import { Router } from 'express';
import { triageSymptoms } from '../controllers/aiController.js';

const router = Router();
router.post('/triage', triageSymptoms);

export default router;
