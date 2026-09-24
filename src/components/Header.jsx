import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { SALON } from '../data/salon.js'
import './Header.css'

const NAV = [
  { id: 'home', label: 'Home' },
  { id: 'services', label: 'Services' },
  { id: 'about', label: 'About' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'book', label: 'Book', emphasize: true },
]

export default function Header({ onBook, onNavigate }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  function handleNav(id) {
    setOpen(false)
    if (id === 'book') {
      onBook?.()
      return
    }
    onNavigate?.(id)
  }

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="site-header__inner">
        <a
          href="#home"
          className="site-header__brand"
          onClick={(e) => {
            e.preventDefault()
            handleNav('home')
          }}
        >
          {SALON.name}
        </a>

        <nav className="site-header__nav" aria-label="Primary">
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`site-header__link${item.emphasize ? ' is-book' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                handleNav(item.id)
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className="site-header__menu"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open ? (
        <div className="site-header__drawer" id="mobile-nav">
          <nav className="site-header__drawer-nav" aria-label="Mobile">
            {NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`site-header__drawer-link${item.emphasize ? ' is-book' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  handleNav(item.id)
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  )
}
