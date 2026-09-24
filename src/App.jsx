import { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import BookingSection from './components/BookingSection.jsx'
import Services from './components/Services.jsx'
import About from './components/About.jsx'
import Gallery from './components/Gallery.jsx'
import LocationHours from './components/LocationHours.jsx'
import Footer from './components/Footer.jsx'
import MobileBookCta from './components/MobileBookCta.jsx'
import './App.css'

function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function App() {
  const [preselectServiceId, setPreselectServiceId] = useState(null)
  const [bookingNonce, setBookingNonce] = useState(0)

  useEffect(() => {
    document.title = "Rozie's Salon"
  }, [])

  function goBook(serviceId = null) {
    if (serviceId) {
      setPreselectServiceId(serviceId)
      setBookingNonce((n) => n + 1)
    }
    scrollToId('book')
  }

  return (
    <div className="site">
      <Header onBook={() => goBook()} onNavigate={scrollToId} />
      <main>
        <Hero
          onBook={() => goBook()}
          onViewAvailability={() => scrollToId('book')}
        />
        <BookingSection
          key={bookingNonce}
          preselectServiceId={preselectServiceId}
          onClearPreselect={() => setPreselectServiceId(null)}
        />
        <Services onBookService={(id) => goBook(id)} />
        <About />
        <Gallery />
        <LocationHours />
      </main>
      <Footer onNavigate={scrollToId} />
      <MobileBookCta onBook={() => goBook()} />
    </div>
  )
}
