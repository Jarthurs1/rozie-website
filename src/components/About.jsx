import { SALON } from '../data/salon.js'
import { ABOUT_IMAGE } from '../data/gallery.js'
import './About.css'

export default function About() {
  return (
    <section className="section about" id="about">
      <div className="section__inner about__inner">
        <div className="about__media">
          <img
            src={ABOUT_IMAGE.src}
            alt={ABOUT_IMAGE.alt}
            loading="lazy"
            className="about__image"
          />
        </div>
        <div className="about__copy">
          <p className="section__eyebrow">About</p>
          <h2 className="section__title">Meet {SALON.stylistName}</h2>
          <p className="about__text">
            {/* PLACEHOLDER COPY — replace with Rozie's real introduction */}
            {SALON.stylistName} is an independent stylist who believes great hair
            should feel personal, unhurried, and easy to maintain. Every visit is
            shaped around how you live — not a one-size formula.
          </p>
          <p className="about__text">
            {/* PLACEHOLDER — specialties / philosophy only, no invented credentials */}
            Her approach balances thoughtful cutting with healthy color and a
            calm studio setting. Expect honest recommendations, careful listening,
            and results that look like you — elevated.
          </p>
          <p className="about__note">
            Photo and biography are placeholders for Phase 1 and will be replaced
            with Rozie&apos;s real details.
          </p>
        </div>
      </div>
    </section>
  )
}
