import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  appointmentTokenFromPath,
  confirmAppointment,
  isPublicBookingConfigured,
  submitBooking,
} from '../services/publicBookingApi.js'

describe('publicBookingApi client', () => {
  const original = import.meta.env.VITE_PUBLIC_BOOKING_API_URL

  afterEach(() => {
    import.meta.env.VITE_PUBLIC_BOOKING_API_URL = original
    vi.unstubAllGlobals()
  })

  it('uses the public booking API when no env URL is set', () => {
    import.meta.env.VITE_PUBLIC_BOOKING_API_URL = ''
    expect(isPublicBookingConfigured()).toBe(true)
  })

  it('maps 409 conflict to a friendly error', async () => {
    import.meta.env.VITE_PUBLIC_BOOKING_API_URL = 'https://example.test'
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        status: 409,
        text: async () =>
          JSON.stringify({
            code: 'conflict',
            message:
              'That time was just booked. Please choose another available time.',
          }),
      })),
    )

    await expect(
      submitBooking({
        serviceId: 'haircut',
        date: '2026-09-29',
        startTime: '10:00',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '555-0100',
      }),
    ).rejects.toMatchObject({ status: 409, code: 'conflict' })
  })

  it('reads a management token from the public path', () => {
    expect(appointmentTokenFromPath('/appointment/abc.def')).toBe('abc.def')
    expect(appointmentTokenFromPath('/')).toBe('')
  })

  it('confirms with POST so a link preview cannot confirm', async () => {
    import.meta.env.VITE_PUBLIC_BOOKING_API_URL = 'https://example.test'
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ ok: true, code: 'confirmed' }),
    }))
    vi.stubGlobal('fetch', fetchMock)
    await confirmAppointment('tok')
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.test/appointment/confirm',
      expect.objectContaining({ method: 'POST' }),
    )
  })
})
