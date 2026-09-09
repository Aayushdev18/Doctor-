import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../../api'
import PanelLayout from '../../components/PanelLayout'
import { adminLinks } from '../../adminNav'

const AdminAudit = () => {
    const [logs, setLogs] = useState([])

    useEffect(() => {
        api.get('/admin/audit')
            .then(({ data }) => setLogs(data.logs || []))
            .catch((error) => toast.error(error.response?.data?.message || 'Could not load activity'))
    }, [])

    return (
        <PanelLayout title='Clinic activity' links={adminLinks}>
            <p className='text-sm text-ink/50 mb-4'>Bookings, payments, cancellations, and visit notes.</p>
            <div className='bg-white border border-ink/10 rounded-2xl overflow-x-auto'>
                <table className='w-full text-sm'>
                    <thead className='bg-sand text-left'>
                        <tr>
                            <th className='p-3'>When</th>
                            <th className='p-3'>Who</th>
                            <th className='p-3'>Action</th>
                            <th className='p-3'>Detail</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log._id} className='border-t border-ink/10'>
                                <td className='p-3 whitespace-nowrap'>{new Date(log.createdAt).toLocaleString('en-IN')}</td>
                                <td className='p-3'>{log.actorName}<div className='text-xs text-ink/45'>{log.actorRole}</div></td>
                                <td className='p-3 capitalize'>{String(log.action).replaceAll('_', ' ')}</td>
                                <td className='p-3 text-ink/60'>{log.detail}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {logs.length === 0 && <p className='p-6 text-ink/50'>No activity yet. New bookings will appear here.</p>}
            </div>
        </PanelLayout>
    )
}

export default AdminAudit
