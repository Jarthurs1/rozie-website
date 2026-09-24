import { SALON } from '../data/salon.js'
import { HERO_IMAGE } from '../data/gallery.js'
import './Hero.css'

export default function Hero({ onBook, onViewAvailability }) {
  return (
    <section className="hero" id="home" aria-label="Welcome">
      <div className="hero__media" aria-hidden="true">
        <img
          src={HERO_IMAGE.src}
          alt=""
          className="hero__image"
          fetchPriority="high"
        />
        <div className="hero__scrim" />
      </div>

      <div className="hero__content">
        <p className="hero__brand">{SALON.name}</p>
        <h1 className="hero__headline">{SALON.tagline}</h1>
        <p className="hero__support">
          Professional hair services with online booking — see real availability
          and reserve a time that works for you.
        </p>
        <div className="hero__actions">
          <button type="button" className="btn btn--accent" onClick={onBook}>
            Book an Appointment
          </button>
          <button
            type="button"
            className="btn btn--ghost hero__secondary"
            onClick={onViewAvailability}
          >
            View Availability
          </button>
        </div>
      </div>
    </section>
  )
}
