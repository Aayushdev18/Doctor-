const StarRating = ({ value = 0, onChange, size = 'text-base' }) => {
    const stars = [1, 2, 3, 4, 5]
    return (
        <div className={`flex gap-0.5 ${size}`}>
            {stars.map((star) => (
                onChange ? (
                    <button
                        key={star}
                        type='button'
                        onClick={() => onChange(star)}
                        className={`${star <= value ? 'text-amber-400' : 'text-ink/15'} cursor-pointer`}
                        aria-label={`${star} star`}
                    >
                        ★
                    </button>
                ) : (
                    <span key={star} className={star <= value ? 'text-amber-400' : 'text-ink/15'}>★</span>
                )
            ))}
        </div>
    )
}

export default StarRating
