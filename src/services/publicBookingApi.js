/**
 * Public Booking API client — no admin tokens.
 * Production must not fall back to mock availability.
 */

function getBaseUrl() {
  const url = import.meta.env.VITE_PUBLIC_BOOKING_API_URL
  return typeof url === 'string' ? url.replace(/\/+$/, '') : ''
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
    }),
  })
}
