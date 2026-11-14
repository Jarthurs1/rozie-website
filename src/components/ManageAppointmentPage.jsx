import { useEffect, useMemo, useState } from 'react'
import DateSelector from './DateSelector.jsx'
import TimeSelector from './TimeSelector.jsx'
import {
  addDays,
  formatLongDate,
  formatTimeDisplay,
  parseDateKey,
  startOfDay,
  toDateKey,
} from '../utils/dateUtils.js'
import {
  cancelAppointment,
  confirmAppointment,
  fetchAppointment,
  fetchManagedAvailability,
  fetchManagedTimes,
  fetchSalon,
  requestReschedule,
} from '../services/publicBookingApi.js'
import SalonFrame from './SalonFrame.jsx'
import './BookingPage.css'

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  reschedule_requested: 'Reschedule requested',
  canceled: 'Canceled',
  cancelled: 'Canceled',
}

function appointmentSearch() {
  return new URLSearchParams(window.location.search)
}

export default function ManageAppointmentPage({ token }) {
  const [record, setRecord] = useState(null)
  const [salonName, setSalonName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState(appointmentSearch().get('intent') === 'confirm' ? 'confirm' : 'view')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [dateKey, setDateKey] = useState('')
  const [times, setTimes] = useState([])
  const [startTime, setStartTime] = useState('')
  const [openDates, setOpenDates] = useState(() => new Set())
  const today = useMemo(() => startOfDay(new Date()), [])
  const tomorrow = useMemo(() => addDays(today, 1), [today])
  const horizon = useMemo(() => addDays(today, 120), [today])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchAppointment(token)
      setRecord(data.appointment)
    } catch (err) {
      setError(err.message || 'This appointment link is not valid.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [token])

  useEffect(() => {
    let ignore = false
    fetchSalon()
      .then((data) => {
        if (!ignore) setSalonName(String(data?.salonName || '').trim())
      })
      .catch(() => {})
    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    if (mode !== 'date') return undefined
    let ignore = false
    fetchManagedAvailability(token, toDateKey(tomorrow), toDateKey(horizon))
      .then((data) => {
        if (ignore) return
        const open = new Set((data.days || []).filter((day) => day.bookable).map((day) => day.date))
        setOpenDates(open)
      })
      .catch(() => {
        if (!ignore) setOpenDates(new Set())
      })
    return () => {
      ignore = true
    }
  }, [mode, token, tomorrow, horizon])

  useEffect(() => {
    if (mode !== 'time' || !dateKey) return undefined
    let ignore = false
    fetchManagedTimes(token, dateKey)
      .then((data) => {
        if (!ignore) setTimes(data.availableTimes || [])
      })
      .catch(() => {
        if (!ignore) setTimes([])
      })
    return () => {
      ignore = true
    }
  }, [mode, token, dateKey])

  async function run(action) {
    setBusy(true)
    setError('')
    try {
      const data = await action()
      setRecord(data.appointment || record)
      return data
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      return null
    } finally {
      setBusy(false)
    }
  }

  const appointment = record
  const contact = [appointment?.contactPhone, appointment?.contactEmail].filter(Boolean).join(' · ')

  return (
    <SalonFrame salonName={appointment?.salonName || salonName || 'Salon'}>
    <main className="book-page">
      <section className="book-page__card">
        {loading ? <p>Loading your appointment…</p> : null}
        {error ? <p className="book-page__error" role="alert">{error}</p> : null}
        {notice ? <p role="status">{notice}</p> : null}
        {appointment && mode === 'view' ? (
          <>
            <h2>Your appointment</h2>
            <p className="book-page__status">{STATUS_LABELS[appointment.status] || appointment.status}</p>
            <p className="book-page__summary">
              <strong>{appointment.service}</strong>
              <span>{formatLongDate(parseDateKey(appointment.date))}</span>
              <span>{formatTimeDisplay(appointment.startTime)}</span>
            </p>
            {appointment.rescheduleRequest ? (
              <p>
                Requested time: {formatLongDate(parseDateKey(appointment.rescheduleRequest.date))}{' '}
                at {formatTimeDisplay(appointment.rescheduleRequest.startTime)}. The salon will
                confirm that change.
              </p>
            ) : null}
            {appointment.actions?.confirm ? (
              <button type="button" className="btn btn--primary" disabled={busy} onClick={() => setMode('confirm')}>
                Confirm Appointment
              </button>
            ) : null}
            {appointment.actions?.reschedule ? (
              <button type="button" className="btn btn--primary" disabled={busy} onClick={() => setMode('date')}>
                Request Reschedule
              </button>
            ) : null}
            {appointment.actions?.cancel ? (
              <button type="button" className="btn btn--primary" disabled={busy} onClick={() => setMode('cancel')}>
                Cancel Appointment
              </button>
            ) : null}
            {appointment.unavailableMessage ? (
              <p>
                {appointment.unavailableMessage}
                {contact ? ` ${contact}` : ''}
              </p>
            ) : null}
          </>
        ) : null}
        {appointment && mode === 'confirm' ? (
          <>
            <h2>Confirm Appointment</h2>
            <p>Press the button to confirm. Opening this page does not change the appointment.</p>
            <button
              type="button"
              className="btn btn--primary"
              disabled={busy}
              onClick={async () => {
                const data = await run(() => confirmAppointment(token))
                if (data?.ok) {
                  setNotice('Your appointment is confirmed.')
                  setMode('view')
                }
              }}
            >
              Confirm Appointment
            </button>
          </>
        ) : null}
        {mode === 'date' ? (
          <>
            <h2>Choose a new date</h2>
            <DateSelector
              selectedKey={dateKey}
              onSelect={(day) => {
                setDateKey(toDateKey(day))
                setStartTime('')
                setMode('time')
              }}
              today={today}
              minDate={tomorrow}
              maxDate={horizon}
              isDateEnabled={(day) => openDates.has(toDateKey(day))}
            />
          </>
        ) : null}
        {mode === 'time' ? (
          <>
            <h2>{dateKey ? formatLongDate(parseDateKey(dateKey)) : 'Choose a time'}</h2>
            <TimeSelector times={times} value={startTime} onChange={setStartTime} />
            <button
              type="button"
              className="btn btn--primary"
              disabled={!startTime}
              onClick={() => setMode('review')}
            >
              Review request
            </button>
          </>
        ) : null}
        {mode === 'review' ? (
          <>
            <h2>Review your request</h2>
            <p>
              {formatLongDate(parseDateKey(dateKey))} at {formatTimeDisplay(startTime)}
            </p>
            <button
              type="button"
              className="btn btn--primary"
              disabled={busy}
              onClick={async () => {
                const data = await run(() => requestReschedule(token, dateKey, startTime))
                if (data?.ok) {
                  setNotice('Your reschedule request has been sent. The salon will confirm your new appointment time.')
                  setMode('view')
                }
              }}
            >
              Submit Reschedule Request
            </button>
          </>
        ) : null}
        {mode === 'cancel' ? (
          <>
            <h2>Cancel this appointment?</h2>
            <p>This cannot be undone from this page.</p>
            <button
              type="button"
              className="btn btn--primary"
              disabled={busy}
              onClick={async () => {
                const data = await run(() => cancelAppointment(token))
                if (data?.ok) {
                  setNotice('Your appointment has been canceled.')
                  setMode('view')
                }
              }}
            >
              Cancel Appointment
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => setMode('view')}>
              Keep Appointment
            </button>
          </>
        ) : null}
      </section>
    </main>
    </SalonFrame>
  )
}
