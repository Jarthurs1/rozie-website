import { formatTimeDisplay } from '../utils/dateUtils.js'
import './TimeSelector.css'

export default function TimeSelector({ times, value, onChange }) {
  return (
    <div className="time-selector" role="listbox" aria-label="Available times">
      {times.map((time) => {
        const selected = value === time
        return (
          <button
            key={time}
            type="button"
            role="option"
            aria-selected={selected}
            className={`time-selector__option${selected ? ' is-selected' : ''}`}
            onClick={() => onChange(time)}
          >
            {formatTimeDisplay(time)}
          </button>
        )
      })}
    </div>
  )
}
