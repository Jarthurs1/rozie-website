/**
 * Mock busy intervals for Phase 1 availability UX.
 * Public site exposes only free start times — never client names or reasons.
 *
 * Keys are YYYY-MM-DD relative to a rolling "today" when generated.
 */

import { addDays, startOfDay, toDateKey } from '../utils/dateUtils.js'
import { isClosedDay } from './schedule.js'

/**
 * Build a realistic mix of days for the next several weeks.
 * Patterns: busy, moderate, light, closed, fully booked, partial.
 */
export function buildMockBusyByDate(today = new Date()) {
  const base = startOfDay(today)
  const map = {}

  for (let offset = 0; offset <= 42; offset += 1) {
    const day = addDays(base, offset)
    const key = toDateKey(day)
    if (isClosedDay(day)) {
      map[key] = []
      continue
    }

    const pattern = offset % 7
    if (pattern === 0) {
      // Fully booked open day
      map[key] = [
        { start: '09:00', end: '12:00' },
        { start: '12:00', end: '15:00' },
        { start: '15:00', end: '18:00' },
      ]
    } else if (pattern === 1) {
      // Busy morning
      map[key] = [
        { start: '09:00', end: '11:00' },
        { start: '11:30', end: '13:00' },
        { start: '15:00', end: '16:30' },
      ]
    } else if (pattern === 2) {
      // Moderate
      map[key] = [
        { start: '10:00', end: '11:30' },
        { start: '14:00', end: '16:00' },
      ]
    } else if (pattern === 3) {
      // Light afternoon only blocked
      map[key] = [{ start: '13:00', end: '14:00' }]
    } else if (pattern === 4) {
      // Partial — morning open, afternoon full
      map[key] = [
        { start: '12:00', end: '14:00' },
        { start: '14:00', end: '18:00' },
      ]
    } else if (pattern === 5) {
      // Full-day style block on an otherwise open day
      map[key] = [{ start: '09:00', end: '18:00' }]
    } else {
      // Nearly open
      map[key] = [{ start: '11:00', end: '12:00' }]
    }
  }

  // Explicit full-day block example ~10 days out if that day is open
  for (let offset = 8; offset <= 14; offset += 1) {
    const day = addDays(base, offset)
    if (!isClosedDay(day)) {
      map[toDateKey(day)] = [{ start: '09:00', end: '18:00' }]
      break
    }
  }

  return map
}

let cachedTodayKey = null
let cachedBusy = null

export function getMockBusyByDate(today = new Date()) {
  const key = toDateKey(startOfDay(today))
  if (cachedTodayKey !== key || !cachedBusy) {
    cachedTodayKey = key
    cachedBusy = buildMockBusyByDate(today)
  }
  return cachedBusy
}

/** Test helper — reset memoization */
export function resetMockAvailabilityCache() {
  cachedTodayKey = null
  cachedBusy = null
}
