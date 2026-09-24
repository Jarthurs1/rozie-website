/**
 * Working hours prototype — aligned with Rozie's stylist app defaults.
 * Live source of truth will later be the shared backend schedule.
 */

export const DAY_KEYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

export const WEEKLY_HOURS = {
  monday: { closed: true },
  tuesday: { closed: false, start: '09:00', end: '18:00' },
  wednesday: { closed: true },
  thursday: { closed: false, start: '09:00', end: '18:00' },
  friday: { closed: false, start: '09:00', end: '18:00' },
  saturday: { closed: false, start: '09:00', end: '17:00' },
  sunday: { closed: false, start: '10:00', end: '16:00' },
}

export const SLOT_STEP_MINUTES = 30
export const MAX_BOOKING_DAYS_AHEAD = 42

export function getDayKey(date) {
  return DAY_KEYS[date.getDay()]
}

export function getHoursForDate(date) {
  return WEEKLY_HOURS[getDayKey(date)] ?? { closed: true }
}

export function isClosedDay(date) {
  return Boolean(getHoursForDate(date).closed)
}

/** Display rows for Location / Hours section */
export const HOURS_DISPLAY = [
  { label: 'Monday', value: 'Closed' },
  { label: 'Tuesday', value: '9:00 AM – 6:00 PM' },
  { label: 'Wednesday', value: 'Closed' },
  { label: 'Thursday', value: '9:00 AM – 6:00 PM' },
  { label: 'Friday', value: '9:00 AM – 6:00 PM' },
  { label: 'Saturday', value: '9:00 AM – 5:00 PM' },
  { label: 'Sunday', value: '10:00 AM – 4:00 PM' },
]
