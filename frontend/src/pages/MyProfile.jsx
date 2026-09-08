import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import { toast } from 'react-toastify'
import api from '../api'

const MyProfile = () => {
    const { user, setUser } = useContext(AppContext)
    const navigate = useNavigate()

    useEffect(() => {
        if (!user) navigate('/login')
    }, [user, navigate])
    const [isEdit, setIsEdit] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        gender: user?.gender || '',
        birthday: user?.birthday || '',
        address: {
            line1: user?.address?.line1 || '',
            line2: user?.address?.line2 || ''
        }
    })

    const onChange = (e) => {
        const { name, value } = e.target
        if (name === 'line1' || name === 'line2') {
            setForm((prev) => ({ ...prev, address: { ...prev.address, [name]: value } }))
            return
        }
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const saveProfile = async () => {
        setSaving(true)
        try {
            const { data } = await api.put('/auth/profile', form)
            setUser(data.user)
            localStorage.setItem('user', JSON.stringify(data.user))
            setIsEdit(false)
            toast.success('Profile updated')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not update profile')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className='max-w-3xl mx-auto mt-8'>
            <div className='flex flex-col items-center mb-8'>
                <img 
                    src={assets.profile_pic} 
                    alt="Profile" 
                    className='w-32 h-32 rounded-full mb-4 object-cover border-4 border-primary'
                />
                {isEdit ? (
                    <input
                        name='name'
                        value={form.name}
                        onChange={onChange}
                        className='text-2xl font-medium text-gray-900 border-b px-2 py-1 text-center'
                    />
                ) : (
                    <h1 className='text-3xl font-medium text-gray-900'>{user?.name || 'Your profile'}</h1>
                )}
            </div>

            <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
                <h2 className='text-xl font-medium text-gray-700 mb-4 border-b pb-2'>CONTACT INFORMATION</h2>
                <div className='space-y-4'>
                    <div>
                        <label className='text-gray-600'>Email id:</label>
                        <p className='text-primary'>{user?.email}</p>
                    </div>
                    <div>
                        <label className='text-gray-600'>Phone:</label>
                        {isEdit ? (
                            <input name='phone' value={form.phone} onChange={onChange} className='border rounded w-full p-2 mt-1' />
                        ) : (
                            <p className='text-gray-800'>{user?.phone || '—'}</p>
                        )}
                    </div>
                    <div>
                        <label className='text-gray-600'>Address:</label>
                        {isEdit ? (
                            <div className='space-y-2 mt-1'>
                                <input name='line1' value={form.address.line1} onChange={onChange} className='border rounded w-full p-2' placeholder='Line 1' />
                                <input name='line2' value={form.address.line2} onChange={onChange} className='border rounded w-full p-2' placeholder='Line 2' />
                            </div>
                        ) : (
                            <>
                                <p className='text-gray-800'>{user?.address?.line1 || '—'}</p>
                                <p className='text-gray-800'>{user?.address?.line2}</p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className='bg-white rounded-lg shadow-sm p-6'>
                <h2 className='text-xl font-medium text-gray-700 mb-4 border-b pb-2'>BASIC INFORMATION</h2>
                <div className='space-y-4'>
                    <div>
                        <label className='text-gray-600'>Gender:</label>
                        {isEdit ? (
                            <select name='gender' value={form.gender} onChange={onChange} className='border rounded w-full p-2 mt-1'>
                                <option value=''>Select</option>
                                <option value='Male'>Male</option>
                                <option value='Female'>Female</option>
                                <option value='Other'>Other</option>
                            </select>
                        ) : (
                            <p className='text-gray-800'>{user?.gender || '—'}</p>
                        )}
                    </div>
                    <div>
                        <label className='text-gray-600'>Birthday:</label>
                        {isEdit ? (
                            <input type='date' name='birthday' value={form.birthday} onChange={onChange} className='border rounded w-full p-2 mt-1' />
                        ) : (
                            <p className='text-gray-800'>{user?.birthday || '—'}</p>
                        )}
                    </div>
                </div>
            </div>

            {isEdit ? (
                <div className='flex gap-3 mt-6'>
                    <button
                        onClick={saveProfile}
                        disabled={saving}
                        className='border border-primary bg-primary text-white px-8 py-2 rounded-full'
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                        onClick={() => setIsEdit(false)}
                        className='border border-gray-300 text-gray-700 px-8 py-2 rounded-full'
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <button 
                    onClick={() => setIsEdit(true)} 
                    className='mt-6 border border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 px-8 py-2 rounded-full'
                >
                    Edit
                </button>
            )}
        </div>
    )
}

export default MyProfile
