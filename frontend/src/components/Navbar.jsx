import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AppContext'
import BrandLogo from './BrandLogo'
import NotificationBell from './NotificationBell'
import ThemeToggle from './ThemeToggle'

const Navbar = () => {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false)
    const { user, logout } = useAuth()

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const linkClass = ({ isActive }) =>
        `text-[13px] font-medium px-1 py-1 ${isActive ? 'text-primary' : 'text-ink/55 hover:text-ink'}`

    return (
        <header className='sticky top-0 z-30 border-b border-ink/10 bg-white/90 backdrop-blur-md'>
            <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between'>
                <BrandLogo onClick={() => navigate('/')} />
                <nav className='hidden md:flex items-center gap-7'>
                    <NavLink to='/' className={linkClass}>Home</NavLink>
                    <NavLink to='/doctors' className={linkClass}>Doctors</NavLink>
                    <NavLink to='/about' className={linkClass}>About</NavLink>
                    <NavLink to='/contact' className={linkClass}>Contact</NavLink>
                </nav>
                <div className='flex items-center gap-3'>
                    <ThemeToggle />
                    {user ? (
                        <div className='flex items-center gap-2'>
                            <NotificationBell />
                            <div className='flex items-center gap-2 cursor-pointer group relative'>
                            <img className='w-9 h-9 rounded-full object-cover' src={assets.profile_pic} alt='' />
                            <span className='hidden sm:block text-sm font-medium max-w-[120px] truncate'>{user.name}</span>
                            <div className='absolute top-0 right-0 pt-12 text-sm z-20 hidden group-hover:block'>
                                <div className='min-w-52 bg-white rounded-2xl shadow-card flex flex-col gap-1 p-2 border border-ink/10'>
                                    {user.role === 'admin' && (
                                        <p onClick={() => navigate('/admin')} className='hover:bg-sand rounded-xl px-3 py-2 cursor-pointer'>Admin panel</p>
                                    )}
                                    {user.role === 'doctor' && (
                                        <p onClick={() => navigate('/doctor')} className='hover:bg-sand rounded-xl px-3 py-2 cursor-pointer'>Doctor panel</p>
                                    )}
                                    <p onClick={() => navigate('/my-profile')} className='hover:bg-sand rounded-xl px-3 py-2 cursor-pointer'>My profile</p>
                                    <p onClick={() => navigate('/my-appointments')} className='hover:bg-sand rounded-xl px-3 py-2 cursor-pointer'>My appointments</p>
                                    <p onClick={handleLogout} className='text-red-600 hover:bg-red-50 rounded-xl px-3 py-2 cursor-pointer'>Logout</p>
                                </div>
                            </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <button onClick={() => navigate('/login')} className='hidden md:block text-sm font-medium text-ink/70 hover:text-ink'>
                                Log in
                            </button>
                            <button onClick={() => navigate('/login?signup=true')} className='hidden md:block bg-ink text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary transition-colors'>
                                Get started
                            </button>
                        </>
                    )}
                    <img onClick={() => setShowMenu(true)} className='w-6 md:hidden' src={assets.menu_icon} alt='' />
                    <div className={`${showMenu ? 'fixed inset-0' : 'h-0 w-0'} md:hidden z-40 overflow-hidden bg-white transition-all`}>
                        <div className='flex items-center justify-between px-5 h-[72px] border-b border-ink/10'>
                            <BrandLogo onClick={() => { setShowMenu(false); navigate('/') }} />
                            <img className='w-7' onClick={() => setShowMenu(false)} src={assets.cross_icon} alt='' />
                        </div>
                        <ul className='flex flex-col items-center gap-5 mt-10 text-lg'>
                            <NavLink onClick={() => setShowMenu(false)} to='/'>Home</NavLink>
                            <NavLink onClick={() => setShowMenu(false)} to='/doctors'>Doctors</NavLink>
                            <NavLink onClick={() => setShowMenu(false)} to='/about'>About</NavLink>
                            <NavLink onClick={() => setShowMenu(false)} to='/contact'>Contact</NavLink>
                            {user ? (
                                <button onClick={() => { handleLogout(); setShowMenu(false) }} className='bg-ink text-white px-8 py-3 rounded-full'>Logout</button>
                            ) : (
                                <button onClick={() => { navigate('/login?signup=true'); setShowMenu(false) }} className='bg-ink text-white px-8 py-3 rounded-full'>Get started</button>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Navbar
