import { GALLERY } from '../data/gallery.js'
import './Gallery.css'

export default function Gallery() {
  return (
    <section className="section gallery" id="gallery">
      <div className="section__inner">
        <p className="section__eyebrow">Work</p>
        <h2 className="section__title">Gallery</h2>
        <p className="section__lead">
          A quiet look at texture, color, and finish. Images are placeholders
          until Rozie&apos;s portfolio is added.
        </p>

        <ul className="gallery__grid">
          {GALLERY.map((item, index) => (
            <li key={item.id} className="gallery__item">
              <img
                src={item.src}
                alt={item.alt}
                loading={index < 2 ? 'eager' : 'lazy'}
                className="gallery__image"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
