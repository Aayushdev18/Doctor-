import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../api'
import { useAuth } from '../context/AppContext'

const Receipt = () => {
    const { id } = useParams()
    const { user, loading } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const justPaid = searchParams.get('paid') === '1'
    const [receipt, setReceipt] = useState(null)

    useEffect(() => {
        if (loading) return
        if (!user) {
            navigate('/login')
            return
        }
        api.get(`/appointments/${id}/receipt`)
            .then(({ data }) => setReceipt(data.receipt))
            .catch((error) => {
                toast.error(error.response?.data?.message || 'Could not load receipt')
                navigate('/my-appointments')
            })
    }, [id, user, loading])

    if (!receipt) return <p className='py-16 text-center text-ink/50'>Loading receipt…</p>

    const when = new Date(receipt.slotDateTime).toLocaleString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })

    return (
        <div className='py-10 pb-16 max-w-xl mx-auto'>
            {justPaid && (
                <div className='print:hidden mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5'>
                    <p className='font-display text-2xl text-emerald-900'>You’re confirmed</p>
                    <p className='text-sm text-emerald-800/80 mt-1'>
                        A confirmation like this would land in {receipt.patient.email}. Keep this receipt for check-in.
                    </p>
                </div>
            )}
            <div className='flex justify-between items-center mb-6 print:hidden'>
                <button type='button' onClick={() => navigate('/my-appointments')} className='text-sm text-ink/60'>← Appointments</button>
                <button type='button' onClick={() => window.print()} className='bg-ink text-white text-sm px-5 py-2.5 rounded-full'>Print / save PDF</button>
            </div>
            <div className='receipt-sheet bg-white rounded-2xl border border-ink/10 p-8 shadow-card'>
                <div className='flex justify-between items-start border-b border-ink/10 pb-5'>
                    <div>
                        <p className='text-xs uppercase tracking-[0.18em] text-primary font-semibold'>Velora Health</p>
                        <h1 className='font-display text-3xl mt-1'>Payment receipt</h1>
                        <p className='text-xs text-ink/45 mt-1'>Clinic confirmation · {receipt.number}</p>
                    </div>
                    <div className='text-right'>
                        <p className='text-[11px] uppercase tracking-wider text-emerald-700 font-semibold'>Paid</p>
                        <p className='font-display text-2xl'>₹{receipt.amount}</p>
                    </div>
                </div>
                <div className='grid grid-cols-2 gap-4 mt-6 text-sm'>
                    <div>
                        <p className='text-ink/40 text-xs uppercase tracking-wider'>Patient</p>
                        <p className='font-medium mt-1'>{receipt.patient.name}</p>
                        <p className='text-ink/55'>{receipt.patient.email}</p>
                    </div>
                    <div>
                        <p className='text-ink/40 text-xs uppercase tracking-wider'>Clinician</p>
                        <p className='font-medium mt-1'>{receipt.doctor?.name}</p>
                        <p className='text-ink/55'>{receipt.doctor?.speciality}</p>
                    </div>
                    <div>
                        <p className='text-ink/40 text-xs uppercase tracking-wider'>Visit</p>
                        <p className='mt-1'>{when}</p>
                        <p className='text-ink/55 capitalize'>{receipt.mode === 'video' ? 'Video consult' : 'In-clinic'}</p>
                    </div>
                    <div>
                        <p className='text-ink/40 text-xs uppercase tracking-wider'>Payment</p>
                        <p className='mt-1 capitalize'>{receipt.paymentProvider}</p>
                        <p className='text-ink/55 text-xs break-all'>{receipt.paymentId}</p>
                    </div>
                </div>
                <div className='mt-8 pt-5 border-t border-ink/10 text-sm space-y-2'>
                    <div className='flex justify-between'><span className='text-ink/50'>Consult fee</span><span>₹{receipt.amount}</span></div>
                    <div className='flex justify-between'><span className='text-ink/50'>Taxes</span><span>₹0</span></div>
                    <div className='flex justify-between font-semibold pt-2'><span>Total paid</span><span>₹{receipt.amount}</span></div>
                </div>
                <p className='text-xs text-ink/40 mt-8'>Issued {new Date(receipt.issuedAt).toLocaleString('en-IN')} · Computer-generated. Bring this page or a printout to reception.</p>
            </div>
        </div>
    )
}

export default Receipt
