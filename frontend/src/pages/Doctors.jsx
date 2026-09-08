import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import DoctorCard from '../components/DoctorCard'
import { DoctorCardSkeleton } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'

const specialities = [
    'General physician',
    'Gynecologist',
    'Dermatologist',
    'Pediatricians',
    'Neurologist'
]

const Doctors = () => {
    const { speciality } = useParams()
    const [search, setSearch] = useState('')
    const [availableOnly, setAvailableOnly] = useState(false)
    const [sort, setSort] = useState('name')
    const navigate = useNavigate()
    const { doctors, currencySymbol, refreshDoctors, doctorsError, doctorsLoading } = useContext(AppContext)

    useEffect(() => {
        refreshDoctors?.()
    }, [])

    const visibleDoctors = useMemo(() => {
        let list = doctors
        if (speciality) list = list.filter((doc) => doc.speciality === speciality)
        const q = search.trim().toLowerCase()
        if (q) {
            list = list.filter((doc) =>
                doc.name.toLowerCase().includes(q) ||
                doc.speciality.toLowerCase().includes(q)
            )
        }
        if (availableOnly) list = list.filter((doc) => doc.available !== false)
        const sorted = [...list]
        if (sort === 'fees-asc') sorted.sort((a, b) => a.fees - b.fees)
        if (sort === 'fees-desc') sorted.sort((a, b) => b.fees - a.fees)
        if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name))
        return sorted
    }, [doctors, speciality, search, availableOnly, sort])

    const toggleSpeciality = (name) => {
        if (speciality === name) navigate('/doctors')
        else navigate(`/doctors/${name}`)
    }

    return (
        <div className='py-10 pb-16'>
            <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-4'>
                <div>
                    <p className='text-xs font-semibold uppercase tracking-[0.18em] text-primary'>Directory</p>
                    <h1 className='font-display text-4xl md:text-5xl mt-2'>Find your specialist</h1>
                    <p className='text-ink/55 mt-2 text-sm'>{visibleDoctors.length} doctors matching your filters</p>
                </div>
            </div>

            <div className='mt-8 bg-white rounded-2xl border border-ink/10 p-4 sm:p-5 shadow-card'>
                <div className='flex flex-col lg:flex-row gap-3'>
                    <input
                        type='search'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder='Search by name or speciality'
                        className='border border-ink/10 bg-sand rounded-xl px-4 py-3 w-full outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white'
                    />
                    <div className='flex flex-wrap gap-3'>
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className='border border-ink/10 bg-sand rounded-xl px-4 py-3 text-sm outline-none'
                        >
                            <option value='name'>Sort by name</option>
                            <option value='fees-asc'>Fee: low to high</option>
                            <option value='fees-desc'>Fee: high to low</option>
                        </select>
                        <label className='flex items-center gap-2 text-sm whitespace-nowrap px-3 rounded-xl border border-ink/10 bg-sand'>
                            <input type='checkbox' checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} />
                            Available only
                        </label>
                    </div>
                </div>
                <div className='flex flex-wrap gap-2 mt-4'>
                    <button
                        type='button'
                        onClick={() => navigate('/doctors')}
                        className={`px-4 py-2 rounded-full text-sm border transition-colors ${!speciality ? 'bg-ink text-white border-ink' : 'bg-white border-ink/10 text-ink/70 hover:border-primary'}`}
                    >
                        All
                    </button>
                    {specialities.map((name) => (
                        <button
                            type='button'
                            key={name}
                            onClick={() => toggleSpeciality(name)}
                            className={`px-4 py-2 rounded-full text-sm border transition-colors ${speciality === name ? 'bg-ink text-white border-ink' : 'bg-white border-ink/10 text-ink/70 hover:border-primary'}`}
                        >
                            {name}
                        </button>
                    ))}
                </div>
            </div>

            <div className='mt-8'>
                {doctorsLoading ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
                        {Array.from({ length: 8 }).map((_, i) => <DoctorCardSkeleton key={i} />)}
                    </div>
                ) : doctorsError ? (
                    <EmptyState
                        illustration='alert'
                        title='Couldn’t load doctors'
                        copy={doctorsError}
                        action={
                            <button type='button' onClick={() => refreshDoctors()} className='mt-4 bg-ink text-white px-5 py-2.5 rounded-full text-sm font-medium'>
                                Try again
                            </button>
                        }
                    />
                ) : visibleDoctors.length === 0 ? (
                    <EmptyState
                        illustration='search'
                        title='No matching specialists'
                        copy='Try another name, speciality, or clear the filters to see the full directory.'
                    />
                ) : (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
                        {visibleDoctors.map((item) => (
                            <DoctorCard key={item._id} doctor={item} currencySymbol={currencySymbol} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Doctors
