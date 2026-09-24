import { useEffect, useMemo, useState } from 'react'
import { SERVICES, getServiceById, formatDuration } from '../data/services.js'
import {
  getAvailableStartTimes,
  isDateBookable,
  getBookableDateRange,
} from '../utils/bookingAvailability.js'
import {
  formatLongDate,
  formatTimeDisplay,
  parseDateKey,
  startOfDay,
} from '../utils/dateUtils.js'
import ServiceSelector from './ServiceSelector.jsx'
import DateSelector from './DateSelector.jsx'
import TimeSelector from './TimeSelector.jsx'
import CustomerForm from './CustomerForm.jsx'
import BookingSummary from './BookingSummary.jsx'
import './BookingSection.css'

const emptyCustomer = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  notes: '',
}

export default function BookingSection({
  preselectServiceId = null,
  onClearPreselect,
}) {
  const today = useMemo(() => startOfDay(new Date()), [])
  const range = useMemo(() => getBookableDateRange(today), [today])

  const [serviceId, setServiceId] = useState(preselectServiceId || '')
  const [dateKey, setDateKey] = useState('')
  const [startTime, setStartTime] = useState('')
  const [customer, setCustomer] = useState(emptyCustomer)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const service = getServiceById(serviceId)
  const durationMinutes = service?.durationMinutes ?? 0

  useEffect(() => {
    if (!preselectServiceId) return
    setServiceId(preselectServiceId)
    setDateKey('')
    setStartTime('')
    setSubmitted(null)
    onClearPreselect?.()
  }, [preselectServiceId, onClearPreselect])

  const availableTimes = useMemo(() => {
    if (!service || !dateKey) return []
    return getAvailableStartTimes(parseDateKey(dateKey), durationMinutes, {
      today,
    })
  }, [service, dateKey, durationMinutes, today])

  useEffect(() => {
    if (startTime && !availableTimes.includes(startTime)) {
      setStartTime('')
    }
  }, [availableTimes, startTime])

  function handleServiceChange(id) {
    setServiceId(id)
    setDateKey('')
    setStartTime('')
    setSubmitted(null)
  }

  function handleDateChange(key) {
    if (!service) return
    const day = parseDateKey(key)
    if (!isDateBookable(day, durationMinutes, { today })) return
    setDateKey(key)
    setStartTime('')
  }

  function validateCustomer() {
    const next = {}
    if (!customer.firstName.trim()) next.firstName = 'Required'
    if (!customer.lastName.trim()) next.lastName = 'Required'
    if (!customer.email.trim()) next.email = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
      next.email = 'Enter a valid email'
    }
    if (!customer.phone.trim()) next.phone = 'Required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!service || !dateKey || !startTime) return
    if (!validateCustomer()) return

    setSubmitting(true)
    // Phase 1 mock — no AWS write
    await new Promise((r) => setTimeout(r, 450))
    setSubmitted({
      serviceName: service.name,
      durationMinutes: service.durationMinutes,
      dateKey,
      startTime,
      customerName: `${customer.firstName.trim()} ${customer.lastName.trim()}`,
      email: customer.email.trim(),
    })
    setSubmitting(false)
  }

  function resetBooking() {
    setServiceId('')
    setDateKey('')
    setStartTime('')
    setCustomer(emptyCustomer)
    setErrors({})
    setSubmitted(null)
  }

  if (submitted) {
    return (
      <section className="section booking" id="book">
        <div className="section__inner">
          <p className="section__eyebrow">Booking</p>
          <h2 className="section__title">Appointment request received</h2>
          <div className="booking__success" role="status">
            <p className="booking__success-lead">
              Thanks — this is a Phase 1 prototype confirmation. No live
              appointment was created and no email was sent.
            </p>
            <dl className="booking__success-summary">
              <div>
                <dt>Service</dt>
                <dd>{submitted.serviceName}</dd>
              </div>
              <div>
                <dt>When</dt>
                <dd>
                  {formatLongDate(parseDateKey(submitted.dateKey))}
                  <br />
                  {formatTimeDisplay(submitted.startTime)} ·{' '}
                  {formatDuration(submitted.durationMinutes)}
                </dd>
              </div>
              <div>
                <dt>Guest</dt>
                <dd>
                  {submitted.customerName}
                  <br />
                  {submitted.email}
                </dd>
              </div>
            </dl>
            <div className="booking__success-actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={resetBooking}
              >
                Book Another Appointment
              </button>
              <a href="#home" className="btn btn--ghost">
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="section booking" id="book">
      <div className="section__inner">
        <p className="section__eyebrow">Availability</p>
        <h2 className="section__title">Book an appointment</h2>
        <p className="section__lead">
          Choose a service, then pick a day and time that is actually open.
          Availability here is mock data for the Phase 1 prototype.
        </p>

        <form className="booking__form" onSubmit={handleSubmit} noValidate>
          <div className="booking__step">
            <h3 className="booking__step-title">1. Service</h3>
            <ServiceSelector
              services={SERVICES}
              value={serviceId}
              onChange={handleServiceChange}
            />
          </div>

          <div className="booking__layout">
            <div className="booking__step">
              <h3 className="booking__step-title">2. Date</h3>
              {!service ? (
                <p className="booking__hint">Select a service to see dates.</p>
              ) : (
                <DateSelector
                  selectedKey={dateKey}
                  onSelect={handleDateChange}
                  durationMinutes={durationMinutes}
                  today={today}
                  minDate={range.start}
                  maxDate={range.end}
                />
              )}
            </div>

            <div className="booking__step">
              <h3 className="booking__step-title">3. Time</h3>
              {!dateKey ? (
                <p className="booking__hint">
                  Select an available date to see times.
                </p>
              ) : availableTimes.length === 0 ? (
                <p className="booking__hint">
                  No times left on this day for that service length.
                </p>
              ) : (
                <TimeSelector
                  times={availableTimes}
                  value={startTime}
                  onChange={setStartTime}
                />
              )}
            </div>
          </div>

          <div className="booking__step">
            <h3 className="booking__step-title">4. Your details</h3>
            <CustomerForm
              value={customer}
              errors={errors}
              onChange={setCustomer}
              disabled={!startTime}
            />
          </div>

          <div className="booking__step">
            <h3 className="booking__step-title">5. Review</h3>
            <BookingSummary
              service={service}
              dateKey={dateKey}
              startTime={startTime}
              customer={customer}
            />
            <button
              type="submit"
              className="btn btn--accent booking__submit"
              disabled={
                submitting || !service || !dateKey || !startTime
              }
            >
              {submitting ? 'Submitting…' : 'Request Appointment'}
            </button>
            <p className="booking__prototype-note">
              Prototype only — does not write to Rozie&apos;s live calendar.
            </p>
          </div>
        </form>
      </div>
    </section>
  )
}
