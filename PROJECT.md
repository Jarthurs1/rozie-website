# Rozie's Salon — Customer Website

## Phase status

**Phase 1** — Frontend / UX with mock availability — complete  
**Phase 2** — Live Public Booking API + shared calendar — **COMPLETE (code + AWS)**  
**Physical iPhone validation — REQUIRED**

**NO Phase 3 yet.**  
SES remains **sandbox**. Reminder Lambda remains **DRY_RUN=true**.

---

## Project purpose

Public-facing website for **Rozie's Salon** (spelling: **Rozie**).

Customers see real availability from Rozie's shared calendar and can request appointments that appear in her stylist app.

---

## Shared backend architecture

```
Stylist App ──(x-rosie-token)──► Data API ──► Private S3
                                              (clients / appointments / settings)
Customer Website ──► Public Booking API ──────┘
                     (no admin token)
```

| Surface | Auth | Capabilities |
|---------|------|----------------|
| Stylist Data API | `x-rosie-token` | Full GET/PUT envelopes |
| Public Booking API | None (throttled) | `GET /services`, `GET /availability`, `POST /book` only |

Public API base: `https://plnsqwwz86.execute-api.us-east-1.amazonaws.com`  
Stack: `rosies-salon-public-booking` (separate from `rosies-salon-data`)  
Bucket: `rosies-salon-data-rosie-jarthurs-2026` (shared)

---

## Monday–Friday public rule

- Website calendar disables Saturday & Sunday
- `GET /availability` returns no times for weekends
- `POST /book` rejects weekends with `weekend_not_public` even if called directly
- **Stylist app weekend capability is unchanged** (Rozie may still book Sat/Sun internally)

---

## Availability / booking contracts

### GET /availability?serviceId=&date=

```json
{ "date": "2026-10-02", "serviceId": "haircut", "durationMinutes": 45, "availableTimes": ["09:00"], "bookable": true }
```

Range: `?serviceId=&from=&to=` returns `{ days: [{ date, bookable, availableTimes, weekend }] }`

Never returns client names, emails, notes, or private appointment records.

### POST /book

Body allowlist: `serviceId`, `date`, `startTime`, `firstName`, `lastName`, `email`, `phone`, `notes`

Server validates service duration, Mon–Fri, hours, blocks, conflicts.  
Uses S3 ETag / If-Match optimistic retries.  
`409 conflict` when the slot was taken.

Appointments: existing schema, `status: "pending"`, Phase 6 confirmation/reminder fields present (null), `source: "website"`.

Clients: match by normalized email; otherwise create. Same name alone does not merge.

---

## Environment

```bash
VITE_PUBLIC_BOOKING_API_URL=https://plnsqwwz86.execute-api.us-east-1.amazonaws.com
```

**Never** set `VITE_DATA_API_TOKEN` on this site.

---

## Deployment

```bash
npm run build
npm run package:amplify-zip
# Amplify app: rozie-website (d20twgz4us6qx7) us-west-2
```

Production: https://main.d20twgz4us6qx7.amplifyapp.com

---

## Scripts

```bash
npm install
npm run dev
npm test
npm run build
```

---

## Known limitations

- No payments / accounts / CAPTCHA
- Contact fields still TBD on Location section
- Reminder emails not sent for website bookings while DRY_RUN=true
- Physical iPhone pass not yet recorded
