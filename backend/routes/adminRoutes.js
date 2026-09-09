import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import {
    createDoctorWithLogin,
    getAdminStats,
    listAdminAppointments,
    listAuditLogs,
    toggleDoctorAvailability
} from '../controllers/adminController.js';
import { listDoctors } from '../controllers/doctorController.js';

const router = Router();

router.use(auth, requireRole('admin'));
router.get('/stats', getAdminStats);
router.get('/audit', listAuditLogs);
router.get('/appointments', listAdminAppointments);
router.get('/doctors', listDoctors);
router.post('/doctors', createDoctorWithLogin);
router.patch('/doctors/:id/availability', toggleDoctorAvailability);

export default router;
