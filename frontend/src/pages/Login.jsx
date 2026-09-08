import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AppContext'
import api from '../api'

const Login = () => {
    const location = useLocation()
    const [state, setState] = useState('Login')
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { login } = useAuth()

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        if (params.get('signup') === 'true') setState('Sign Up')
    }, [location])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const validateForm = () => {
        if (state === 'Sign Up' && !formData.name.trim()) {
            toast.error('Name is required!')
            return false
        }
        if (!formData.email.trim()) {
            toast.error('Email is required!')
            return false
        }
        if (!formData.password.trim()) {
            toast.error('Password is required!')
            return false
        }
        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters long!')
            return false
        }
        return true
    }

    const onSubmitHandler = async (event) => {
        event.preventDefault()
        if (!validateForm()) return
        setLoading(true)
        try {
            if (state === 'Sign Up') {
                const { data } = await api.post('/auth/register', formData)
                login(data.user, data.token)
                toast.success('Account created successfully!')
                navigate('/')
            } else {
                const { data } = await api.post('/auth/login', {
                    email: formData.email,
                    password: formData.password
                })
                login(data.user, data.token)
                toast.success('Logged in successfully!')
                if (data.user.role === 'admin') navigate('/admin')
                else if (data.user.role === 'doctor') navigate('/doctor')
                else navigate('/my-appointments')
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong! Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const { user } = useAuth()
    if (user) {
        if (user.role === 'admin') navigate('/admin')
        else if (user.role === 'doctor') navigate('/doctor')
        else navigate('/my-appointments')
        return null
    }

    const inputClass = 'border border-ink/10 rounded-xl w-full p-3 mt-1 bg-sand outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white'

    return (
        <form onSubmit={onSubmitHandler} className='min-h-[70vh] flex items-center py-10'>
            <div className='flex flex-col gap-4 m-auto w-full max-w-md p-8 bg-white rounded-2xl border border-ink/10 shadow-card text-sm'>
                <p className='font-display text-3xl'>{state === 'Sign Up' ? 'Join Velora' : 'Welcome back'}</p>
                <p className='text-ink/60'>{state === 'Sign Up' ? 'Create an account to book care.' : 'Log in to manage appointments.'}</p>
                {state === 'Sign Up' && (
                    <div className='w-full'>
                        <p className='text-xs uppercase tracking-wider text-ink/50'>Full name</p>
                        <input className={inputClass} type='text' name='name' onChange={handleChange} value={formData.name} required minLength={2} />
                    </div>
                )}
                <div className='w-full'>
                    <p className='text-xs uppercase tracking-wider text-ink/50'>Email</p>
                    <input className={inputClass} type='email' name='email' onChange={handleChange} value={formData.email} required />
                </div>
                <div className='w-full'>
                    <p className='text-xs uppercase tracking-wider text-ink/50'>Password</p>
                    <input className={inputClass} type='password' name='password' onChange={handleChange} value={formData.password} required minLength={6} />
                </div>
                <button
                    type='submit'
                    disabled={loading}
                    className={`w-full py-3 rounded-full text-base text-white font-semibold ${loading ? 'bg-gray-400' : 'bg-ink hover:bg-primary'}`}
                >
                    {loading ? 'Please wait...' : (state === 'Sign Up' ? 'Create account' : 'Log in')}
                </button>
                {state === 'Sign Up' ? (
                    <p>Already with us? <span onClick={() => { setState('Login'); setFormData({ name: '', email: '', password: '' }) }} className='text-primary font-semibold cursor-pointer'>Log in</span></p>
                ) : (
                    <>
                        <p>New here? <span onClick={() => { setState('Sign Up'); setFormData({ name: '', email: '', password: '' }) }} className='text-primary font-semibold cursor-pointer'>Create an account</span></p>
                        <details className='text-xs text-ink/45 pt-2 border-t border-ink/5'>
                            <summary className='cursor-pointer'>Demo accounts</summary>
                            <p className='mt-2'>Patient: patient@prescripto.com / Patient@123</p>
                            <p>Doctor: doctor@prescripto.com / Doctor@123</p>
                            <p>Admin: admin@prescripto.com / Admin@123</p>
                        </details>
                    </>
                )}
            </div>
        </form>
    )
}

export default Login
