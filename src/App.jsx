import { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import Services from './components/Services.jsx'
import About from './components/About.jsx'
import BookingSection from './components/BookingSection.jsx'
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
  useEffect(() => {
    document.title = "Rozie's Salon"
  }, [])

  function goBook() {
    scrollToId('book')
  }

  return (
    <div className="site">
      <Header onBook={goBook} onNavigate={scrollToId} />
      <main>
        <Hero />
        <Services />
        <About />
        <BookingSection />
        <LocationHours />
      </main>
      <Footer onNavigate={scrollToId} />
      <MobileBookCta onBook={goBook} />
    </div>
  )
}
