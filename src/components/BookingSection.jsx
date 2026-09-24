import { useEffect, useMemo, useRef, useState } from 'react'
import { SERVICES, getServiceById, formatDuration } from '../data/services.js'
import {
  formatLongDate,
  formatTimeDisplay,
  parseDateKey,
  startOfDay,
  toDateKey,
  addDays,
} from '../utils/dateUtils.js'
import { MAX_BOOKING_DAYS_AHEAD } from '../data/schedule.js'
import {
  fetchAvailabilityForDate,
  fetchAvailabilityRange,
  isPublicBookingConfigured,
  submitBooking,
} from '../services/publicBookingApi.js'
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
  const range = useMemo(
    () => ({
      start: today,
      end: addDays(today, MAX_BOOKING_DAYS_AHEAD),
    }),
    [today],
  )

  const [serviceId, setServiceId] = useState(preselectServiceId || '')
  const [dateKey, setDateKey] = useState('')
  const [startTime, setStartTime] = useState('')
  const [customer, setCustomer] = useState(emptyCustomer)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [bookableByDate, setBookableByDate] = useState({})
  const [availableTimes, setAvailableTimes] = useState([])
  const [rangeLoading, setRangeLoading] = useState(false)
  const [timesLoading, setTimesLoading] = useState(false)
  const [availabilityError, setAvailabilityError] = useState(null)
  const [conflictMessage, setConflictMessage] = useState(null)
  const submitLock = useRef(false)

  const service = getServiceById(serviceId)
  const configured = isPublicBookingConfigured()

  useEffect(() => {
    if (!preselectServiceId) return
    setServiceId(preselectServiceId)
    setDateKey('')
    setStartTime('')
    setSubmitted(null)
    setConflictMessage(null)
    onClearPreselect?.()
  }, [preselectServiceId, onClearPreselect])

  useEffect(() => {
    let cancelled = false
    async function loadRange() {
      setAvailabilityError(null)
      setBookableByDate({})
      if (!serviceId || !configured) return
      setRangeLoading(true)
      try {
        const data = await fetchAvailabilityRange(
          serviceId,
          toDateKey(range.start),
          toDateKey(range.end),
        )
        if (cancelled) return
        const map = {}
        for (const day of data.days || []) {
          map[day.date] = Boolean(day.bookable)
        }
        setBookableByDate(map)
      } catch (error) {
        if (!cancelled) {
          setAvailabilityError(
            error.message || 'Could not load availability. Please try again.',
          )
          setBookableByDate({})
        }
      } finally {
        if (!cancelled) setRangeLoading(false)
      }
    }
    loadRange()
    return () => {
      cancelled = true
    }
  }, [serviceId, configured, range.start, range.end])

  useEffect(() => {
    let cancelled = false
    async function loadTimes() {
      setAvailableTimes([])
      setConflictMessage(null)
      if (!serviceId || !dateKey || !configured) return
      setTimesLoading(true)
      try {
        const data = await fetchAvailabilityForDate(serviceId, dateKey)
        if (cancelled) return
        setAvailableTimes(data.availableTimes || [])
        if (!(data.availableTimes || []).length) {
          setDateKey('')
        }
      } catch (error) {
        if (!cancelled) {
          setAvailabilityError(
            error.message || 'Could not load times. Please try again.',
          )
          setAvailableTimes([])
        }
      } finally {
        if (!cancelled) setTimesLoading(false)
      }
    }
    loadTimes()
    return () => {
      cancelled = true
    }
  }, [serviceId, dateKey, configured])

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
    setConflictMessage(null)
  }

  function handleDateChange(key) {
    if (!service) return
    if (bookableByDate[key] === false) return
    setDateKey(key)
    setStartTime('')
    setConflictMessage(null)
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

  async function refreshAfterConflict() {
    if (!serviceId || !dateKey) return
    try {
      const [rangeData, dayData] = await Promise.all([
        fetchAvailabilityRange(
          serviceId,
          toDateKey(range.start),
          toDateKey(range.end),
        ),
        fetchAvailabilityForDate(serviceId, dateKey),
      ])
      const map = {}
      for (const day of rangeData.days || []) {
        map[day.date] = Boolean(day.bookable)
      }
      setBookableByDate(map)
      setAvailableTimes(dayData.availableTimes || [])
      setStartTime('')
    } catch {
      /* keep conflict message */
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitLock.current || submitting) return
    if (!service || !dateKey || !startTime) return
    if (!validateCustomer()) return
    if (!configured) {
      setAvailabilityError('Booking is temporarily unavailable.')
      return
    }

    submitLock.current = true
    setSubmitting(true)
    setConflictMessage(null)
    setAvailabilityError(null)

    try {
      const result = await submitBooking({
        serviceId: service.id,
        date: dateKey,
        startTime,
        firstName: customer.firstName.trim(),
        lastName: customer.lastName.trim(),
        email: customer.email.trim(),
        phone: customer.phone.trim(),
        notes: customer.notes.trim(),
      })
      setSubmitted({
        serviceName: result.booking?.service || service.name,
        durationMinutes:
          result.booking?.durationMinutes || service.durationMinutes,
        dateKey: result.booking?.date || dateKey,
        startTime: result.booking?.startTime || startTime,
        customerName:
          result.booking?.customerName ||
          `${customer.firstName.trim()} ${customer.lastName.trim()}`,
        status: result.booking?.status || 'pending',
      })
    } catch (error) {
      if (error.status === 409 || error.code === 'conflict') {
        setConflictMessage(
          error.message ||
            'That time was just booked. Please choose another available time.',
        )
        await refreshAfterConflict()
      } else {
        setAvailabilityError(
          error.message || 'Could not complete booking. Please try again.',
        )
      }
    } finally {
      setSubmitting(false)
      submitLock.current = false
    }
  }

  function resetBooking() {
    setServiceId('')
    setDateKey('')
    setStartTime('')
    setCustomer(emptyCustomer)
    setErrors({})
    setSubmitted(null)
    setConflictMessage(null)
    setAvailabilityError(null)
  }

  if (submitted) {
    return (
      <section className="section booking" id="book">
        <div className="section__inner">
          <p className="section__eyebrow">Booking</p>
          <h2 className="section__title">Appointment request received</h2>
          <div className="booking__success" role="status">
            <p className="booking__success-lead">
              Thanks — your request is pending on Rozie&apos;s calendar. You may
              receive a confirmation email later when reminders are enabled for
              production.
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
                <dd>{submitted.customerName}</dd>
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
          Choose a service, then pick a weekday and time that is open. Weekends
          are not available online.
        </p>

        {!configured ? (
          <p className="booking__error" role="alert">
            Online booking is not configured yet. Please check back soon.
          </p>
        ) : null}

        {availabilityError ? (
          <div className="booking__error" role="alert">
            <p>{availabilityError}</p>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setAvailabilityError(null)
                setServiceId((id) => id)
              }}
            >
              Retry
            </button>
          </div>
        ) : null}

        {conflictMessage ? (
          <p className="booking__conflict" role="alert">
            {conflictMessage}
          </p>
        ) : null}

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
              ) : rangeLoading ? (
                <p className="booking__hint">Checking availability…</p>
              ) : (
                <DateSelector
                  selectedKey={dateKey}
                  onSelect={handleDateChange}
                  today={today}
                  minDate={range.start}
                  maxDate={range.end}
                  isDateEnabled={(day) => {
                    const key = toDateKey(day)
                    if (bookableByDate[key] != null) return bookableByDate[key]
                    // Until map loads, only allow Mon–Fri non-past
                    const dow = day.getDay()
                    if (dow === 0 || dow === 6) return false
                    return day.getTime() >= today.getTime()
                  }}
                />
              )}
            </div>

            <div className="booking__step">
              <h3 className="booking__step-title">3. Time</h3>
              {!dateKey ? (
                <p className="booking__hint">
                  Select an available date to see times.
                </p>
              ) : timesLoading ? (
                <p className="booking__hint">Loading available times…</p>
              ) : availableTimes.length === 0 ? (
                <p className="booking__hint">
                  No times left on this day for that service.
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
                submitting ||
                !configured ||
                !service ||
                !dateKey ||
                !startTime
              }
            >
              {submitting ? 'Booking your appointment…' : 'Request Appointment'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
