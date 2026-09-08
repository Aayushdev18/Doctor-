import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import {
    createRazorpayOrder,
    paymentConfig,
    razorpayWebhook,
    verifyRazorpayPayment
} from '../controllers/paymentController.js';

const router = Router();

router.get('/config', paymentConfig);
router.post('/razorpay/webhook', razorpayWebhook);
router.use(auth);
router.post('/razorpay/order', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);

export default router;
