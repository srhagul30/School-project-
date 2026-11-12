# NoticeBridge

Turn a long school circular into a message parents will actually read.

Paste or upload a circular and NoticeBridge produces:

- **A WhatsApp message** — short, formatted, ready to send to class groups
- **A translated version** in one of 13 languages (Tamil, Hindi, Telugu, Kannada, Malayalam, Marathi, Bengali, Gujarati, Urdu, Arabic, Spanish, French, simple English)
- **An SMS** under 320 characters
- **Key facts** — date, time, venue, deadline, fee, dress code, contact
- **A parent checklist** with deadlines, and the questions parents are likely to ask
- **A calendar file** (.ics) parents can add to Google Calendar, Outlook or Apple Calendar
- **A printable one-page handout**

The original circular is shown with dates, times, amounts and contacts highlighted, so whoever sends the message can check the facts before it goes out.

## Two engines

| | Offline reader | Gemini |
|---|---|---|
| Needs an API key | No | Yes (free tier works) |
| Facts, checklist, SMS, calendar | Yes | Yes |
| Translation | Headings translated; details stay in English | Full translation |
| Invents details | Never — missing facts show as "Not mentioned" | Instructed not to |

If Gemini is unavailable or the key is wrong, the app falls back to the offline reader automatically and says so.

## Run locally

Requires Node.js 20.9 or later.

```bash
git clone https://github.com/srhagul30/School-project-.git
cd School-project-
npm install
cp .env.example .env.local   # optional: add GEMINI_API_KEY
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel

1. Import this repository at [vercel.com/new](https://vercel.com/new). The framework is detected as Next.js; no build settings need changing.
2. Optional: under **Settings → Environment Variables**, add `GEMINI_API_KEY` (get one free at [Google AI Studio](https://aistudio.google.com/apikey)).
3. Deploy.

Without a server key, each visitor can still paste their own key under **Settings** in the app; it is stored only in their browser.

### Environment variables

| Name | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | No | Enables Gemini for all visitors. |
| `GEMINI_MODEL` | No | Override the model. Defaults to `gemini-3.8-flash`, falling back to `gemini-3.6-flash` and `gemini-3.5-flash-lite`. |

## Project structure

```
src/
  app/
    page.tsx                  Landing page and workspace
    api/process-notice/       Circular → notice (Gemini or offline)
    api/extract-text/         PDF → text
    api/status/               Reports whether a server key is configured
  components/                 Client UI (input panel, result panel, dialogs)
  lib/
    extract.ts                Date, time, money, phone and email patterns
    offline-engine.ts         Rule-based circular reader
    gemini.ts                 Gemini client, schema and validation
    languages.ts              Supported languages and offline labels
    ics.ts                    Calendar export
```

## Privacy

Circular text is processed in memory and never stored on the server. Recent notices and settings are saved in the browser's local storage only. API requests are rate-limited per IP.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript
