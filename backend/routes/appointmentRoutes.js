import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import {
    cancelAppointment,
    completeVisit,
    createAppointment,
    getReceipt,
    listMyAppointments,
    payAppointment,
    rescheduleAppointment
} from '../controllers/appointmentController.js';

const router = Router();

router.use(auth);
router.get('/', listMyAppointments);
router.post('/', createAppointment);
router.get('/:id/receipt', getReceipt);
router.patch('/:id/cancel', cancelAppointment);
router.patch('/:id/reschedule', rescheduleAppointment);
router.patch('/:id/complete', completeVisit);
router.patch('/:id/pay', payAppointment);

export default router;
