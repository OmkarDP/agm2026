# संवेदना फाउंडेशन — AGM 2026 नोंदणी

Marathi-only registration form for Samvedana Foundation, Ajara. The public interface is in Devanagari. This README is for people setting up the project.

## Stack

- React + TypeScript + Vite + Tailwind CSS
- Google Apps Script web app (`apps-script/Code.gs`)
- Google Sheets as the registration store

There is no Node.js API and no paid database.

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

Copy `.env.example` to `.env` (already present in a fresh clone if you keep the example file):

```
VITE_GOOGLE_SCRIPT_URL=YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL
```

Replace the placeholder with your deployed Apps Script `/exec` URL. The frontend reads only `import.meta.env.VITE_GOOGLE_SCRIPT_URL`. `.env` is gitignored.

If the URL is missing or still the placeholder, the form shows:

> नोंदणी सेवा सध्या उपलब्ध नाही. कृपया आयोजकांशी संपर्क साधा.

## Google Sheets setup

1. Create a spreadsheet named **संवेदना फाउंडेशन — AGM 2026**.
2. Name the worksheet **AGM 2026 नोंदणी**.
3. Keep the sheet private. Share it only with organizers who need the list. Do not publish it to the web.
4. Columns (created automatically by the script if the sheet is empty), in this order:
   1. नोंदणी क्रमांक
   2. नोंदणी दिनांक व वेळ
   3. पूर्ण नाव
   4. मोबाईल क्रमांक
   5. प्रवासाचा पर्याय
   6. भोजनाची पसंती
5. Copy the spreadsheet ID from the URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

## Apps Script deployment

1. Open [Google Apps Script](https://script.google.com) and create a project bound to that spreadsheet, or a standalone project.
2. Paste `apps-script/Code.gs` into `Code.gs`.
3. Set `CONFIG.SPREADSHEET_ID` to the spreadsheet ID.
4. Optional: set `CONFIG.REJECT_DUPLICATE_MOBILE` to `false` if a second registration from the same mobile number should be allowed.
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
- body: `JSON.stringify({ fullName, mobile, travel, food, website })`

`doPost` parses `e.postData.contents`. The script returns JSON as `text/plain` so more browsers can read the redirected `script.googleusercontent.com` body.

**Success is shown only after the browser parses `{ "ok": true }`.** The UI never treats `mode: "no-cors"` opaque responses, network errors, or non-JSON bodies as a completed registration.

Known limits:

- Some mobile browsers still block reading the redirected response even when the write succeeded.
- If that happens, the form shows a Marathi “could not confirm” message instead of a false success.
- A same-origin proxy (Cloudflare Worker, Netlify Function, or similar) is the smallest reliable workaround if confirmation fails in production. That is an extra hosting piece, not included here, so the Apps Script + Sheets path stays free.

Local Vite proxying of the Google URL is not used, because it would hide production CORS behaviour.

## Privacy and security

- The site does not list registrations.
- Validation runs in the browser and again in Apps Script.
- Mobile numbers are stored as text.
- Formula-like prefixes in text fields are neutralized before they are written.
- A hidden honeypot field (`website`) is rejected on the server.
- Duplicate mobile numbers are rejected by default, inside the same `LockService` section as the write.
- Do not put Google passwords, service-account keys, or other secrets in the frontend.

## Test plan

### You can run locally without a live Apps Script URL

| Case | Expected |
| --- | --- |
| Empty name | कृपया पूर्ण नाव भरा. |
| Whitespace-only name | same name error |
| Mobile shorter/longer than 10 digits, or starting with 0–5 | कृपया १० अंकी वैध भारतीय मोबाईल क्रमांक भरा. |
| Missing travel or food | matching Marathi field errors |
| Submit with placeholder script URL | नोंदणी सेवा सध्या उपलब्ध नाही. कृपया आयोजकांशी संपर्क साधा. |
| All fields valid | request starts; button shows नोंदणी सुरू आहे... and cannot be clicked again until the request finishes |

### After you deploy Apps Script and paste the `/exec` URL

| Case | Expected |
| --- | --- |
| Valid first registration | Success: आपली नोंदणी यशस्वीरीत्या पूर्ण झाली आहे. धन्यवाद! and a new spreadsheet row |
| Same mobile again | या मोबाईल क्रमांकाची नोंदणी आधीच झाली आहे. |
| `doGet` in a browser | `{"ok":true,"message":"नोंदणी सेवा कार्यरत आहे."}` and no personal data |
| Temporary wrong spreadsheet ID | Marathi service-unavailable error, no stack trace |
| Network offline | संपर्क साधता आला नाही... |

## What was verified in this workspace versus what you must do

Executed here:

- `npm install`
- `npm run build` (TypeScript + Vite production build)
- UI review of the Marathi form, including a mobile-width layout
- Frontend validation of empty fields and invalid mobile numbers
- Config-missing path using the placeholder `VITE_GOOGLE_SCRIPT_URL`

You must do:

- Create the spreadsheet and worksheet
- Paste the spreadsheet ID into `Code.gs`
- Deploy the web app
- Put the `/exec` URL in `.env`
- Submit a real registration and confirm a new row
- Retry the same mobile number to confirm the duplicate policy
