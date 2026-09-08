import mongoose from 'mongoose';

const hoursSchema = new mongoose.Schema(
    {
        start: String,
        end: String
    },
    { _id: false }
);

const doctorSchema = new mongoose.Schema(
    {
        slug: { type: String, unique: true },
        name: { type: String, required: true },
        image: { type: String, required: true },
        speciality: { type: String, required: true },
        degree: { type: String, required: true },
        experience: { type: String, required: true },
        about: { type: String, required: true },
        fees: { type: Number, required: true },
        available: { type: Boolean, default: true },
        ratingAvg: { type: Number, default: 0 },
        ratingCount: { type: Number, default: 0 },
        address: {
            line1: String,
            line2: String
        },
        workingHours: {
            monday: { type: hoursSchema, default: null },
            tuesday: { type: hoursSchema, default: null },
            wednesday: { type: hoursSchema, default: null },
            thursday: { type: hoursSchema, default: null },
            friday: { type: hoursSchema, default: null },
            saturday: { type: hoursSchema, default: null },
            sunday: { type: hoursSchema, default: null }
        }
    },
    { timestamps: true }
);

export default mongoose.model('Doctor', doctorSchema);
