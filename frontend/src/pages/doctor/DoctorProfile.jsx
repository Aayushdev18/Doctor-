import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../../api'
import PanelLayout from '../../components/PanelLayout'

const doctorLinks = [
    { to: '/doctor', label: 'Appointments', end: true },
    { to: '/doctor/profile', label: 'Profile' }
]

const DoctorProfile = () => {
    const [form, setForm] = useState({ about: '', fees: 0, available: true, experience: '' })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        api.get('/doctor/profile')
            .then(({ data }) => {
                setForm({
                    about: data.doctor.about || '',
                    fees: data.doctor.fees || 0,
                    available: data.doctor.available,
                    experience: data.doctor.experience || ''
                })
            })
            .catch((error) => toast.error(error.response?.data?.message || 'Could not load profile'))
    }, [])

    const save = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await api.put('/doctor/profile', form)
            toast.success('Profile updated')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not update profile')
        } finally {
            setSaving(false)
        }
    }

    return (
        <PanelLayout title='Doctor Profile' links={doctorLinks}>
            <form onSubmit={save} className='bg-white border rounded-xl p-5 max-w-xl space-y-3'>
                <label className='block text-sm'>
                    Experience
                    <input className='border rounded w-full p-2 mt-1' value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
                </label>
                <label className='block text-sm'>
                    Fees (₹)
                    <input type='number' className='border rounded w-full p-2 mt-1' value={form.fees} onChange={(e) => setForm({ ...form, fees: e.target.value })} />
                </label>
                <label className='block text-sm'>
                    About
                    <textarea className='border rounded w-full p-2 mt-1' rows={4} value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} />
                </label>
                <label className='flex items-center gap-2 text-sm'>
                    <input type='checkbox' checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} />
                    Available for booking
                </label>
                <button disabled={saving} className='bg-primary text-white px-6 py-2 rounded'>
                    {saving ? 'Saving...' : 'Save'}
                </button>
            </form>
        </PanelLayout>
    )
}

export default DoctorProfile
