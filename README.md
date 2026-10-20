# दिवाळी अंक २०२६ — आरक्षण (Diwali Ank 2026 Booking)

Marathi booking form for **साहित्य संवेदना**, a team of **संवेदना फाउंडेशन**. The public interface is in Devanagari. This README is for people setting up the project.

## Stack

- React + TypeScript + Vite + Tailwind CSS
- Google Apps Script web app (`apps-script/Code.gs`)
- Google Sheets as the booking store

There is no Node.js API and no paid database.

## Booking model

| Field | Notes |
| --- | --- |
| `fullName` | पूर्ण नाव, required |
| `mobile` | 10-digit Indian mobile, unique by default |
| `address` | पत्ता, required, used for postal delivery |
| `bookingType` | `withPostage` (पोस्टासह, ₹२१०/प्रत) or `withoutPostage` (पोस्टाशिवाय, ₹१५०/प्रत) |
| `quantity` | 1–99 copies |
| `paymentStatus` | `होय` or `नंतर करतो आणि आयोजकांना कळवतो` |

The total is `rate × quantity`, calculated in the browser for display and **recalculated in Apps Script** before writing. A tampered browser request cannot change the price.

### Where to change prices

Update **both** places so the UI and the sheet agree:

1. `src/constants.ts` → `BOOKING_TYPES[].rate`
2. `apps-script/Code.gs` → `BOOKING_TYPES` (`rate` values)

### Where to change UPI details

- `src/constants.ts` → `UPI_ID`, `UPI_NAME`, `UPI_QR_PATH`.

The payment QR is **`public/qr.jpeg`** (UPI ID `9892305447`). Replace that file to change the QR; update `UPI_ID` / `UPI_NAME` to match. The payment section appears only after a booking type is selected, so the amount is always correct.

## Local development

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

Production build:

```bash
npm run build
npm run preview
```

## Environment

Copy `.env.example` to `.env`:

```
VITE_GOOGLE_SCRIPT_URL=YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL
```

Replace the placeholder with your deployed Apps Script `/exec` URL. The frontend reads only `import.meta.env.VITE_GOOGLE_SCRIPT_URL`. `.env` is gitignored.

The existing `.env` in this workspace still points at the old AGM 2026 deployment. Replace it before testing bookings.

If the URL is missing or still the placeholder, the form shows:

> आरक्षण सेवा सध्या उपलब्ध नाही. कृपया आयोजकांशी संपर्क साधा.

## Google Sheets setup

1. Create a spreadsheet named **साहित्य संवेदना — दिवाळी अंक २०२६**.
2. Name the worksheet **दिवाळी अंक २०२६ आरक्षण** (the script creates it if missing).
3. Keep the sheet private. Share it only with organizers who need the list.
4. Columns are created automatically on the first booking, in this order:

| # | Header | Written value |
| --- | --- | --- |
| 1 | आरक्षण क्रमांक | UUID |
| 2 | आरक्षण दिनांक व वेळ | `yyyy-MM-dd HH:mm:ss`, Asia/Kolkata |
| 3 | पूर्ण नाव | normalized name |
| 4 | मोबाईल क्रमांक | 10 digits, stored as text |
| 5 | पत्ता | address |
| 6 | आरक्षण प्रकार | पोस्टासह / पोस्टाशिवाय |
| 7 | प्रतींची संख्या | integer |
| 8 | एकूण रक्कम (₹) | `rate × quantity` |
| 9 | पेमेंट स्थिती | होय / नंतर करतो… |

5. Copy the spreadsheet ID from `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`.

## Apps Script deployment

1. Open [Google Apps Script](https://script.google.com) and create a project bound to that spreadsheet, or a standalone project.
2. Paste `apps-script/Code.gs` into `Code.gs`.
3. Set `CONFIG.SPREADSHEET_ID` to the spreadsheet ID.
4. Optional: set `CONFIG.REJECT_DUPLICATE_MOBILE` to `false` if one mobile number may book more than once (for example, a family booking on separate days).
5. Deploy → New deployment → Web app
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Copy the `/exec` URL into `.env` as `VITE_GOOGLE_SCRIPT_URL`.
7. After every script change, **Manage deployments → Edit → New version**. Updating the file without a new version leaves the old code live.

The web app must run as your account so it can write to the private spreadsheet. “Anyone” only means unauthenticated browsers can call the `/exec` URL. It does not make the spreadsheet public.

## Frontend-to-Apps-Script submission

Google Apps Script web apps do not answer CORS preflight (`OPTIONS`). Sending `Content-Type: application/json` from the browser therefore fails before `doPost` runs.

This app posts JSON as a simple request:

- `method: POST`
- `redirect: follow` (Apps Script `/exec` responds with a 302)
- `Content-Type: text/plain;charset=utf-8`
- body: `JSON.stringify({ fullName, mobile, address, bookingType, quantity, paymentConfirmed, paymentStatus, website })`

`doPost` parses `e.postData.contents` and returns JSON as `text/plain`.

**Success is shown only after the browser parses `{ "ok": true }`.** Opaque `no-cors` responses, network errors, and non-JSON bodies are treated as failures.

Known limits:

- Some mobile browsers still block reading the redirected response even when the write succeeded.
- If that happens, the form shows a Marathi “could not confirm” message instead of a false success.
- A same-origin proxy (Cloudflare Worker, Netlify Function, or similar) is the smallest reliable workaround if confirmation fails in production. That is an extra hosting piece, not included here, so the Apps Script + Sheets path stays free.

## Privacy and security

- The site does not list bookings.
- Validation runs in the browser and again in Apps Script.
- Mobile numbers are stored as text.
- Prices and totals are computed server-side.
- Formula-like prefixes in text fields are neutralized before they are written.
- A hidden honeypot field (`website`) is rejected on the server.
- Duplicate mobile numbers are rejected by default inside the same `LockService` section as the write.
- Do not put Google passwords, service-account keys, or other secrets in the frontend.

## Test plan

### Without a live Apps Script URL

| Case | Expected |
| --- | --- |
| Empty name / address | matching Marathi field errors |
| Whitespace-only name or address | same required errors |
| Mobile shorter/longer than 10 digits, or starting with 0–5 | मोबाईल क्रमांक error |
| No booking type | आरक्षणाचा प्रकार error |
| Quantity 0 or above 99 | प्रतींची संख्या error |
| Missing payment answer | पेमेंट error |
| Booking type selected | payment card appears with live amount; ₹२१० × qty or ₹१५० × qty |
| Quantity +/− | amount updates immediately; cannot go below 1 or above 99 |
| Submit with placeholder script URL | service-unavailable message |
| All fields valid | button shows आरक्षण सुरू आहे... and is disabled until the request finishes |

### After deploying Apps Script and pasting `/exec`

| Case | Expected |
| --- | --- |
| Valid first booking | success page with type, quantity, amount, payment status, and a new sheet row |
| Same mobile again | “या मोबाईल क्रमांकावरून आरक्षण आधीच झाले आहे.” |
| `doGet` in a browser | `{"ok":true,"message":"दिवाळी अंक आरक्षण सेवा कार्यरत आहे.","configured":true}` and no personal data; `configured:false` means the spreadsheet ID is still the placeholder |
| Tampered `bookingType` / negative quantity | Marathi validation error, no row |
| Temporary wrong spreadsheet ID | Marathi service-unavailable error, no stack trace |
| Network offline | संपर्क साधता आला नाही… |

## Files worth knowing

- `src/constants.ts` — organization names, booking types/rates, UPI details, all Marathi messages
- `src/pricing.ts` — rate lookup and total calculation
- `src/validation.ts` — field rules
- `src/components/RegistrationForm.tsx` — form state and submission
- `src/components/PaymentSection.tsx` — UPI QR, UPI ID, live amount
- `apps-script/Code.gs` — server validation, duplicate check, sheet write
- `public/qr.jpeg` — UPI payment QR shown in the payment card
- `public/banner.jpeg` — introductory banner shown at the top of the form
#   d i w a l i a n k 2 6 b o o k i n g  
 