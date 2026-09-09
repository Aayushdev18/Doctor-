import crypto from 'crypto';

export const razorpaySignature = (orderId, paymentId, secret) =>
    crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');

export const isValidRazorpaySignature = ({ orderId, paymentId, signature, secret }) => {
    if (!orderId || !paymentId || !signature || !secret) return false;
    const expected = razorpaySignature(orderId, paymentId, secret);
    try {
        return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
        return false;
    }
};
