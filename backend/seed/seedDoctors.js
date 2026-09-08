import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';
import { connectDB } from '../config/db.js';

dotenv.config();

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

const doctors = [
    {
        slug: 'doc1',
        name: 'Dr. Richard James',
        image: '/static/doctors/doc1.png',
        speciality: 'General physician',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Committed to comprehensive care with a focus on prevention, early diagnosis, and effective treatment.',
        fees: 50,
        address: { line1: '42, Rajendra Nagar, Near Apollo Hospital', line2: 'New Delhi, Delhi - 110001' },
        workingHours: {
            monday: { start: '10:00', end: '17:00' },
            tuesday: { start: '11:00', end: '19:00' },
            wednesday: { start: '10:00', end: '17:00' },
            thursday: { start: '09:00', end: '16:00' },
            friday: { start: '10:00', end: '18:00' },
            saturday: { start: '10:00', end: '15:00' },
            sunday: null
        }
    },
    {
        slug: 'doc2',
        name: 'Dr. Emily Larson',
        image: '/static/doctors/doc2.png',
        speciality: 'Gynecologist',
        degree: 'MBBS',
        experience: '3 Years',
        about: 'Provides patient-centered gynecological care with attention to comfort and long-term wellness.',
        fees: 60,
        address: { line1: '15, MG Road, Vijaya Complex', line2: 'Bangalore, Karnataka - 560001' },
        workingHours: {
            monday: { start: '09:00', end: '16:00' },
            tuesday: { start: '10:00', end: '18:00' },
            wednesday: { start: '11:00', end: '19:00' },
            thursday: { start: '10:00', end: '17:00' },
            friday: { start: '09:00', end: '16:00' },
            saturday: { start: '10:00', end: '14:00' },
            sunday: null
        }
    },
    {
        slug: 'doc3',
        name: 'Dr. Sarah Patel',
        image: '/static/doctors/doc3.png',
        speciality: 'Dermatologist',
        degree: 'MBBS',
        experience: '1 Years',
        about: 'Treats skin conditions with evidence-based plans tailored to each patient.',
        fees: 30,
        address: { line1: '78, Park Street, Lake Gardens', line2: 'Kolkata, West Bengal - 700029' },
        workingHours: {
            monday: { start: '09:00', end: '17:00' },
            tuesday: { start: '09:00', end: '17:00' },
            wednesday: { start: '09:00', end: '17:00' },
            thursday: { start: '09:00', end: '17:00' },
            friday: { start: '09:00', end: '15:00' },
            saturday: { start: '10:00', end: '14:00' },
            sunday: null
        }
    },
    {
        slug: 'doc4',
        name: 'Dr. Christopher Lee',
        image: '/static/doctors/doc4.png',
        speciality: 'Pediatricians',
        degree: 'MBBS',
        experience: '2 Years',
        about: 'Dedicated to child health, from routine checkups to acute care.',
        fees: 40,
        address: { line1: '23, Marine Drive, Sea View Building', line2: 'Mumbai, Maharashtra - 400002' },
        workingHours: {
            monday: { start: '14:00', end: '20:00' },
            tuesday: { start: '14:00', end: '20:00' },
            wednesday: { start: '14:00', end: '20:00' },
            thursday: { start: '14:00', end: '20:00' },
            friday: { start: '14:00', end: '20:00' },
            saturday: null,
            sunday: null
        }
    },
    {
        slug: 'doc5',
        name: 'Dr. Jennifer Garcia',
        image: '/static/doctors/doc5.png',
        speciality: 'Neurologist',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Focuses on neurological diagnosis and treatment with a calm, thorough approach.',
        fees: 50,
        address: { line1: '56, Anna Salai, Rainbow Tower', line2: 'Chennai, Tamil Nadu - 600002' },
        workingHours: {
            monday: { start: '10:00', end: '18:00' },
            tuesday: { start: '10:00', end: '18:00' },
            wednesday: { start: '10:00', end: '18:00' },
            thursday: { start: '10:00', end: '18:00' },
            friday: { start: '10:00', end: '18:00' },
            saturday: { start: '10:00', end: '15:00' },
            sunday: null
        }
    },
    {
        slug: 'doc6',
        name: 'Dr. Andrew Williams',
        image: '/static/doctors/doc6.png',
        speciality: 'Neurologist',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Helps patients manage neurological conditions with clear, practical care plans.',
        fees: 50,
        address: { line1: '12, Banjara Hills', line2: 'Hyderabad, Telangana - 500034' },
        workingHours: {
            monday: { start: '09:00', end: '17:00' },
            tuesday: { start: '09:00', end: '17:00' },
            wednesday: null,
            thursday: { start: '09:00', end: '17:00' },
            friday: { start: '09:00', end: '17:00' },
            saturday: { start: '09:00', end: '13:00' },
            sunday: null
        }
    },
    {
        slug: 'doc7',
        name: 'Dr. Christopher Davis',
        image: '/static/doctors/doc7.png',
        speciality: 'General physician',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'First-contact physician for everyday illnesses and preventive health.',
        fees: 50,
        address: { line1: '9, Civil Lines', line2: 'Jaipur, Rajasthan - 302006' },
        workingHours: {
            monday: { start: '11:00', end: '19:00' },
            tuesday: { start: '11:00', end: '19:00' },
            wednesday: { start: '11:00', end: '19:00' },
            thursday: { start: '11:00', end: '19:00' },
            friday: { start: '11:00', end: '19:00' },
            saturday: null,
            sunday: null
        }
    },
    {
        slug: 'doc8',
        name: 'Dr. Timothy White',
        image: '/static/doctors/doc8.png',
        speciality: 'Gynecologist',
        degree: 'MBBS',
        experience: '3 Years',
        about: 'Supports women through all stages of reproductive health.',
        fees: 60,
        address: { line1: '44, FC Road', line2: 'Pune, Maharashtra - 411004' },
        workingHours: {
            monday: { start: '08:00', end: '16:00' },
            tuesday: { start: '08:00', end: '16:00' },
            wednesday: { start: '08:00', end: '16:00' },
            thursday: { start: '08:00', end: '16:00' },
            friday: { start: '08:00', end: '16:00' },
            saturday: { start: '09:00', end: '13:00' },
            sunday: null
        }
    },
    {
        slug: 'doc9',
        name: 'Dr. Ava Mitchell',
        image: '/static/doctors/doc9.png',
        speciality: 'Dermatologist',
        degree: 'MBBS',
        experience: '1 Years',
        about: 'Specializes in acne, eczema, and general dermatology consultations.',
        fees: 30,
        address: { line1: '31, Sector 18', line2: 'Noida, Uttar Pradesh - 201301' },
        workingHours: {
            monday: { start: '10:00', end: '18:00' },
            tuesday: { start: '10:00', end: '18:00' },
            wednesday: { start: '10:00', end: '18:00' },
            thursday: { start: '10:00', end: '18:00' },
            friday: { start: '10:00', end: '16:00' },
            saturday: { start: '10:00', end: '14:00' },
            sunday: null
        }
    },
    {
        slug: 'doc10',
        name: 'Dr. Jeffrey King',
        image: '/static/doctors/doc10.png',
        speciality: 'Pediatricians',
        degree: 'MBBS',
        experience: '2 Years',
        about: 'Friendly pediatric care for infants, children, and adolescents.',
        fees: 40,
        address: { line1: '6, SG Highway', line2: 'Ahmedabad, Gujarat - 380054' },
        workingHours: {
            monday: { start: '09:00', end: '17:00' },
            tuesday: { start: '09:00', end: '17:00' },
            wednesday: { start: '09:00', end: '17:00' },
            thursday: { start: '09:00', end: '17:00' },
            friday: { start: '09:00', end: '15:00' },
            saturday: null,
            sunday: null
        }
    },
    {
        slug: 'doc11',
        name: 'Dr. Zoe Kelly',
        image: '/static/doctors/doc11.png',
        speciality: 'Neurologist',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Evaluates headaches, seizures, and other neurological concerns.',
        fees: 50,
        address: { line1: '18, Panampilly Nagar', line2: 'Kochi, Kerala - 682036' },
        workingHours: defaultHours
    },
    {
        slug: 'doc12',
        name: 'Dr. Patrick Harris',
        image: '/static/doctors/doc12.png',
        speciality: 'Neurologist',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Combines clinical assessment with practical follow-up for neurological care.',
        fees: 50,
        address: { line1: '21, Gomti Nagar', line2: 'Lucknow, Uttar Pradesh - 226010' },
        workingHours: defaultHours
    },
    {
        slug: 'doc13',
        name: 'Dr. Chloe Evans',
        image: '/static/doctors/doc13.png',
        speciality: 'General physician',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Helps patients with routine medical needs and chronic disease follow-up.',
        fees: 50,
        address: { line1: '5, Sector 17', line2: 'Chandigarh - 160017' },
        workingHours: defaultHours
    },
    {
        slug: 'doc14',
        name: 'Dr. Ryan Martinez',
        image: '/static/doctors/doc14.png',
        speciality: 'Gynecologist',
        degree: 'MBBS',
        experience: '3 Years',
        about: 'Offers confidential, respectful gynecology consultations.',
        fees: 60,
        address: { line1: '14, Bandra West', line2: 'Mumbai, Maharashtra - 400050' },
        workingHours: defaultHours
    },
    {
        slug: 'doc15',
        name: 'Dr. Amelia Hill',
        image: '/static/doctors/doc15.png',
        speciality: 'Dermatologist',
        degree: 'MBBS',
        experience: '1 Years',
        about: 'Treats common skin, hair, and nail conditions with a personalised plan.',
        fees: 30,
        address: { line1: '8, Salt Lake Sector V', line2: 'Kolkata, West Bengal - 700091' },
        workingHours: defaultHours
    }
];

export const seedCatalog = async () => {
    await Doctor.deleteMany({});
    const created = await Doctor.insertMany(doctors);
    console.log(`Seeded ${created.length} doctors`);

    await User.deleteMany({ role: { $in: ['admin', 'doctor', 'patient'] }, email: { $in: ['admin@prescripto.com', 'doctor@prescripto.com', 'patient@prescripto.com'] } });

    await User.create({
        name: 'Prescripto Admin',
        email: 'admin@prescripto.com',
        password: 'Admin@123',
        role: 'admin'
    });
    console.log('Admin login: admin@prescripto.com / Admin@123');

    const first = created[0];
    await User.create({
        name: first.name,
        email: 'doctor@prescripto.com',
        password: 'Doctor@123',
        role: 'doctor',
        doctor: first._id
    });
    console.log(`Doctor login: doctor@prescripto.com / Doctor@123 (${first.name})`);

    const patient = await User.create({
        name: 'Ananya Shah',
        email: 'patient@prescripto.com',
        password: 'Patient@123',
        role: 'patient'
    });

    const comments = [
        { rating: 5, comment: 'Calm, clear, and on time. Booking on Velora was effortless.' },
        { rating: 4, comment: 'Good consult. Explained the plan without rushing.' },
        { rating: 5, comment: 'Felt listened to. Would book again.' },
        { rating: 4, comment: 'Clinic was easy to find and the slot was honoured.' }
    ];

    for (let i = 0; i < 4; i++) {
        const doc = created[i];
        const when = new Date();
        when.setDate(when.getDate() - (i + 2));
        when.setHours(11, 0, 0, 0);
        const appt = await Appointment.create({
            user: patient._id,
            doctor: doc._id,
            slotDateTime: when,
            amount: doc.fees,
            status: 'paid',
            paymentProvider: 'razorpay',
            visitCompleted: true
        });
        await Review.create({
            user: patient._id,
            doctor: doc._id,
            appointment: appt._id,
            rating: comments[i].rating,
            comment: comments[i].comment
        });
        const stats = await Review.aggregate([
            { $match: { doctor: doc._id } },
            { $group: { _id: '$doctor', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);
        await Doctor.findByIdAndUpdate(doc._id, {
            ratingAvg: Math.round((stats[0]?.avg || 0) * 10) / 10,
            ratingCount: stats[0]?.count || 0
        });
    }
    console.log('Patient login: patient@prescripto.com / Patient@123 (with sample reviews)');

    const upcoming = new Date();
    upcoming.setDate(upcoming.getDate() + 1);
    upcoming.setHours(11, 0, 0, 0);
    await Appointment.create({
        user: patient._id,
        doctor: created[0]._id,
        slotDateTime: upcoming,
        amount: created[0].fees,
        status: 'pending',
        mode: 'clinic'
    });
    await Notification.create({
        user: patient._id,
        title: 'Welcome to Velora',
        body: 'Your upcoming visit with Dr. Richard James is waiting for payment.',
        link: '/my-appointments'
    });
};

const isCli = process.argv[1]?.includes('seedDoctors.js');

if (isCli) {
    const run = async () => {
        await connectDB();
        await seedCatalog();
        await mongoose.disconnect();
        process.exit(0);
    };

    run().catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
