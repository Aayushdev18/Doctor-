import React from 'react'
import { assets } from '../assets/assets'

const About = () => {
    return (
        <div className='pb-12'>
            <p className='text-xs uppercase tracking-[0.25em] text-primary font-semibold'>Our story</p>
            <h1 className='font-display text-4xl md:text-5xl mt-2'>Healthcare access, designed with more care.</h1>
            <div className='my-10 grid md:grid-cols-2 gap-10 items-center'>
                <img className='w-full rounded-[2rem] shadow-soft' src={assets.about_image} alt='' />
                <div className='text-ink/70 leading-relaxed space-y-4'>
                    <p>Velora Health helps you find specialists, see real availability, and book without calling a reception desk five times.</p>
                    <p>We built patient, doctor, and admin views so clinics can run the same system patients already use.</p>
                    <p className='font-semibold text-ink'>Vision</p>
                    <p>A calmer path from “I need a doctor” to “I’m seen this week.”</p>
                </div>
            </div>
            <div className='grid md:grid-cols-3 gap-4'>
                {[
                    ['Fewer delays', 'Slots update from real bookings, not a static timetable.'],
                    ['Clear fees', 'Consult charges are shown before you confirm.'],
                    ['One login', 'Patients book. Doctors manage their day. Admins see the whole clinic.']
                ].map(([title, copy]) => (
                    <div key={title} className='bg-white rounded-2xl p-6 border border-ink/10'>
                        <p className='font-display text-2xl'>{title}</p>
                        <p className='text-sm text-ink/60 mt-3'>{copy}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default About
