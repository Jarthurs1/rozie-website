import { describe, it, expect, beforeEach } from 'vitest'
import {
  getAvailableStartTimes,
  isDateBookable,
} from './bookingAvailability.js'
import { resetMockAvailabilityCache } from '../data/availability.js'
import { parseDateKey, startOfDay, toDateKey, addDays } from './dateUtils.js'
import { isClosedDay } from '../data/schedule.js'

const today = startOfDay(parseDateKey('2026-09-23')) // Wednesday

beforeEach(() => {
  resetMockAvailabilityCache()
})

describe('public booking availability', () => {
  it('returns no times on closed days', () => {
    // Monday closed
    const monday = parseDateKey('2026-09-28')
    expect(isClosedDay(monday)).toBe(true)
    expect(
      getAvailableStartTimes(monday, 60, {
        today,
        busyByDate: {},
      }),
    ).toEqual([])
    expect(isDateBookable(monday, 60, { today, busyByDate: {} })).toBe(false)
  })

  it('returns no times for past days', () => {
    const past = parseDateKey('2026-09-20')
    expect(
      getAvailableStartTimes(past, 60, { today, busyByDate: {} }),
    ).toEqual([])
  })

  it('exposes only free start times — never busy internals', () => {
    const thursday = parseDateKey('2026-09-24')
    const busyByDate = {
      [toDateKey(thursday)]: [{ start: '10:00', end: '12:00' }],
    }
    const times = getAvailableStartTimes(thursday, 60, { today, busyByDate })
    expect(times).toContain('09:00')
    expect(times).not.toContain('10:00')
    expect(times).not.toContain('10:30')
    expect(times).toContain('12:00')
    expect(times.every((t) => typeof t === 'string')).toBe(true)
  })

  it('requires duration to fit before a date is bookable', () => {
    const thursday = parseDateKey('2026-09-24')
    const busyByDate = {
      [toDateKey(thursday)]: [
        { start: '09:00', end: '11:00' },
        { start: '12:00', end: '18:00' },
      ],
    }
    // Only 11:00–12:00 free — 60 min fits, 90 does not
    expect(isDateBookable(thursday, 60, { today, busyByDate })).toBe(true)
    expect(isDateBookable(thursday, 90, { today, busyByDate })).toBe(false)
  })

  it('marks a full-day blocked open day unbookable', () => {
    const friday = parseDateKey('2026-09-25')
    const busyByDate = {
      [toDateKey(friday)]: [{ start: '09:00', end: '18:00' }],
    }
    expect(isDateBookable(friday, 45, { today, busyByDate })).toBe(false)
  })

  it('keeps partially busy days bookable when a slot remains', () => {
    const saturday = parseDateKey('2026-09-26')
    const busyByDate = {
      [toDateKey(saturday)]: [{ start: '09:00', end: '12:00' }],
    }
    expect(isDateBookable(saturday, 45, { today, busyByDate })).toBe(true)
    expect(
      getAvailableStartTimes(saturday, 45, { today, busyByDate }).length,
    ).toBeGreaterThan(0)
  })
})

describe('mock busy map', () => {
  it('includes entries for upcoming open days', async () => {
    const { getMockBusyByDate } = await import('../data/availability.js')
    const map = getMockBusyByDate(today)
    const openDay = addDays(today, 1) // Thursday
    expect(isClosedDay(openDay)).toBe(false)
    expect(map[toDateKey(openDay)]).toBeDefined()
  })
})
