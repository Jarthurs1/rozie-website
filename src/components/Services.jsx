import {
  SERVICES,
  formatDuration,
  formatStartingPrice,
} from '../data/services.js'
import './Services.css'

export default function Services() {
  return (
    <section className="section services" id="services">
      <div className="section__inner">
        <p className="section__eyebrow">Menu</p>
        <h2 className="section__title">Services</h2>
        <p className="section__lead">
          A focused menu of cuts, color, and finishing.
        </p>

        <ul className="services__list">
          {SERVICES.map((service) => (
            <li key={service.id} className="services__item">
              <div className="services__main">
                <h3 className="services__name">{service.name}</h3>
                <p className="services__desc">{service.description}</p>
              </div>
              <p className="services__meta">
                {formatDuration(service.durationMinutes)}
                {service.startingPrice != null
                  ? ` · ${formatStartingPrice(service.startingPrice)}`
                  : ''}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
