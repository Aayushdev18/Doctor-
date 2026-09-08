import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../../api'
import PanelLayout from '../../components/PanelLayout'

const adminLinks = [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/doctors', label: 'Doctors' },
    { to: '/admin/appointments', label: 'Appointments' }
]

const AdminAppointments = () => {
    const [appointments, setAppointments] = useState([])

    useEffect(() => {
        api.get('/admin/appointments')
            .then(({ data }) => setAppointments(data.appointments || []))
            .catch((error) => toast.error(error.response?.data?.message || 'Could not load appointments'))
    }, [])

    return (
        <PanelLayout title='All Appointments' links={adminLinks}>
            <div className='bg-white border rounded-xl overflow-x-auto'>
                <table className='w-full text-sm'>
                    <thead className='bg-slate-50 text-left'>
                        <tr>
                            <th className='p-3'>Patient</th>
                            <th className='p-3'>Doctor</th>
                            <th className='p-3'>When</th>
                            <th className='p-3'>Fee</th>
                            <th className='p-3'>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map((item) => (
                            <tr key={item._id} className='border-t'>
                                <td className='p-3'>{item.user?.name}<div className='text-xs text-gray-500'>{item.user?.email}</div></td>
                                <td className='p-3'>{item.doctor?.name}</td>
                                <td className='p-3'>{new Date(item.slotDateTime).toLocaleString('en-IN')}</td>
                                <td className='p-3'>₹{item.amount || item.doctor?.fees || 0}</td>
                                <td className='p-3 capitalize'>{item.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {appointments.length === 0 && <p className='p-6 text-gray-500'>No appointments yet.</p>}
            </div>
        </PanelLayout>
    )
}

export default AdminAppointments
