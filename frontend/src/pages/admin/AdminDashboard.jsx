import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../../api'
import PanelLayout from '../../components/PanelLayout'
import { adminLinks } from '../../adminNav'

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
            <p className='text-sm text-ink/50 mt-8'>
                Add doctors from the Doctors tab. Each doctor gets a login for their week calendar.
            </p>
            {stats?.week?.length > 0 && (
                <div className='mt-8 bg-white rounded-2xl border border-ink/10 p-5'>
                    <p className='text-sm font-medium'>Bookings this week</p>
                    <div className='flex items-end gap-3 h-28 mt-4'>
                        {stats.week.map((day) => (
                            <div key={day.label} className='flex-1 flex flex-col items-center justify-end'>
                                <div className='w-full bg-mist rounded-t' style={{ height: `${Math.max(8, (day.bookings || 0) * 18)}px` }} />
                                <p className='text-[10px] mt-1 text-ink/45'>{day.label}</p>
                            </div>
                        ))}
                    </div>
                    <p className='text-xs text-ink/45 mt-3'>Cancelled past visits: {stats.noShows ?? 0}</p>
                </div>
            )}
        </PanelLayout>
    )
}

export default AdminDashboard
