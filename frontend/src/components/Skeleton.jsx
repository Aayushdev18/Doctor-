const Skeleton = ({ className = '' }) => (
    <div className={`animate-pulse bg-ink/10 rounded-xl ${className}`} />
);

export const DoctorCardSkeleton = () => (
    <div className='bg-white rounded-2xl overflow-hidden border border-ink/10'>
        <Skeleton className='h-56 rounded-none' />
        <div className='p-4 space-y-3'>
            <Skeleton className='h-3 w-24' />
            <Skeleton className='h-5 w-40' />
            <Skeleton className='h-4 w-28' />
        </div>
    </div>
);

export default Skeleton;
