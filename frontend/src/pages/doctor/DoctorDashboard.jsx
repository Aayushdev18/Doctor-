import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../../api'
import PanelLayout from '../../components/PanelLayout'

const doctorLinks = [
    { to: '/doctor', label: 'Calendar', end: true },
    { to: '/doctor/profile', label: 'Profile' }
]

const startOfWeek = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    d.setDate(d.getDate() - day)
    d.setHours(0, 0, 0, 0)
    return d
}

const DoctorDashboard = () => {
    const [appointments, setAppointments] = useState([])
    const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
    const [noteId, setNoteId] = useState('')
    const [notes, setNotes] = useState('')
    const [prescription, setPrescription] = useState('')

    const load = async () => {
        const { data } = await api.get('/doctor/appointments')
        setAppointments(data.appointments || [])
    }

    useEffect(() => {
        load().catch((error) => toast.error(error.response?.data?.message || 'Could not load appointments'))
    }, [])

    const days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart)
        d.setDate(weekStart.getDate() + i)
        return d
    }), [weekStart])

    const byDay = useMemo(() => {
        const map = {}
        appointments.forEach((item) => {
            if (item.status === 'cancelled') return
            const key = new Date(item.slotDateTime).toDateString()
            map[key] = map[key] || []
            map[key].push(item)
        })
        return map
    }, [appointments])

    const complete = async (id) => {
        try {
            await api.patch(`/doctor/appointments/${id}/complete`)
            toast.success('Visit marked complete')
            await load()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not update')
        }
    }

    const saveNotes = async (id) => {
        try {
            await api.patch(`/doctor/appointments/${id}/notes`, { notes, prescription })
            toast.success('Notes sent to the patient')
            setNoteId('')
            await load()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not save notes')
        }
    }

    const shiftWeek = (delta) => {
        const next = new Date(weekStart)
        next.setDate(weekStart.getDate() + delta * 7)
        setWeekStart(next)
    }

    return (
        <PanelLayout title='Your week' links={doctorLinks}>
            <div className='flex items-center justify-between mb-5'>
                <button type='button' onClick={() => shiftWeek(-1)} className='text-sm px-3 py-1.5 rounded-full border border-ink/10 bg-white'>← Prev</button>
                <p className='text-sm font-medium'>
                    {days[0].toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {days[6].toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
                <button type='button' onClick={() => shiftWeek(1)} className='text-sm px-3 py-1.5 rounded-full border border-ink/10 bg-white'>Next →</button>
            </div>
            <div className='grid grid-cols-7 gap-2 overflow-x-auto'>
                {days.map((day) => (
                    <div key={day.toDateString()} className='bg-white rounded-2xl border border-ink/10 min-w-[120px] p-2'>
                        <p className='text-[11px] uppercase tracking-wider text-ink/45'>{day.toLocaleDateString('en-IN', { weekday: 'short' })}</p>
                        <p className='font-semibold text-lg'>{day.getDate()}</p>
                        <div className='mt-2 space-y-1 min-h-[160px]'>
                            {(byDay[day.toDateString()] || []).map((item) => (
                                <div key={item._id} className={`text-[11px] rounded-lg px-2 py-1 ${item.status === 'paid' ? 'bg-mist text-primary' : 'bg-amber-50 text-amber-800'}`}>
                                    {new Date(item.slotDateTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                    <p className='font-medium truncate'>{item.user?.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <h2 className='font-display text-2xl mt-10 mb-4'>Visit list</h2>
            <div className='space-y-3'>
                {appointments.length === 0 && <p className='text-ink/50'>No appointments yet.</p>}
                {appointments.map((item) => (
                    <div key={item._id} className='bg-white border border-ink/10 rounded-2xl p-4'>
                        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
                            <div className='text-sm'>
                                <p className='font-semibold'>{item.user?.name}</p>
                                <p className='text-ink/50'>{item.user?.email}</p>
                                <p className='mt-1'>{new Date(item.slotDateTime).toLocaleString('en-IN')}</p>
                                <p className='capitalize text-xs mt-1'>{item.mode || 'clinic'} · {item.status}</p>
                            </div>
                            <div className='flex gap-2'>
                                {item.status !== 'cancelled' && (
                                    <button onClick={() => { setNoteId(item._id); setNotes(item.notes || ''); setPrescription(item.prescription || '') }} className='border border-ink/10 px-4 py-2 rounded-full text-sm'>
                                        Notes
                                    </button>
                                )}
                                    {item.mode === 'video' && item.videoJoinUrl && (
                                        <a href={item.videoJoinUrl} target='_blank' rel='noreferrer' className='border border-ink/10 px-4 py-2 rounded-full text-sm text-center'>
                                            Join video
                                        </a>
                                    )}
                                    {item.status === 'paid' && !item.visitCompleted && (
                                        <button onClick={() => complete(item._id)} className='bg-ink text-white px-4 py-2 rounded-full text-sm'>
                                            Mark visit done
                                        </button>
                                    )}
                            </div>
                        </div>
                        {noteId === item._id && (
                            <div className='mt-4 grid sm:grid-cols-2 gap-3'>
                                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder='Clinical notes' className='border border-ink/10 rounded-xl p-3 text-sm' rows={3} />
                                <textarea value={prescription} onChange={(e) => setPrescription(e.target.value)} placeholder='Prescription' className='border border-ink/10 rounded-xl p-3 text-sm' rows={3} />
                                <button type='button' onClick={() => saveNotes(item._id)} className='bg-primary text-white text-sm px-4 py-2 rounded-full w-fit'>Save & notify patient</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </PanelLayout>
    )
}

export default DoctorDashboard
