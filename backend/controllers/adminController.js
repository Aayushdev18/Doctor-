import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import { notify } from '../utils/notify.js';

const weekday = { start: '10:00', end: '17:00' };
const defaultHours = {
    monday: weekday,
    tuesday: weekday,
    wednesday: weekday,
    thursday: weekday,
    friday: weekday,
    saturday: { start: '10:00', end: '14:00' },
    sunday: null
};

export const getAdminStats = async (_req, res) => {
    try {
        const [patients, doctors, appointments, paid] = await Promise.all([
            User.countDocuments({ role: 'patient' }),
            Doctor.countDocuments(),
            Appointment.countDocuments(),
            Appointment.find({ status: 'paid' }).select('amount')
        ]);
        const revenue = paid.reduce((sum, item) => sum + (item.amount || 0), 0);
        return res.json({ patients, doctors, appointments, revenue });
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Could not load dashboard' });
    }
};

export const listAdminAppointments = async (_req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('doctor')
            .populate('user', 'name email phone')
            .sort({ slotDateTime: -1 });
        return res.json({ appointments });
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Could not load appointments' });
    }
};

export const createDoctorWithLogin = async (req, res) => {
    try {
        const {
            name,
            speciality,
            degree,
            experience,
            about,
            fees,
            email,
            password,
            phone,
            image,
            address
        } = req.body;

        if (!name || !speciality || !degree || !experience || !about || fees === undefined || !email || !password) {
            return res.status(400).json({ message: 'Please fill all required doctor fields' });
        }
        if (String(password).length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const exists = await User.findOne({ email: email.toLowerCase() });
        if (exists) {
            return res.status(400).json({ message: 'A user with this email already exists' });
        }

        const slug = `doc-${Date.now()}`;
        const doctor = await Doctor.create({
            slug,
            name,
            speciality,
            degree,
            experience,
            about,
            fees: Number(fees),
            image: image || '/static/doctors/doc1.png',
            available: true,
            address: address || { line1: '', line2: '' },
            workingHours: defaultHours
        });

        const user = await User.create({
            name,
            email,
            password,
            phone: phone || '',
            role: 'doctor',
            doctor: doctor._id
        });

        return res.status(201).json({
            message: 'Doctor added',
            doctor,
            loginEmail: user.email
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Could not add doctor' });
    }
};

export const toggleDoctorAvailability = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
        doctor.available = !doctor.available;
        await doctor.save();
        return res.json({ doctor });
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Could not update doctor' });
    }
};

export const getDoctorAppointments = async (req, res) => {
    try {
        if (!req.user.doctor) {
            return res.status(403).json({ message: 'This account is not linked to a doctor profile' });
        }
        const appointments = await Appointment.find({ doctor: req.user.doctor })
            .populate('doctor')
            .populate('user', 'name email phone')
            .sort({ slotDateTime: -1 });
        return res.json({ appointments });
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Could not load appointments' });
    }
};

export const getDoctorProfile = async (req, res) => {
    try {
        if (!req.user.doctor) {
            return res.status(403).json({ message: 'This account is not linked to a doctor profile' });
        }
        const doctor = await Doctor.findById(req.user.doctor);
        if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
        return res.json({ doctor });
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Could not load profile' });
    }
};

export const updateDoctorProfile = async (req, res) => {
    try {
        if (!req.user.doctor) {
            return res.status(403).json({ message: 'This account is not linked to a doctor profile' });
        }
        const doctor = await Doctor.findById(req.user.doctor);
        if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

        const { about, fees, available, workingHours, address, experience } = req.body;
        if (about !== undefined) doctor.about = about;
        if (fees !== undefined) doctor.fees = Number(fees);
        if (available !== undefined) doctor.available = Boolean(available);
        if (workingHours !== undefined) doctor.workingHours = workingHours;
        if (address !== undefined) doctor.address = address;
        if (experience !== undefined) doctor.experience = experience;
        await doctor.save();
        return res.json({ doctor });
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Could not update profile' });
    }
};

export const completeDoctorAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findOne({
            _id: req.params.id,
            doctor: req.user.doctor
        }).populate('doctor').populate('user', 'name email');

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        if (appointment.status === 'cancelled') {
            return res.status(400).json({ message: 'Appointment is cancelled' });
        }
        appointment.status = 'paid';
        appointment.visitCompleted = true;
        await appointment.save();
        await notify(appointment.user._id || appointment.user, {
            title: 'Visit completed',
            body: `${appointment.doctor?.name || 'Your doctor'} marked this visit complete. You can leave a review.`,
            link: '/my-appointments'
        });
        return res.json({ appointment });
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Could not update appointment' });
    }
};

export const addDoctorNote = async (req, res) => {
    try {
        const appointment = await Appointment.findOne({
            _id: req.params.id,
            doctor: req.user.doctor
        }).populate('user', 'name');

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        const { notes, prescription } = req.body;
        if (notes !== undefined) appointment.notes = String(notes).slice(0, 2000);
        if (prescription !== undefined) appointment.prescription = String(prescription).slice(0, 2000);
        await appointment.save();
        await notify(appointment.user._id || appointment.user, {
            title: 'Visit notes added',
            body: `${req.user.name} added notes to your visit.`,
            link: '/my-appointments'
        });
        return res.json({ appointment });
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Could not save notes' });
    }
};
