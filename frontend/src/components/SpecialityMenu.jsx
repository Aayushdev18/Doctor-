import React from 'react'
import { specialityData } from '../assets/assets'
import { Link } from 'react-router-dom'

const SpecialityMenu = () => {
    return (
        <div className='py-14' id='speciality'>
            <p className='text-xs font-semibold uppercase tracking-[0.18em] text-primary'>Specialities</p>
            <h2 className='font-display text-3xl md:text-[2.5rem] mt-2'>What kind of care do you need?</h2>
            <p className='text-ink/55 mt-3 max-w-xl'>Choose a speciality to see doctors taking appointments this week.</p>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-8'>
                {specialityData.map((item) => (
                    <Link
                        onClick={() => scrollTo(0, 0)}
                        className='bg-white rounded-2xl p-5 text-center border border-ink/10 hover:border-primary/40 hover:shadow-card transition-all'
                        key={item.speciality}
                        to={`/doctors/${item.speciality}`}
                    >
                        <img className='w-12 h-12 mx-auto mb-3 object-contain' src={item.image} alt='' />
                        <p className='text-sm font-medium leading-snug'>{item.speciality}</p>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default SpecialityMenu
