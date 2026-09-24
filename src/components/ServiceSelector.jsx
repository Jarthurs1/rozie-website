import { formatDuration, formatStartingPrice } from '../data/services.js'
import './ServiceSelector.css'

export default function ServiceSelector({ services, value, onChange }) {
  return (
    <div className="service-selector" role="listbox" aria-label="Services">
      {services.map((service) => {
        const selected = value === service.id
        return (
          <button
            key={service.id}
            type="button"
            role="option"
            aria-selected={selected}
            className={`service-selector__option${selected ? ' is-selected' : ''}`}
            onClick={() => onChange(service.id)}
          >
            <span className="service-selector__name">{service.name}</span>
            <span className="service-selector__meta">
              {formatDuration(service.durationMinutes)}
              {service.startingPrice != null
                ? ` · ${formatStartingPrice(service.startingPrice)}`
                : ''}
            </span>
          </button>
        )
      })}
    </div>
  )
}
