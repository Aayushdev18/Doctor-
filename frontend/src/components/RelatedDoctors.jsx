import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import DoctorCard from './DoctorCard'

const RelatedDoctors = ({ speciality, docId }) => {
    const { doctors, currencySymbol } = useContext(AppContext)
    const navigate = useNavigate()
    const [relDoc, setRelDocs] = useState([])
    useEffect(() => {
        if (doctors.length > 0 && speciality) {
            setRelDocs(doctors.filter((doc) => doc.speciality === speciality && doc._id !== docId))
        }
    }, [doctors, speciality, docId])

    if (!relDoc.length) return null

    return (
        <div className='mt-16'>
            <h2 className='font-display text-3xl'>Similar doctors</h2>
            <div className='grid grid-cols-auto gap-5 mt-6'>
                {relDoc.slice(0, 4).map((item) => (
                    <DoctorCard key={item._id} doctor={item} currencySymbol={currencySymbol} />
                ))}
            </div>
            <button onClick={() => { navigate('/doctors'); scrollTo(0, 0) }} className='mt-8 text-sm font-semibold text-primary'>
                Browse everyone →
            </button>
        </div>
    )
}

export default RelatedDoctors
