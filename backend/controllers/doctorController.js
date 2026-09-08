import mongoose from 'mongoose';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';

const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const isWithinWorkingHours = (workingHours, dateTime) => {
    const hours = workingHours?.[days[dateTime.getDay()]];
    if (!hours?.start || !hours?.end) return false;
    const time = dateTime.toTimeString().slice(0, 5);
    return time >= hours.start && time <= hours.end;
};

export const listDoctors = async (req, res) => {
    try {
        const filter = {};
        if (req.query.speciality) filter.speciality = req.query.speciality;
        if (req.query.available === 'true') filter.available = true;
        if (req.query.search?.trim()) {
            const search = req.query.search.trim();
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { speciality: { $regex: search, $options: 'i' } }
            ];
        }

        let query = Doctor.find(filter);
        if (req.query.sort === 'fees-asc') query = query.sort({ fees: 1 });
        else if (req.query.sort === 'fees-desc') query = query.sort({ fees: -1 });
        else query = query.sort({ name: 1 });

        const doctors = await query;
        return res.json({ doctors });
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Could not load doctors' });
    }
};

export const getDoctor = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid doctor id' });
        }
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
        return res.json({ doctor });
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Could not load doctor' });
    }
};

export const getDoctorSlots = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid doctor id' });
        }
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

        const today = new Date();
        today.setSeconds(0, 0);
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + (6 - today.getDay()));
        weekEnd.setHours(23, 59, 59, 999);

        const booked = await Appointment.find({
            doctor: doctor._id,
            status: { $ne: 'cancelled' },
            slotDateTime: { $gte: today, $lte: weekEnd }
        }).select('slotDateTime');

        const bookedSet = new Set(booked.map((a) => a.slotDateTime.getTime()));
        const daysUntilEndOfWeek = 6 - today.getDay();
        const slotsByDay = [];

        for (let i = 0; i <= daysUntilEndOfWeek; i++) {
            const dayStart = new Date(today);
            dayStart.setDate(today.getDate() + i);

            const endTime = new Date(dayStart);
            endTime.setHours(21, 0, 0, 0);

            const cursor = new Date(dayStart);
            if (i === 0) {
                const nextHour = cursor.getHours() >= 10 ? cursor.getHours() + 1 : 10;
                cursor.setHours(nextHour, cursor.getMinutes() > 30 ? 30 : 0, 0, 0);
            } else {
                cursor.setHours(10, 0, 0, 0);
            }

            const timeSlots = [];
            while (cursor < endTime) {
                let status = 'unavailable';
                if (isWithinWorkingHours(doctor.workingHours, cursor)) {
                    status = bookedSet.has(cursor.getTime()) ? 'busy' : 'available';
                }
                timeSlots.push({
                    datetime: new Date(cursor),
                    time: cursor.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                    status
                });
                cursor.setMinutes(cursor.getMinutes() + 30);
            }
            slotsByDay.push(timeSlots);
        }

        return res.json({ slots: slotsByDay });
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Could not load slots' });
    }
};
