import './MobileBookCta.css'

export default function MobileBookCta({ onBook }) {
  return (
    <div className="mobile-book-cta">
      <button type="button" className="btn btn--accent" onClick={onBook}>
        Book Appointment
      </button>
    </div>
  )
}
