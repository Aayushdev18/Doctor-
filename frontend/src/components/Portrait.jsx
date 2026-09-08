const Portrait = ({ src, alt, className = 'h-56', rounded = 'rounded-none' }) => (
    <div className={`relative overflow-hidden ${className} ${rounded}`}>
        <div
            className='absolute inset-0'
            style={{
                background: 'radial-gradient(ellipse at 50% 18%, #f7f1e8 0%, #e4ebe6 42%, #c5d5ce 100%)'
            }}
        />
        <div className='absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/10 to-transparent' />
        <img
            src={src}
            alt={alt}
            className='relative z-10 w-full h-full object-contain object-bottom drop-shadow-[0_22px_28px_rgba(18,33,30,0.22)] group-hover:scale-[1.03] transition-transform duration-500'
        />
    </div>
)

export default Portrait
