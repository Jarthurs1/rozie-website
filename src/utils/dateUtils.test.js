import { describe, expect, it } from 'vitest'
import { dateKeyFromSelector, toDateKey } from './dateUtils.js'

describe('dateKeyFromSelector', () => {
  it('keeps the calendar day the customer selected', () => {
    expect(dateKeyFromSelector('2026-11-24')).toBe('2026-11-24')
  })

  it('does not apply the UTC shift that toDateKey causes for a date-only string', () => {
    const selected = '2026-11-24'
    if (new Date().getTimezoneOffset() > 0) {
      expect(toDateKey(selected)).toBe('2026-11-23')
    }
    expect(dateKeyFromSelector(selected)).toBe(selected)
  })

  it('still formats a Date object', () => {
    expect(dateKeyFromSelector(new Date(2026, 10, 24))).toBe('2026-11-24')
  })
})
