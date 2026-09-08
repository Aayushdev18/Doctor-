import React from 'react'
import { useNavigate } from 'react-router-dom'
import BrandLogo from './BrandLogo'

const Footer = () => {
    const navigate = useNavigate()
    return (
        <footer className='mt-8 bg-[#12211E] text-white'>
            <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14'>
                <div className='grid md:grid-cols-4 gap-10'>
                    <div className='md:col-span-2'>
                        <BrandLogo light onClick={() => navigate('/')} />
                        <p className='text-sm text-white/60 mt-5 max-w-sm leading-relaxed'>
                            A quieter way to find specialists, book appointments, and stay on top of your care.
                        </p>
                    </div>
                    <div>
                        <p className='text-xs uppercase tracking-[0.18em] text-white/40 mb-4'>Explore</p>
                        <ul className='text-sm flex flex-col gap-3 text-white/70'>
                            <li className='cursor-pointer hover:text-white' onClick={() => navigate('/')}>Home</li>
                            <li className='cursor-pointer hover:text-white' onClick={() => navigate('/doctors')}>Doctors</li>
                            <li className='cursor-pointer hover:text-white' onClick={() => navigate('/about')}>About</li>
                            <li className='cursor-pointer hover:text-white' onClick={() => navigate('/contact')}>Contact</li>
                        </ul>
                    </div>
                    <div>
                        <p className='text-xs uppercase tracking-[0.18em] text-white/40 mb-4'>Clinic</p>
                        <ul className='text-sm flex flex-col gap-3 text-white/70'>
                            <li>+91 99990 85486</li>
                            <li>hello@velora.health</li>
                            <li>Preet Vihar, Delhi</li>
                        </ul>
                    </div>
                </div>
                <p className='text-xs text-white/35 mt-12 pt-6 border-t border-white/10'>© {new Date().getFullYear()} Velora Health</p>
            </div>
        </footer>
    )
}

export default Footer
