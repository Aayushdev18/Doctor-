import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Header = () => {
    const navigate = useNavigate()

    return (
        <section className='grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-center py-10 lg:py-16'>
            <div>
                <p className='inline-flex items-center gap-2 text-xs font-semibold text-primary bg-mist px-3 py-1.5 rounded-full'>
                    Verified specialists in Delhi NCR
                </p>
                <h1 className='font-display text-[2.4rem] md:text-6xl leading-[1.08] mt-5'>
                    Book a doctor the way you book everything else.
                </h1>
                <p className='text-ink/65 mt-5 max-w-lg text-base leading-relaxed'>
                    See who is actually free this week, pick a slot, and manage visits from one place — no reception desk, no hold music.
                </p>
                <div className='flex flex-wrap gap-3 mt-8'>
                    <button onClick={() => navigate('/doctors')} className='bg-primary text-white px-7 py-3 rounded-full text-sm font-semibold hover:bg-ink transition-colors'>
                        Browse doctors
                    </button>
                    <a href='#guide' className='px-7 py-3 rounded-full text-sm font-semibold bg-white border border-ink/10 hover:border-primary/40 transition-colors'>
                        Try the AI guide
                    </a>
                </div>
                <div className='grid grid-cols-3 gap-4 mt-12 max-w-md'>
                    {[
                        ['15+', 'Specialists'],
                        ['Same week', 'Open slots'],
                        ['From ₹30', 'Consult fee']
                    ].map(([value, label]) => (
                        <div key={label} className='bg-white rounded-2xl border border-ink/10 px-3 py-4'>
                            <p className='font-semibold text-lg leading-tight'>{value}</p>
                            <p className='text-[11px] uppercase tracking-wider text-ink/45 mt-1'>{label}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className='relative'>
                <div className='absolute -inset-4 bg-mist rounded-[2.2rem] -z-10' />
                <img className='relative w-full h-[420px] md:h-[500px] rounded-[1.8rem] object-cover object-top shadow-soft' src={assets.header_img} alt='Doctors at Velora' />
                <div className='absolute bottom-5 left-5 right-5 bg-white/95 rounded-2xl p-4 flex items-center gap-3 shadow-card border border-ink/5'>
                    <img className='w-14' src={assets.group_profiles} alt='' />
                    <p className='text-sm text-ink/70'>Patients across Delhi NCR book with Velora every week.</p>
                </div>
            </div>
        </section>
    )
}

export default Header
