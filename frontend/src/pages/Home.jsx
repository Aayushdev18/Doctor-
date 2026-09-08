import React from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'
import SymptomGuide from '../components/SymptomGuide'

const steps = [
    { n: '1', t: 'Choose a speciality', d: 'Dermatology, neurology, paediatrics — pick what you actually need.' },
    { n: '2', t: 'Pick a live slot', d: 'See working hours and already-booked times before you commit.' },
    { n: '3', t: 'Confirm in seconds', d: 'Create an account, book, pay, or cancel from your appointments.' }
]

const Home = () => {
    return (
        <div className='pb-4'>
            <Header />
            <SymptomGuide />
            <div className='grid grid-cols-2 md:grid-cols-4 gap-3 py-2'>
                {[
                    ['Verified doctors', 'Profiles checked before they go live'],
                    ['Live slots', 'Booked times disappear instantly'],
                    ['Secure pay', 'Razorpay checkout, receipt after'],
                    ['AI guide', 'Describe symptoms, get a speciality']
                ].map(([title, copy]) => (
                    <div key={title} className='bg-white rounded-2xl border border-ink/10 p-4'>
                        <p className='text-sm font-semibold'>{title}</p>
                        <p className='text-xs text-ink/50 mt-1 leading-relaxed'>{copy}</p>
                    </div>
                ))}
            </div>
            <div id='how' className='grid md:grid-cols-3 gap-4 py-6'>
                {steps.map((step) => (
                    <div key={step.n} className='bg-white rounded-2xl p-6 border border-ink/10'>
                        <p className='w-8 h-8 rounded-full bg-mist text-primary text-sm font-semibold grid place-items-center'>{step.n}</p>
                        <p className='font-semibold mt-4'>{step.t}</p>
                        <p className='text-sm text-ink/55 mt-2 leading-relaxed'>{step.d}</p>
                    </div>
                ))}
            </div>
            <SpecialityMenu />
            <TopDoctors />
            <Banner />
        </div>
    )
}

export default Home
