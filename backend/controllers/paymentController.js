import { isValidRazorpaySignature } from '../utils/razorpaySig.js';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import { notify } from '../utils/notify.js';
import { writeAudit } from '../utils/audit.js';

const isPlaceholder = (value) =>
    !value ||
    /your_|changeme|placeholder|xxxx/i.test(value) ||
    value.trim().length < 8;

export const getRazorpay = () => {
    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (isPlaceholder(keyId) || isPlaceholder(keySecret)) return null;
    return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

const demoPayEnabled = () => process.env.ALLOW_DEMO_PAY === 'true';

const markPaid = async (appointment, { orderId, paymentId, signature }) => {
    appointment.status = 'paid';
    appointment.paymentProvider = 'razorpay';
    appointment.razorpayOrderId = orderId || appointment.razorpayOrderId;
    appointment.razorpayPaymentId = paymentId;
    appointment.razorpaySignature = signature || appointment.razorpaySignature;
    await appointment.save();
    await writeAudit({
        user: appointment.user,
        action: 'paid',
        entityId: appointment._id,
        detail: `₹${appointment.amount}`
    });
    const userId = appointment.user?._id || appointment.user;
    await notify(userId, {
        title: 'Payment received',
        body: `₹${appointment.amount} paid for ${appointment.doctor?.name || 'your visit'}. Receipt is ready.`,
        link: `/receipt/${appointment._id}`
    });
};

export const paymentConfig = (_req, res) => {
    const keyId = process.env.RAZORPAY_KEY_ID?.trim() || '';
    const enabled = Boolean(getRazorpay());
    res.json({
        razorpayEnabled: enabled,
        demoPayEnabled: demoPayEnabled(),
        testMode: enabled && keyId.startsWith('rzp_test_')
    });
};

export const createRazorpayOrder = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        if (!mongoose.isValidObjectId(appointmentId)) {
            return res.status(400).json({ message: 'Valid appointment id is required' });
        }

        const appointment = await Appointment.findOne({
            _id: appointmentId,
            user: req.user._id
        }).populate('doctor');

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        if (appointment.status === 'cancelled') {
            return res.status(400).json({ message: 'Cannot pay for a cancelled appointment' });
        }
        if (appointment.status === 'paid') {
            return res.status(400).json({ message: 'Appointment is already paid' });
        }

        const amountInr = appointment.amount || appointment.doctor?.fees || 0;
        const amountPaise = Math.max(100, Math.round(Number(amountInr) * 100));
        const razorpay = getRazorpay();

        if (!razorpay) {
            return res.status(503).json({
                demoMode: true,
                demoPayEnabled: demoPayEnabled(),
                message: 'Checkout is not configured on the server. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Vercel (or backend/.env), then Redeploy.'
            });
        }

        const order = await razorpay.orders.create({
            amount: amountPaise,
            currency: 'INR',
            receipt: `vh_${String(appointment._id).slice(-12)}`
        });

        appointment.razorpayOrderId = order.id;
        appointment.paymentProvider = 'razorpay';
        appointment.amount = amountInr;
        await appointment.save();

        return res.json({
            demoMode: false,
            keyId: process.env.RAZORPAY_KEY_ID.trim(),
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            appointmentId: appointment._id,
            doctorName: appointment.doctor?.name || 'Doctor',
            patientName: req.user.name,
            patientEmail: req.user.email,
            patientPhone: '9999999999'
        });
    } catch (error) {
        const detail = error?.error?.description || error.message || 'Could not create payment order';
        console.error('Razorpay order failed:', detail);
        return res.status(500).json({ message: detail });
    }
};

export const verifyRazorpayPayment = async (req, res) => {
    try {
        const {
            appointmentId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (!mongoose.isValidObjectId(appointmentId)) {
            return res.status(400).json({ message: 'Valid appointment id is required' });
        }

        const appointment = await Appointment.findOne({
            _id: appointmentId,
            user: req.user._id
        }).populate('doctor');

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        if (appointment.status === 'paid') {
            return res.json({ message: 'Already paid', appointment });
        }

        const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
        if (isPlaceholder(keySecret)) {
            return res.status(400).json({ message: 'Checkout is not configured on the server' });
        }

        if (appointment.razorpayOrderId && appointment.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({ message: 'This payment does not match the visit' });
        }

        if (!isValidRazorpaySignature({
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
            secret: keySecret
        })) {
            return res.status(400).json({ message: 'Payment could not be verified. No charge was applied.' });
        }

        await markPaid(appointment, {
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature
        });

        return res.json({ message: 'Payment successful', appointment });
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Payment verification failed' });
    }
};

export const completeTestCheckout = async (req, res) => {
    try {
        const keyId = process.env.RAZORPAY_KEY_ID?.trim() || '';
        if (!keyId.startsWith('rzp_test_')) {
            return res.status(403).json({ message: 'This shortcut only works with Razorpay Test keys.' });
        }

        const { appointmentId } = req.body;
        if (!mongoose.isValidObjectId(appointmentId)) {
            return res.status(400).json({ message: 'Valid appointment id is required' });
        }

        const appointment = await Appointment.findOne({
            _id: appointmentId,
            user: req.user._id
        }).populate('doctor');

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        if (appointment.status === 'cancelled') {
            return res.status(400).json({ message: 'This visit was cancelled' });
        }
        if (appointment.status === 'paid') {
            return res.json({ message: 'Already paid', appointment });
        }

        await markPaid(appointment, {
            orderId: appointment.razorpayOrderId || 'order_test',
            paymentId: `pay_test_${Date.now()}`,
            signature: 'test_checkout_fallback'
        });

        return res.json({ message: 'Test payment recorded', appointment });
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Could not complete test payment' });
    }
};

export const razorpayWebhook = async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
        if (isPlaceholder(secret)) {
            return res.status(503).json({ message: 'Webhook secret not configured' });
        }

        const signature = req.headers['x-razorpay-signature'];
        const raw = req.rawBody || JSON.stringify(req.body);
        const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
        if (expected !== signature) {
            return res.status(400).json({ message: 'Invalid webhook signature' });
        }

        const event = req.body?.event;
        const payment = req.body?.payload?.payment?.entity;
        if (event !== 'payment.captured' || !payment?.order_id) {
            return res.json({ ok: true });
        }

        const appointment = await Appointment.findOne({ razorpayOrderId: payment.order_id }).populate('doctor');
        if (!appointment || appointment.status === 'paid') {
            return res.json({ ok: true });
        }

        await markPaid(appointment, {
            orderId: payment.order_id,
            paymentId: payment.id,
            signature
        });
        return res.json({ ok: true });
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Webhook failed' });
    }
};
