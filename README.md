# Velora Health — Doctor Appointment Booking

Full-stack clinic product: patients book live slots, pay with Razorpay, and manage visits. Doctors run a week calendar. Admins see stats and an activity log.

**Live:** https://doctor-tau-rouge.vercel.app  
**Code:** https://github.com/Aayushdev18/Doctor-

## Architecture

```
React (Vite)  ──/api──►  Express on Vercel serverless
                         JWT roles: patient | doctor | admin
                         MongoDB Atlas (appointments unique per doctor+slot)
                         Razorpay order → signature verify → receipt
```

Video consults open a **Jitsi** room (`meet.jit.si/VeloraHealth-{id}`) — no extra API key.

## Run locally (3 minutes)

```bash
cd backend && npm install && npm run seed && npm start
# other terminal
cd frontend && npm install && npm run dev
```

Open **http://localhost:5173** (not port 4000).

| Role | Email | Password |
|------|--------|----------|
| Patient | patient@prescripto.com | Patient@123 |
| Doctor | doctor@prescripto.com | Doctor@123 |
| Admin | admin@prescripto.com | Admin@123 |

Pay (Test): card `4111 1111 1111 1111`, UPI `success@razorpay`. Copy Razorpay Test keys into `backend/.env` as `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`.

```bash
cd backend && npm test
```

## Deploy (Vercel)

Same GitHub repo builds the React app and the `/api` function.

**Project** → Settings → Environment Variables (Production + Preview):

| Key | Example |
|-----|---------|
| `MONGO_URI` | `mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/prescripto?retryWrites=true&w=majority` |
| `JWT_SECRET` | long random string |
| `CLIENT_URL` | `https://doctor-tau-rouge.vercel.app` |
| `RAZORPAY_KEY_ID` | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Test secret |

Atlas → Network Access → `0.0.0.0/0`. Then **Redeploy**. Check `https://your-app.vercel.app/api/health` → `"mongo":"ok"`.

## Features

Patients search specialists, book clinic or video slots, reschedule or cancel, pay, print a receipt, and review after the visit. Doctors add notes and mark visits done. Admins see weekly bookings and a clinic activity log. Concurrent bookings of the same slot are rejected (unique index + tests in CI).
