import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../../api'
import PanelLayout from '../../components/PanelLayout'

const adminLinks = [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/doctors', label: 'Doctors' },
    { to: '/admin/appointments', label: 'Appointments' }
]

const AdminDashboard = () => {
    const [stats, setStats] = useState(null)

    useEffect(() => {
        api.get('/admin/stats')
            .then(({ data }) => setStats(data))
            .catch((error) => toast.error(error.response?.data?.message || 'Could not load stats'))
    }, [])

    const cards = [
        { label: 'Patients', value: stats?.patients ?? '—' },
        { label: 'Doctors', value: stats?.doctors ?? '—' },
        { label: 'Appointments', value: stats?.appointments ?? '—' },
        { label: 'Revenue (₹)', value: stats?.revenue ?? '—' }
    ]

    return (
        <PanelLayout title='Admin Dashboard' links={adminLinks}>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                {cards.map((card) => (
                    <div key={card.label} className='bg-white rounded-xl p-5 shadow-sm border'>
                        <p className='text-sm text-gray-500'>{card.label}</p>
                        <p className='text-3xl font-semibold mt-2'>{card.value}</p>
                    </div>
                ))}
            </div>
            <p className='text-sm text-gray-500 mt-8'>
                Add doctors from the Doctors tab. Each doctor gets a login to manage their appointments.
            </p>
        </PanelLayout>
    )
}

export default AdminDashboard
