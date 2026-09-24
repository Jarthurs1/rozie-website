import { SALON } from '../data/salon.js'
import './Footer.css'

export default function Footer({ onNavigate }) {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div>
          <p className="site-footer__brand">{SALON.name}</p>
          <p className="site-footer__tag">{SALON.tagline}</p>
        </div>
        <nav className="site-footer__nav" aria-label="Footer">
          {[
            ['home', 'Home'],
            ['services', 'Services'],
            ['about', 'About'],
            ['gallery', 'Gallery'],
            ['book', 'Book'],
          ].map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault()
                onNavigate?.(id)
              }}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
      <p className="site-footer__legal">
        © {year} {SALON.name}. Online booking connected to Rozie&apos;s calendar.
      </p>
    </footer>
  )
}
