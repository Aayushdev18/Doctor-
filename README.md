# Velora Health — Doctor Appointment Booking

Full-stack app: React (Vite) frontend, Express API, MongoDB.

## Run locally

**Backend** (http://localhost:4000)

```bash
cd backend
npm install
npm run seed
npm start
```

**Frontend** (http://localhost:5173)

```bash
cd frontend
npm install
npm run dev
```

Keep both terminals open. Open the **frontend** URL in the browser.

## Demo accounts

After `npm run seed` in `backend/`:

- **Admin:** `admin@prescripto.com` / `Admin@123` → http://localhost:5173/admin
- **Doctor:** `doctor@prescripto.com` / `Doctor@123` → http://localhost:5173/doctor
- **Patient:** `patient@prescripto.com` / `Patient@123` → book, Razorpay pay, review after visit

## Razorpay (real checkout)

1. Create a free account at https://dashboard.razorpay.com
2. Switch to **Test mode** → Account & Settings → API Keys → Generate
3. Put them in `backend/.env`:

```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxx
ALLOW_DEMO_PAY=false
```

4. Restart the API. **Pay with Razorpay** opens the official Checkout.
5. Test card: `4111 1111 1111 1111`, any future expiry, any CVV, any 3D-secure PIN.

Without keys, Pay is blocked (no fake “paid”). Set `ALLOW_DEMO_PAY=true` only if you need a shortcut.

Optional webhook: `POST https://your-api/api/payments/razorpay/webhook` with event `payment.captured` and `RAZORPAY_WEBHOOK_SECRET`. Checkout still verifies on localhost without a webhook.

## Features

- Patient: search doctors, ratings, book slots, Razorpay, cancel, review after a paid visit
- Admin: stats, manage doctors, view appointments
- Doctor: manage own appointments and profile
