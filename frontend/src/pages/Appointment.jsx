import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import RelatedDoctors from '../components/RelatedDoctors';
import StarRating from '../components/StarRating';
import { toast } from 'react-toastify';
import api, { assetUrl } from '../api';
import Portrait from '../components/Portrait';
import EmptyState from '../components/EmptyState';

const Appointment = () => {
    const navigate = useNavigate();
    const { docId } = useParams();
    const { currencySymbol, user } = useContext(AppContext);
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const [docInfo, setDocInfo] = useState(null);
    const [docSlots, setDocSlots] = useState([]);
    const [slotIndex, setSlotIndex] = useState(0);
    const [slotTime, setSlotTime] = useState('');
    const [selectedDateTime, setSelectedDateTime] = useState(null);
    const [booking, setBooking] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [pageState, setPageState] = useState('loading');
    const [mode, setMode] = useState('clinic');
    const [showBusy, setShowBusy] = useState(false);

    const loadDoctor = async () => {
        setPageState('loading');
        setDocInfo(null);
        setReviews([]);
        try {
            const { data } = await api.get(`/doctors/${docId}`);
            if (!data.doctor) {
                setPageState('missing');
                return;
            }
            setDocInfo({ ...data.doctor, image: assetUrl(data.doctor.image) });
            setPageState('ready');
        } catch {
            setPageState('missing');
            return;
        }

        try {
            const reviewRes = await api.get(`/doctors/${docId}/reviews`);
            setReviews(reviewRes.data.reviews || []);
        } catch {
            setReviews([]);
        }
    };

    const loadSlots = async () => {
        try {
            const { data } = await api.get(`/doctors/${docId}/slots`);
            const slots = (data.slots || []).map((day) =>
                day.map((slot) => ({ ...slot, datetime: new Date(slot.datetime) }))
            );
            setDocSlots(slots);
        } catch {
            setDocSlots([]);
        }
    };

    useEffect(() => {
        loadDoctor();
    }, [docId]);

    useEffect(() => {
        if (docInfo) loadSlots();
    }, [docInfo]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'available':
                return 'text-green-500 border-green-200';
            case 'busy':
                return 'text-red-500 border-red-200';
            default:
                return 'text-gray-400 border-gray-200';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'available':
                return 'Available';
            case 'busy':
                return 'Booked';
            default:
                return 'Unavailable';
        }
    };

    const handleBookAppointment = async () => {
        if (!user) {
            toast.error('Please login to book an appointment');
            navigate('/login');
            return;
        }

        if (!selectedDateTime) {
            toast.error('Please select a time slot');
            return;
        }

        setBooking(true);
        try {
            await api.post('/appointments', {
                doctorId: docId,
                slotDateTime: selectedDateTime.toISOString(),
                mode
            });
            toast.success('Appointment booked successfully!');
            navigate('/my-appointments');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not book appointment');
            loadSlots();
        } finally {
            setBooking(false);
        }
    };

    if (pageState === 'loading') {
        return <p className='py-20 text-center text-ink/50'>Loading doctor…</p>;
    }

    if (pageState === 'missing' || !docInfo) {
        return (
            <div className='my-10'>
                <EmptyState
                    illustration='alert'
                    title='This doctor isn’t available'
                    copy='The profile may have been refreshed after a database seed. Pick a doctor from the live list.'
                    action={
                        <button onClick={() => navigate('/doctors')} className='mt-6 bg-primary text-white px-6 py-3 rounded-full text-sm font-semibold'>
                            Browse doctors
                        </button>
                    }
                />
            </div>
        );
    }

    return (
        <div className='py-10 pb-16'>
            <div className='grid sm:grid-cols-[280px_1fr] gap-6'>
                <Portrait src={docInfo.image} alt={docInfo.name} className='h-[360px]' rounded='rounded-2xl' />
                <div className='bg-white rounded-2xl p-8 border border-ink/10 shadow-card'>
                    <p className='font-display text-3xl flex items-center gap-2'>
                        {docInfo.name}
                        <img className='w-5' src={assets.verified_icon} alt='' />
                    </p>
                    <div className='flex flex-wrap items-center gap-2 text-sm mt-2 text-ink/60'>
                        <p>{docInfo.degree} · {docInfo.speciality}</p>
                        <span className='px-2 py-0.5 border border-ink/10 rounded-full text-xs'>{docInfo.experience}</span>
                    </div>
                    <p className='text-sm font-semibold mt-5'>About</p>
                    <p className='text-sm text-ink/60 mt-1 leading-relaxed'>{docInfo.about}</p>
                    {docInfo.address?.line1 && (
                        <a
                            className='inline-block text-sm text-primary mt-4'
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${docInfo.address.line1} ${docInfo.address.line2 || ''}`)}`}
                            target='_blank'
                            rel='noreferrer'
                        >
                            {docInfo.address.line1}, {docInfo.address.line2}
                        </a>
                    )}
                    <p className='mt-5 text-sm'>Consult fee <span className='font-display text-2xl text-primary ml-2'>{currencySymbol}{docInfo.fees}</span></p>
                    <div className='flex items-center gap-2 mt-3'>
                        <StarRating value={Math.round(docInfo.ratingAvg || 0)} />
                        <span className='text-sm text-ink/60'>
                            {docInfo.ratingCount ? `${docInfo.ratingAvg} from ${docInfo.ratingCount} visits` : 'No reviews yet'}
                        </span>
                    </div>
                </div>
            </div>
            <div className='bg-white rounded-2xl p-6 md:p-8 mt-6 border border-ink/10 shadow-card'>
                <p className='font-display text-2xl'>Choose a slot</p>
                <div className='flex gap-2 mt-4'>
                    {[
                        { id: 'clinic', label: 'In-clinic' },
                        { id: 'video', label: 'Video consult' }
                    ].map((option) => (
                        <button
                            type='button'
                            key={option.id}
                            onClick={() => setMode(option.id)}
                            className={`px-4 py-2 rounded-full text-sm border ${mode === option.id ? 'bg-ink text-white border-ink' : 'border-ink/10'}`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
                <div className='flex gap-3 items-center w-full overflow-x-auto mt-4 pb-1'>
                    {docSlots.length > 0 && docSlots.map((item, index) => (
                        <button
                            type='button'
                            onClick={() => setSlotIndex(index)}
                            className={`text-center py-5 min-w-16 rounded-2xl ${slotIndex === index ? 'bg-primary text-white' : 'border border-ink/10'}`}
                            key={index}
                        >
                            <p className='text-xs'>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                            <p className='text-lg font-semibold'>{item[0] && item[0].datetime.getDate()}</p>
                        </button>
                    ))}
                </div>
                <div className='flex items-center justify-between mt-5'>
                    <p className='text-sm text-ink/50'>Available times</p>
                    <label className='text-xs text-ink/50 flex items-center gap-2'>
                        <input type='checkbox' checked={showBusy} onChange={(e) => setShowBusy(e.target.checked)} />
                        Show booked
                    </label>
                </div>
                <div className='flex flex-wrap items-center gap-2 w-full mt-3'>
                    {docSlots.length > 0 && docSlots[slotIndex]?.filter((item) => showBusy || item.status === 'available').map((item, index) => (
                        <button
                            type='button'
                            key={index}
                            onClick={() => {
                                if (item.status === 'available') {
                                    setSlotTime(item.time);
                                    setSelectedDateTime(item.datetime);
                                }
                            }}
                            className={`text-sm px-4 py-2 rounded-full border transition-all
                                ${item.status === 'available' && item.time === slotTime ? 'bg-primary text-white border-primary' : getStatusColor(item.status)}`}
                        >
                            {item.time}
                        </button>
                    ))}
                </div>
                <button
                    onClick={handleBookAppointment}
                    disabled={!slotTime || booking}
                    className={`text-white text-sm font-semibold px-10 py-3 rounded-full my-6
                        ${slotTime && !booking ? 'bg-ink hover:bg-primary' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                    {booking ? 'Booking...' : 'Confirm appointment'}
                </button>
            </div>
            {reviews.length > 0 && (
                <div className='bg-white rounded-3xl p-6 md:p-8 mt-6 border border-ink/5 shadow-soft'>
                    <p className='font-display text-2xl'>Patient reviews</p>
                    <div className='mt-4 space-y-4'>
                        {reviews.map((review) => (
                            <div key={review._id} className='border-b border-ink/5 pb-4 last:border-0'>
                                <div className='flex items-center justify-between'>
                                    <p className='font-medium'>{review.user?.name || 'Patient'}</p>
                                    <StarRating value={review.rating} />
                                </div>
                                {review.comment && <p className='text-sm text-ink/60 mt-1'>{review.comment}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
        </div>
    );
};

export default Appointment;
