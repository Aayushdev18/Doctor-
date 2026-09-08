import Notification from '../models/Notification.js';

export const listNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(30);
        const unread = notifications.filter((n) => !n.read).length;
        return res.json({ notifications, unread });
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Could not load notifications' });
    }
};

export const markNotificationsRead = async (req, res) => {
    try {
        await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
        return res.json({ ok: true });
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Could not update notifications' });
    }
};
