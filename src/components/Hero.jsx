import { SALON } from '../data/salon.js'
import { HERO_IMAGE } from '../data/media.js'
import './Hero.css'

export default function Hero() {
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
        <h1 className="hero__headline">
          <span className="hero__line">Beautiful hair.</span>
          <span className="hero__line">Personal service.</span>
        </h1>
        <p className="hero__support">{SALON.shortDescription}</p>
      </div>
    </section>
  )
}
