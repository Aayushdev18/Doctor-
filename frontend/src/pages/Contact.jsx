import React from 'react'
import { assets } from '../assets/assets'

const Contact = () => {
    return (
        <div className='grid md:grid-cols-2 gap-10 items-center py-8'>
            <div>
                <p className='text-xs uppercase tracking-[0.25em] text-primary font-semibold'>Contact</p>
                <h1 className='font-display text-4xl mt-2'>We’re here, without the hold music.</h1>
                <p className='text-ink/60 mt-4'>Questions about bookings, clinic onboarding, or the assignment demo — write to us.</p>
                <div className='mt-8 bg-white rounded-2xl p-6 border border-ink/10 shadow-card space-y-4'>
                    <div>
                        <p className='text-xs uppercase tracking-wider text-ink/40'>Studio</p>
                        <p>11/378, Preet Vihar, Delhi</p>
                    </div>
                    <div>
                        <p className='text-xs uppercase tracking-wider text-ink/40'>Reach</p>
                        <p>+91 99990 85486</p>
                        <p>hello@velora.health</p>
                    </div>
                </div>
            </div>
            <img className='w-full rounded-[2rem] shadow-soft' src={assets.contact_image} alt='' />
        </div>
    )
}

export default Contact
