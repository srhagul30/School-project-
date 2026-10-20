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
  MessageCircle,
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

      // Celebrate with subtle confetti
      try {
        confetti({
          particleCount: 40,
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
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
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
              <span className="badge-pill badge-emerald">AI Powered</span>
              <span className="badge-pill badge-indigo">Vercel Ready</span>
            </div>
            <p className="brand-subtitle">
              Transforming Complex School Circulars into 30-Second WhatsApp & Multilingual Parent Notices
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
            <Settings style={{ width: "16px", height: "16px", color: "#818cf8" }} />
            <span>{customApiKey ? "API Key Set ✓" : "Set API Key (Optional)"}</span>
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
        <div className="glass-panel" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FileText style={{ width: "16px", height: "16px", color: "#818cf8" }} />
              <span style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#cbd5e1" }}>
                School Circular Input
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
                <Sparkles style={{ width: "13px", height: "13px", color: "#fbbf24" }} />
                Try Sample Circulars:
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
              <span>Paste Circular / Notice Text</span>
              {circularText && (
                <button
                  onClick={() => setCircularText("")}
                  style={{ background: "none", border: "none", color: "#fb7185", fontSize: "0.7rem", cursor: "pointer" }}
                >
                  Clear Text
                </button>
              )}
            </div>
            <textarea
              value={circularText}
              onChange={(e) => setCircularText(e.target.value)}
              rows={8}
              placeholder="Paste raw circular text, PDF content, or announcement here..."
              className="form-textarea"
            />
          </div>

          {/* Target Language & Tone */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Languages style={{ width: "14px", height: "14px", color: "#34d399" }} />
                Parent Language
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
              <label className="form-label">Message Tone</label>
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
                <div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                <span>Processing & Generating Updates...</span>
              </>
            ) : (
              <>
                <Send style={{ width: "16px", height: "16px" }} />
                <span>Transform into Parent Notice</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Output Hub */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {!result && !isLoading && (
            <div
              className="glass-panel"
              style={{
                padding: "2.5rem 1.5rem",
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
              <div style={{ width: "4rem", height: "4rem", borderRadius: "50%", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>
                📢
              </div>
              <div style={{ maxWidth: "400px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f8fafc" }}>
                  Ready to Transform Your First Notice
                </h3>
                <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "0.35rem", lineHeight: 1.5 }}>
                  Select one of the sample circulars on the left (Sports Day, Exam Rules, Field Trip, or Monsoon Notice) or paste your own circular, then click <strong>"Transform into Parent Notice"</strong>.
                </p>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.4rem", marginTop: "0.5rem" }}>
                <span className="badge-pill badge-indigo">📱 30-Sec WhatsApp Format</span>
                <span className="badge-pill badge-emerald">🌐 Regional Translation</span>
                <span className="badge-pill badge-amber">🔊 Voice Audio Read-Aloud</span>
                <span className="badge-pill badge-rose">✍️ Action Checklist</span>
              </div>
            </div>
          )}

          {isLoading && (
            <div
              className="glass-panel"
              style={{
                padding: "2.5rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                gap: "1rem",
                minHeight: "440px",
              }}
            >
              <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "1rem", background: "rgba(99,102,241,0.25)", border: "1px solid rgba(99,102,241,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>
                ⚡
              </div>
              <div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#f8fafc" }}>
                  Analyzing Circular Details...
                </h3>
                <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "0.25rem" }}>
                  Extracting dates, fees, actions, and translating to {selectedLanguage}...
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className="glass-panel" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Notice Metadata Header */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", paddingBottom: "0.75rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                    <span className={`badge-pill ${result.urgency === "High" ? "badge-rose" : result.urgency === "Medium" ? "badge-amber" : "badge-emerald"}`}>
                      {result.urgency} Urgency
                    </span>
                    <span className="badge-pill badge-indigo">{result.category}</span>
                    <span className="badge-pill badge-emerald">{result.meta.readingTimeReduction}</span>
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                    {result.meta.modelUsed}
                  </span>
                </div>
                <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#f8fafc" }}>
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
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                      Ready to broadcast into Class Parent WhatsApp Groups
                    </span>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <button
                        onClick={() => handleCopy(result.whatsappNotice, "whatsapp")}
                        className="icon-btn"
                      >
                        {copiedKey === "whatsapp" ? (
                          <>
                            <Check style={{ width: "14px", height: "14px", color: "#34d399" }} />
                            <span style={{ color: "#34d399" }}>Copied!</span>
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
                          padding: "0.5rem 1rem",
                          borderRadius: "0.75rem",
                          background: "#059669",
                          color: "#ffffff",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          border: "none",
                          cursor: "pointer",
                          boxShadow: "0 4px 12px rgba(5,150,105,0.3)",
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
                        {isSpeaking ? <VolumeX style={{ width: "18px", height: "18px" }} /> : <Volume2 style={{ width: "18px", height: "18px" }} />}
                      </button>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", fontWeight: 700, color: "#f8fafc" }}>
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
                        <p style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                          Helps non-English literate or busy parents listen instantly
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

                  <div className="whatsapp-bubble" style={{ borderColor: "rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.08)" }}>
                    {result.translatedNotice}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.5rem" }}>
                    <button
                      onClick={() => handleCopy(result.translatedNotice, "translation")}
                      className="icon-btn"
                    >
                      {copiedKey === "translation" ? (
                        <>
                          <Check style={{ width: "14px", height: "14px", color: "#34d399" }} />
                          <span style={{ color: "#34d399" }}>Copied!</span>
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
                        padding: "0.5rem 1rem",
                        borderRadius: "0.75rem",
                        background: "#4f46e5",
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
                    <div className="fact-icon-box" style={{ background: "rgba(245,158,11,0.15)", color: "#fbbf24" }}>
                      <Calendar style={{ width: "16px", height: "16px" }} />
                    </div>
                    <div>
                      <div className="fact-label">Event Date</div>
                      <div className="fact-value">{result.keyDetails.eventDate}</div>
                    </div>
                  </div>

                  <div className="fact-card">
                    <div className="fact-icon-box" style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>
                      <Clock style={{ width: "16px", height: "16px" }} />
                    </div>
                    <div>
                      <div className="fact-label">Timings</div>
                      <div className="fact-value">{result.keyDetails.timings}</div>
                    </div>
                  </div>

                  <div className="fact-card">
                    <div className="fact-icon-box" style={{ background: "rgba(244,63,94,0.15)", color: "#f87171" }}>
                      <AlertCircle style={{ width: "16px", height: "16px" }} />
                    </div>
                    <div>
                      <div className="fact-label">Strict Deadline</div>
                      <div className="fact-value" style={{ color: "#fda4af" }}>{result.keyDetails.deadline}</div>
                    </div>
                  </div>

                  <div className="fact-card">
                    <div className="fact-icon-box" style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}>
                      <DollarSign style={{ width: "16px", height: "16px" }} />
                    </div>
                    <div>
                      <div className="fact-label">Fees / Amount</div>
                      <div className="fact-value">{result.keyDetails.feeOrAmount}</div>
                    </div>
                  </div>

                  <div className="fact-card">
                    <div className="fact-icon-box" style={{ background: "rgba(168,85,247,0.15)", color: "#c084fc" }}>
                      <Shirt style={{ width: "16px", height: "16px" }} />
                    </div>
                    <div>
                      <div className="fact-label">Dress Code / Kit</div>
                      <div className="fact-value">{result.keyDetails.dressCode}</div>
                    </div>
                  </div>

                  <div className="fact-card">
                    <div className="fact-icon-box" style={{ background: "rgba(6,182,212,0.15)", color: "#22d3ee" }}>
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
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.78rem", color: "#94a3b8" }}>
                    <span>
                      Readiness: <strong style={{ color: "#f8fafc" }}>{completedCount} of {totalTasks}</strong> completed
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
                      style={{ background: "none", border: "none", color: "#818cf8", fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem" }}
                    >
                      {copiedKey === "checklist" ? <Check style={{ width: "12px", height: "12px", color: "#34d399" }} /> : <Copy style={{ width: "12px", height: "12px" }} />}
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
                              <CheckSquare style={{ width: "16px", height: "16px", color: "#34d399" }} />
                            ) : (
                              <Square style={{ width: "16px", height: "16px", color: "#64748b" }} />
                            )}
                          </div>
                          <div style={{ flex: 1, fontSize: "0.82rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                              <span>{item.task}</span>
                              {item.important && !isDone && (
                                <span className="badge-pill badge-rose" style={{ fontSize: "0.65rem", padding: "0.15rem 0.45rem" }}>
                                  Mandatory
                                </span>
                              )}
                            </div>
                            {item.deadline && (
                              <span style={{ fontSize: "0.72rem", color: "#64748b", display: "block", marginTop: "2px" }}>
                                Deadline: {item.deadline}
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
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                    Anticipated questions parents will ask in class WhatsApp groups:
                  </div>
                  {result.frequentlyAskedQuestions.map((faq, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "0.85rem 1rem",
                        borderRadius: "0.85rem",
                        background: "rgba(15,23,42,0.6)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.35rem",
                      }}
                    >
                      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#c7d2fe", display: "flex", gap: "0.4rem" }}>
                        <span style={{ color: "#818cf8" }}>Q:</span>
                        <span>{faq.question}</span>
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#cbd5e1", paddingLeft: "1.1rem", lineHeight: 1.5 }}>
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Settings style={{ width: "16px", height: "16px", color: "#818cf8" }} />
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#f8fafc" }}>
                  Gemini API Key Settings
                </h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1rem" }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: "0.8rem", color: "#cbd5e1", lineHeight: 1.5 }}>
              NoticeBridge works out-of-the-box using its <strong>Smart Heuristic Engine</strong>. To enable Google Gemini AI analysis and live multilingual translations:
            </p>

            <div style={{ padding: "0.75rem", borderRadius: "0.75rem", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", fontSize: "0.75rem", color: "#c7d2fe" }}>
              <strong>For Vercel Deployment:</strong>
              <div style={{ marginTop: "0.25rem", color: "#e2e8f0" }}>
                Add <code style={{ background: "rgba(0,0,0,0.4)", padding: "2px 5px", borderRadius: "4px", color: "#fde68a" }}>GEMINI_API_KEY</code> under <strong>Settings &gt; Environment Variables</strong> in your Vercel project.
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
                Saved locally in browser localStorage. Free key available at aistudio.google.com.
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
                  padding: "0.5rem 1rem",
                  borderRadius: "0.75rem",
                  background: "#4f46e5",
                  color: "#fff",
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
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span>Deployable on Vercel</span>
          <span>•</span>
          <a
            href="https://github.com/srhagul30/School-project-.git"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#818cf8" }}
          >
            GitHub Repository
          </a>
        </div>
      </footer>
    </main>
  );
}
