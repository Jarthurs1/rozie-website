import {
  SERVICES,
  formatDuration,
  formatStartingPrice,
} from '../data/services.js'
import './Services.css'

export default function Services({ onBookService }) {
  return (
    <section className="section services" id="services">
      <div className="section__inner">
        <p className="section__eyebrow">Menu</p>
        <h2 className="section__title">Services</h2>
        <p className="section__lead">
          A focused menu of cuts, color, and finishing — durations guide what
          times you can book.
        </p>

        <ul className="services__list">
          {SERVICES.map((service) => (
            <li key={service.id} className="services__item">
              <div className="services__copy">
                <div className="services__heading">
                  <h3 className="services__name">{service.name}</h3>
                  <p className="services__meta">
                    {formatDuration(service.durationMinutes)}
                    {service.startingPrice != null
                      ? ` · ${formatStartingPrice(service.startingPrice)}`
                      : ''}
                  </p>
                </div>
                <p className="services__desc">{service.description}</p>
              </div>
              <button
                type="button"
                className="btn btn--text"
                onClick={() => onBookService(service.id)}
              >
                Book This Service
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
