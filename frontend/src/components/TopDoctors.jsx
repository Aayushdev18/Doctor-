import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import DoctorCard from './DoctorCard'
import { DoctorCardSkeleton } from './Skeleton'

const TopDoctors = () => {
    const navigate = useNavigate()
    const { doctors, currencySymbol, doctorsLoading, doctorsError, refreshDoctors } = useContext(AppContext)
    return (
        <div className='py-6'>
            <div className='flex items-end justify-between gap-4 mb-8'>
                <div>
                    <p className='text-xs font-semibold uppercase tracking-[0.18em] text-primary'>Clinicians</p>
                    <h2 className='font-display text-3xl md:text-[2.5rem] mt-2'>Doctors patients book first</h2>
                </div>
                <button onClick={() => { navigate('/doctors'); scrollTo(0, 0) }} className='hidden sm:block text-sm font-semibold text-primary hover:text-ink'>
                    View all
                </button>
            </div>
            {doctorsLoading ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
                    {Array.from({ length: 8 }).map((_, i) => <DoctorCardSkeleton key={i} />)}
                </div>
            ) : doctorsError ? (
                <div className='bg-white rounded-2xl p-8 text-center border border-ink/10'>
                    <p className='text-ink/70 text-sm'>{doctorsError}</p>
                    <button type='button' onClick={() => refreshDoctors()} className='mt-4 bg-ink text-white px-5 py-2.5 rounded-full text-sm font-medium'>
                        Try again
                    </button>
                </div>
            ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
                    {doctors.slice(0, 8).map((item) => (
                        <DoctorCard key={item._id} doctor={item} currencySymbol={currencySymbol} />
                    ))}
                </div>
            )}
            <button onClick={() => { navigate('/doctors'); scrollTo(0, 0) }} className='sm:hidden mt-8 w-full border border-ink/10 py-3 rounded-full text-sm font-semibold bg-white'>
                View all doctors
            </button>
        </div>
    )
}

export default TopDoctors
