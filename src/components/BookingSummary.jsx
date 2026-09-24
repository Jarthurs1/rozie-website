import { formatDuration } from '../data/services.js'
import {
  formatLongDate,
  formatTimeDisplay,
  parseDateKey,
} from '../utils/dateUtils.js'
import './BookingSummary.css'

export default function BookingSummary({
  service,
  dateKey,
  startTime,
  customer,
}) {
  const ready = Boolean(service && dateKey && startTime)
  const name = [customer.firstName, customer.lastName]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(' ')

  return (
    <div className="booking-summary">
      {!ready ? (
        <p className="booking-summary__empty">
          Your appointment summary will appear here once service, date, and time
          are selected.
        </p>
      ) : (
        <dl className="booking-summary__list">
          <div>
            <dt>Service</dt>
            <dd>
              {service.name}
              <span> · {formatDuration(service.durationMinutes)}</span>
            </dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{formatLongDate(parseDateKey(dateKey))}</dd>
          </div>
          <div>
            <dt>Time</dt>
            <dd>{formatTimeDisplay(startTime)}</dd>
          </div>
          <div>
            <dt>Guest</dt>
            <dd>{name || '—'}</dd>
          </div>
        </dl>
      )}
    </div>
  )
}
