import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Review from '../models/Review.js';
import { notify, notifyDoctorOf } from '../utils/notify.js';
import { writeAudit } from '../utils/audit.js';
import { videoRoomUrl } from '../utils/video.js';

const formatWhen = (date) =>
    new Date(date).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });

export const createAppointment = async (req, res) => {
    try {
        const { doctorId, slotDateTime, mode } = req.body;
        if (!mongoose.isValidObjectId(doctorId) || !slotDateTime) {
            return res.status(400).json({ message: 'Doctor and time slot are required' });
        }

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

        const slot = new Date(slotDateTime);
        if (Number.isNaN(slot.getTime()) || slot < new Date()) {
            return res.status(400).json({ message: 'Please choose a valid future slot' });
        }

        const taken = await Appointment.findOne({
            doctor: doctorId,
            slotDateTime: slot,
            status: { $ne: 'cancelled' }
        });
        if (taken) {
            return res.status(409).json({ message: 'This slot is already booked' });
        }

        const visitMode = mode === 'video' ? 'video' : 'clinic';
        const appointment = await Appointment.create({
            user: req.user._id,
            doctor: doctorId,
            slotDateTime: slot,
            amount: doctor.fees || 0,
            status: 'pending',
            mode: visitMode
        });

        const populated = await appointment.populate('doctor');
        await writeAudit({
            user: req.user,
            action: 'booked',
            entityId: appointment._id,
            detail: `${doctor.name} · ${formatWhen(slot)} · ${visitMode}`
        });
        await notify(req.user._id, {
            title: 'Appointment booked',
            body: `${doctor.name} · ${formatWhen(slot)} · ${visitMode === 'video' ? 'Video consult' : 'In-clinic'}`,
            link: '/my-appointments'
        });
        await notifyDoctorOf(doctorId, {
            title: 'New booking',
            body: `${req.user.name} booked ${formatWhen(slot)}`
        });
        return res.status(201).json({ message: 'Appointment booked', appointment: populated });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'This slot is already booked' });
        }
        return res.status(500).json({ message: error.message || 'Could not book appointment' });
    }
};

export const listMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ user: req.user._id })
            .populate('doctor')
            .sort({ slotDateTime: -1 });

        const ids = appointments.map((a) => a._id);
        const reviews = await Review.find({ appointment: { $in: ids } });
        const reviewByAppt = Object.fromEntries(reviews.map((r) => [String(r.appointment), r]));
        const now = new Date();

        const payload = appointments.map((a) => {
            const obj = a.toObject();
            const review = reviewByAppt[String(a._id)] || null;
            const visitDone = a.visitCompleted || new Date(a.slotDateTime) <= now;
            const upcoming = a.status !== 'cancelled' && new Date(a.slotDateTime) > now;
            return {
                ...obj,
                videoJoinUrl: a.mode === 'video' ? videoRoomUrl(a._id) : '',
                review,
                canReview: a.status === 'paid' && visitDone && !review,
                canConfirmVisit: a.status === 'paid' && !visitDone && !review,
                canReschedule: upcoming
            };
        });

        return res.json({ appointments: payload });
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Could not load appointments' });
    }
};

export const cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findOne({
            _id: req.params.id,
            user: req.user._id
        }).populate('doctor');

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        if (appointment.status === 'cancelled') {
            return res.status(400).json({ message: 'Appointment is already cancelled' });
        }

        appointment.status = 'cancelled';
        await appointment.save();
        await writeAudit({
            user: req.user,
            action: 'cancelled',
            entityId: appointment._id,
            detail: formatWhen(appointment.slotDateTime)
        });
        await notify(req.user._id, {
            title: 'Appointment cancelled',
            body: `${appointment.doctor?.name || 'Your visit'} on ${formatWhen(appointment.slotDateTime)} was cancelled`
        });
        return res.json({ message: 'Appointment cancelled', appointment });
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Could not cancel appointment' });
    }
};

export const rescheduleAppointment = async (req, res) => {
    try {
        const { slotDateTime } = req.body;
        const appointment = await Appointment.findOne({
            _id: req.params.id,
            user: req.user._id
        }).populate('doctor');

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        if (appointment.status === 'cancelled') {
            return res.status(400).json({ message: 'Cannot reschedule a cancelled appointment' });
        }

        const slot = new Date(slotDateTime);
        if (Number.isNaN(slot.getTime()) || slot < new Date()) {
            return res.status(400).json({ message: 'Please choose a valid future slot' });
        }

        const taken = await Appointment.findOne({
            _id: { $ne: appointment._id },
            doctor: appointment.doctor._id,
            slotDateTime: slot,
            status: { $ne: 'cancelled' }
        });
        if (taken) {
            return res.status(409).json({ message: 'This slot is already booked' });
        }

        appointment.slotDateTime = slot;
        await appointment.save();
        await writeAudit({
            user: req.user,
            action: 'rescheduled',
            entityId: appointment._id,
            detail: formatWhen(slot)
        });
        await notify(req.user._id, {
            title: 'Appointment rescheduled',
            body: `${appointment.doctor?.name} is now ${formatWhen(slot)}`
        });
        await notifyDoctorOf(appointment.doctor._id, {
            title: 'Visit rescheduled',
            body: `${req.user.name} moved to ${formatWhen(slot)}`
        });
        return res.json({ message: 'Appointment rescheduled', appointment });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'This slot is already booked' });
        }
        return res.status(500).json({ message: error.message || 'Could not reschedule' });
    }
};

export const getReceipt = async (req, res) => {
    try {
        const appointment = await Appointment.findOne({
            _id: req.params.id,
            user: req.user._id
        }).populate('doctor');

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        if (appointment.status !== 'paid') {
            return res.status(400).json({ message: 'Receipt is available after payment' });
        }

        return res.json({
            receipt: {
                number: `VH-${String(appointment._id).slice(-8).toUpperCase()}`,
                issuedAt: appointment.updatedAt,
                patient: { name: req.user.name, email: req.user.email },
                doctor: appointment.doctor,
                slotDateTime: appointment.slotDateTime,
                amount: appointment.amount,
                mode: appointment.mode,
                paymentProvider: appointment.paymentProvider,
                paymentId: appointment.razorpayPaymentId || 'TEST-PAY',
                videoJoinUrl: appointment.mode === 'video' ? videoRoomUrl(appointment._id) : ''
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Could not load receipt' });
    }
};

export const completeVisit = async (req, res) => {
    try {
        const appointment = await Appointment.findOne({
            _id: req.params.id,
            user: req.user._id
        }).populate('doctor');

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        if (appointment.status !== 'paid') {
            return res.status(400).json({ message: 'Pay for the visit before confirming it' });
        }

        appointment.visitCompleted = true;
        await appointment.save();
        await writeAudit({
            user: req.user,
            action: 'visit_confirmed',
            entityId: appointment._id,
            detail: appointment.doctor?.name || ''
        });
        return res.json({ message: 'Visit confirmed. You can leave a review.', appointment });
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Could not confirm visit' });
    }
};

export const payAppointment = async (req, res) => {
    try {
        if (process.env.ALLOW_DEMO_PAY !== 'true') {
            return res.status(403).json({
                message: 'Demo pay is off. Use Razorpay checkout, or set ALLOW_DEMO_PAY=true in backend/.env.'
            });
        }
        const appointment = await Appointment.findOne({
            _id: req.params.id,
            user: req.user._id
        }).populate('doctor');

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        if (appointment.status === 'cancelled') {
            return res.status(400).json({ message: 'Cannot pay for a cancelled appointment' });
        }

        appointment.status = 'paid';
        appointment.paymentProvider = 'demo';
        await appointment.save();
        await writeAudit({
            user: req.user,
            action: 'paid',
            entityId: appointment._id,
            detail: 'demo'
        });
        await notify(req.user._id, {
            title: 'Payment received',
            body: `₹${appointment.amount} paid for ${appointment.doctor?.name}. Receipt is ready.`,
            link: `/receipt/${appointment._id}`
        });
        return res.json({ message: 'Payment successful', appointment });
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Payment failed' });
    }
};
