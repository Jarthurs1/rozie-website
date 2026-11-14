/**
 * Public Booking API client — no admin tokens.
 * Production must not fall back to mock availability.
 */

const PUBLIC_BOOKING_API_URL =
  'https://plnsqwwz86.execute-api.us-east-1.amazonaws.com'

function getBaseUrl() {
  const configured = import.meta.env.VITE_PUBLIC_BOOKING_API_URL
  const url =
    typeof configured === 'string' && configured.trim()
      ? configured
      : PUBLIC_BOOKING_API_URL
  return url.replace(/\/+$/, '')
}

export function isPublicBookingConfigured() {
  return Boolean(getBaseUrl())
}

async function request(path, options = {}) {
  const base = getBaseUrl()
  if (!base) {
    const err = new Error('Booking is temporarily unavailable.')
    err.code = 'not_configured'
    throw err
  }

  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  })

  let data = null
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }

  if (!res.ok) {
    const err = new Error(
      data?.message || 'Something went wrong. Please try again.',
    )
    err.code = data?.code || `http_${res.status}`
    err.status = res.status
    err.data = data
    throw err
  }

  return data
}

export async function fetchSalon() {
  return request('/salon')
}

export async function lookupCustomer(email) {
  const q = new URLSearchParams({ email })
  return request(`/customer?${q}`)
}

export async function fetchServices() {
  return request('/services')
}

export async function fetchAvailabilityForDate(serviceId, date) {
  const q = new URLSearchParams({ serviceId, date })
  return request(`/availability?${q}`)
}

export async function fetchAvailabilityRange(serviceId, from, to) {
  const q = new URLSearchParams({ serviceId, from, to })
  return request(`/availability?${q}`)
}

export async function fetchAppointment(token) {
  const q = new URLSearchParams({ token })
  return request(`/appointment?${q}`)
}

export async function confirmAppointment(token) {
  return request('/appointment/confirm', {
    method: 'POST',
    body: JSON.stringify({ token }),
  })
}

export async function cancelAppointment(token) {
  return request('/appointment/cancel', {
    method: 'POST',
    body: JSON.stringify({ token }),
  })
}

export async function requestReschedule(token, date, startTime) {
  return request('/appointment/reschedule', {
    method: 'POST',
    body: JSON.stringify({ token, date, startTime }),
  })
}

export async function fetchManagedAvailability(token, from, to) {
  const q = new URLSearchParams({ token, from, to })
  return request(`/availability?${q}`)
}

export async function fetchManagedTimes(token, date) {
  const q = new URLSearchParams({ token, date })
  return request(`/availability?${q}`)
}

export function appointmentTokenFromPath(pathname) {
  const match = String(pathname || '').match(/^\/appointment\/([^/]+)\/?$/)
  if (!match) return ''
  try {
    return decodeURIComponent(match[1])
  } catch {
    return ''
  }
}

export async function submitBooking(payload) {
  return request('/book', {
    method: 'POST',
    body: JSON.stringify({
      serviceId: payload.serviceId,
      date: payload.date,
      startTime: payload.startTime,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      notes: payload.notes || '',
      smsOptIn: false,
    }),
  })
}
