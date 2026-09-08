import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AppContext'

const NotificationBell = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)
    const [items, setItems] = useState([])
    const [unread, setUnread] = useState(0)

    const load = async () => {
        if (!user) return
        try {
            const { data } = await api.get('/notifications')
            setItems(data.notifications || [])
            setUnread(data.unread || 0)
        } catch {
            setItems([])
        }
    }

    useEffect(() => {
        load()
        const id = setInterval(load, 20000)
        return () => clearInterval(id)
    }, [user])

    const openPanel = async () => {
        setOpen((v) => !v)
        if (!open && unread) {
            await api.patch('/notifications/read').catch(() => {})
            setUnread(0)
        }
    }

    if (!user) return null

    return (
        <div className='relative'>
            <button type='button' onClick={openPanel} className='relative h-9 w-9 rounded-full border border-ink/10 grid place-items-center text-sm hover:bg-sand'>
                <span aria-hidden>🔔</span>
                {unread > 0 && (
                    <span className='absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-primary text-white text-[10px] grid place-items-center'>
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>
            {open && (
                <div className='absolute right-0 top-11 w-80 bg-white rounded-2xl border border-ink/10 shadow-card z-40 overflow-hidden'>
                    <p className='px-4 py-3 text-sm font-semibold border-b border-ink/10'>Notifications</p>
                    <div className='max-h-80 overflow-y-auto'>
                        {items.length === 0 && <p className='p-4 text-sm text-ink/50'>You’re all caught up.</p>}
                        {items.map((item) => (
                            <button
                                type='button'
                                key={item._id}
                                onClick={() => { setOpen(false); navigate(item.link || '/my-appointments') }}
                                className={`w-full text-left px-4 py-3 border-b border-ink/5 hover:bg-sand ${item.read ? '' : 'bg-mist/50'}`}
                            >
                                <p className='text-sm font-medium'>{item.title}</p>
                                <p className='text-xs text-ink/55 mt-0.5'>{item.body}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default NotificationBell
