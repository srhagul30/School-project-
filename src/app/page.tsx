"use client";

import React, { useState, useEffect } from "react";
import {
  Send,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Sparkles,
  Share2,
  Settings,
  AlertCircle,
  FileText,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Phone,
  Shirt,
  HelpCircle,
  Languages,
  CheckSquare,
  Square,
  ExternalLink,
} from "lucide-react";
import confetti from "canvas-confetti";
import type { NoticeResult } from "./api/process-notice/route";

// Sample circular presets for instant one-click demonstration
const PRESET_CIRCULARS = [
  {
    id: "sports-day",
    title: "🏆 Annual Sports Day 2026",
    tag: "Sports & Events",
    schoolName: "St. Xavier's International School",
    language: "Tamil",
    text: `ST. XAVIER'S INTERNATIONAL SCHOOL
CIRCULAR NO: SEC/2026/104
DATE: 21st October 2026

SUBJECT: 32nd ANNUAL INTER-HOUSE ATHLETIC MEET & SPORTS DAY

Dear Parents and Guardians,

We are immensely pleased to announce that our 32nd Annual Sports Meet will be celebrated on Saturday, 14th November 2026, at the Main School Sports Stadium from 8:30 AM to 1:30 PM.

All students from Grade 1 to 12 are mandated to assemble by 7:45 AM in their respective House T-Shirts (Emerald, Ruby, Sapphire, Topaz) along with white sports shoes and house caps. 

Parents are cordially invited to witness the march past, track events, and aerobic drill presentations. Parents are requested to be seated in Pavilion Block B by 8:15 AM with their official Parent ID cards. 

Please take note of the following logistical arrangements:
1. School bus routes will operate 30 minutes earlier than usual in the morning. Return buses will depart from campus at 2:00 PM.
2. Students participating in the march-past and relay finals must attend mandatory practice on Friday, 13th November.
3. Lunch and fresh fruit juices will be provided to all students by the school catering committee. Outside snacks are strictly prohibited.
4. An entry fee of Rs. 150 per family pass is applicable for the souvenir brochure, payable to the class teacher on or before 5th November 2026.
5. In case of sudden rain, the indoor badminton and table tennis finals will proceed as scheduled in the Multi-Purpose Hall.

For any specific medical exemptions or inquiries, please contact the Physical Education Department at sports@stxaviers.edu or call the Sports Coordinator Mr. K. Ramanathan at +91 98401 23456.

Sincerely,
Dr. Elizabeth Matthews
Principal`,
  },
  {
    id: "term-exam",
    title: "📝 Final Term Examination Rules",
    tag: "Exams",
    schoolName: "Delhi Model Public School",
    language: "Hindi",
    text: `DELHI MODEL PUBLIC SCHOOL
SENIOR WING CIRCULAR - ADM/EXAM/2026
DATE: 18th October 2026

SUBJECT: INSTRUCTIONS & SCHEDULE FOR MID-TERM EXAMINATIONS 2026

Dear Parents,

The Mid-Term Summative Assessments for Classes VI to XII are scheduled to commence from Monday, 3rd November 2026, and will conclude on Friday, 14th November 2026.

Important Instructions for Candidates & Parents:
1. Reporting Time: All students must be seated in their assigned exam halls by 8:15 AM sharp. The exam begins at 8:30 AM with 15 minutes of reading time. Late arrivals beyond 8:30 AM will not be granted entry.
2. Admit Card: Carrying the official laminated Examination Hall Ticket is mandatory. Duplicate cards can be requested at the admin desk with a replacement charge of Rs. 100.
3. Stationery Regulations: Only transparent pouches containing blue/black ballpoint pens, pencils, erasers, and rulers are permitted. Smartwatches, digital calculators (for classes below Grade 11), and mobile phones are strictly barred.
4. Bus Timings: Buses will depart from school premises early at 12:30 PM post-examination during the exam fortnight. Parents picking up their wards must report to Gate 2 by 12:45 PM.
5. Medical Leave Policy: In case of genuine medical emergency, a medical certificate signed by a registered MBBS practitioner must be submitted to the Principal within 24 hours. No re-examination will be conducted; assessment will be computed based on continuous internal evaluations.

Parent-Teacher Meeting (PTM) for answer script review will be held on Saturday, 28th November 2026.

For queries, contact the Examination Cell at examcell@delhimodel.edu or +91 94440 88210.

Warm Regards,
Vice Principal (Academics)`,
  },
  {
    id: "planetarium-trip",
    title: "🚌 Science Field Trip & Fees",
    tag: "Field Trip",
    schoolName: "Greenwood Valley Academy",
    language: "Tamil",
    text: `GREENWOOD VALLEY ACADEMY
DEPARTMENT OF SCIENCE & ASTRONOMY
CIRCULAR REF: GVA/SCI/TRIP/2026-09

SUBJECT: EDUCATIONAL EXCURSION TO REGIONAL PLANETARIUM & ROBOTICS LAB

Dear Parents,

To foster scientific curiosity and hands-on experimental learning, the Science Department has arranged a full-day educational excursion for Students of Classes 7, 8, and 9 to the Regional Planetarium and Centre for Robotics Innovation on Friday, 6th November 2026.

Key Tour Highlights:
- 3D Full-Dome Sky Theater presentation: "Journey Through Deep Cosmos"
- Interactive Artificial Intelligence & Humanoid Robotics Demonstration
- Guided tour through the Science Park and Renewable Energy Pavilion

Tour Details & Action Items:
1. Timings: Students must report to school at regular morning time 8:00 AM. Expected return time to school is 4:45 PM. Parents are requested to arrange pick-up from the school auditorium by 5:00 PM.
2. Excursion Fee: An all-inclusive fee of Rs. 450 (covers luxury AC coach transport, planetarium tickets, science kit, and lunch) must be paid through the School Parent ERP Portal or cash to the Class Teacher by 28th October 2026.
3. Dress Code: Complete formal school uniform with school ID card and comfortable walking sports shoes.
4. What to bring: Water bottle (labeled with student name) and a small notebook/pen for observations. Valuables, cameras, and cash over Rs. 100 are strictly not advised.
5. Consent Slip: The tear-off authorization slip below must be duly signed by parents and returned by Wednesday, 29th October.

Trip Coordinator: Mrs. S. Radhika (Head of Science) | Mobile: +91 97890 55432.

With Best Wishes,
Academic Director`,
  },
  {
    id: "rainy-day",
    title: "🌧️ Emergency Monsoon Advisory",
    tag: "Emergency",
    schoolName: "National Public School",
    language: "Telugu",
    text: `NATIONAL PUBLIC SCHOOL
URGENT ADVISORY NOTICE
DATE: 20th October 2026

SUBJECT: RAIN ALERT & SHIFT TO HYBRID ONLINE SESSIONS FOR TOMORROW

Dear Parents,

In view of the red weather alert and heavy waterlogging reported across the city by the Meteorological Department and District Collectorate, the school premises will remain closed for offline classes tomorrow, Wednesday, 21st October 2026.

Kindly note the following contingency plan:
1. Online Classes: Live classes will be conducted on Microsoft Teams as per the regular Wednesday timetable, starting at 9:00 AM instead of 8:00 AM to allow students adequate prep time.
2. Class links: Class teachers will broadcast individual Teams meeting links on the official Class WhatsApp group by 8:30 AM tomorrow.
3. Attendance: Attendance in online lectures is compulsory and will be tracked for term clearance.
4. Scheduled Assessments: The Unit Test for Grade 9 Math scheduled for tomorrow stands postponed to next Monday, 26th October.
5. School administrative helpline is active: 044-24567890 for any parental assistance.

Please stay safe and keep children indoors.

Principal,
National Public School`,
  },
];

const AVAILABLE_LANGUAGES = [
  { code: "ta-IN", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳" },
  { code: "hi-IN", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "te-IN", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳" },
  { code: "ml-IN", name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳" },
  { code: "es-ES", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr-FR", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "ar-SA", name: "Arabic", nativeName: "العربية", flag: "🇦🇪" },
  { code: "en-US", name: "Plain English", nativeName: "Simple English", flag: "🇬🇧" },
];

export default function NoticeBridgeApp() {
  const [schoolName, setSchoolName] = useState("St. Xavier's International School");
  const [circularText, setCircularText] = useState(PRESET_CIRCULARS[0].text);
  const [selectedLanguage, setSelectedLanguage] = useState("Tamil");
  const [tone, setTone] = useState("Clear & Friendly");
  const [customApiKey, setCustomApiKey] = useState("");
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<NoticeResult | null>(null);
  const [activeTab, setActiveTab] = useState<"whatsapp" | "translation" | "facts" | "checklist" | "faqs">("whatsapp");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Audio Speech state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);

  // Checklist state
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});

  // Load custom API key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem("noticebridge_gemini_key");
    if (savedKey) setCustomApiKey(savedKey);
  }, []);

  const handleSaveApiKey = (key: string) => {
    setCustomApiKey(key);
    localStorage.setItem("noticebridge_gemini_key", key.trim());
    setShowSettingsModal(false);
  };

  // Process circular
  const handleProcess = async () => {
    if (!circularText.trim()) return;

    setIsLoading(true);
    setResult(null);
    setCheckedTasks({});
    stopSpeech();

    try {
      const response = await fetch("/api/process-notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          circularText,
          targetLanguage: selectedLanguage,
          tone,
          schoolName,
          customApiKey: customApiKey || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to transform circular");
      }

      setResult(data);
      setActiveTab("whatsapp");

      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }
    } catch (err: any) {
      alert("Error: " + (err.message || "Failed to process notice."));
    } finally {
      setIsLoading(false);
    }
  };

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Open in WhatsApp
  const handleShareWhatsApp = (text: string) => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // Audio speech synthesis
  const handlePlaySpeech = (textToSpeak: string) => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = speechRate;

    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().includes(selectedLanguage.toLowerCase().substring(0, 2)) ||
        v.name.toLowerCase().includes("natural")
    );
    if (matchingVoice) utterance.voice = matchingVoice;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const stopSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Toggle checklist item
  const toggleTask = (id: string) => {
    setCheckedTasks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checkedTasks).filter(Boolean).length;
  const totalTasks = result?.actionChecklist?.length || 0;

  return (
    <main className="app-container">
      {/* Top Header Bar */}
      <header className="app-header">
        <div className="header-brand">
          <div className="logo-badge">🏫</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <h1 className="brand-title">NoticeBridge</h1>
              <span className="badge-pill badge-blue">AI Powered</span>
              <span className="badge-pill badge-emerald">Vercel Ready</span>
            </div>
            <p className="brand-subtitle">
              School Circular to 30-Second WhatsApp & Multilingual Parent Notice Engine
            </p>
          </div>
        </div>

        {/* Quick Settings & GitHub */}
        <div className="header-actions">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="icon-btn"
            title="Configure Gemini API Key"
          >
            <Settings style={{ width: "15px", height: "15px", color: "#2563eb" }} />
            <span>{customApiKey ? "API Key Configured ✓" : "Set API Key (Optional)"}</span>
          </button>

          <a
            href="https://github.com/srhagul30/School-project-.git"
            target="_blank"
            rel="noopener noreferrer"
            className="icon-btn"
          >
            <ExternalLink style={{ width: "14px", height: "14px" }} />
            <span>GitHub</span>
          </a>
        </div>
      </header>

      {/* Main Grid: Input Left, Output Right */}
      <div className="main-grid">
        {/* Left Column: Input Form */}
        <div className="white-panel" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "0.5rem", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
              <FileText style={{ width: "16px", height: "16px", color: "#2563eb" }} />
              <span style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#0f172a" }}>
                Input Circular
              </span>
            </div>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
              {circularText.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>

          {/* School Name */}
          <div className="form-group">
            <label className="form-label">School / Institution Name</label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="e.g. St. Xavier's International School"
              className="form-input"
            />
          </div>

          {/* Presets */}
          <div className="form-group">
            <div className="form-label">
              <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Sparkles style={{ width: "13px", height: "13px", color: "#d97706" }} />
                Sample Circular Templates:
              </span>
            </div>
            <div className="presets-grid">
              {PRESET_CIRCULARS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setCircularText(preset.text);
                    setSchoolName(preset.schoolName);
                    setSelectedLanguage(preset.language);
                  }}
                  className={`preset-btn ${circularText === preset.text ? "active" : ""}`}
                >
                  <div className="preset-title">{preset.title}</div>
                  <div className="preset-tag">{preset.tag}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Circular Textarea */}
          <div className="form-group">
            <div className="form-label">
              <span>Paste Circular Text</span>
              {circularText && (
                <button
                  onClick={() => setCircularText("")}
                  style={{ background: "none", border: "none", color: "#e11d48", fontSize: "0.72rem", cursor: "pointer", fontWeight: 500 }}
                >
                  Clear Text
                </button>
              )}
            </div>
            <textarea
              value={circularText}
              onChange={(e) => setCircularText(e.target.value)}
              rows={8}
              placeholder="Paste raw circular text, PDF announcements, or notices here..."
              className="form-textarea"
            />
          </div>

          {/* Target Language & Tone */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Languages style={{ width: "14px", height: "14px", color: "#16a34a" }} />
                Target Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="form-select"
              >
                {AVAILABLE_LANGUAGES.map((lang) => (
                  <option key={lang.name} value={lang.name}>
                    {lang.flag} {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="form-select"
              >
                <option value="Clear & Friendly">Clear & Friendly</option>
                <option value="High Urgency Alert">High Urgency Alert ⚠️</option>
                <option value="Short & Crisp">Short & Crisp</option>
                <option value="Formal & Respectful">Formal & Respectful</option>
              </select>
            </div>
          </div>

          {/* Transform Button */}
          <button
            onClick={handleProcess}
            disabled={isLoading || !circularText.trim()}
            className="btn-transform"
          >
            {isLoading ? (
              <>
                <div style={{ width: "15px", height: "15px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                <span>Processing Circular...</span>
              </>
            ) : (
              <>
                <Send style={{ width: "15px", height: "15px" }} />
                <span>Transform into Parent Notice</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Output Hub */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {!result && !isLoading && (
            <div
              className="white-panel"
              style={{
                padding: "3rem 1.5rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                gap: "1rem",
                minHeight: "440px",
                borderStyle: "dashed",
              }}
            >
              <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "50%", background: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem" }}>
                📢
              </div>
              <div style={{ maxWidth: "380px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>
                  No Circular Processed Yet
                </h3>
                <p style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "0.35rem", lineHeight: 1.5 }}>
                  Choose one of the sample templates on the left or paste your school circular, then click <strong>"Transform into Parent Notice"</strong>.
                </p>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.4rem", marginTop: "0.25rem" }}>
                <span className="badge-pill badge-slate">📱 30-Sec WhatsApp Format</span>
                <span className="badge-pill badge-slate">🌐 Regional Translation</span>
                <span className="badge-pill badge-slate">🔊 Voice Audio Read-Aloud</span>
                <span className="badge-pill badge-slate">✍️ Action Checklist</span>
              </div>
            </div>
          )}

          {isLoading && (
            <div
              className="white-panel"
              style={{
                padding: "3rem 1.5rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                gap: "1rem",
                minHeight: "440px",
              }}
            >
              <div style={{ width: "3.25rem", height: "3.25rem", borderRadius: "10px", background: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
                ⚡
              </div>
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>
                  Analyzing Circular Details...
                </h3>
                <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.25rem" }}>
                  Extracting dates, fees, actions, and translating to {selectedLanguage}...
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className="white-panel" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Notice Metadata Header */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", paddingBottom: "0.75rem", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                    <span className={`badge-pill ${result.urgency === "High" ? "badge-rose" : result.urgency === "Medium" ? "badge-amber" : "badge-emerald"}`}>
                      {result.urgency} Urgency
                    </span>
                    <span className="badge-pill badge-blue">{result.category}</span>
                    <span className="badge-pill badge-emerald">{result.meta.readingTimeReduction}</span>
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                    {result.meta.modelUsed}
                  </span>
                </div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>
                  {result.title}
                </h2>
              </div>

              {/* Tabs Navigation */}
              <div className="tabs-nav">
                <button
                  onClick={() => setActiveTab("whatsapp")}
                  className={`tab-btn whatsapp-tab ${activeTab === "whatsapp" ? "active" : ""}`}
                >
                  <Share2 style={{ width: "14px", height: "14px" }} />
                  <span>WhatsApp Broadcast</span>
                </button>

                <button
                  onClick={() => setActiveTab("translation")}
                  className={`tab-btn ${activeTab === "translation" ? "active" : ""}`}
                >
                  <Languages style={{ width: "14px", height: "14px" }} />
                  <span>{result.targetLanguageName} Translation</span>
                </button>

                <button
                  onClick={() => setActiveTab("facts")}
                  className={`tab-btn ${activeTab === "facts" ? "active" : ""}`}
                >
                  <Calendar style={{ width: "14px", height: "14px" }} />
                  <span>Key Facts Sheet</span>
                </button>

                <button
                  onClick={() => setActiveTab("checklist")}
                  className={`tab-btn ${activeTab === "checklist" ? "active" : ""}`}
                >
                  <CheckSquare style={{ width: "14px", height: "14px" }} />
                  <span>Action Checklist ({completedCount}/{totalTasks})</span>
                </button>

                <button
                  onClick={() => setActiveTab("faqs")}
                  className={`tab-btn ${activeTab === "faqs" ? "active" : ""}`}
                >
                  <HelpCircle style={{ width: "14px", height: "14px" }} />
                  <span>Parent FAQs</span>
                </button>
              </div>

              {/* Tab 1: WhatsApp Broadcast */}
              {activeTab === "whatsapp" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div className="whatsapp-bubble">
                    {result.whatsappNotice}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      Ready to share directly to Parent Class WhatsApp Groups
                    </span>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <button
                        onClick={() => handleCopy(result.whatsappNotice, "whatsapp")}
                        className="icon-btn"
                      >
                        {copiedKey === "whatsapp" ? (
                          <>
                            <Check style={{ width: "14px", height: "14px", color: "#16a34a" }} />
                            <span style={{ color: "#16a34a" }}>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy style={{ width: "14px", height: "14px" }} />
                            <span>Copy Text</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleShareWhatsApp(result.whatsappNotice)}
                        style={{
                          padding: "0.45rem 0.9rem",
                          borderRadius: "8px",
                          background: "#16a34a",
                          color: "#ffffff",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        <Share2 style={{ width: "14px", height: "14px" }} />
                        <span>Send to WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Translation & Audio */}
              {activeTab === "translation" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {/* Audio Read-Aloud */}
                  <div className="audio-bar">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <button
                        onClick={() => handlePlaySpeech(result.translatedNotice || result.audioScript)}
                        className={`audio-play-btn ${isSpeaking ? "playing" : ""}`}
                        title={isSpeaking ? "Stop Audio" : "Listen Aloud"}
                      >
                        {isSpeaking ? <VolumeX style={{ width: "17px", height: "17px" }} /> : <Volume2 style={{ width: "17px", height: "17px" }} />}
                      </button>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}>
                          <span>Listen Aloud (Speech Synthesizer)</span>
                          {isSpeaking && (
                            <div className="wave-container">
                              <div className="wave-bar" />
                              <div className="wave-bar" />
                              <div className="wave-bar" />
                              <div className="wave-bar" />
                            </div>
                          )}
                        </div>
                        <p style={{ fontSize: "0.72rem", color: "#64748b" }}>
                          Helps non-English literate or busy parents listen to the announcement
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSpeechRate((r) => (r === 1 ? 1.25 : r === 1.25 ? 0.85 : 1))}
                      className="icon-btn"
                      style={{ padding: "0.3rem 0.6rem", fontSize: "0.72rem" }}
                    >
                      {speechRate}x Speed
                    </button>
                  </div>

                  <div
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "1.15rem",
                      color: "#0f172a",
                      fontSize: "0.85rem",
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                      userSelect: "text",
                    }}
                  >
                    {result.translatedNotice}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.5rem" }}>
                    <button
                      onClick={() => handleCopy(result.translatedNotice, "translation")}
                      className="icon-btn"
                    >
                      {copiedKey === "translation" ? (
                        <>
                          <Check style={{ width: "14px", height: "14px", color: "#16a34a" }} />
                          <span style={{ color: "#16a34a" }}>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy style={{ width: "14px", height: "14px" }} />
                          <span>Copy Translation</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleShareWhatsApp(result.translatedNotice)}
                      style={{
                        padding: "0.45rem 0.9rem",
                        borderRadius: "8px",
                        background: "#2563eb",
                        color: "#ffffff",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <Share2 style={{ width: "14px", height: "14px" }} />
                      <span>Share in {result.targetLanguageName}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: Key Facts */}
              {activeTab === "facts" && (
                <div className="facts-grid">
                  <div className="fact-card">
                    <div className="fact-icon-box" style={{ background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a" }}>
                      <Calendar style={{ width: "16px", height: "16px" }} />
                    </div>
                    <div>
                      <div className="fact-label">Event Date</div>
                      <div className="fact-value">{result.keyDetails.eventDate}</div>
                    </div>
                  </div>

                  <div className="fact-card">
                    <div className="fact-icon-box" style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }}>
                      <Clock style={{ width: "16px", height: "16px" }} />
                    </div>
                    <div>
                      <div className="fact-label">Timings</div>
                      <div className="fact-value">{result.keyDetails.timings}</div>
                    </div>
                  </div>

                  <div className="fact-card">
                    <div className="fact-icon-box" style={{ background: "#fff1f2", color: "#be123c", border: "1px solid #fecdd3" }}>
                      <AlertCircle style={{ width: "16px", height: "16px" }} />
                    </div>
                    <div>
                      <div className="fact-label">Strict Deadline</div>
                      <div className="fact-value" style={{ color: "#be123c" }}>{result.keyDetails.deadline}</div>
                    </div>
                  </div>

                  <div className="fact-card">
                    <div className="fact-icon-box" style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}>
                      <DollarSign style={{ width: "16px", height: "16px" }} />
                    </div>
                    <div>
                      <div className="fact-label">Fees / Amount</div>
                      <div className="fact-value">{result.keyDetails.feeOrAmount}</div>
                    </div>
                  </div>

                  <div className="fact-card">
                    <div className="fact-icon-box" style={{ background: "#faf5ff", color: "#7e22ce", border: "1px solid #e9d5ff" }}>
                      <Shirt style={{ width: "16px", height: "16px" }} />
                    </div>
                    <div>
                      <div className="fact-label">Dress Code / Kit</div>
                      <div className="fact-value">{result.keyDetails.dressCode}</div>
                    </div>
                  </div>

                  <div className="fact-card">
                    <div className="fact-icon-box" style={{ background: "#ecfeff", color: "#0e7490", border: "1px solid #a5f3fc" }}>
                      <Phone style={{ width: "16px", height: "16px" }} />
                    </div>
                    <div>
                      <div className="fact-label">Contact / Helpline</div>
                      <div className="fact-value">{result.keyDetails.contactPerson}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Parent Action Checklist */}
              {activeTab === "checklist" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.78rem", color: "#64748b" }}>
                    <span>
                      Readiness Status: <strong style={{ color: "#0f172a" }}>{completedCount} of {totalTasks}</strong> completed
                    </span>
                    <button
                      onClick={() =>
                        handleCopy(
                          result.actionChecklist
                            .map((i, idx) => `${idx + 1}. [ ] ${i.task}${i.deadline ? ` (Due: ${i.deadline})` : ""}`)
                            .join("\n"),
                          "checklist"
                        )
                      }
                      style={{ background: "none", border: "none", color: "#2563eb", fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontWeight: 600 }}
                    >
                      {copiedKey === "checklist" ? <Check style={{ width: "12px", height: "12px", color: "#16a34a" }} /> : <Copy style={{ width: "12px", height: "12px" }} />}
                      <span>Copy Checklist</span>
                    </button>
                  </div>

                  <div className="checklist-container">
                    {result.actionChecklist.map((item) => {
                      const isDone = !!checkedTasks[item.id];
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleTask(item.id)}
                          className={`checklist-item ${isDone ? "done" : ""}`}
                        >
                          <div style={{ marginTop: "2px" }}>
                            {isDone ? (
                              <CheckSquare style={{ width: "16px", height: "16px", color: "#16a34a" }} />
                            ) : (
                              <Square style={{ width: "16px", height: "16px", color: "#94a3b8" }} />
                            )}
                          </div>
                          <div style={{ flex: 1, fontSize: "0.82rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                              <span style={{ color: isDone ? "#94a3b8" : "#0f172a", fontWeight: isDone ? 400 : 500 }}>
                                {item.task}
                              </span>
                              {item.important && !isDone && (
                                <span className="badge-pill badge-rose" style={{ fontSize: "0.65rem", padding: "0.15rem 0.45rem" }}>
                                  Required
                                </span>
                              )}
                            </div>
                            {item.deadline && (
                              <span style={{ fontSize: "0.72rem", color: "#64748b", display: "block", marginTop: "2px" }}>
                                Due: {item.deadline}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 5: FAQs */}
              {activeTab === "faqs" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    Frequently asked questions by parents:
                  </div>
                  {result.frequentlyAskedQuestions.map((faq, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "0.85rem 1rem",
                        borderRadius: "8px",
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.35rem",
                      }}
                    >
                      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1d4ed8", display: "flex", gap: "0.4rem" }}>
                        <span>Q:</span>
                        <span>{faq.question}</span>
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#334155", paddingLeft: "1.1rem", lineHeight: 1.5 }}>
                        {faq.answer}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* API Key Modal */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Settings style={{ width: "16px", height: "16px", color: "#2563eb" }} />
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>
                  API Key Configuration
                </h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1rem" }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: "0.8rem", color: "#475569", lineHeight: 1.5 }}>
              NoticeBridge includes a built-in Smart Heuristic engine for offline/demo use. To enable Google Gemini AI analysis and live multilingual translations:
            </p>

            <div style={{ padding: "0.75rem", borderRadius: "8px", background: "#eff6ff", border: "1px solid #bfdbfe", fontSize: "0.75rem", color: "#1e40af" }}>
              <strong>For Vercel Deployment:</strong>
              <div style={{ marginTop: "0.25rem", color: "#334155" }}>
                Add <code style={{ background: "#ffffff", padding: "2px 5px", borderRadius: "4px", color: "#b45309", border: "1px solid #cbd5e1" }}>GEMINI_API_KEY</code> under <strong>Settings &gt; Environment Variables</strong> in your Vercel project.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Optional: Enter Gemini API Key for local browser testing
              </label>
              <input
                type="password"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="form-input"
                style={{ fontFamily: "monospace" }}
              />
              <span style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "2px" }}>
                Saved in your browser's localStorage. Free key available at aistudio.google.com.
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="icon-btn"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveApiKey(customApiKey)}
                style={{
                  padding: "0.45rem 0.9rem",
                  borderRadius: "8px",
                  background: "#2563eb",
                  color: "#ffffff",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="app-footer">
        <div>
          NoticeBridge • School Circular & Parent Communication Engine
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span>Deployable on Vercel</span>
          <span>•</span>
          <a
            href="https://github.com/srhagul30/School-project-.git"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#2563eb", textDecoration: "none", fontWeight: 500 }}
          >
            GitHub Repository
          </a>
        </div>
      </footer>
    </main>
  );
}
