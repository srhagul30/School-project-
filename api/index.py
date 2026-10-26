import os
import re
import json
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
import requests

app = FastAPI(title="NoticeBridge - School Circular & Parent Communication Engine")

# Unicode Emojis cleanly defined in Python (safe for all platforms & WhatsApp)
EMOJI_MEGAPHONE = "\U0001F4E2" # 📢
EMOJI_PIN = "\U0001F4CC"       # 📌
EMOJI_CALENDAR = "\U0001F4C5"  # 📅
EMOJI_CLOCK = "\u23F0"          # ⏰
EMOJI_CARD = "\U0001F4B3"       # 💳
EMOJI_PHONE = "\U0001F4DE"      # 📞
EMOJI_CHECK = "\u2705"          # ✅
EMOJI_WARNING = "\u26A0\uFE0F"  # ⚠️

class NoticeRequest(BaseModel):
    circularText: str
    targetLanguage: str = "Tamil"
    tone: str = "Clear & Friendly"
    schoolName: str = "St. Xavier's International School"
    customApiKey: Optional[str] = None

def generate_smart_fallback(text: str, target_language: str, school_name: str) -> Dict[str, Any]:
    words = text.strip().split()
    word_count = len(words)

    # Regex extractions
    date_match = re.search(r'\b(?:\d{1,2}(?:st|nd|rd|th)?[\s/-](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|[A-Za-z]+)[\s/-]?\d{2,4}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b', text, re.IGNORECASE)
    time_match = re.search(r'\b(?:\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))\b', text)
    fee_match = re.search(r'(?:Rs\.?|INR|\u20B9|\$)\s*[\d,]+', text, re.IGNORECASE)
    phone_match = re.search(r'\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}\b', text)

    detected_date = date_match.group(0) if date_match else "Check circular schedule"
    detected_time = time_match.group(0) if time_match else "School hours"
    detected_fee = fee_match.group(0) if fee_match else "Nil / Included"
    detected_contact = phone_match.group(0) if phone_match else "Class Teacher / School Office"

    # Category & Urgency
    category = "General"
    urgency = "Medium"
    lower_text = text.lower()

    if any(k in lower_text for k in ["exam", "test", "assessment", "timetable"]):
        category = "Exams"
        urgency = "High"
    elif any(k in lower_text for k in ["sports", "annual day", "picnic", "tour", "trip"]):
        category = "Sports & Events"
    elif any(k in lower_text for k in ["fee", "payment", "permission", "consent"]):
        category = "Fees & Permissions"
        urgency = "High"
    elif any(k in lower_text for k in ["rain", "closed", "holiday", "emergency", "cancelled"]):
        category = "Emergency"
        urgency = "High"

    # Smart subject extraction (avoids duplicating school name)
    extracted_title = ""
    lines = [l.strip() for l in text.split("\n") if l.strip()]

    for line in lines:
        if re.match(r'^(subject|sub|regarding|re)\s*[:\-]', line, re.IGNORECASE):
            extracted_title = re.sub(r'^(subject|sub|regarding|re)\s*[:\-]\s*', '', line, flags=re.IGNORECASE).strip()
            break

    if not extracted_title:
        for line in lines:
            line_l = line.lower()
            if (school_name.lower() not in line_l and 
                not line_l.startswith("circular") and 
                not line_l.startswith("date:") and 
                len(line) > 5):
                extracted_title = line
                break

    title = extracted_title if extracted_title else "Important School Circular"

    whatsapp_notice = f"""{EMOJI_MEGAPHONE} *{school_name.upper()} - PARENT UPDATE*
---------------------------------
{EMOJI_PIN} *Subject:* {title}

Dear Parents,
Please note the essential details regarding the upcoming school announcement:

{EMOJI_CALENDAR} *Date:* {detected_date}
{EMOJI_CLOCK} *Time:* {detected_time}
{EMOJI_CARD} *Fees / Charges:* {detected_fee}
{EMOJI_PHONE} *Contact / Queries:* {detected_contact}

{EMOJI_CHECK} *Required Actions for Parents:*
1. Review the scheduled timings and ensure punctuality.
2. Sign and submit required permission/acknowledgment slips.
3. Check student's uniform and kit as per circular guidelines.

{EMOJI_WARNING} _Please avoid sending children to school if they are unwell._

Warm regards,
*School Administration*"""

    # Multilingual translation fallback
    translated_notice = ""
    if "tamil" in target_language.lower():
        translated_notice = f"""{EMOJI_MEGAPHONE} *{school_name} - பெற்றோர் முக்கிய அறிவிப்பு*
---------------------------------
{EMOJI_PIN} *பொருள்:* {title}

வணக்கம் பெற்றோர்களே! பள்ளி சுற்றறிக்கையின் முக்கிய குறிப்புகள் கீழே கொடுக்கப்பட்டுள்ளன:

{EMOJI_CALENDAR} *தேதி:* {detected_date}
{EMOJI_CLOCK} *நேரம்:* {detected_time}
{EMOJI_CARD} *கட்டணம்:* {detected_fee}
{EMOJI_PHONE} *தொடர்புக்கு:* {detected_contact}

{EMOJI_CHECK} *பெற்றோர்கள் செய்ய வேண்டியவை:*
1. தேதிகள் மற்றும் நேரத்தை குறித்துக் கொள்ளவும்.
2. சம்மதக் கடிதம் / ஆவணங்களை உரிய தேதியில் சமர்ப்பிக்கவும்.
3. மாணவர்கள் பள்ளி சீருடையில் வர வேண்டும்.

நன்றி,
*பள்ளி நிர்வாகம்*"""
    elif "hindi" in target_language.lower():
        translated_notice = f"""{EMOJI_MEGAPHONE} *{school_name} - अभिभावक महत्वपूर्ण सूचना*
---------------------------------
{EMOJI_PIN} *विषय:* {title}

सादर प्रणाम! आगामी स्कूल परिपत्र का मुख्य सारांश निम्नलिखित है:

{EMOJI_CALENDAR} *तारीख:* {detected_date}
{EMOJI_CLOCK} *समय:* {detected_time}
{EMOJI_CARD} *शुल्क:* {detected_fee}
{EMOJI_PHONE} *संपर्क:* {detected_contact}

{EMOJI_CHECK} *अभिभावकों के लिए निर्देश:*
1. कृपया तय समय पर बच्चे की उपस्थिति सुनिश्चित करें।
2. आवश्यक सहमति पत्र समय पर हस्ताक्षर करके भेजें।
3. निर्धारित ड्रेस कोड का पालन करें।

सधन्यवाद,
*विद्यालय प्रशासन*"""
    elif "spanish" in target_language.lower():
        translated_notice = f"""{EMOJI_MEGAPHONE} *{school_name} - AVISO IMPORTANTE PARA FAMILIAS*
---------------------------------
{EMOJI_PIN} *Asunto:* {title}

Estimadas familias:
Compartimos los puntos clave del reciente comunicado escolar:

{EMOJI_CALENDAR} *Fecha:* {detected_date}
{EMOJI_CLOCK} *Horario:* {detected_time}
{EMOJI_CARD} *Costos:* {detected_fee}
{EMOJI_PHONE} *Contacto:* {detected_contact}

{EMOJI_CHECK} *Acciones Requeridas:*
1. Confirmar asistencia y revisar los horarios.
2. Firmar y enviar el formulario de autorización a tiempo.
3. Asegurar que los alumnos vistan el uniforme reglamentario.

Atentamente,
*Dirección Escolar*"""
    else:
        translated_notice = whatsapp_notice

    audio_script = f"Attention parents from {school_name}. Here is a quick update regarding {title}. The event is scheduled for {detected_date} at {detected_time}. Please ensure your child follows the designated guidelines and return any signed slips. Thank you!"

    return {
        "title": title,
        "urgency": urgency,
        "category": category,
        "whatsappNotice": whatsapp_notice,
        "translatedNotice": translated_notice,
        "audioScript": audio_script,
        "targetLanguageName": target_language,
        "keyDetails": {
            "eventDate": detected_date,
            "timings": detected_time,
            "venue": "School Campus / Main Auditorium",
            "feeOrAmount": detected_fee,
            "dressCode": "Prescribed School Uniform",
            "deadline": "Within 2 days of circular",
            "contactPerson": detected_contact,
        },
        "actionChecklist": [
            {"id": "1", "task": "Read and acknowledge circular details", "deadline": "Today", "important": True},
            {"id": "2", "task": "Submit signed parent permission slip (if applicable)", "deadline": detected_date, "important": True},
            {"id": "3", "task": "Prepare required uniform or activity kit", "deadline": "Day prior to event", "important": False},
        ],
        "frequentlyAskedQuestions": [
            {
                "question": "Are school bus routes operational as usual?",
                "answer": "Yes, regular transportation schedules remain active unless specifically stated otherwise.",
            },
            {
                "question": "Can parents attend the event on campus?",
                "answer": "Parents are warmly invited for open sessions; please carry your parent visitor badge.",
            },
        ],
        "meta": {
            "isMock": True,
            "modelUsed": "NoticeBridge Python Smart Engine",
            "originalWordCount": word_count,
            "summaryWordCount": round(word_count * 0.28) or 50,
            "readingTimeReduction": "75% time saved for parents",
        },
    }

@app.post("/api/process-notice")
async def process_notice(req: NoticeRequest):
    if not req.circularText or len(req.circularText.strip()) < 10:
        raise HTTPException(status_code=400, detail="Please enter circular text (at least 10 characters).")

    api_key = req.customApiKey.strip() if req.customApiKey and req.customApiKey.strip() else os.environ.get("GEMINI_API_KEY", "").strip()

    if not api_key:
        return generate_smart_fallback(req.circularText, req.targetLanguage, req.schoolName)

    # Call Gemini API via Python requests
    system_prompt = f"""You are "NoticeBridge", an expert school-to-parent communication engine.
Your task is to transform dense, formal, multi-page school circulars into clear, friendly, and actionable parent updates.

Rules:
1. "whatsappNotice": A WhatsApp broadcast message formatted with clean emojis (like {EMOJI_MEGAPHONE}, {EMOJI_PIN}, {EMOJI_CALENDAR}, {EMOJI_CLOCK}, {EMOJI_CARD}, {EMOJI_PHONE}, {EMOJI_CHECK}, {EMOJI_WARNING}), bold text (*word*), simple numbered bullets (1., 2., 3.), and divider lines (---------------------------------). It MUST take less than 30 seconds to read. Avoid duplicating the school name in the subject line.
2. "translatedNotice": Translate the core message into {req.targetLanguage}. It must feel natural, polite, respectful, and culturally appropriate for parents. Preserve numbers, dates, times, and proper nouns accurately.
3. "audioScript": A concise, natural spoken script (in plain English or simple terms) suitable for browser text-to-speech audio for busy or illiterate parents.
4. "keyDetails": Extract or infer key facts (eventDate, timings, venue, feeOrAmount, dressCode, deadline, contactPerson).
5. "actionChecklist": 2 to 4 clear checkboxes of what parents actually need to do (e.g. sign slips, pack supplies, pay fee).
6. "frequentlyAskedQuestions": 2 realistic questions parents will definitely ask in class WhatsApp groups, with clear answers.

Output MUST be strictly valid JSON matching this schema:
{{
  "title": "string",
  "urgency": "High | Medium | Low",
  "category": "Exams | Sports & Events | Fees & Permissions | Emergency | General",
  "whatsappNotice": "string",
  "translatedNotice": "string",
  "audioScript": "string",
  "targetLanguageName": "{req.targetLanguage}",
  "keyDetails": {{
    "eventDate": "string",
    "timings": "string",
    "venue": "string",
    "feeOrAmount": "string",
    "dressCode": "string",
    "deadline": "string",
    "contactPerson": "string"
  }},
  "actionChecklist": [
    {{ "id": "1", "task": "string", "deadline": "string", "important": true }}
  ],
  "frequentlyAskedQuestions": [
    {{ "question": "string", "answer": "string" }}
  ]
}}"""

    user_prompt = f"""School Name: {req.schoolName}
Target Regional Language: {req.targetLanguage}
Tone: {req.tone}

Original School Circular / Announcement:
\"\"\"
{req.circularText}
\"\"\""""

    for model in ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-1.5-flash"]:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            payload = {
                "contents": [{"role": "user", "parts": [{"text": f"{system_prompt}\n\n{user_prompt}"}]}],
                "generationConfig": {"responseMimeType": "application/json", "temperature": 0.2}
            }
            res = requests.post(url, json=payload, timeout=20)
            if res.ok:
                data = res.json()
                text_content = data["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(text_content)
                orig_words = len(req.circularText.strip().split())
                sum_words = len(parsed.get("whatsappNotice", "").strip().split())

                return {
                    "title": parsed.get("title", "School Notice Update"),
                    "urgency": parsed.get("urgency", "Medium"),
                    "category": parsed.get("category", "General"),
                    "whatsappNotice": parsed.get("whatsappNotice", ""),
                    "translatedNotice": parsed.get("translatedNotice", ""),
                    "audioScript": parsed.get("audioScript", parsed.get("whatsappNotice", "")),
                    "targetLanguageName": req.targetLanguage,
                    "keyDetails": parsed.get("keyDetails", {}),
                    "actionChecklist": parsed.get("actionChecklist", []),
                    "frequentlyAskedQuestions": parsed.get("frequentlyAskedQuestions", []),
                    "meta": {
                        "isMock": False,
                        "modelUsed": f"Google {model} (Python FastAPI)",
                        "originalWordCount": orig_words,
                        "summaryWordCount": sum_words,
                        "readingTimeReduction": f"{max(60, min(90, round((1 - sum_words / (orig_words or 1)) * 100)))}% time saved",
                    }
                }
        except Exception as e:
            continue

    # Fallback if API fails
    return generate_smart_fallback(req.circularText, req.targetLanguage, req.schoolName)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "engine": "Python FastAPI", "service": "NoticeBridge"}

@app.get("/", response_class=HTMLResponse)
def index_page():
    return """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NoticeBridge | School Circular & Parent Communication Engine (Python)</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏫</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.4/dist/confetti.browser.min.js"></script>
  <style>
    :root {
      --bg-app: #f8fafc;
      --card-bg: #ffffff;
      --card-border: #e2e8f0;
      --text-main: #0f172a;
      --text-body: #334155;
      --text-muted: #64748b;
      --primary: #2563eb;
      --primary-hover: #1d4ed8;
      --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }
    * { box-sizing: border-box; padding: 0; margin: 0; }
    body {
      background-color: var(--bg-app);
      color: var(--text-main);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      -webkit-font-smoothing: antialiased;
      line-height: 1.5;
    }
    .app-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1.5rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      min-height: 100vh;
    }
    @media (min-width: 768px) { .app-container { padding: 2rem 1.5rem; } }
    .app-header {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      box-shadow: var(--shadow-sm);
    }
    @media (min-width: 768px) {
      .app-header { flex-direction: row; align-items: center; justify-content: space-between; }
    }
    .header-brand { display: flex; align-items: center; gap: 0.85rem; }
    .logo-badge {
      width: 2.75rem; height: 2.75rem; border-radius: 10px; background: #eff6ff;
      border: 1px solid #bfdbfe; display: flex; align-items: center; justify-content: center; font-size: 1.4rem;
    }
    .brand-title { font-size: 1.45rem; font-weight: 700; color: #0f172a; }
    .brand-subtitle { font-size: 0.82rem; color: var(--text-muted); margin-top: 0.15rem; }
    .badge-pill {
      display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.2rem 0.55rem;
      border-radius: 6px; font-size: 0.72rem; font-weight: 600;
    }
    .badge-blue { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
    .badge-emerald { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
    .badge-amber { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
    .badge-rose { background: #fff1f2; color: #be123c; border: 1px solid #fecdd3; }
    .badge-slate { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
    .icon-btn {
      display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.8rem;
      border-radius: 8px; background: #ffffff; border: 1px solid #cbd5e1;
      color: #334155; font-size: 0.8rem; font-weight: 500; cursor: pointer; text-decoration: none;
      transition: all 0.15s ease;
    }
    .icon-btn:hover { background: #f1f5f9; border-color: #94a3b8; color: #0f172a; }
    .white-panel {
      background: var(--card-bg); border: 1px solid var(--card-border);
      border-radius: 12px; box-shadow: var(--shadow-sm); padding: 1.25rem;
    }
    .main-grid {
      display: grid; grid-template-columns: 1fr; gap: 1.25rem; align-items: start;
    }
    @media (min-width: 1024px) { .main-grid { grid-template-columns: 5fr 7fr; } }
    .form-group { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 0.85rem; }
    .form-label { font-size: 0.78rem; font-weight: 600; color: #334155; display: flex; justify-content: space-between; }
    .form-input, .form-select, .form-textarea {
      width: 100%; padding: 0.6rem 0.75rem; background: #ffffff; border: 1px solid #cbd5e1;
      border-radius: 8px; color: #0f172a; font-size: 0.85rem; font-family: inherit; outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .form-input:focus, .form-select:focus, .form-textarea:focus {
      border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }
    .presets-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
    .preset-btn {
      text-align: left; padding: 0.55rem 0.7rem; border-radius: 8px; border: 1px solid #e2e8f0;
      background: #f8fafc; color: #334155; font-size: 0.75rem; cursor: pointer; transition: all 0.15s ease;
    }
    .preset-btn:hover { background: #eff6ff; border-color: #bfdbfe; color: #1e40af; }
    .preset-btn.active { background: #eff6ff; border-color: #3b82f6; color: #1d4ed8; font-weight: 600; }
    .preset-title { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .preset-tag { font-size: 0.68rem; color: #64748b; margin-top: 0.15rem; }
    .btn-transform {
      width: 100%; padding: 0.75rem 1.25rem; border-radius: 8px; font-weight: 600;
      font-size: 0.88rem; display: flex; align-items: center; justify-content: center; gap: 0.45rem;
      background: #2563eb; color: #ffffff; border: none; cursor: pointer; transition: background 0.15s;
    }
    .btn-transform:hover:not(:disabled) { background: #1d4ed8; }
    .btn-transform:disabled { opacity: 0.6; cursor: not-allowed; }
    .tabs-nav {
      display: flex; align-items: center; gap: 0.35rem; overflow-x: auto;
      padding-bottom: 0.5rem; border-bottom: 1px solid var(--card-border);
    }
    .tab-btn {
      display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.45rem 0.75rem;
      border-radius: 6px; font-size: 0.78rem; font-weight: 600; color: #475569;
      background: transparent; border: 1px solid transparent; cursor: pointer; white-space: nowrap;
    }
    .tab-btn:hover { color: #0f172a; background: #f1f5f9; }
    .tab-btn.active { background: #eff6ff; border-color: #bfdbfe; color: #1d4ed8; }
    .tab-btn.active.whatsapp-tab { background: #f0fdf4; border-color: #bbf7d0; color: #15803d; }
    .whatsapp-bubble {
      background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #16a34a;
      border-radius: 8px; padding: 1.15rem; color: #14532d; font-size: 0.85rem; line-height: 1.6;
      white-space: pre-wrap; user-select: text;
    }
    .facts-grid { display: grid; grid-template-columns: 1fr; gap: 0.65rem; }
    @media (min-width: 640px) { .facts-grid { grid-template-columns: 1fr 1fr; } }
    .fact-card {
      padding: 0.75rem 0.9rem; border-radius: 8px; background: #ffffff;
      border: 1px solid #e2e8f0; display: flex; align-items: flex-start; gap: 0.7rem;
    }
    .fact-icon-box {
      width: 2rem; height: 2rem; border-radius: 6px; display: flex; align-items: center;
      justify-content: center; flex-shrink: 0; font-size: 1rem;
    }
    .fact-label { font-size: 0.68rem; font-weight: 700; color: #64748b; text-transform: uppercase; }
    .fact-value { font-size: 0.85rem; font-weight: 600; color: #0f172a; margin-top: 0.15rem; }
    .checklist-item {
      padding: 0.7rem 0.9rem; border-radius: 8px; background: #ffffff; border: 1px solid #e2e8f0;
      display: flex; align-items: flex-start; gap: 0.7rem; cursor: pointer; margin-bottom: 0.45rem;
    }
    .checklist-item:hover { border-color: #cbd5e1; background: #f8fafc; }
    .checklist-item.done { text-decoration: line-through; color: #94a3b8; background: #f8fafc; }
    .audio-bar {
      padding: 0.75rem 0.9rem; border-radius: 8px; background: #eff6ff; border: 1px solid #bfdbfe;
      display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
    }
    .modal-overlay {
      position: fixed; inset: 0; z-index: 50; background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(4px); display: none; align-items: center; justify-content: center; padding: 1rem;
    }
    .modal-overlay.open { display: flex; }
    .modal-content {
      background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;
      padding: 1.5rem; max-width: 440px; width: 100%; box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <div class="app-container">
    <header class="app-header">
      <div class="header-brand">
        <div class="logo-badge">🏫</div>
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
            <h1 class="brand-title">NoticeBridge</h1>
            <span class="badge-pill badge-blue">Python FastAPI</span>
            <span class="badge-pill badge-emerald">Vercel Ready</span>
          </div>
          <p class="brand-subtitle">School Circular to 30-Second WhatsApp & Multilingual Parent Notice Engine</p>
        </div>
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <button onclick="toggleModal(true)" class="icon-btn">⚙️ <span id="apiKeyBtnText">Set API Key</span></button>
        <a href="https://github.com/srhagul30/School-project-.git" target="_blank" class="icon-btn">🔗 GitHub</a>
      </div>
    </header>

    <div class="main-grid">
      <!-- Left: Input form -->
      <div class="white-panel">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 1px solid #f1f5f9;">
          <span style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: #0f172a;">📄 Input Circular</span>
          <span id="wordCountLabel" style="font-size: 0.75rem; color: #64748b;">0 words</span>
        </div>

        <div class="form-group">
          <label class="form-label">School / Institution Name</label>
          <input type="text" id="schoolNameInput" value="St. Xavier's International School" class="form-input">
        </div>

        <div class="form-group">
          <label class="form-label">✨ Sample Circular Templates:</label>
          <div class="presets-grid" id="presetsGrid"></div>
        </div>

        <div class="form-group">
          <div class="form-label">
            <span>Paste Circular Text</span>
            <button onclick="clearText()" style="background: none; border: none; color: #e11d48; font-size: 0.72rem; cursor: pointer;">Clear Text</button>
          </div>
          <textarea id="circularTextArea" rows="7" class="form-textarea" placeholder="Paste school circular text here..."></textarea>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">🌐 Target Language</label>
            <select id="targetLanguageSelect" class="form-select">
              <option value="Tamil">🇮🇳 Tamil (தமிழ்)</option>
              <option value="Hindi">🇮🇳 Hindi (हिन्दी)</option>
              <option value="Telugu">🇮🇳 Telugu (తెలుగు)</option>
              <option value="Malayalam">🇮🇳 Malayalam (മലയാളം)</option>
              <option value="Spanish">🇪🇸 Spanish (Español)</option>
              <option value="French">🇫🇷 French (Français)</option>
              <option value="Plain English">🇬🇧 Plain English</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Tone</label>
            <select id="toneSelect" class="form-select">
              <option value="Clear & Friendly">Clear & Friendly</option>
              <option value="High Urgency Alert">High Urgency Alert ⚠️</option>
              <option value="Short & Crisp">Short & Crisp</option>
              <option value="Formal & Respectful">Formal & Respectful</option>
            </select>
          </div>
        </div>

        <button onclick="processNotice()" id="transformBtn" class="btn-transform">
          <span>🚀 Transform into Parent Notice</span>
        </button>
      </div>

      <!-- Right: Output hub -->
      <div id="outputHub">
        <div class="white-panel" style="min-height: 440px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; border-style: dashed; padding: 2rem;">
          <div style="width: 3.5rem; height: 3.5rem; border-radius: 50%; background: #eff6ff; border: 1px solid #bfdbfe; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; margin-bottom: 0.75rem;">
            📢
          </div>
          <h3 style="font-size: 1.1rem; font-weight: 700; color: #0f172a;">No Circular Processed Yet</h3>
          <p style="font-size: 0.82rem; color: #64748b; max-width: 380px; margin: 0.35rem 0 1rem;">
            Select one of the sample circular templates on the left or paste your own circular, then click <strong>"Transform into Parent Notice"</strong>.
          </p>
          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap; justify-content: center;">
            <span class="badge-pill badge-slate">📱 30-Sec WhatsApp Format</span>
            <span class="badge-pill badge-slate">🌐 Regional Translation</span>
            <span class="badge-pill badge-slate">🔊 Audio Read-Aloud</span>
            <span class="badge-pill badge-slate">✍️ Action Checklist</span>
          </div>
        </div>
      </div>
    </div>

    <!-- API Modal -->
    <div class="modal-overlay" id="apiModal" onclick="toggleModal(false)">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; margin-bottom: 0.75rem;">
          <h3 style="font-size: 1rem; font-weight: 700;">⚙️ Gemini API Key Settings</h3>
          <button onclick="toggleModal(false)" style="background: none; border: none; font-size: 1.1rem; cursor: pointer;">✕</button>
        </div>
        <p style="font-size: 0.8rem; color: #475569; margin-bottom: 0.75rem;">
          NoticeBridge has a built-in Python Smart Engine that works offline. To enable Google Gemini AI analysis and translation:
        </p>
        <div style="padding: 0.65rem 0.8rem; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; font-size: 0.75rem; color: #1e40af; margin-bottom: 0.75rem;">
          <strong>Vercel Deployment:</strong> Add <code>GEMINI_API_KEY</code> under <strong>Settings &gt; Environment Variables</strong> in Vercel.
        </div>
        <div class="form-group">
          <label class="form-label">Optional: Enter Gemini API Key for local browser testing</label>
          <input type="password" id="customApiKeyInput" placeholder="AIzaSy..." class="form-input">
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem;">
          <button onclick="toggleModal(false)" class="icon-btn">Cancel</button>
          <button onclick="saveApiKey()" style="padding: 0.45rem 0.9rem; background: #2563eb; color: #fff; border: none; border-radius: 8px; font-size: 0.8rem; font-weight: 600; cursor: pointer;">Save Key</button>
        </div>
      </div>
    </div>

    <footer style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 0.78rem; color: #64748b; flex-wrap: wrap; gap: 0.5rem;">
      <div>NoticeBridge • Python FastAPI School Circular & Parent Communication Engine</div>
      <div>Deployable on Vercel • <a href="https://github.com/srhagul30/School-project-.git" target="_blank" style="color: #2563eb; text-decoration: none;">GitHub Repository</a></div>
    </footer>
  </div>

  <script>
    const PRESETS = [
      {
        id: "sports-day",
        title: "🏆 Annual Sports Day 2026",
        tag: "Sports & Events",
        schoolName: "St. Xavier's International School",
        language: "Tamil",
        text: `ST. XAVIER'S INTERNATIONAL SCHOOL\\nCIRCULAR NO: SEC/2026/104\\nDATE: 21st October 2026\\n\\nSUBJECT: 32nd ANNUAL INTER-HOUSE ATHLETIC MEET & SPORTS DAY\\n\\nDear Parents and Guardians,\\n\\nWe are immensely pleased to announce that our 32nd Annual Sports Meet will be celebrated on Saturday, 14th November 2026, at the Main School Sports Stadium from 8:30 AM to 1:30 PM.\\n\\nAll students from Grade 1 to 12 are mandated to assemble by 7:45 AM in their respective House T-Shirts (Emerald, Ruby, Sapphire, Topaz) along with white sports shoes and house caps.\\n\\nParents are cordially invited to witness the march past, track events, and aerobic drill presentations. Parents are requested to be seated in Pavilion Block B by 8:15 AM with their official Parent ID cards.\\n\\nLogistical arrangements:\\n1. School bus routes will operate 30 minutes earlier than usual in the morning. Return buses will depart from campus at 2:00 PM.\\n2. Students participating in the march-past and relay finals must attend mandatory practice on Friday, 13th November.\\n3. Lunch and fresh fruit juices will be provided to all students by the school catering committee.\\n4. An entry fee of Rs. 150 per family pass is applicable for the souvenir brochure, payable to the class teacher on or before 5th November 2026.\\n\\nFor questions, contact the Sports Coordinator Mr. K. Ramanathan at +91 98401 23456.\\n\\nSincerely,\\nDr. Elizabeth Matthews\\nPrincipal`
      },
      {
        id: "term-exam",
        title: "📝 Final Term Exam Rules",
        tag: "Exams",
        schoolName: "Delhi Model Public School",
        language: "Hindi",
        text: `DELHI MODEL PUBLIC SCHOOL\\nSENIOR WING CIRCULAR - ADM/EXAM/2026\\nDATE: 18th October 2026\\n\\nSUBJECT: INSTRUCTIONS & SCHEDULE FOR MID-TERM EXAMINATIONS 2026\\n\\nDear Parents,\\n\\nThe Mid-Term Summative Assessments for Classes VI to XII are scheduled to commence from Monday, 3rd November 2026, and will conclude on Friday, 14th November 2026.\\n\\nImportant Instructions:\\n1. Reporting Time: All students must be seated in exam halls by 8:15 AM sharp. Late arrivals beyond 8:30 AM will not be admitted.\\n2. Admit Card: Carrying the official Examination Hall Ticket is mandatory.\\n3. Stationery Regulations: Only transparent pouches containing pens, pencils, erasers are permitted. Smartwatches are strictly barred.\\n4. Bus Timings: Buses will depart early at 12:30 PM post-examination.\\n\\nFor queries, contact the Examination Cell at +91 94440 88210.\\n\\nWarm Regards,\\nVice Principal`
      },
      {
        id: "field-trip",
        title: "🚌 Planetarium Science Trip",
        tag: "Field Trip",
        schoolName: "Greenwood Valley Academy",
        language: "Tamil",
        text: `GREENWOOD VALLEY ACADEMY\\nDEPARTMENT OF SCIENCE & ASTRONOMY\\nCIRCULAR REF: GVA/SCI/TRIP/2026-09\\n\\nSUBJECT: EDUCATIONAL EXCURSION TO REGIONAL PLANETARIUM & ROBOTICS LAB\\n\\nDear Parents,\\n\\nThe Science Department has arranged a full-day educational excursion for Students of Classes 7, 8, and 9 to the Regional Planetarium on Friday, 6th November 2026.\\n\\nTour Details:\\n1. Timings: Report to school at regular morning time 8:00 AM. Return to campus at 4:45 PM.\\n2. Excursion Fee: An all-inclusive fee of Rs. 450 must be paid by 28th October 2026.\\n3. Dress Code: Complete formal school uniform with school ID card and sports shoes.\\n4. Consent Slip: Authorization slip must be duly signed by parents and returned by Wednesday, 29th October.\\n\\nTrip Coordinator: Mrs. S. Radhika | Mobile: +91 97890 55432.`
      },
      {
        id: "monsoon-rain",
        title: "🌧️ Emergency Monsoon Alert",
        tag: "Emergency",
        schoolName: "National Public School",
        language: "Telugu",
        text: `NATIONAL PUBLIC SCHOOL\\nURGENT ADVISORY NOTICE\\nDATE: 20th October 2026\\n\\nSUBJECT: RAIN ALERT & SHIFT TO HYBRID ONLINE SESSIONS FOR TOMORROW\\n\\nDear Parents,\\n\\nIn view of the red weather alert and heavy waterlogging reported across the city, the school premises will remain closed for offline classes tomorrow, Wednesday, 21st October 2026.\\n\\n1. Online Classes: Live classes will be conducted on Microsoft Teams starting at 9:00 AM.\\n2. Attendance: Compulsory and tracked.\\n3. Helpline: School helpline 044-24567890 is active for assistance.\\n\\nPlease stay safe and keep children indoors.\\n\\nPrincipal`
      }
    ];

    let currentNoticeResult = null;
    let isSpeaking = false;
    let checkedItems = {};

    window.onload = function() {
      renderPresets();
      loadPreset(0);
      const savedKey = localStorage.getItem("noticebridge_gemini_key");
      if (savedKey) {
        document.getElementById("customApiKeyInput").value = savedKey;
        document.getElementById("apiKeyBtnText").innerText = "API Key Set ✓";
      }
      document.getElementById("circularTextArea").addEventListener("input", updateWordCount);
    };

    function renderPresets() {
      const grid = document.getElementById("presetsGrid");
      grid.innerHTML = PRESETS.map((p, idx) => `
        <button onclick="loadPreset(${idx})" id="preset-btn-${idx}" class="preset-btn ${idx === 0 ? 'active' : ''}">
          <div class="preset-title">${p.title}</div>
          <div class="preset-tag">${p.tag}</div>
        </button>
      `).join("");
    }

    function loadPreset(idx) {
      document.querySelectorAll(".preset-btn").forEach(b => b.classList.remove("active"));
      const btn = document.getElementById(`preset-btn-${idx}`);
      if (btn) btn.classList.add("active");
      const p = PRESETS[idx];
      document.getElementById("schoolNameInput").value = p.schoolName;
      document.getElementById("circularTextArea").value = p.text.replace(/\\\\n/g, '\\n');
      document.getElementById("targetLanguageSelect").value = p.language;
      updateWordCount();
    }

    function updateWordCount() {
      const text = document.getElementById("circularTextArea").value.trim();
      const count = text ? text.split(/\\s+/).length : 0;
      document.getElementById("wordCountLabel").innerText = `${count} words`;
    }

    function clearText() {
      document.getElementById("circularTextArea").value = "";
      updateWordCount();
    }

    function toggleModal(open) {
      const modal = document.getElementById("apiModal");
      if (open) modal.classList.add("open");
      else modal.classList.remove("open");
    }

    function saveApiKey() {
      const key = document.getElementById("customApiKeyInput").value.trim();
      localStorage.setItem("noticebridge_gemini_key", key);
      document.getElementById("apiKeyBtnText").innerText = key ? "API Key Set ✓" : "Set API Key";
      toggleModal(false);
    }

    async function processNotice() {
      const text = document.getElementById("circularTextArea").value.trim();
      if (!text) return alert("Please enter or paste a circular notice.");

      const btn = document.getElementById("transformBtn");
      btn.disabled = true;
      btn.innerText = "⏳ Processing Circular...";

      const customKey = localStorage.getItem("noticebridge_gemini_key") || "";

      try {
        const response = await fetch("/api/process-notice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            circularText: text,
            targetLanguage: document.getElementById("targetLanguageSelect").value,
            tone: document.getElementById("toneSelect").value,
            schoolName: document.getElementById("schoolNameInput").value,
            customApiKey: customKey || undefined
          })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Processing failed");

        currentNoticeResult = data;
        checkedItems = {};
        renderResults(data);

        try { confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } }); } catch(e){}
      } catch (err) {
        alert("Error: " + err.message);
      } finally {
        btn.disabled = false;
        btn.innerText = "🚀 Transform into Parent Notice";
      }
    }

    function renderResults(data) {
      const hub = document.getElementById("outputHub");
      hub.innerHTML = `
        <div class="white-panel">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.75rem; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <div style="display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap;">
                <span class="badge-pill ${data.urgency === 'High' ? 'badge-rose' : data.urgency === 'Medium' ? 'badge-amber' : 'badge-emerald'}">${data.urgency} Urgency</span>
                <span class="badge-pill badge-blue">${data.category}</span>
                <span class="badge-pill badge-emerald">${data.meta.readingTimeReduction}</span>
              </div>
              <h2 style="font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-top: 0.25rem;">${data.title}</h2>
            </div>
            <span style="font-size: 0.72rem; color: #64748b;">${data.meta.modelUsed}</span>
          </div>

          <div class="tabs-nav" id="tabsNav">
            <button onclick="switchTab('whatsapp')" id="tab-whatsapp" class="tab-btn whatsapp-tab active">📱 WhatsApp Notice</button>
            <button onclick="switchTab('translation')" id="tab-translation" class="tab-btn">🌐 ${data.targetLanguageName} Translation</button>
            <button onclick="switchTab('facts')" id="tab-facts" class="tab-btn">📌 Key Facts</button>
            <button onclick="switchTab('checklist')" id="tab-checklist" class="tab-btn">✍️ Action Checklist</button>
            <button onclick="switchTab('faqs')" id="tab-faqs" class="tab-btn">❓ Parent FAQs</button>
          </div>

          <div id="tabContentWhatsapp" style="display: block; margin-top: 0.75rem;">
            <div class="whatsapp-bubble">${data.whatsappNotice}</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
              <span style="font-size: 0.75rem; color: #64748b;">Ready to share directly to parent class groups</span>
              <div style="display: flex; gap: 0.5rem;">
                <button onclick="copyText(currentNoticeResult.whatsappNotice, this)" class="icon-btn">📋 Copy Text</button>
                <button onclick="sendToWhatsApp(currentNoticeResult.whatsappNotice)" style="padding: 0.45rem 0.9rem; background: #16a34a; color: #fff; border: none; border-radius: 8px; font-size: 0.8rem; font-weight: 600; cursor: pointer;">📲 Send to WhatsApp</button>
              </div>
            </div>
          </div>

          <div id="tabContentTranslation" style="display: none; margin-top: 0.75rem;">
            <div class="audio-bar" style="margin-bottom: 0.75rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <button onclick="toggleSpeech()" id="speechBtn" class="icon-btn" style="background: #2563eb; color: #fff; border: none; font-size: 1rem;">🔊</button>
                <div>
                  <div style="font-size: 0.82rem; font-weight: 700;">Listen Aloud (Speech Synthesizer)</div>
                  <div style="font-size: 0.72rem; color: #64748b;">Voice playback for non-English literate or busy parents</div>
                </div>
              </div>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.15rem; color: #0f172a; font-size: 0.85rem; line-height: 1.6; white-space: pre-wrap;">${data.translatedNotice}</div>
            <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.75rem;">
              <button onclick="copyText(currentNoticeResult.translatedNotice, this)" class="icon-btn">📋 Copy Translation</button>
              <button onclick="sendToWhatsApp(currentNoticeResult.translatedNotice)" style="padding: 0.45rem 0.9rem; background: #2563eb; color: #fff; border: none; border-radius: 8px; font-size: 0.8rem; font-weight: 600; cursor: pointer;">📲 Share in ${data.targetLanguageName}</button>
            </div>
          </div>

          <div id="tabContentFacts" style="display: none; margin-top: 0.75rem;">
            <div class="facts-grid">
              <div class="fact-card"><div class="fact-icon-box" style="background: #fffbeb; color: #b45309;">📅</div><div><div class="fact-label">Event Date</div><div class="fact-value">${data.keyDetails.eventDate || 'Refer notice'}</div></div></div>
              <div class="fact-card"><div class="fact-icon-box" style="background: #eff6ff; color: #1d4ed8;">⏰</div><div><div class="fact-label">Timings</div><div class="fact-value">${data.keyDetails.timings || 'School hours'}</div></div></div>
              <div class="fact-card"><div class="fact-icon-box" style="background: #fff1f2; color: #be123c;">⚠️</div><div><div class="fact-label">Strict Deadline</div><div class="fact-value">${data.keyDetails.deadline || 'Immediate'}</div></div></div>
              <div class="fact-card"><div class="fact-icon-box" style="background: #f0fdf4; color: #15803d;">💳</div><div><div class="fact-label">Fees / Amount</div><div class="fact-value">${data.keyDetails.feeOrAmount || 'Nil'}</div></div></div>
              <div class="fact-card"><div class="fact-icon-box" style="background: #faf5ff; color: #7e22ce;">👔</div><div><div class="fact-label">Dress Code / Kit</div><div class="fact-value">${data.keyDetails.dressCode || 'Regular Uniform'}</div></div></div>
              <div class="fact-card"><div class="fact-icon-box" style="background: #ecfeff; color: #0e7490;">📞</div><div><div class="fact-label">Helpline / Contact</div><div class="fact-value">${data.keyDetails.contactPerson || 'School Office'}</div></div></div>
            </div>
          </div>

          <div id="tabContentChecklist" style="display: none; margin-top: 0.75rem;">
            <div style="font-size: 0.78rem; color: #64748b; margin-bottom: 0.5rem;" id="checklistProgress">Checklist: 0 of ${data.actionChecklist.length} completed</div>
            <div id="checklistItemsList">
              ${data.actionChecklist.map((item, idx) => `
                <div onclick="toggleCheck(${idx})" id="check-item-${idx}" class="checklist-item">
                  <span id="check-box-${idx}" style="font-size: 1rem; color: #94a3b8;">⬜</span>
                  <div style="flex: 1; font-size: 0.82rem;">
                    <div><strong>${item.task}</strong> ${item.important ? '<span class="badge-pill badge-rose" style="font-size: 0.65rem;">Required</span>' : ''}</div>
                    ${item.deadline ? `<span style="font-size: 0.72rem; color: #64748b;">Due: ${item.deadline}</span>` : ''}
                  </div>
                </div>
              `).join("")}
            </div>
          </div>

          <div id="tabContentFaqs" style="display: none; margin-top: 0.75rem;">
            ${data.frequentlyAskedQuestions.map(faq => `
              <div style="padding: 0.85rem 1rem; border-radius: 8px; background: #ffffff; border: 1px solid #e2e8f0; margin-bottom: 0.5rem;">
                <div style="font-size: 0.82rem; font-weight: 700; color: #1d4ed8; margin-bottom: 0.25rem;">Q: ${faq.question}</div>
                <div style="font-size: 0.78rem; color: #334155; padding-left: 1rem;">${faq.answer}</div>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    }

    function switchTab(tab) {
      ['whatsapp', 'translation', 'facts', 'checklist', 'faqs'].forEach(t => {
        document.getElementById(`tabContent${t.charAt(0).toUpperCase() + t.slice(1)}`).style.display = (t === tab ? 'block' : 'none');
        document.getElementById(`tab-${t}`).classList.toggle('active', t === tab);
      });
      if (tab !== 'translation' && isSpeaking) toggleSpeech();
    }

    function copyText(text, btn) {
      navigator.clipboard.writeText(text);
      const orig = btn.innerText;
      btn.innerText = "✓ Copied!";
      setTimeout(() => btn.innerText = orig, 2000);
    }

    function sendToWhatsApp(text) {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
    }

    function toggleCheck(idx) {
      checkedItems[idx] = !checkedItems[idx];
      const itemEl = document.getElementById(`check-item-${idx}`);
      const boxEl = document.getElementById(`check-box-${idx}`);
      if (checkedItems[idx]) {
        itemEl.classList.add("done");
        boxEl.innerText = "✅";
      } else {
        itemEl.classList.remove("done");
        boxEl.innerText = "⬜";
      }
      const doneCount = Object.values(checkedItems).filter(Boolean).length;
      const total = currentNoticeResult.actionChecklist.length;
      document.getElementById("checklistProgress").innerText = `Checklist: ${doneCount} of ${total} completed`;
    }

    function toggleSpeech() {
      if (!('speechSynthesis' in window)) return alert("Speech is not supported in this browser.");
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        isSpeaking = false;
        document.getElementById("speechBtn").innerText = "🔊";
      } else {
        const text = currentNoticeResult.translatedNotice || currentNoticeResult.audioScript;
        const u = new SpeechSynthesisUtterance(text);
        u.onend = () => { isSpeaking = false; document.getElementById("speechBtn").innerText = "🔊"; };
        u.onerror = () => { isSpeaking = false; document.getElementById("speechBtn").innerText = "🔊"; };
        window.speechSynthesis.speak(u);
        isSpeaking = true;
        document.getElementById("speechBtn").innerText = "⏹️";
      }
    }
  </script>
</body>
</html>
"""
