import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api, { assetUrl } from '../api'
import { useAuth } from '../context/AppContext'
import DoctorCard from './DoctorCard'

const examples = [
    'Itchy rash on both arms for a week',
    'Migraines and numbness in my left hand',
    'Missed periods and pelvic pain',
    'My 3-year-old has a fever and cough'
]

const SymptomGuide = () => {
    const navigate = useNavigate()
    const { currencySymbol, mapDoctor } = useAuth()
    const [symptoms, setSymptoms] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)

    const submit = async (event) => {
        event.preventDefault()
        setLoading(true)
        setResult(null)
        try {
            const { data } = await api.post('/ai/triage', { symptoms }, { timeout: 20000 })
            setResult({
                ...data,
                doctors: (data.doctors || []).map((doctor) => mapDoctor ? mapDoctor(doctor) : { ...doctor, image: assetUrl(doctor.image) })
            })
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not suggest a speciality')
        } finally {
            setLoading(false)
        }
    }

    return (
        <section id='guide' className='bg-white rounded-[1.8rem] border border-ink/10 shadow-card p-6 md:p-8 my-6'>
            <p className='text-xs font-semibold uppercase tracking-[0.18em] text-primary'>AI guide</p>
            <h2 className='font-display text-3xl md:text-4xl mt-2'>Not sure who to book?</h2>
            <p className='text-ink/55 mt-2 max-w-2xl text-sm'>Describe what you’re feeling. We’ll suggest a speciality and doctors on Velora. This is not a diagnosis.</p>
            <form onSubmit={submit} className='mt-6 flex flex-col sm:flex-row gap-3'>
                <input
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder='e.g. itchy rash on my arms'
                    maxLength={400}
                    className='flex-1 border border-ink/10 bg-sand rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white'
                />
                <button type='submit' disabled={loading} className='bg-ink text-white px-6 py-3 rounded-2xl text-sm font-semibold disabled:bg-gray-400'>
                    {loading ? 'Matching…' : 'Find a speciality'}
                </button>
            </form>
            <div className='flex flex-wrap gap-2 mt-3'>
                {examples.map((example) => (
                    <button
                        type='button'
                        key={example}
                        onClick={() => setSymptoms(example)}
                        className='text-xs px-3 py-1.5 rounded-full border border-ink/10 text-ink/60 hover:border-primary'
                    >
                        {example}
                    </button>
                ))}
            </div>

            {result && (
                <div className='mt-8 border-t border-ink/10 pt-6'>
                    <div className={`rounded-2xl px-4 py-3 text-sm ${result.urgency === 'emergency' ? 'bg-red-50 text-red-800' : 'bg-mist text-ink/80'}`}>
                        <p className='font-semibold'>Suggested: {result.speciality}</p>
                        <p className='mt-1'>{result.summary}</p>
                    </div>
                    <p className='text-xs text-ink/40 mt-3'>{result.disclaimer}</p>
                    <div className='flex items-center justify-between mt-6 mb-4'>
                        <p className='font-semibold'>Doctors who match</p>
                        <button type='button' onClick={() => navigate(`/doctors/${result.speciality}`)} className='text-sm font-semibold text-primary'>
                            See all {result.speciality}
                        </button>
                    </div>
                    {result.doctors.length === 0 ? (
                        <p className='text-sm text-ink/50'>No doctors listed for that speciality yet.</p>
                    ) : (
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                            {result.doctors.map((doctor) => (
                                <DoctorCard key={doctor._id} doctor={doctor} currencySymbol={currencySymbol} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    )
}

export default SymptomGuide
