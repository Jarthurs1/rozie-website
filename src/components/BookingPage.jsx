import { useEffect, useMemo, useState } from 'react'
import CustomerForm from './CustomerForm.jsx'
import ServiceSelector from './ServiceSelector.jsx'
import DateSelector from './DateSelector.jsx'
import TimeSelector from './TimeSelector.jsx'
import { formatDuration } from '../data/services.js'
import {
  addDays,
  formatLongDate,
  formatTimeDisplay,
  parseDateKey,
  startOfDay,
  toDateKey,
} from '../utils/dateUtils.js'
import {
  fetchAvailabilityForDate,
  fetchAvailabilityRange,
  fetchSalon,
  fetchServices,
  isPublicBookingConfigured,
  lookupCustomer,
  submitBooking,
} from '../services/publicBookingApi.js'
import './BookingPage.css'

const emptyCustomer = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  notes: '',
  smsOptIn: false,
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

export default function BookingPage() {
  const configured = isPublicBookingConfigured()
  const [salonName, setSalonName] = useState('Salon')
  const [salonToday, setSalonToday] = useState(null)
  const [services, setServices] = useState([])
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [recognized, setRecognized] = useState(false)
  const [customer, setCustomer] = useState(emptyCustomer)
  const [serviceId, setServiceId] = useState('')
  const [dateKey, setDateKey] = useState('')
  const [startTime, setStartTime] = useState('')
  const [bookableByDate, setBookableByDate] = useState({})
  const [availableTimes, setAvailableTimes] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmation, setConfirmation] = useState(null)

  const service = services.find((item) => item.id === serviceId) || null
  const tomorrow = useMemo(() => {
    if (!salonToday) return null
    return startOfDay(addDays(parseDateKey(salonToday), 1))
  }, [salonToday])
  const horizon = useMemo(() => {
    if (!tomorrow) return null
    return addDays(tomorrow, 120)
  }, [tomorrow])

  useEffect(() => {
    if (!configured) return
    let cancelled = false
    async function load() {
      try {
        const [salon, catalog] = await Promise.all([fetchSalon(), fetchServices()])
        if (cancelled) return
        setSalonName(salon.salonName || 'Salon')
        setSalonToday(salon.salonToday)
        setServices(catalog.services || [])
        document.title = salon.salonName ? `Book · ${salon.salonName}` : 'Book an Appointment'
      } catch (err) {
        if (!cancelled) setError(err.message || 'Booking is temporarily unavailable.')
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [configured])

  useEffect(() => {
    if (!serviceId || !tomorrow || !horizon || !configured) return
    let cancelled = false
    async function loadDates() {
      try {
        const data = await fetchAvailabilityRange(
          serviceId,
          toDateKey(tomorrow),
          toDateKey(horizon),
        )
        if (cancelled) return
        const map = {}
        for (const day of data.days || []) map[day.date] = Boolean(day.bookable)
        setBookableByDate(map)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load dates.')
      }
    }
    loadDates()
    return () => {
      cancelled = true
    }
  }, [serviceId, tomorrow, horizon, configured])

  useEffect(() => {
    if (!serviceId || !dateKey) return
    let cancelled = false
    async function loadTimes() {
      setAvailableTimes([])
      try {
        const data = await fetchAvailabilityForDate(serviceId, dateKey)
        if (cancelled) return
        const times = data.availableTimes || []
        setAvailableTimes(times)
        if (!times.length) setDateKey('')
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load times.')
      }
    }
    loadTimes()
    return () => {
      cancelled = true
    }
  }, [serviceId, dateKey])

  async function continueEmail(event) {
    event.preventDefault()
    if (!validEmail(email)) {
      setError('Enter a valid email.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const result = await lookupCustomer(email.trim())
      const known = Boolean(result.recognized)
      setRecognized(known)
      setCustomer((prev) => ({ ...prev, email: email.trim(), smsOptIn: false }))
      setStep(known ? 'service' : 'details')
    } catch (err) {
      setError(err.message || 'Could not continue. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  function continueDetails(event) {
    event.preventDefault()
    if (!customer.firstName.trim() || !customer.lastName.trim() || !customer.phone.trim()) {
      setError('First name, last name, and phone are required.')
      return
    }
    if (!validEmail(customer.email)) {
      setError('Enter a valid email.')
      return
    }
    setError('')
    setEmail(customer.email.trim())
    setStep('service')
  }

  async function book(event) {
    event.preventDefault()
    if (!service || !dateKey || !startTime) return
    setBusy(true)
    setError('')
    try {
      const result = await submitBooking({
        serviceId: service.id,
        date: dateKey,
        startTime,
        email: customer.email.trim(),
        firstName: recognized ? '' : customer.firstName.trim(),
        lastName: recognized ? '' : customer.lastName.trim(),
        phone: recognized ? '' : customer.phone.trim(),
      })
      setConfirmation(result)
      setStep('done')
    } catch (err) {
      if (err.status === 409 || err.code === 'conflict') {
        setError(err.message || 'That time is no longer available.')
        setStartTime('')
        setStep('time')
        const data = await fetchAvailabilityForDate(service.id, dateKey).catch(() => null)
        setAvailableTimes(data?.availableTimes || [])
      } else {
        setError(err.message || 'Could not book that appointment.')
      }
    } finally {
      setBusy(false)
    }
  }

  const sent = confirmation?.booking?.emailDelivery === 'sent'

  return (
    <main className="book-page">
      <header className="book-page__header">
        <p className="book-page__brand">{salonName}</p>
        <h1>Book an Appointment</h1>
      </header>

      {!configured ? (
        <p className="book-page__error" role="alert">Online booking is not configured yet.</p>
      ) : null}
      {error ? <p className="book-page__error" role="alert">{error}</p> : null}

      {step === 'email' ? (
        <form className="book-page__card" onSubmit={continueEmail}>
          <p>Enter your email to get started.</p>
          <label className="field">
            <span className="field__label">Email</span>
            <input
              className="field__input"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <button className="btn btn--primary" type="submit" disabled={busy || !configured}>
            {busy ? 'Checking…' : 'Continue'}
          </button>
        </form>
      ) : null}

      {step === 'details' ? (
        <form className="book-page__card" onSubmit={continueDetails}>
          <p>Tell us how to reach you. This is only needed the first time you book.</p>
          <CustomerForm
            value={customer}
            errors={{}}
            onChange={setCustomer}
            includeSms={false}
            includeNotes={false}
          />
          <button className="btn btn--primary" type="submit">Continue</button>
        </form>
      ) : null}

      {step === 'service' ? (
        <section className="book-page__card">
          <h2>Select a service</h2>
          <ServiceSelector services={services} value={serviceId} onChange={(id) => {
            setServiceId(id)
            setDateKey('')
            setStartTime('')
            setStep('date')
          }} />
        </section>
      ) : null}

      {step === 'date' && tomorrow && horizon ? (
        <section className="book-page__card">
          <h2>Select a date</h2>
          <DateSelector
            selectedKey={dateKey}
            today={tomorrow}
            minDate={tomorrow}
            maxDate={horizon}
            isDateEnabled={(day) => bookableByDate[toDateKey(day)] === true}
            onSelect={(key) => {
              if (bookableByDate[key] !== true) return
              setDateKey(key)
              setStartTime('')
              setStep('time')
            }}
          />
        </section>
      ) : null}

      {step === 'time' ? (
        <section className="book-page__card">
          <h2>Select a time</h2>
          <TimeSelector times={availableTimes} value={startTime} onChange={(time) => {
            setStartTime(time)
            setStep('review')
          }} />
        </section>
      ) : null}

      {step === 'review' && service ? (
        <form className="book-page__card" onSubmit={book}>
          <h2>Review</h2>
          <dl className="book-page__review">
            <div><dt>Service</dt><dd>{service.name}{service.durationMinutes ? ` · ${formatDuration(service.durationMinutes)}` : ''}</dd></div>
            <div><dt>Date</dt><dd>{formatLongDate(parseDateKey(dateKey))}</dd></div>
            <div><dt>Time</dt><dd>{formatTimeDisplay(startTime)}</dd></div>
          </dl>
          <button className="btn btn--primary" type="submit" disabled={busy}>
            {busy ? 'Booking…' : 'Book Appointment'}
          </button>
        </form>
      ) : null}

      {step === 'done' ? (
        <section className="book-page__card" role="status">
          <h2>Appointment requested</h2>
          <p>
            {sent
              ? 'Your appointment has been requested! Check your email to confirm your appointment.'
              : 'Your appointment has been requested and is pending. We could not send the confirmation email, and the salon will follow up.'}
          </p>
        </section>
      ) : null}
    </main>
  )
}
