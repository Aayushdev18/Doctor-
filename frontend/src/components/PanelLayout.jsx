import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AppContext'
import ThemeToggle from './ThemeToggle'

const PanelLayout = ({ title, links, children }) => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const onLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className='min-h-screen bg-sand'>
            <header className='bg-white/80 backdrop-blur border-b border-ink/5 px-6 py-4 flex items-center justify-between'>
                <div>
                    <p className='text-xs uppercase tracking-[0.22em] text-primary font-semibold'>Velora</p>
                    <h1 className='font-display text-2xl text-ink'>{title}</h1>
                </div>
                <div className='flex items-center gap-4 text-sm'>
                    <span className='text-ink/60'>{user?.name} · {user?.role}</span>
                    <ThemeToggle />
                    <button onClick={() => navigate('/')} className='text-ink/50 hover:text-primary'>Site</button>
                    <button onClick={onLogout} className='text-red-600'>Logout</button>
                </div>
            </header>
            <div className='flex'>
                <aside className='w-56 bg-white min-h-[calc(100vh-73px)] p-4 flex flex-col gap-2 border-r border-ink/5'>
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.end}
                            className={({ isActive }) =>
                                `px-3 py-2 rounded-2xl text-sm ${isActive ? 'bg-primary text-white' : 'text-ink/70 hover:bg-mist'}`
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </aside>
                <main className='flex-1 p-6'>{children}</main>
            </div>
        </div>
    )
}

export default PanelLayout
