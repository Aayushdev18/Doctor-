const BrandLogo = ({ onClick, light = false }) => (
    <button type='button' onClick={onClick} className='flex items-center gap-2.5'>
        <span className={`h-8 w-8 rounded-xl grid place-items-center text-sm font-bold ${light ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
            V
        </span>
        <span className={`text-left leading-none ${light ? 'text-white' : 'text-ink'}`}>
            <span className='block text-[17px] font-semibold tracking-tight'>Velora</span>
            <span className={`block text-[10px] uppercase tracking-[0.2em] mt-0.5 ${light ? 'text-white/55' : 'text-ink/40'}`}>Health</span>
        </span>
    </button>
)

export default BrandLogo
