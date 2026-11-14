import { useState } from 'react'
import BookingPage from './components/BookingPage.jsx'
import ManageAppointmentPage from './components/ManageAppointmentPage.jsx'
import { appointmentTokenFromPath } from './services/publicBookingApi.js'
import './App.css'

export default function App() {
  const [token] = useState(() => appointmentTokenFromPath(window.location.pathname))
  return (
    <div className="site">
      {token ? <ManageAppointmentPage token={token} /> : <BookingPage />}
    </div>
  )
}
