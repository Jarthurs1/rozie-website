/**
 * Placeholder service menu — durations drive availability.
 * Pricing is optional and centralized for easy later edits.
 */

export const SERVICES = [
  {
    id: 'haircut',
    name: 'Haircut',
    description: 'Precision cut tailored to your hair and lifestyle.',
    durationMinutes: 45,
    startingPrice: 65,
  },
  {
    id: 'haircut-style',
    name: 'Haircut & Style',
    description: 'Cut plus finish styling for everyday polish or an event.',
    durationMinutes: 60,
    startingPrice: 85,
  },
  {
    id: 'blowout',
    name: 'Blowout',
    description: 'Smooth, lasting blow-dry finish.',
    durationMinutes: 45,
    startingPrice: 55,
  },
  {
    id: 'color',
    name: 'Color',
    description: 'Custom color formulated for healthy, natural-looking results.',
    durationMinutes: 120,
    startingPrice: 145,
  },
  {
    id: 'highlights',
    name: 'Highlights',
    description: 'Dimensional lightening with careful placement.',
    durationMinutes: 150,
    startingPrice: 185,
  },
]

export function getServiceById(id) {
  return SERVICES.find((s) => s.id === id) ?? null
}

export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`
  const hours = minutes / 60
  if (Number.isInteger(hours)) {
    return hours === 1 ? '1 hr' : `${hours} hr`
  }
  const whole = Math.floor(hours)
  const rem = minutes % 60
  return rem === 0 ? `${whole} hr` : `${whole} hr ${rem} min`
}

export function formatStartingPrice(price) {
  if (price == null) return null
  return `From $${price}`
}
