import { Router } from 'express';
import { getDoctor, getDoctorSlots, listDoctors } from '../controllers/doctorController.js';
import { listDoctorReviews } from '../controllers/reviewController.js';

const router = Router();

router.get('/', listDoctors);
router.get('/:id/slots', getDoctorSlots);
router.get('/:id/reviews', listDoctorReviews);
router.get('/:id', getDoctor);

export default router;
