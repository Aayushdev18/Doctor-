import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AppContext'

const Login = () => {
    const [state, setState] = useState('Sign Up')
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { login } = useAuth()

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
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
                // Simulate signup success
                toast.success('Account created successfully! Please login.')
                setFormData({ name: '', email: '', password: '' })
                setState('Login')
            } else {
                // Simulate login success
                const mockUser = {
                    id: '1',
                    name: formData.name || 'User',
                    email: formData.email,
                }
                const mockToken = 'mock-token-123'
                
                login(mockUser, mockToken)
                toast.success('Logged in successfully!')
                navigate('/')
            }
        } catch (error) {
            toast.error('Something went wrong! Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // Redirect if user is already logged in
    const { user } = useAuth()
    if (user) {
        navigate('/')
        return null
    }

    return (
        <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
            <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>
                <p className='text-2xl font-semibold'>{state === 'Sign Up' ? "Create Account" : "Login"}</p>
                <p>Please {state === 'Sign Up' ? "sign up" : "log in"} to book appointment</p>
                {state === "Sign Up" && (
                    <div className='w-full'>
                        <p>Full Name</p>
                        <input 
                            className='border border-zinc-300 rounded w-full p-2 mt-1' 
                            type='text' 
                            name="name" 
                            onChange={handleChange} 
                            value={formData.name} 
                            required
                            minLength={2}
                        />
                    </div>
                )}
                <div className='w-full'>
                    <p>Email</p>
                    <input 
                        className='border border-zinc-300 rounded w-full p-2 mt-1' 
                        type='email' 
                        name="email" 
                        onChange={handleChange} 
                        value={formData.email} 
                        required
                    />
                </div>
                <div className='w-full'>
                    <p>Password</p>
                    <input 
                        className='border border-zinc-300 rounded w-full p-2 mt-1' 
                        type='password' 
                        name="password" 
                        onChange={handleChange} 
                        value={formData.password} 
                        required
                        minLength={6}
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full py-2 rounded-md text-base text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'}`}
                >
                    {loading ? 'Please wait...' : (state === 'Sign Up' ? "Create Account" : "Login")}
                </button>
                {state === "Sign Up" ? (
                    <p>Already have an account? <span onClick={() => {
                        setState('Login')
                        setFormData({ name: '', email: '', password: '' })
                    }} className='text-primary underline cursor-pointer'>Login here</span></p>
                ) : (
                    <p>Create a new account? <span onClick={() => {
                        setState('Sign Up')
                        setFormData({ name: '', email: '', password: '' })
                    }} className='text-primary underline cursor-pointer'>click here</span></p>
                )}
            </div>
        </form>
    )
}

export default Login
