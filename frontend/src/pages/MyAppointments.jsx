import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AppContext'
import { toast } from 'react-toastify'
import api, { assetUrl } from '../api'
import { assets } from '../assets/assets'
import StarRating from '../components/StarRating'
import { openRazorpayCheckout } from '../payments/razorpay'
import EmptyState from '../components/EmptyState'
import Portrait from '../components/Portrait'

const formatWhen = (value) => {
    const when = new Date(value)
    return {
        dateLabel: when.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
        timeLabel: when.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }
}

const MyAppointments = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('upcoming')
    const [reviewingId, setReviewingId] = useState('')
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [paying, setPaying] = useState(false)
    const [payConfig, setPayConfig] = useState({ razorpayEnabled: false, demoPayEnabled: false, testMode: false })
    const [rescheduleId, setRescheduleId] = useState('')
    const [slots, setSlots] = useState([])
    const [newSlot, setNewSlot] = useState(null)

    const loadAppointments = async () => {
        try {
            const { data } = await api.get('/appointments')
            setAppointments(data.appointments || [])
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not load appointments')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }
        loadAppointments()
        api.get('/payments/config').then(({ data }) => setPayConfig(data)).catch(() => {})
    }, [user])

    const visible = useMemo(() => {
        const now = Date.now()
        return appointments.filter((a) => {
            const upcoming = a.status !== 'cancelled' && new Date(a.slotDateTime).getTime() > now
            return tab === 'upcoming' ? upcoming : !upcoming
        })
    }, [appointments, tab])

    const handlePayment = async (appointment) => {
        setPaying(appointment._id)
        try {
            const { data } = await api.post('/payments/razorpay/order', { appointmentId: appointment._id })
            await openRazorpayCheckout({
                order: data,
                appointmentId: appointment._id,
                onSuccess: async () => {
                    toast.success('Payment confirmed. Sending you to your receipt.')
                    navigate(`/receipt/${appointment._id}?paid=1`)
                }
            })
        } catch (error) {
            if (error.response?.status === 503 && payConfig.demoPayEnabled) {
                try {
                    await api.patch(`/appointments/${appointment._id}/pay`)
                    toast.success('Demo payment recorded. Add Razorpay keys for real checkout.')
                    navigate(`/receipt/${appointment._id}?paid=1`)
                    return
                } catch (demoError) {
                    toast.error(demoError.response?.data?.message || 'Payment failed')
                    return
                }
            }
            const message = error.response?.data?.message || error.message
            if (message !== 'Payment cancelled') {
                toast.error(message || 'Payment failed')
            } else {
                toast.info('Payment cancelled')
            }
        } finally {
            setPaying(false)
        }
    }

    const openReschedule = async (appointment) => {
        setRescheduleId(appointment._id)
        setNewSlot(null)
        try {
            const { data } = await api.get(`/doctors/${appointment.doctor._id}/slots`)
            setSlots(data.slots || [])
        } catch {
            toast.error('Could not load open slots')
        }
    }

    const saveReschedule = async () => {
        if (!newSlot) return
        try {
            await api.patch(`/appointments/${rescheduleId}/reschedule`, { slotDateTime: newSlot })
            toast.success('Visit moved to the new slot')
            setRescheduleId('')
            loadAppointments()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not reschedule')
        }
    }

    const handleCancelAppointment = async (appointmentId) => {
        try {
            await api.patch(`/appointments/${appointmentId}/cancel`)
            toast.info('Appointment cancelled')
            loadAppointments()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not cancel appointment')
        }
    }

    const handleConfirmVisit = async (appointmentId) => {
        try {
            await api.patch(`/appointments/${appointmentId}/complete`)
            toast.success('Visit confirmed')
            setReviewingId(appointmentId)
            loadAppointments()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not confirm visit')
        }
    }

    const handleReview = async (appointmentId) => {
        try {
            await api.post('/reviews', { appointmentId, rating, comment })
            toast.success('Review published')
            setReviewingId('')
            setComment('')
            setRating(5)
            loadAppointments()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not save review')
        }
    }

    if (loading) {
        return <p className='py-12 text-ink/50'>Loading appointments…</p>
    }

    return (
        <div className='py-10 pb-16'>
            <p className='text-xs uppercase tracking-[0.18em] text-primary font-semibold'>Schedule</p>
            <h1 className='font-display text-4xl mt-2'>My appointments</h1>
            {!payConfig.razorpayEnabled && (
                <div className='mt-4 bg-amber-50 border border-amber-200 text-amber-900 text-sm rounded-2xl p-4'>
                    Razorpay is not configured on this server. In Vercel → doctor → Settings → Environment Variables add
                    <span className='block mt-1 font-mono'>RAZORPAY_KEY_ID</span>
                    <span className='block font-mono'>RAZORPAY_KEY_SECRET</span>
                    <span className='block mt-1'>Use Test mode keys from dashboard.razorpay.com, then Redeploy. Locally those same names go in backend/.env.</span>
                    {payConfig.demoPayEnabled && <span className='block mt-1'>Demo pay is on as a fallback until keys are added.</span>}
                </div>
            )}
            {payConfig.razorpayEnabled && payConfig.testMode && (
                <p className='mt-3 text-sm text-ink/60 bg-mist rounded-2xl p-3'>
                    Test mode: UPI and QR are visible. A real PhonePe/GPay scan usually fails here — use UPI ID <span className='font-mono'>success@razorpay</span>, or card <span className='font-mono'>4111 1111 1111 1111</span>.
                </p>
            )}
            <div className='flex gap-2 mt-6'>
                {['upcoming', 'past'].map((key) => (
                    <button
                        key={key}
                        type='button'
                        onClick={() => setTab(key)}
                        className={`px-4 py-2 rounded-full text-sm capitalize ${tab === key ? 'bg-ink text-white' : 'bg-white border border-ink/10'}`}
                    >
                        {key}
                    </button>
                ))}
            </div>
            <div className='space-y-4 mt-6'>
                {visible.length === 0 && (
                    <EmptyState
                        illustration='calendar'
                        title={tab === 'upcoming' ? 'Your week is clear' : 'No past visits yet'}
                        copy={tab === 'upcoming' ? 'Book a specialist when you’re ready. Confirmations and receipts live here.' : 'Completed and cancelled visits will appear in this list.'}
                        action={tab === 'upcoming' ? (
                            <button type='button' onClick={() => navigate('/doctors')} className='mt-4 bg-ink text-white px-5 py-2.5 rounded-full text-sm'>
                                Browse doctors
                            </button>
                        ) : null}
                    />
                )}
                {visible.map((appointment) => {
                    const doctor = appointment.doctor
                    if (!doctor) return null
                    const { dateLabel, timeLabel } = formatWhen(appointment.slotDateTime)
                    const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${doctor.address?.line1 || ''} ${doctor.address?.line2 || ''}`)}`

                    return (
                        <div className='p-5 bg-white rounded-2xl border border-ink/10 shadow-card' key={appointment._id}>
                            <div className='flex flex-col sm:flex-row gap-5'>
                                <Portrait src={assetUrl(doctor.image)} alt={doctor.name} className='w-28 h-28' rounded='rounded-2xl' />
                                <div className='flex-1 text-sm text-ink/70'>
                                    <div className='flex flex-wrap gap-2'>
                                        <span className={`text-[11px] uppercase tracking-wider px-2 py-1 rounded-full ${appointment.mode === 'video' ? 'bg-mist text-primary' : 'bg-sand text-ink/70'}`}>
                                            {appointment.mode === 'video' ? 'Video' : 'In-clinic'}
                                        </span>
                                        <span className={`text-[11px] uppercase tracking-wider px-2 py-1 rounded-full ${
                                            appointment.status === 'paid' ? 'bg-emerald-50 text-emerald-700' :
                                            appointment.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'
                                        }`}>
                                            {appointment.status}
                                        </span>
                                    </div>
                                    <p className='font-semibold text-xl text-ink mt-2'>{doctor.name}</p>
                                    <p>{doctor.speciality}</p>
                                    <p className='mt-2 text-ink font-medium'>{dateLabel} · {timeLabel}</p>
                                    {appointment.mode !== 'video' && (
                                        <a href={maps} target='_blank' rel='noreferrer' className='text-xs text-primary mt-1 inline-block'>
                                            {doctor.address?.line1}, {doctor.address?.line2}
                                        </a>
                                    )}
                                    {appointment.prescription && (
                                        <p className='mt-3 text-xs bg-sand rounded-xl p-3'><span className='font-semibold text-ink'>Prescription: </span>{appointment.prescription}</p>
                                    )}
                                    {appointment.notes && (
                                        <p className='mt-2 text-xs bg-sand rounded-xl p-3'><span className='font-semibold text-ink'>Doctor note: </span>{appointment.notes}</p>
                                    )}
                                </div>
                                <div className='flex flex-col gap-2 sm:min-w-44'>
                                    {appointment.status === 'pending' && (
                                        <button
                                            onClick={() => handlePayment(appointment)}
                                            disabled={paying === appointment._id}
                                            className='text-sm py-2 rounded-full bg-[#0B5CFF] text-white flex items-center justify-center gap-2'
                                        >
                                            <img src={assets.razorpay_logo} alt='' className='h-4 bg-white rounded px-1' />
                                            {paying === appointment._id ? 'Opening Razorpay…' : `Pay ₹${appointment.amount || doctor.fees} with Razorpay`}
                                        </button>
                                    )}
                                    {appointment.status === 'paid' && (
                                        <button onClick={() => navigate(`/receipt/${appointment._id}`)} className='text-sm py-2 rounded-full border border-ink/10'>
                                            View receipt
                                        </button>
                                    )}
                                    {appointment.canReschedule && (
                                        <button onClick={() => openReschedule(appointment)} className='text-sm py-2 rounded-full border border-ink/10'>
                                            Reschedule
                                        </button>
                                    )}
                                    {appointment.canConfirmVisit && (
                                        <button onClick={() => handleConfirmVisit(appointment._id)} className='text-sm py-2 rounded-full bg-primary text-white'>
                                            I completed this visit
                                        </button>
                                    )}
                                    {appointment.canReview && reviewingId !== appointment._id && (
                                        <button onClick={() => { setReviewingId(appointment._id); setRating(5); setComment('') }} className='text-sm py-2 rounded-full border border-ink/10'>
                                            Write a review
                                        </button>
                                    )}
                                    {appointment.review && <p className='text-xs text-ink/50'>Reviewed</p>}
                                    {appointment.status !== 'cancelled' && appointment.canReschedule && (
                                        <button onClick={() => handleCancelAppointment(appointment._id)} className='text-sm py-2 rounded-full border border-ink/10 hover:text-red-600'>
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                            {reviewingId === appointment._id && (
                                <div className='bg-sand rounded-2xl p-4 mt-4'>
                                    <p className='text-sm font-medium mb-2'>How was your visit?</p>
                                    <StarRating value={rating} onChange={setRating} size='text-2xl' />
                                    <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder='Share a short note for other patients' className='w-full mt-3 rounded-xl border border-ink/10 p-3 text-sm outline-none' rows={3} />
                                    <div className='flex gap-2 mt-3'>
                                        <button onClick={() => handleReview(appointment._id)} className='bg-ink text-white text-sm px-4 py-2 rounded-full'>Publish</button>
                                        <button onClick={() => setReviewingId('')} className='text-sm px-4 py-2'>Cancel</button>
                                    </div>
                                </div>
                            )}
                            {rescheduleId === appointment._id && (
                                <div className='bg-sand rounded-2xl p-4 mt-4'>
                                    <p className='text-sm font-medium mb-3'>Pick a new slot</p>
                                    <div className='flex flex-wrap gap-2'>
                                        {slots.flat().filter((s) => s.status === 'available').slice(0, 18).map((slot) => (
                                            <button
                                                type='button'
                                                key={slot.datetime}
                                                onClick={() => setNewSlot(slot.datetime)}
                                                className={`text-xs px-3 py-2 rounded-full border ${new Date(newSlot).getTime() === new Date(slot.datetime).getTime() ? 'bg-ink text-white border-ink' : 'bg-white border-ink/10'}`}
                                            >
                                                {new Date(slot.datetime).toLocaleString('en-IN', { weekday: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </button>
                                        ))}
                                    </div>
                                    <div className='flex gap-2 mt-4'>
                                        <button type='button' onClick={saveReschedule} disabled={!newSlot} className='bg-ink text-white text-sm px-4 py-2 rounded-full disabled:bg-gray-300'>Save</button>
                                        <button type='button' onClick={() => setRescheduleId('')} className='text-sm px-4 py-2'>Close</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default MyAppointments
