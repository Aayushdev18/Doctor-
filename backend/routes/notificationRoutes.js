import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { listNotifications, markNotificationsRead } from '../controllers/notificationController.js';

const router = Router();
router.use(auth);
router.get('/', listNotifications);
router.patch('/read', markNotificationsRead);

export default router;
