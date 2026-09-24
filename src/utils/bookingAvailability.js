/**
 * Public availability helpers for the customer booking UI.
 * Returns free start times only — never private calendar details.
 */

import {
  addDays,
  isPastDay,
  parseTimeToMinutes,
  minutesToTime,
  startOfDay,
  toDateKey,
} from './dateUtils.js'
import {
  getHoursForDate,
  isClosedDay,
  SLOT_STEP_MINUTES,
  MAX_BOOKING_DAYS_AHEAD,
} from '../data/schedule.js'
import { getMockBusyByDate } from '../data/availability.js'

function intervalsOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd
}

/**
 * @returns {string[]} HH:MM start times that fit duration without overlapping busy blocks
 */
export function getAvailableStartTimes(date, durationMinutes, options = {}) {
  const today = options.today ?? startOfDay(new Date())
  const day = startOfDay(date)
  if (isPastDay(day, today)) return []
  if (isClosedDay(day)) return []

  const hours = getHoursForDate(day)
  if (hours.closed || !hours.start || !hours.end) return []

  const openStart = parseTimeToMinutes(hours.start)
  const openEnd = parseTimeToMinutes(hours.end)
  if (openStart == null || openEnd == null) return []
  if (durationMinutes > openEnd - openStart) return []

  const busyMap = options.busyByDate ?? getMockBusyByDate(today)
  const busy = busyMap[toDateKey(day)] ?? []
  const busyRanges = busy
    .map((block) => ({
      start: parseTimeToMinutes(block.start),
      end: parseTimeToMinutes(block.end),
    }))
    .filter((b) => b.start != null && b.end != null)

  const times = []
  for (
    let start = openStart;
    start + durationMinutes <= openEnd;
    start += SLOT_STEP_MINUTES
  ) {
    const end = start + durationMinutes
    const conflicts = busyRanges.some((b) =>
      intervalsOverlap(start, end, b.start, b.end),
    )
    if (!conflicts) times.push(minutesToTime(start))
  }
  return times
}

export function isDateBookable(date, durationMinutes, options = {}) {
  return getAvailableStartTimes(date, durationMinutes, options).length > 0
}

export function getBookableDateRange(today = new Date()) {
  const start = startOfDay(today)
  const end = addDays(start, MAX_BOOKING_DAYS_AHEAD)
  return { start, end }
}
