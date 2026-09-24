const DAY_MS = 24 * 60 * 60 * 1000

export function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function toDateKey(date) {
  const d = startOfDay(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseDateKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function isSameDay(a, b) {
  return toDateKey(a) === toDateKey(b)
}

export function isPastDay(date, today = new Date()) {
  return startOfDay(date).getTime() < startOfDay(today).getTime()
}

export function getWeekStart(date) {
  const d = startOfDay(date)
  const day = d.getDay()
  const offset = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + offset)
  return d
}

export function getMonthStart(date) {
  const d = startOfDay(date)
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export function addMonths(date, months) {
  const d = startOfDay(date)
  return new Date(d.getFullYear(), d.getMonth() + months, 1)
}

export function getMonthGridDays(monthDate) {
  const monthStart = getMonthStart(monthDate)
  const gridStart = getWeekStart(monthStart)
  const nextMonth = addMonths(monthStart, 1)
  const cells = []
  let cursor = gridStart
  while (cursor.getTime() < nextMonth.getTime() || cells.length % 7 !== 0) {
    cells.push({
      date: startOfDay(cursor),
      inMonth: cursor.getMonth() === monthStart.getMonth(),
    })
    cursor = addDays(cursor, 1)
    if (cells.length >= 42) break
  }
  return cells
}

export function getDateRange(startDate, endDate) {
  const start = startOfDay(startDate)
  const end = startOfDay(endDate)
  const days = []
  for (let d = new Date(start); d.getTime() <= end.getTime(); d = addDays(d, 1)) {
    days.push(startOfDay(d))
  }
  return days
}

export function formatMonthYear(date) {
  return startOfDay(date).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

export function formatLongDate(date) {
  return startOfDay(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export function parseTimeToMinutes(time) {
  const match = String(time).trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null
  const h = Number(match[1])
  const m = Number(match[2])
  if (h < 0 || h > 23 || m < 0 || m > 59) return null
  return h * 60 + m
}

export function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60) % 24
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function formatTimeDisplay(time) {
  const minutes = parseTimeToMinutes(time)
  if (minutes == null) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}
