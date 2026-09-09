export const adminLinks = [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/doctors', label: 'Doctors' },
    { to: '/admin/appointments', label: 'Appointments' },
    { to: '/admin/activity', label: 'Activity' }
]

export const visitStatusLabel = (status) => {
    if (status === 'paid') return 'Confirmed'
    if (status === 'cancelled') return 'Cancelled'
    return 'Awaiting payment'
}
