import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AppContext'

const Banner = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    return (
        <div className='relative overflow-hidden rounded-[1.8rem] bg-ink text-white px-8 md:px-12 py-12 md:py-14 my-16'>
            <div className='absolute right-[-40px] top-[-40px] w-64 h-64 bg-primary/40 rounded-full blur-3xl' />
            <div className='relative grid md:grid-cols-2 gap-8 items-center'>
                <div>
                    <p className='text-xs uppercase tracking-[0.2em] text-white/50 font-semibold'>Join Velora</p>
                    <h2 className='font-display text-3xl md:text-5xl mt-3 leading-tight'>Your next appointment, without the waiting room.</h2>
                    {!user && (
                        <button
                            onClick={() => { navigate('/login?signup=true'); scrollTo(0, 0) }}
                            className='mt-8 bg-white text-ink px-8 py-3 rounded-full text-sm font-semibold hover:bg-mist transition-colors'
                        >
                            Create a free account
                        </button>
                    )}
                </div>
                <img className='hidden md:block w-full max-w-xs ml-auto drop-shadow-xl' src={assets.appointment_img} alt='' />
            </div>
        </div>
    )
}

export default Banner
