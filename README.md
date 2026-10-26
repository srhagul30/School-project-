# 🏫 NoticeBridge – School Circular & Parent Communication Engine

> **AI-powered engine that transforms dense, multi-page school circulars and PDF notices into 30-second WhatsApp broadcasts, multilingual regional translations, and actionable parent checklists.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsrhagul30%2FSchool-project-)

---

## 📌 The Problem It Solves

Schools routinely send out dense 2-to-3-page formal circulars regarding sports events, exam protocols, excursion fees, or emergency monsoon closures. 

**The Pain Points:**
- **Parent Inattention & Skimming**: Working parents don't have time to read through bureaucratic text and miss critical instructions (timings, permission slip deadlines, bus route alterations).
- **Language Barriers**: In diverse communities, parents who are not fluent in English struggle to understand official school circulars.
- **Lost Marks & Disorganization**: Students arrive without signed slips, missing fees, or incorrect uniforms due to missed circular details.

---

## 🚀 The Innovative Solution

**NoticeBridge** allows school administrators or teachers to paste any circular text (or select one of the built-in presets) and generates:

1. 📱 **The 30-Second WhatsApp Broadcast**: Clean bullet points formatted with WhatsApp-ready markdown (`*bold*`, emojis, clean line breaks) ready for instant 1-click sharing or clipboard copying.
2. 🌐 **Regional Language Translation**: Natural, culturally polite translations (e.g. **Tamil, Hindi, Telugu, Malayalam, Spanish, French, Arabic**) preserving all proper nouns, dates, fees, and contact numbers.
3. 🔊 **Voice Audio Read-Aloud**: Built-in speech synthesis (uses native Web Speech API) so non-English literate or busy parents can listen to the notice with 1 tap.
4. 📌 **Key Facts Sheet**: Instant badges for **Event Date, Timings, Strict Deadlines, Fees, Dress Code, and Helpline Contact**.
5. ✍️ **Parent Action Checklist**: Interactive checkable items with live completion tracking so parents can verify every requirement.
6. ❓ **Parent FAQs**: Pre-answers the questions parents typically flood class WhatsApp groups with.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) + React 19 + TypeScript
- **Styling**: Pure Modern Vanilla CSS (Glassmorphism, dark/light harmonious design system, zero bloated CSS runtime)
- **AI Engine**: Google Gemini API (`gemini-3.8-flash` / `gemini-2.5-flash`) via Next.js Serverless Route (`/api/process-notice`)
- **Offline Resilience**: Built-in Smart Heuristic Engine that allows the app to function flawlessly even if an API key is not yet set or during offline demos!
- **Audio**: Native Browser Web Speech API (`window.speechSynthesis`)
- **Icons**: Lucide React

---

## 🚀 Quick Start (Run Locally)

### 1. Clone the repository
```bash
git clone https://github.com/srhagul30/School-project-.git
cd School-project-
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variable
Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```
> *Tip: You can generate a free Gemini API key in 30 seconds at [Google AI Studio](https://aistudio.google.com/). If left empty, the app will automatically use its built-in Smart Heuristic engine.*

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ 1-Minute Vercel Deployment Guide

1. Push your code to your GitHub repository:
   ```bash
   git add .
   git commit -m "feat: NoticeBridge School Circular & Parent Communication Engine"
   git push origin master
   ```
2. Go to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import your repository: `https://github.com/srhagul30/School-project-.git`.
4. In the **Environment Variables** section, add:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: *(Your free Google Gemini API key)*
5. Click **Deploy**! Your application will be live across the globe with custom domain & HTTPS in under 60 seconds.

---

## 🏆 Project Highlights for Academic Presentation & Evaluation

- **Target Audience**: School Administrators, Principals, Teachers, and Parents.
- **Social Impact**: Promotes inclusive education and bridges digital & linguistic divides.
- **Zero Heavy Infrastructure**: No external database needed; lightweight and cost-effective serverless architecture.
