# NoticeBridge

Turn a long school circular into a message parents will actually read. Built for a school in Salem, Tamil Nadu.

Upload a circular PDF (or paste the text), and NoticeBridge produces:

- **A WhatsApp message**: short, formatted and ready to send to class groups
- **A Tamil version**, or one of 11 other languages
- **An SMS** under 320 characters
- **Key facts**: date, time, venue, deadline, fee, dress code and contact
- **A calendar file** (.ics) parents can add to Google Calendar, Outlook or Apple Calendar
- **A printable handout**

The original circular is shown with dates, times, amounts and contacts highlighted, so the teacher can check the facts before sending.

## Architecture

All the notice logic is written in **Python**. The Next.js app is only the interface.

```
Browser (Next.js)  ──POST /api/py/*──▶  Python API (FastAPI on Vercel)  ──JSON──▶  Browser
                                         │
                                         ├─ pdf_text.py      PDF → text (pypdf), re-joins wrapped lines
                                         ├─ patterns.py      dates, times, amounts, phones, emails
                                         ├─ offline.py       rule-based reader: facts → actions → messages
                                         ├─ gemini.py        Gemini 3.8 Flash with a JSON schema (optional)
                                         └─ calendar_ics.py  .ics calendar export
```

| Endpoint | Purpose |
|---|---|
| `POST /api/py/process-notice` | Circular text → notice (Gemini if a key is set, else the offline reader) |
| `POST /api/py/extract-text` | PDF upload → text |
| `POST /api/py/calendar` | Notice → `.ics` file |
| `GET /api/py/status` | Whether a server-side Gemini key is configured |
| `GET /api/py/docs` | Interactive API documentation |

If Gemini fails or the key is wrong, the API falls back to the offline reader automatically and says so in the response. The offline reader never invents facts: anything not in the circular is reported as "Not mentioned".

## Demo circulars

`public/demo/` has five PDF circulars from a fictional school in Fairlands, Salem:

| File | Topic |
|---|---|
| `01-rain-holiday.pdf` | Rain holiday ordered by the District Collector |
| `02-yercaud-trip.pdf` | One-day educational trip to Yercaud, with a fee and consent form |
| `03-half-yearly-exams.pdf` | Half-yearly exam schedule and instructions |
| `04-annual-sports-day.pdf` | Annual sports day |
| `05-pongal-celebration.pdf` | Samathuva Pongal celebration and Pongal holidays |

In the app, open **Demo PDFs from a Salem school** to upload one with a click, or download them. They are generated from `src/data/samples.json`:

```bash
pip install reportlab
npm run demo-pdfs
```

The school, names and phone numbers are fictional.

## Run locally

You need **Node.js 20.9+** and **Python 3.10+**.

```bash
git clone https://github.com/srhagul30/School-project-.git
cd School-project-
npm install
npm run setup:api            # pip install -r requirements.txt
cp .env.example .env.local   # optional: add GEMINI_API_KEY
npm run dev
```

`npm run dev` starts both servers: Next.js on http://localhost:3000 and the Python API on port 8000. Open http://localhost:3000.

Locally, the Python API reads `GEMINI_API_KEY` from `.env.local`.

## Deploy to Vercel

1. Import the repository at [vercel.com/new](https://vercel.com/new). Vercel detects Next.js and builds `api/index.py` as a Python function. No build settings need changing.
2. Optional: add `GEMINI_API_KEY` under **Settings → Environment Variables**.
3. Deploy.

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | No | Turns on Gemini for all visitors. Visitors can also add their own key in the app's Settings. |
| `GEMINI_MODEL` | No | Overrides the model. Defaults to `gemini-3.8-flash`, then `gemini-3.6-flash`, then `gemini-3.5-flash-lite`. |

## Project structure

```
api/
  index.py                FastAPI app and routes
  _engine/                All notice logic (Python)
public/demo/              Demo circular PDFs
scripts/make_demo_pdfs.py Builds the demo PDFs
src/
  app/                    Next.js pages and styles
  components/             Interface components
  data/samples.json       Demo circular text
```

## Privacy

Circulars are processed in memory and never stored. Recent notices and settings stay in the browser's local storage. Requests are rate-limited per IP.
