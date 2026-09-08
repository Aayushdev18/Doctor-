import { useNavigate } from 'react-router-dom'
import StarRating from './StarRating'
import Portrait from './Portrait'

const DoctorCard = ({ doctor, currencySymbol = '₹' }) => {
    const navigate = useNavigate()
    const available = doctor.available !== false

    return (
        <button
            type='button'
            onClick={() => { navigate(`/appointment/${doctor._id}`); scrollTo(0, 0) }}
            className='group text-left bg-white rounded-2xl overflow-hidden border border-ink/10 shadow-card hover:border-primary/30 hover:shadow-soft transition-all duration-200'
        >
            <div className='relative'>
                <Portrait src={doctor.image} alt={doctor.name} />
                <span className={`absolute top-3 left-3 z-20 inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full backdrop-blur-md ${available ? 'bg-white/90 text-emerald-800' : 'bg-white/90 text-gray-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${available ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    {available ? 'Available' : 'Unavailable'}
                </span>
            </div>
            <div className='p-4'>
                <p className='text-[11px] uppercase tracking-[0.16em] text-primary font-semibold'>{doctor.speciality}</p>
                <p className='text-[17px] font-semibold mt-1 leading-snug'>{doctor.name}</p>
                {doctor.address?.line2 && (
                    <p className='text-xs text-ink/45 mt-1 truncate'>{doctor.address.line2}</p>
                )}
                <div className='flex items-center justify-between mt-3 pt-3 border-t border-ink/10'>
                    <div className='flex items-center gap-1.5'>
                        <StarRating value={Math.round(doctor.ratingAvg || 0)} size='text-sm' />
                        <span className='text-xs text-ink/45'>
                            {doctor.ratingCount ? `${doctor.ratingAvg}` : 'New'}
                        </span>
                    </div>
                    {doctor.fees != null && (
                        <p className='text-sm font-semibold'>{currencySymbol}{doctor.fees}</p>
                    )}
                </div>
            </div>
        </button>
    )
}

export default DoctorCard
