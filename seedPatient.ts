// db/seedPatient.ts
import 'dotenv/config'; // Load environment variables
import { drizzle } from 'drizzle-orm/mysql2';
import { createPool } from 'mysql2/promise';
import * as schema from './db/schema'; // Corrected path
import { eq, isNull, or, SQL } from 'drizzle-orm'; // Import the 'or' operator and SQL type
import patientData from './data'; // Import the patient data array

/**
 * Seeds the database with patient data.
 * It checks for existing entries to prevent duplicates by phone number or email.
 */
async function seedPatient() {
    console.log('🚀 Starting database seeding for patients...');

    const pool = createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        port: Number(process.env.DB_PORT || 3306),
    });

    const db = drizzle(pool, { schema, mode: 'default' });

    try {
        // --- Seed Patients ---
        console.log('🔄 Seeding patient data...');
        let patientsAdded = 0;
        let patientsSkipped = 0;

        for (const patient of patientData) {
            // Build a dynamic query to check for duplicates on either phone or email
            const duplicateConditions: SQL[] = []; // Explicitly type the array to prevent TS error
            if (patient.phoneNumber) {
                duplicateConditions.push(eq(schema.patients.phoneNumber, patient.phoneNumber));
            }
            if (patient.email) {
                duplicateConditions.push(eq(schema.patients.email, patient.email));
            }

            let existingPatient: typeof schema.patients.$inferSelect | null = null;
            if (duplicateConditions.length > 0) {
                const found = await db.query.patients.findFirst({
                    where: or(...duplicateConditions)
                });
                existingPatient = found ?? null;
            }

            if (existingPatient) {
                // console.log(`⏩ Skipping existing patient: ${patient.name}`);
                patientsSkipped++;
                continue;
            }

            await db.insert(schema.patients).values({
                name: patient.name,
                sex: patient.sex,
                // Ensure date fields are correctly formatted or null
                dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth) : null,
                phoneNumber: patient.phoneNumber,
                email: patient.email,
                address: patient.address,
                hmo: patient.hmo ? JSON.stringify(patient.hmo) : null, // Assuming hmo is an object
                nextAppointmentDate: patient.nextAppointmentDate ? new Date(patient.nextAppointmentDate) : null,
                outstanding: patient.outstanding || '0.00',
                isFamilyHead: patient.isFamilyHead,
                familyId: patient.familyId,
                // Use the createdAt from your data file
                createdAt: new Date(patient.createdAt),
            });
            patientsAdded++;
        }

        console.log(`✅ Patient seeding complete. Added: ${patientsAdded}, Skipped: ${patientsSkipped}`);

    } catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1); // Exit with an error code
    } finally {
        await pool.end(); // Close the database connection pool
        console.log('🏁 Seeding process finished.');
    }
}

seedPatient();
