# Rozie's Salon — Customer Website

## Phase status

**PHASE 1 IS FRONTEND / UX ONLY.**  
**NO LIVE CUSTOMER BOOKING YET.**  
**NO PRODUCTION AWS CONNECTION.**  
**DOES NOT MODIFY the stylist/admin application.**

---

## Project purpose

Public-facing website for **Rozie's Salon** (spelling: **Rozie**, not Rosie).

Goals for Phase 1:

- Premium boutique salon presence (not a SaaS dashboard)
- Make availability easy to find
- Prototype a simple customer booking flow with realistic mock data
- Structure the app so Phase 2 can connect to a public booking API backed by the same availability rules as Rozie's stylist app

---

## Technology

| Layer | Choice |
|-------|--------|
| UI | React + Vite (JavaScript) |
| Styles | Plain CSS (minimal dependencies) |
| Icons | Lucide React |
| Tests | Vitest |
| Hosting target | AWS Amplify (`amplify.yml` included) |

---

## Design direction

- Soft cream / ivory backgrounds, charcoal text, muted rose accent
- Display type: Cormorant Garamond; UI/body: Outfit
- Full-bleed hero with brand-first hierarchy
- Editorial services list (menu, not pricing cards)
- Calm spacing, restrained motion, mobile-first

---

## Component structure

```
src/
  App.jsx
  components/
    Header.jsx
    Hero.jsx
    BookingSection.jsx
    ServiceSelector.jsx
    DateSelector.jsx
    TimeSelector.jsx
    CustomerForm.jsx
    BookingSummary.jsx
    Services.jsx
    About.jsx
    Gallery.jsx
    LocationHours.jsx
    Footer.jsx
    MobileBookCta.jsx
  data/
    salon.js
    services.js
    schedule.js
    availability.js
    gallery.js
  utils/
    dateUtils.js
    bookingAvailability.js
```

---

## Booking workflow (Phase 1)

1. Select service (sets duration)
2. Select bookable date (unavailable days greyed / disabled)
3. Select available start time only
4. Enter first name, last name, email, phone, optional notes
5. Review summary
6. Request Appointment → **mock success** (no AWS write, no email)

Service buttons in the Services section preselect that service and scroll to Book.

---

## Mock data architecture

| Module | Responsibility |
|--------|----------------|
| `salon.js` | Brand + contact placeholders (address/phone/email/IG are TBD) |
| `services.js` | Service menu, durations, optional starting prices |
| `schedule.js` | Weekly hours (aligned with stylist-app prototype defaults) |
| `availability.js` | Mock busy intervals for upcoming days |
| `gallery.js` | Hero / about / gallery image URLs + alt text |

Public availability exposes **dates and free start times only** — never client names, appointment details, or block reasons.

---

## Future AWS integration

Intended architecture:

```
Customer Website
      ↓
Public Booking API  (narrowly scoped; no admin token)
      ↓
Server-side availability validation + concurrency check
      ↓
Existing appointment data (shared with stylist app)
      ↓
Rozie's stylist Calendar
```

**Must not:**

- Let the customer website write S3 directly
- Embed the stylist app's shared/admin API token in the browser
- Treat browser-shown availability as a reservation

### Concurrency (Phase 2+)

Availability shown in the browser is advisory. Immediately before creating an appointment, the server must revalidate the slot. If Customer A books 2:00 PM first, Customer B's overlapping request must fail atomically / conditionally.

---

## Public / private data separation

| Public (this site) | Private (stylist app) |
|--------------------|------------------------|
| Service names & durations | Client records |
| Open hours presentation | Full calendar details |
| Free start times | Who is booked / why blocked |
| Customer-submitted booking requests | Admin confirmation / edits |

---

## Current limitations

- Mock availability only
- No payments, accounts, or authentication
- Contact fields intentionally empty until real details are provided
- Gallery / About imagery and copy are placeholders
- Success state clearly labels prototype behavior

---

## Scripts

```bash
npm install
npm run dev
npm test
npm run build
```

Local review: http://localhost:5173/
