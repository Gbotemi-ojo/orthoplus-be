// src/routes/patient.routes.ts
import { Router } from 'express';
import { patientController } from '../controllers/patient.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// --- PATIENT & FAMILY MANAGEMENT ROUTES ---

// POST /guest-submit - Create a new primary patient (now a Family Head). Publicly accessible.
router.post('/guest-submit', patientController.submitGuestPatient);

// NEW ROUTE: POST /guest-family-submit - Create a new family unit (Head + Members) at once. Publicly accessible.
router.post('/guest-family-submit', patientController.submitGuestFamilyPatient);

// POST /returning-guest-visit - Record a visit for a returning guest. Publicly accessible.
router.post('/returning-guest-visit', patientController.recordReturningGuestVisit);

// ADD MEMBER ROUTE: Add a family member to an existing patient (the Family Head).
router.post(
    '/:headId/members',
    authenticateToken,
    authorizeRoles(['owner', 'staff', 'doctor']),
    patientController.addFamilyMember
);

// --- NEW ROUTE for today's returning patients ---
router.get(
    '/returning-today',
    authenticateToken,
    authorizeRoles(['owner', 'staff', 'nurse', 'doctor']),
    patientController.getTodaysReturningPatients
);

// --- DOCTOR SCHEDULE ROUTES ---
router.get(
    '/doctor-schedule/:doctorId',
    authenticateToken,
    authorizeRoles(['owner', 'staff', 'doctor']),
    patientController.getDoctorSchedule
);
router.get(
    '/doctor-schedule',
    authenticateToken,
    authorizeRoles(['owner', 'staff']),
    patientController.getAllPatientsForScheduling
);
router.put(
    '/:patientId/assign-doctor',
    authenticateToken,
    authorizeRoles(['owner', 'staff']),
    patientController.assignDoctor
);


// GET / - Get all patients.
router.get('/', authenticateToken, authorizeRoles(['owner', 'staff', 'nurse', 'doctor']), patientController.getAllPatients);

// GET /:id - Get a single patient by ID.
router.get('/:id', authenticateToken, authorizeRoles(['owner', 'staff', 'nurse', 'doctor']), patientController.getPatientById);

// PUT /:id - Update patient information.
router.put('/:id', authenticateToken, authorizeRoles(['owner', 'staff']), patientController.updatePatient);

// [NEW ROUTE] Update patient balance (Process Payment)
router.put(
    '/:id/balance', 
    authenticateToken, 
    authorizeRoles(['owner', 'staff', 'nurse']), 
    patientController.updateBalance
);


// --- APPOINTMENT SCHEDULING & REMINDER ROUTES ---
router.post(
    '/:patientId/schedule-appointment',
    authenticateToken,
    authorizeRoles(['owner', 'staff', 'doctor','nurse']),
    patientController.scheduleNextAppointment
);

router.post(
    '/:patientId/send-reminder',
    authenticateToken,
    authorizeRoles(['owner', 'staff', 'doctor','nurse']),
    patientController.sendAppointmentReminder
);


// --- DENTAL RECORD MANAGEMENT ROUTES ---
router.post('/:patientId/dental-records', authenticateToken, authorizeRoles(['owner', 'staff', 'nurse', 'doctor']), patientController.createDentalRecord);

router.get('/:patientId/dental-records', authenticateToken, authorizeRoles(['owner', 'staff', 'nurse', 'doctor']), patientController.getDentalRecordsByPatientId);

router.get('/:patientId/dental-records/:recordId', authenticateToken, authorizeRoles(['owner', 'staff', 'nurse', 'doctor']), patientController.getSpecificDentalRecordForPatient);

router.get('/dental-records/:id', authenticateToken, authorizeRoles(['owner', 'staff', 'nurse', 'doctor']), patientController.getDentalRecordById);

router.put('/dental-records/:id', authenticateToken, authorizeRoles(['owner', 'staff', 'nurse', 'doctor']), patientController.updateDentalRecord);

router.delete('/dental-records/:id', authenticateToken, authorizeRoles(['owner', 'staff', 'nurse', 'doctor']), patientController.deleteDentalRecord);

export default router;