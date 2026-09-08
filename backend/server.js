import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import Doctor from './models/Doctor.js';
import { seedCatalog } from './seed/seedDoctors.js';
import authRoutes from './routes/authRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import doctorPanelRoutes from './routes/doctorPanelRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://doctor-tau-rouge.vercel.app',
    ...(process.env.CLIENT_URLS || '').split(',').map((value) => value.trim()).filter(Boolean)
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked for ${origin}`));
    }
}));
app.use(express.json({
    verify: (req, _res, buf) => {
        req.rawBody = buf;
    }
}));
app.use('/static', express.static(path.join(__dirname, 'public')));

const apiInfo = {
    name: 'Velora Health API',
    status: 'running',
    frontend: process.env.CLIENT_URL || 'http://localhost:5173',
    endpoints: {
        health: 'GET /api/health',
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        profile: 'PUT /api/auth/profile',
        doctors: 'GET /api/doctors',
        doctor: 'GET /api/doctors/:id',
        slots: 'GET /api/doctors/:id/slots',
        appointments: 'GET /api/appointments',
        book: 'POST /api/appointments',
        pay: 'PATCH /api/appointments/:id/pay',
        razorpayOrder: 'POST /api/payments/razorpay/order',
        razorpayVerify: 'POST /api/payments/razorpay/verify',
        adminStats: 'GET /api/admin/stats',
        adminDoctors: 'POST /api/admin/doctors',
        doctorPanel: 'GET /api/doctor/appointments',
        cancel: 'PATCH /api/appointments/:id/cancel',
        triage: 'POST /api/ai/triage'
    }
};

app.get('/', (_req, res) => res.json(apiInfo));
app.get('/api', (_req, res) => res.json(apiInfo));
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctor', doctorPanelRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
});

let boot;

export const ensureReady = () => {
    if (!boot) {
        boot = connectDB().then(async () => {
            const count = await Doctor.countDocuments();
            if (count === 0) {
                await seedCatalog();
                console.log('Empty database — catalog seeded');
            }
        });
    }
    return boot;
};

const port = process.env.PORT || 4000;

if (!process.env.VERCEL) {
    ensureReady()
        .then(() => {
            app.listen(port, () => console.log(`API running on http://localhost:${port}`));
        })
        .catch((error) => {
            console.error('Failed to connect to MongoDB:', error.message);
            process.exit(1);
        });
}

export default app;
