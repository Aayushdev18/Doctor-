import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';

const refreshDoctorRating = async (doctorId) => {
    const stats = await Review.aggregate([
        { $match: { doctor: new mongoose.Types.ObjectId(doctorId) } },
        { $group: { _id: '$doctor', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const avg = stats[0]?.avg || 0;
    const count = stats[0]?.count || 0;
    await Doctor.findByIdAndUpdate(doctorId, {
        ratingAvg: Math.round(avg * 10) / 10,
        ratingCount: count
    });
};

export const createReview = async (req, res) => {
    try {
        const { appointmentId, rating, comment } = req.body;
        if (!mongoose.isValidObjectId(appointmentId) || !rating) {
            return res.status(400).json({ message: 'Appointment and rating are required' });
        }

        const appointment = await Appointment.findOne({
            _id: appointmentId,
            user: req.user._id
        });
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        if (appointment.status !== 'paid') {
            return res.status(400).json({ message: 'You can review only after a paid visit' });
        }

        const visitDone = appointment.visitCompleted || new Date(appointment.slotDateTime) <= new Date();
        if (!visitDone) {
            return res.status(400).json({ message: 'Confirm the visit first, then leave a review' });
        }

        const existing = await Review.findOne({ appointment: appointment._id });
        if (existing) return res.status(400).json({ message: 'You already reviewed this visit' });

        const review = await Review.create({
            user: req.user._id,
            doctor: appointment.doctor,
            appointment: appointment._id,
            rating: Math.min(5, Math.max(1, Number(rating))),
            comment: comment || ''
        });

        await refreshDoctorRating(appointment.doctor);
        return res.status(201).json({ message: 'Thank you for the review', review });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You already reviewed this visit' });
        }
        return res.status(500).json({ message: error.message || 'Could not save review' });
    }
};

export const listDoctorReviews = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid doctor id' });
        }
        const reviews = await Review.find({ doctor: req.params.id })
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .limit(20);
        return res.json({ reviews });
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Could not load reviews' });
    }
};
