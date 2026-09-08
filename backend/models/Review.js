import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
        appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, default: '', trim: true, maxlength: 500 }
    },
    { timestamps: true }
);

export default mongoose.model('Review', reviewSchema);
