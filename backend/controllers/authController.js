import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name?.trim() || !email?.trim() || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const exists = await User.findOne({ email: email.toLowerCase() });
        if (exists) {
            return res.status(400).json({ message: 'An account with this email already exists' });
        }

        const user = await User.create({ name: name.trim(), email, password, role: 'patient' });
        return res.status(201).json({
            message: 'Account created successfully',
            user: user.toPublicJSON(),
            token: signToken(user._id)
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Registration failed' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        return res.json({
            message: 'Logged in successfully',
            user: user.toPublicJSON(),
            token: signToken(user._id)
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Login failed' });
    }
};

export const getMe = async (req, res) => {
    return res.json({ user: req.user.toPublicJSON() });
};

export const updateProfile = async (req, res) => {
    try {
        const { name, phone, gender, birthday, address } = req.body;
        if (name !== undefined) req.user.name = name;
        if (phone !== undefined) req.user.phone = phone;
        if (gender !== undefined) req.user.gender = gender;
        if (birthday !== undefined) req.user.birthday = birthday;
        if (address !== undefined) req.user.address = address;
        await req.user.save();
        return res.json({ user: req.user.toPublicJSON() });
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Could not update profile' });
    }
};
