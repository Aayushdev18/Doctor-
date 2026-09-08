import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api, { assetUrl } from '../../api'
import PanelLayout from '../../components/PanelLayout'

const adminLinks = [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/doctors', label: 'Doctors' },
    { to: '/admin/appointments', label: 'Appointments' }
]

const emptyForm = {
    name: '',
    speciality: 'General physician',
    degree: 'MBBS',
    experience: '1 Years',
    about: '',
    fees: 50,
    email: '',
    password: 'Doctor@123',
    phone: '',
    address: { line1: '', line2: '' }
}

const AdminDoctors = () => {
    const [doctors, setDoctors] = useState([])
    const [form, setForm] = useState(emptyForm)
    const [saving, setSaving] = useState(false)

    const load = async () => {
        const { data } = await api.get('/admin/doctors')
        setDoctors(data.doctors || [])
    }

    useEffect(() => {
        load().catch((error) => toast.error(error.response?.data?.message || 'Could not load doctors'))
    }, [])

    const onChange = (e) => {
        const { name, value } = e.target
        if (name === 'line1' || name === 'line2') {
            setForm((prev) => ({ ...prev, address: { ...prev.address, [name]: value } }))
            return
        }
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await api.post('/admin/doctors', form)
            toast.success('Doctor added')
            setForm(emptyForm)
            await load()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not add doctor')
        } finally {
            setSaving(false)
        }
    }

    const toggle = async (id) => {
        try {
            await api.patch(`/admin/doctors/${id}/availability`)
            await load()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not update doctor')
        }
    }

    return (
        <PanelLayout title='Manage Doctors' links={adminLinks}>
            <form onSubmit={onSubmit} className='bg-white border rounded-xl p-5 mb-8 grid grid-cols-1 md:grid-cols-2 gap-3'>
                <input name='name' value={form.name} onChange={onChange} placeholder='Doctor name' className='border rounded p-2' required />
                <select name='speciality' value={form.speciality} onChange={onChange} className='border rounded p-2'>
                    <option>General physician</option>
                    <option>Gynecologist</option>
                    <option>Dermatologist</option>
                    <option>Pediatricians</option>
                    <option>Neurologist</option>
                </select>
                <input name='degree' value={form.degree} onChange={onChange} placeholder='Degree' className='border rounded p-2' required />
                <input name='experience' value={form.experience} onChange={onChange} placeholder='Experience' className='border rounded p-2' required />
                <input name='fees' type='number' value={form.fees} onChange={onChange} placeholder='Fees' className='border rounded p-2' required />
                <input name='email' type='email' value={form.email} onChange={onChange} placeholder='Login email' className='border rounded p-2' required />
                <input name='password' value={form.password} onChange={onChange} placeholder='Login password' className='border rounded p-2' required />
                <input name='phone' value={form.phone} onChange={onChange} placeholder='Phone' className='border rounded p-2' />
                <input name='line1' value={form.address.line1} onChange={onChange} placeholder='Address line 1' className='border rounded p-2' />
                <input name='line2' value={form.address.line2} onChange={onChange} placeholder='Address line 2' className='border rounded p-2' />
                <textarea name='about' value={form.about} onChange={onChange} placeholder='About' className='border rounded p-2 md:col-span-2' required />
                <button disabled={saving} className='bg-primary text-white rounded py-2 md:col-span-2'>
                    {saving ? 'Saving...' : 'Add doctor'}
                </button>
            </form>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {doctors.map((doc) => (
                    <div key={doc._id} className='bg-white border rounded-xl p-4 flex gap-4'>
                        <img src={assetUrl(doc.image)} alt='' className='w-20 h-20 object-cover rounded bg-blue-50' />
                        <div className='flex-1 text-sm'>
                            <p className='font-semibold'>{doc.name}</p>
                            <p className='text-gray-500'>{doc.speciality} · ₹{doc.fees}</p>
                            <p className={doc.available ? 'text-green-600' : 'text-red-500'}>
                                {doc.available ? 'Available' : 'Unavailable'}
                            </p>
                            <button onClick={() => toggle(doc._id)} className='mt-2 border px-3 py-1 rounded text-xs'>
                                Toggle availability
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </PanelLayout>
    )
}

export default AdminDoctors
