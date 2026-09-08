const illustrations = {
    search: (
        <svg viewBox='0 0 160 100' className='w-40 h-24 mx-auto text-primary/70' fill='none'>
            <rect x='18' y='22' width='124' height='56' rx='16' className='stroke-current' strokeWidth='1.5' />
            <circle cx='62' cy='50' r='12' className='stroke-current' strokeWidth='1.5' />
            <path d='M71 59l14 12' className='stroke-current' strokeWidth='1.5' strokeLinecap='round' />
            <path d='M92 42h32M92 52h22' className='stroke-current' strokeWidth='1.5' strokeLinecap='round' />
        </svg>
    ),
    calendar: (
        <svg viewBox='0 0 160 100' className='w-40 h-24 mx-auto text-primary/70' fill='none'>
            <rect x='30' y='24' width='100' height='58' rx='12' className='stroke-current' strokeWidth='1.5' />
            <path d='M30 42h100M52 24v12M108 24v12' className='stroke-current' strokeWidth='1.5' />
            <circle cx='58' cy='62' r='4' className='fill-current' />
            <circle cx='80' cy='62' r='4' className='fill-current opacity-40' />
            <circle cx='102' cy='62' r='4' className='fill-current opacity-40' />
        </svg>
    ),
    alert: (
        <svg viewBox='0 0 160 100' className='w-40 h-24 mx-auto text-primary/70' fill='none'>
            <path d='M80 22l48 68H32L80 22z' className='stroke-current' strokeWidth='1.5' strokeLinejoin='round' />
            <path d='M80 46v18' className='stroke-current' strokeWidth='1.5' strokeLinecap='round' />
            <circle cx='80' cy='74' r='2.5' className='fill-current' />
        </svg>
    )
}

const EmptyState = ({ title, copy, action, illustration = 'search' }) => (
    <div className='bg-white rounded-2xl p-12 text-center border border-ink/10'>
        {illustrations[illustration] || illustrations.search}
        <p className='font-display text-2xl mt-4'>{title}</p>
        <p className='text-sm text-ink/50 mt-2 max-w-sm mx-auto'>{copy}</p>
        {action}
    </div>
)

export default EmptyState
