import { useEffect, useState } from 'react'

const applyTheme = (dark) => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('velora-theme', dark ? 'dark' : 'light')
}

const ThemeToggle = () => {
    const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

    useEffect(() => {
        const sync = () => setDark(document.documentElement.classList.contains('dark'))
        window.addEventListener('velora-theme', sync)
        return () => window.removeEventListener('velora-theme', sync)
    }, [])

    return (
        <button
            type='button'
            onClick={() => {
                applyTheme(!dark)
                setDark(!dark)
                window.dispatchEvent(new Event('velora-theme'))
            }}
            className='h-9 w-9 rounded-full border border-ink/10 grid place-items-center text-sm hover:bg-sand'
            aria-label='Toggle theme'
            title='Toggle theme'
        >
            {dark ? '☀' : '☽'}
        </button>
    )
}

export default ThemeToggle
