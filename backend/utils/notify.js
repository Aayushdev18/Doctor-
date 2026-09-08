import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const notify = async (userId, { title, body = '', link = '/my-appointments' }) => {
    if (!userId) return;
    await Notification.create({ user: userId, title, body, link });
};

export const notifyDoctorOf = async (doctorId, payload) => {
    const account = await User.findOne({ doctor: doctorId, role: 'doctor' });
    if (account) await notify(account._id, { ...payload, link: payload.link || '/doctor' });
};
