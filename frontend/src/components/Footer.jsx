import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Footer = () => {
    const navigate = useNavigate()
  return (
    <div className='bg-gray-100 mt-16 py-8 px-6 md:px-16'>
        <div className='flex flex-col md:flex-row gap-16 items-start'>
            <div className='flex-1'>
                <img className='w-44' src={assets.logo} alt=''/>
                <p className='text-sm text-gray-600 mt-5'>Find the right doctor and book an appointment</p>
            </div>
            <div className='flex-1'>
                <p className='font-medium mb-4'>Quick Links</p>
                <ul className='text-sm text-gray-600 flex flex-col gap-3'>
                    <li className='cursor-pointer hover:text-black' onClick={()=>navigate('/')}>Home</li>
                    <li className='cursor-pointer hover:text-black' onClick={()=>navigate('/doctors')}>All Doctors</li>
                    <li className='cursor-pointer hover:text-black' onClick={()=>navigate('/about')}>About</li>
                    <li className='cursor-pointer hover:text-black' onClick={()=>navigate('/contact')}>Contact</li>
                </ul>
            </div>
            <div className='flex-1'>
                <p className='font-medium mb-4'>Contact Info</p>
                <ul className='text-sm text-gray-600 flex flex-col gap-3'>
                    <li>+1 123 456 7890</li>
                    <li>ayushdev18@gmail.com</li>
                    <li>123 Sample St, Sydney NSW 2000 AU</li>
                </ul>
            </div>
            <div className='flex-1'>
                <p className='font-medium mb-4'>Social Links</p>
                <div className='flex gap-3'>
                    <img className='w-6 cursor-pointer' src={assets.chats_icon} alt=''/>
                </div>
            </div>
        </div>
        <hr className='my-10'/>
        <p className='text-center text-sm text-gray-600'>© 2024 Doctor Appointment. All rights reserved.</p>
    </div>
  )
}

export default Footer
