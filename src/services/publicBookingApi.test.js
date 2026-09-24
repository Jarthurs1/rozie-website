import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  isPublicBookingConfigured,
  submitBooking,
} from '../services/publicBookingApi.js'

describe('publicBookingApi client', () => {
  const original = import.meta.env.VITE_PUBLIC_BOOKING_API_URL

  afterEach(() => {
    import.meta.env.VITE_PUBLIC_BOOKING_API_URL = original
    vi.unstubAllGlobals()
  })

  it('reports unconfigured when URL missing', () => {
    import.meta.env.VITE_PUBLIC_BOOKING_API_URL = ''
    expect(isPublicBookingConfigured()).toBe(false)
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
})
