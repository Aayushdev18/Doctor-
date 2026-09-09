import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import request from 'supertest';
import { closeDB } from '../config/db.js';
import { isValidRazorpaySignature, razorpaySignature } from '../utils/razorpaySig.js';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'velora-test-jwt-secret-value';
process.env.RAZORPAY_KEY_SECRET = 'test_razorpay_secret_key';
process.env.ALLOW_EMBEDDED_MONGO = 'true';
process.env.ALLOW_DEMO_PAY = 'false';

const { default: app, ensureReady } = await import('../server.js');

const futureSlot = () => {
    const when = new Date();
    when.setDate(when.getDate() + 8);
    when.setHours(16, 17, 0, 0);
    return when.toISOString();
};

let patientA;
let patientB;
let doctorId;

before(async () => {
    await ensureReady();
    const stamp = Date.now();
    const slot = futureSlot();

    const a = await request(app).post('/api/auth/register').send({
        name: 'Patient A',
        email: `a-${stamp}@velora.test`,
        password: 'Secret12'
    });
    const b = await request(app).post('/api/auth/register').send({
        name: 'Patient B',
        email: `b-${stamp}@velora.test`,
        password: 'Secret12'
    });
    assert.equal(a.status, 201);
    assert.equal(b.status, 201);
    patientA = a.body;
    patientB = b.body;

    const doctors = await request(app).get('/api/doctors');
    assert.ok(doctors.body.doctors?.length > 0);
    doctorId = doctors.body.doctors[0]._id;

    const first = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientA.token}`)
        .send({ doctorId, slotDateTime: slot });
    assert.equal(first.status, 201);

    const clash = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientB.token}`)
        .send({ doctorId, slotDateTime: slot });
    assert.equal(clash.status, 409);
});

after(async () => {
    await closeDB();
});

test('rejects a forged Razorpay signature', () => {
    const secret = 'test_razorpay_secret_key';
    const orderId = 'order_test';
    const paymentId = 'pay_test';
    const good = razorpaySignature(orderId, paymentId, secret);
    assert.equal(isValidRazorpaySignature({ orderId, paymentId, signature: good, secret }), true);
    assert.equal(isValidRazorpaySignature({
        orderId,
        paymentId,
        signature: 'a'.repeat(good.length),
        secret
    }), false);
});

test('patient cannot open the admin dashboard', async () => {
    const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${patientA.token}`);
    assert.equal(res.status, 403);
});

test('verify endpoint rejects a fake payment signature', async () => {
    const slot = new Date();
    slot.setDate(slot.getDate() + 4);
    slot.setHours(14, 0, 0, 0);

    const booked = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientA.token}`)
        .send({ doctorId, slotDateTime: slot.toISOString() });
    assert.equal(booked.status, 201);

    const fake = await request(app)
        .post('/api/payments/razorpay/verify')
        .set('Authorization', `Bearer ${patientA.token}`)
        .send({
            appointmentId: booked.body.appointment._id,
            razorpay_order_id: 'order_fake',
            razorpay_payment_id: 'pay_fake',
            razorpay_signature: 'deadbeef'
        });
    assert.equal(fake.status, 400);
});
