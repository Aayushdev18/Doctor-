import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
        slotDateTime: { type: Date, required: true },
        amount: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ['pending', 'paid', 'cancelled'],
            default: 'pending'
        },
        paymentProvider: {
            type: String,
            enum: ['none', 'razorpay', 'demo'],
            default: 'none'
        },
        razorpayOrderId: { type: String, default: '' },
        razorpayPaymentId: { type: String, default: '' },
        razorpaySignature: { type: String, default: '' },
        visitCompleted: { type: Boolean, default: false },
        mode: {
            type: String,
            enum: ['clinic', 'video'],
            default: 'clinic'
        },
        notes: { type: String, default: '' },
        prescription: { type: String, default: '' }
    },
    { timestamps: true }
);

appointmentSchema.index(
    { doctor: 1, slotDateTime: 1 },
    { unique: true, partialFilterExpression: { status: { $ne: 'cancelled' } } }
);

export default mongoose.model('Appointment', appointmentSchema);
