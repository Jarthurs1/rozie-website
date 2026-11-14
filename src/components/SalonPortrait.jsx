import standIn from '../assets/salon-interior.svg'

/**
 * Drop a salon photograph at src/assets/salon-photo.jpg
 * (jpeg, webp, or png also work). It replaces the illustration
 * without any layout changes.
 */
const suppliedPhotos = import.meta.glob('../assets/salon-photo.{jpg,jpeg,webp,png}', {
  eager: true,
  import: 'default',
})

const portrait = Object.values(suppliedPhotos)[0] || standIn

export default function SalonPortrait() {
  return (
    <aside className="salon-portrait" aria-label="Salon interior">
      <img src={portrait} alt="" />
    </aside>
  )
}
