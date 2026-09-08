import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema(
    {
        line1: { type: String, default: '' },
        line2: { type: String, default: '' }
    },
    { _id: false }
);

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, minlength: 6 },
        role: {
            type: String,
            enum: ['patient', 'doctor', 'admin'],
            default: 'patient'
        },
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor',
            default: null
        },
        phone: { type: String, default: '' },
        gender: { type: String, default: '' },
        birthday: { type: String, default: '' },
        address: { type: addressSchema, default: () => ({}) }
    },
    { timestamps: true }
);

userSchema.pre('save', async function hashPassword() {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function matchPassword(entered) {
    return bcrypt.compare(entered, this.password);
};

userSchema.methods.toPublicJSON = function toPublicJSON() {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        role: this.role,
        doctor: this.doctor,
        phone: this.phone,
        gender: this.gender,
        birthday: this.birthday,
        address: this.address
    };
};

export default mongoose.model('User', userSchema);
