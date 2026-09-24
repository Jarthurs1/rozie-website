import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  addMonths,
  formatLongDate,
  formatMonthYear,
  getMonthGridDays,
  getMonthStart,
  isSameDay,
  parseDateKey,
  startOfDay,
  toDateKey,
} from '../utils/dateUtils.js'
import './DateSelector.css'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function DateSelector({
  selectedKey,
  onSelect,
  today,
  minDate,
  maxDate,
  isDateEnabled,
}) {
  const [visibleMonth, setVisibleMonth] = useState(() =>
    getMonthStart(selectedKey ? parseDateKey(selectedKey) : today),
  )

  const monthStart = getMonthStart(visibleMonth)
  const cells = useMemo(() => getMonthGridDays(monthStart), [monthStart])
  const selected = selectedKey ? parseDateKey(selectedKey) : null

  const canGoBack = getMonthStart(minDate).getTime() < monthStart.getTime()
  const canGoForward = getMonthStart(maxDate).getTime() > monthStart.getTime()

  function enabled(day) {
    if (day.getTime() < startOfDay(minDate).getTime()) return false
    if (day.getTime() > startOfDay(maxDate).getTime()) return false
    return Boolean(isDateEnabled?.(day))
  }

  return (
    <div className="date-selector" aria-label="Choose a date">
      <div className="date-selector__header">
        <button
          type="button"
          className="date-selector__arrow"
          onClick={() => setVisibleMonth(addMonths(monthStart, -1))}
          disabled={!canGoBack}
          aria-label="Previous month"
        >
          <ChevronLeft size={20} />
        </button>
        <p className="date-selector__month">{formatMonthYear(monthStart)}</p>
        <button
          type="button"
          className="date-selector__arrow"
          onClick={() => setVisibleMonth(addMonths(monthStart, 1))}
          disabled={!canGoForward}
          aria-label="Next month"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="date-selector__weekdays" aria-hidden="true">
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="date-selector__grid" role="grid">
        {cells.map(({ date, inMonth }) => {
          const key = toDateKey(date)
          const canSelect = inMonth && enabled(date)
          const isSelected = selected && isSameDay(date, selected)
          return (
            <button
              key={key}
              type="button"
              role="gridcell"
              className={[
                'date-selector__day',
                inMonth ? '' : 'is-outside',
                canSelect ? '' : 'is-unavailable',
                isSelected ? 'is-selected' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={!canSelect}
              aria-label={
                canSelect
                  ? formatLongDate(date)
                  : `${formatLongDate(date)}, unavailable`
              }
              aria-selected={isSelected}
              onClick={() => canSelect && onSelect(key)}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>

      {selectedKey ? (
        <p className="date-selector__chosen">{formatLongDate(selected)}</p>
      ) : null}
    </div>
  )
}
