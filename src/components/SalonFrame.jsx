import SalonPortrait from './SalonPortrait.jsx'
import './SalonFrame.css'

export default function SalonFrame({ salonName, children }) {
  return (
    <div className="salon-frame">
      <section className="salon-frame__panel">
        <div className="salon-frame__inner">
          <p className="salon-frame__eyebrow">Welcome to</p>
          <h1 className="salon-frame__name">{salonName}</h1>
          <p className="salon-frame__subtitle">Your next great hair day starts here.</p>
          {children}
        </div>
      </section>
      <SalonPortrait />
    </div>
  )
}
