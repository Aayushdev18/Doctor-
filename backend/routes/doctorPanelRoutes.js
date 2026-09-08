import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import {
    addDoctorNote,
    completeDoctorAppointment,
    getDoctorAppointments,
    getDoctorProfile,
    updateDoctorProfile
} from '../controllers/adminController.js';

const router = Router();

router.use(auth, requireRole('doctor'));
router.get('/appointments', getDoctorAppointments);
router.get('/profile', getDoctorProfile);
router.put('/profile', updateDoctorProfile);
router.patch('/appointments/:id/complete', completeDoctorAppointment);
router.patch('/appointments/:id/notes', addDoctorNote);

export default router;
