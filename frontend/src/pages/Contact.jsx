import React from 'react'
import { assets } from '../assets/assets'

const Contact = () => {
  return (
    <div className='flex flex-col sm:flex-row items-center gap-10 sm:gap-20 my-10'>
      <div className='flex-1'>
        <p className='text-3xl font-medium text-gray-900'>Get in touch</p>
        <p className='text-gray-500 mt-3'>Have a question or just want to say hi? We'd love to hear from you.</p>
        <div className='mt-8'>
            <p className='text-gray-900 font-medium'>Our Office</p>
            <p className='text-gray-500 mt-2'>123 Sample St, Sydney NSW 2000 AU</p>
            <p className='text-gray-900 font-medium mt-8'>Contact Info</p>
            <p className='text-gray-500 '>Tel: (415) 555‑0132 <br/> Email: ayushdev18@gmail.com</p>
        </div>
      </div>
      <img className='w-full sm:w-1/2' src={assets.contact_image} alt=''/>
    </div>
  )
}

export default Contact
