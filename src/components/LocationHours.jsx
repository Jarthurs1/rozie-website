import { MapPin, Phone, Mail, AtSign } from 'lucide-react'
import { SALON } from '../data/salon.js'
import { HOURS_DISPLAY } from '../data/schedule.js'
import './LocationHours.css'

function Placeholder({ label }) {
  return <span className="location__tbd">{label} — to be added</span>
}

export default function LocationHours() {
  return (
    <section className="section location" id="location">
      <div className="section__inner location__inner">
        <div>
          <p className="section__eyebrow">Visit</p>
          <h2 className="section__title">Location & hours</h2>
          <p className="section__lead">
            Contact details will be published when ready. Hours shown match the
            current stylist schedule prototype.
          </p>

          <ul className="location__contacts">
            <li>
              <MapPin size={18} aria-hidden="true" />
              <div>
                <p className="location__label">Salon location</p>
                {SALON.address ? (
                  <p>{SALON.address}</p>
                ) : (
                  <Placeholder label="Address" />
                )}
              </div>
            </li>
            <li>
              <Phone size={18} aria-hidden="true" />
              <div>
                <p className="location__label">Phone</p>
                {SALON.phone ? (
                  <a href={`tel:${SALON.phone}`}>{SALON.phone}</a>
                ) : (
                  <Placeholder label="Phone" />
                )}
              </div>
            </li>
            <li>
              <Mail size={18} aria-hidden="true" />
              <div>
                <p className="location__label">Email</p>
                {SALON.email ? (
                  <a href={`mailto:${SALON.email}`}>{SALON.email}</a>
                ) : (
                  <Placeholder label="Email" />
                )}
              </div>
            </li>
            <li>
              <AtSign size={18} aria-hidden="true" />
              <div>
                <p className="location__label">Instagram</p>
                {SALON.instagram ? (
                  <a
                    href={`https://instagram.com/${SALON.instagram}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    @{SALON.instagram}
                  </a>
                ) : (
                  <Placeholder label="Instagram" />
                )}
              </div>
            </li>
          </ul>
        </div>

        <div className="location__hours">
          <h3 className="location__hours-title">Hours</h3>
          <dl className="location__hours-list">
            {HOURS_DISPLAY.map((row) => (
              <div key={row.label} className="location__hours-row">
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
