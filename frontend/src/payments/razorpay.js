import api from '../api'

export const loadRazorpay = () =>
    new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true)
            return
        }
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)
        document.body.appendChild(script)
    })

export const openRazorpayCheckout = async ({ order, appointmentId, onSuccess }) => {
    const loaded = await loadRazorpay()
    if (!loaded || !window.Razorpay) {
        throw new Error('Could not load Razorpay checkout')
    }

    return new Promise((resolve, reject) => {
        const checkout = new window.Razorpay({
            key: order.keyId,
            amount: order.amount,
            currency: order.currency,
            name: 'Velora Health',
            description: `Consult · ${order.doctorName}`,
            order_id: order.orderId,
            theme: { color: '#0B6B63' },
            prefill: {
                name: order.patientName,
                email: order.patientEmail,
                contact: order.patientPhone || '9999999999',
                method: 'card'
            },
            method: {
                card: true,
                netbanking: true,
                upi: false,
                wallet: false,
                emi: false,
                paylater: false
            },
            remember_customer: false,
            config: {
                display: {
                    hide: [{ method: 'upi' }]
                }
            },
            handler: async (response) => {
                try {
                    await api.post('/payments/razorpay/verify', {
                        appointmentId,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature
                    })
                    await onSuccess?.()
                    resolve(response)
                } catch (error) {
                    reject(error)
                }
            },
            modal: {
                ondismiss: () => reject(new Error('Payment cancelled'))
            }
        })
        checkout.on('payment.failed', (response) => {
            reject(new Error(response.error?.description || 'Payment failed'))
        })
        checkout.open()
    })
}
