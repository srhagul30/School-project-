"use client";

import React, { useState, useEffect } from "react";
import {
  Send,
  Copy,
  Check,
  Volume2,
  VolumeX,
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
  Sparkles,
  Zap,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";
import type { NoticeResult } from "./api/process-notice/route";

const PRESET_CIRCULARS = [
  {
    id: "sports-day",
    title: "Annual Sports Day 2026",
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
    title: "Final Term Examination Rules",
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
    title: "Science Field Trip & Fees",
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
    title: "Emergency Monsoon Advisory",
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
  { code: "ta-IN", name: "Tamil", nativeName: "தமிழ்" },
  { code: "hi-IN", name: "Hindi", nativeName: "हिन्दी" },
  { code: "te-IN", name: "Telugu", nativeName: "తెలుగు" },
  { code: "ml-IN", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "es-ES", name: "Spanish", nativeName: "Español" },
  { code: "fr-FR", name: "French", nativeName: "Français" },
  { code: "ar-SA", name: "Arabic", nativeName: "العربية" },
  { code: "en-US", name: "Plain English", nativeName: "Simple English" },
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

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const savedKey = localStorage.getItem("noticebridge_gemini_key");
    if (savedKey) setCustomApiKey(savedKey);
  }, []);

  const handleSaveApiKey = (key: string) => {
    setCustomApiKey(key);
    localStorage.setItem("noticebridge_gemini_key", key.trim());
    setShowSettingsModal(false);
  };

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
      if (!response.ok) throw new Error(data.error || "Failed to transform circular");

      setResult(data);
      setActiveTab("whatsapp");
      try {
        confetti({ particleCount: 30, spread: 55, origin: { y: 0.6 } });
      } catch (_) {}
    } catch (err: any) {
      alert("Error: " + (err.message || "Failed to process notice."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleShareWhatsApp = (text: string) => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

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
    const match = voices.find(
      (v) =>
        v.lang.toLowerCase().includes(selectedLanguage.toLowerCase().substring(0, 2)) ||
        v.name.toLowerCase().includes("natural")
    );
    if (match) utterance.voice = match;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const stopSpeech = () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const toggleTask = (id: string) => {
    setCheckedTasks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checkedTasks).filter(Boolean).length;
  const totalTasks = result?.actionChecklist?.length || 0;

  const urgencyClass =
    result?.urgency === "High"
      ? "badge-red"
      : result?.urgency === "Medium"
      ? "badge-amber"
      : "badge-green";

  return (
    <main className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-brand">
          <div className="logo-mark">
            <FileText style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <h1 className="brand-title">NoticeBridge</h1>
              <span className="badge badge-blue">AI</span>
            </div>
            <p className="brand-subtitle">School Circular to WhatsApp Parent Notice — in seconds</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="btn btn-ghost"
            title="Configure Gemini API Key"
          >
            <Settings style={{ width: 14, height: 14 }} />
            <span>{customApiKey ? "API Key Set" : "API Key"}</span>
          </button>
          <a
            href="https://github.com/srhagul30/School-project-.git"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
          >
            <ExternalLink style={{ width: 13, height: 13 }} />
            <span>GitHub</span>
          </a>
        </div>
      </header>

      {/* Main Grid */}
      <div className="main-grid">
        {/* LEFT: Input Panel */}
        <div className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Panel header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="section-label">
              <FileText style={{ width: 13, height: 13 }} />
              Input Circular
            </span>
            <span className="word-count">
              {circularText.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>

          {/* School name */}
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

          {/* Preset templates */}
          <div className="form-group">
            <div className="form-label">
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Sparkles style={{ width: 12, height: 12, color: "#d97706" }} />
                Sample Templates
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

          {/* Textarea */}
          <div className="form-group">
            <div className="form-label">
              <span>Circular Text</span>
              {circularText && (
                <button
                  onClick={() => setCircularText("")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#dc2626",
                    fontSize: "0.72rem",
                    cursor: "pointer",
                    fontWeight: 500,
                    padding: 0,
                  }}
                >
                  Clear
                </button>
              )}
            </div>
            <textarea
              value={circularText}
              onChange={(e) => setCircularText(e.target.value)}
              rows={9}
              placeholder="Paste the full circular or announcement text here..."
              className="form-textarea"
            />
          </div>

          {/* Language & Tone row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Languages style={{ width: 13, height: 13, color: "#16a34a" }} />
                Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="form-select"
              >
                {AVAILABLE_LANGUAGES.map((lang) => (
                  <option key={lang.name} value={lang.name}>
                    {lang.name} ({lang.nativeName})
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
                <option value="High Urgency Alert">High Urgency</option>
                <option value="Short & Crisp">Short & Crisp</option>
                <option value="Formal & Respectful">Formal</option>
              </select>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={handleProcess}
            disabled={isLoading || !circularText.trim()}
            className="btn btn-primary btn-full"
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                <span>Processing Circular...</span>
              </>
            ) : (
              <>
                <Send style={{ width: 14, height: 14 }} />
                <span>Transform into Parent Notice</span>
              </>
            )}
          </button>
        </div>

        {/* RIGHT: Output Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Empty state */}
          {!result && !isLoading && (
            <div className="card state-panel" style={{ borderStyle: "dashed" }}>
              <div className="state-icon">
                <FileText style={{ width: 20, height: 20 }} />
              </div>
              <div>
                <h3 className="state-title">No notice processed yet</h3>
                <p className="state-body" style={{ marginTop: "0.35rem" }}>
                  Select a template on the left or paste your own circular, then click{" "}
                  <strong>Transform into Parent Notice</strong>.
                </p>
              </div>
              <div className="feature-chips">
                <span className="badge badge-neutral">WhatsApp Format</span>
                <span className="badge badge-neutral">Regional Translation</span>
                <span className="badge badge-neutral">Voice Read-Aloud</span>
                <span className="badge badge-neutral">Action Checklist</span>
              </div>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="card state-panel">
              <div className="state-icon" style={{ background: "#eff6ff", borderColor: "#bfdbfe" }}>
                <Zap style={{ width: 20, height: 20, color: "#2563eb" }} />
              </div>
              <div>
                <h3 className="state-title">Analyzing circular...</h3>
                <p className="state-body" style={{ marginTop: "0.25rem" }}>
                  Extracting dates, fees, deadlines and translating into {selectedLanguage}.
                </p>
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Result header */}
              <div style={{ paddingBottom: "0.75rem", borderBottom: "1px solid #f1f5f9" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                    <span className={`badge ${urgencyClass}`}>{result.urgency} Priority</span>
                    <span className="badge badge-blue">{result.category}</span>
                    <span className="badge badge-green">{result.meta.readingTimeReduction}</span>
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "#9ca3af" }}>
                    {result.meta.modelUsed}
                  </span>
                </div>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#111827" }}>{result.title}</h2>
              </div>

              {/* Tabs */}
              <div className="tabs-nav">
                {[
                  { id: "whatsapp", icon: <Share2 style={{ width: 13, height: 13 }} />, label: "WhatsApp" },
                  {
                    id: "translation",
                    icon: <Languages style={{ width: 13, height: 13 }} />,
                    label: result.targetLanguageName,
                  },
                  { id: "facts", icon: <Calendar style={{ width: 13, height: 13 }} />, label: "Key Facts" },
                  {
                    id: "checklist",
                    icon: <CheckSquare style={{ width: 13, height: 13 }} />,
                    label: `Checklist (${completedCount}/${totalTasks})`,
                  },
                  { id: "faqs", icon: <HelpCircle style={{ width: 13, height: 13 }} />, label: "FAQs" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab: WhatsApp */}
              {activeTab === "whatsapp" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div className="message-block">{result.whatsappNotice}</div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                    }}
                  >
                    <span style={{ fontSize: "0.74rem", color: "#9ca3af" }}>
                      Ready to paste into class WhatsApp groups
                    </span>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => handleCopy(result.whatsappNotice, "whatsapp")}
                        className="btn btn-ghost"
                      >
                        {copiedKey === "whatsapp" ? (
                          <>
                            <Check style={{ width: 13, height: 13, color: "#16a34a" }} />
                            <span style={{ color: "#16a34a" }}>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy style={{ width: 13, height: 13 }} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleShareWhatsApp(result.whatsappNotice)}
                        className="btn btn-success"
                      >
                        <Share2 style={{ width: 13, height: 13 }} />
                        <span>Open WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Translation */}
              {activeTab === "translation" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {/* Audio bar */}
                  <div className="audio-bar">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <button
                        onClick={() => handlePlaySpeech(result.translatedNotice || result.audioScript)}
                        className={`audio-play-btn ${isSpeaking ? "playing" : "idle"}`}
                        title={isSpeaking ? "Stop" : "Listen"}
                      >
                        {isSpeaking ? (
                          <VolumeX style={{ width: 16, height: 16 }} />
                        ) : (
                          <Volume2 style={{ width: 16, height: 16 }} />
                        )}
                      </button>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span className="audio-label">Listen aloud</span>
                          {isSpeaking && (
                            <div className="wave">
                              <div className="wave-bar" />
                              <div className="wave-bar" />
                              <div className="wave-bar" />
                              <div className="wave-bar" />
                            </div>
                          )}
                        </div>
                        <p className="audio-sub">For parents who prefer audio over reading</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSpeechRate((r) => (r === 1 ? 1.25 : r === 1.25 ? 0.85 : 1))}
                      className="btn btn-ghost"
                      style={{ padding: "0.25rem 0.55rem", fontSize: "0.72rem" }}
                    >
                      {speechRate}x
                    </button>
                  </div>

                  <div className="translation-block">{result.translatedNotice}</div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                    <button onClick={() => handleCopy(result.translatedNotice, "translation")} className="btn btn-ghost">
                      {copiedKey === "translation" ? (
                        <>
                          <Check style={{ width: 13, height: 13, color: "#16a34a" }} />
                          <span style={{ color: "#16a34a" }}>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy style={{ width: 13, height: 13 }} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                    <button onClick={() => handleShareWhatsApp(result.translatedNotice)} className="btn btn-success">
                      <Share2 style={{ width: 13, height: 13 }} />
                      <span>Share in {result.targetLanguageName}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab: Key Facts */}
              {activeTab === "facts" && (
                <div className="facts-grid">
                  {[
                    {
                      icon: <Calendar style={{ width: 15, height: 15 }} />,
                      label: "Event Date",
                      value: result.keyDetails.eventDate,
                      bg: "#fffbeb",
                      fg: "#b45309",
                      border: "#fde68a",
                    },
                    {
                      icon: <Clock style={{ width: 15, height: 15 }} />,
                      label: "Timings",
                      value: result.keyDetails.timings,
                      bg: "#eff6ff",
                      fg: "#1d4ed8",
                      border: "#bfdbfe",
                    },
                    {
                      icon: <AlertCircle style={{ width: 15, height: 15 }} />,
                      label: "Deadline",
                      value: result.keyDetails.deadline,
                      bg: "#fef2f2",
                      fg: "#dc2626",
                      border: "#fecaca",
                      valueColor: "#dc2626",
                    },
                    {
                      icon: <DollarSign style={{ width: 15, height: 15 }} />,
                      label: "Fees / Amount",
                      value: result.keyDetails.feeOrAmount,
                      bg: "#f0fdf4",
                      fg: "#15803d",
                      border: "#bbf7d0",
                    },
                    {
                      icon: <Shirt style={{ width: 15, height: 15 }} />,
                      label: "Dress Code",
                      value: result.keyDetails.dressCode,
                      bg: "#faf5ff",
                      fg: "#7e22ce",
                      border: "#e9d5ff",
                    },
                    {
                      icon: <Phone style={{ width: 15, height: 15 }} />,
                      label: "Contact",
                      value: result.keyDetails.contactPerson,
                      bg: "#ecfeff",
                      fg: "#0e7490",
                      border: "#a5f3fc",
                    },
                  ].map((f, i) => (
                    <div className="fact-row" key={i}>
                      <div
                        className="fact-icon"
                        style={{ background: f.bg, color: f.fg, border: `1px solid ${f.border}` }}
                      >
                        {f.icon}
                      </div>
                      <div>
                        <div className="fact-label">{f.label}</div>
                        <div className="fact-value" style={f.valueColor ? { color: f.valueColor } : {}}>
                          {f.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab: Checklist */}
              {activeTab === "checklist" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "0.78rem",
                      color: "#6b7280",
                    }}
                  >
                    <span>
                      {completedCount} of {totalTasks} completed
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
                      className="btn btn-ghost"
                      style={{ padding: "0.2rem 0.5rem", fontSize: "0.72rem" }}
                    >
                      {copiedKey === "checklist" ? (
                        <Check style={{ width: 12, height: 12, color: "#16a34a" }} />
                      ) : (
                        <Copy style={{ width: 12, height: 12 }} />
                      )}
                      <span>Copy list</span>
                    </button>
                  </div>

                  {/* Progress */}
                  <div className="progress-bar-wrap">
                    <div
                      className="progress-bar-fill"
                      style={{ width: totalTasks ? `${(completedCount / totalTasks) * 100}%` : "0%" }}
                    />
                  </div>

                  <div className="checklist-items">
                    {result.actionChecklist.map((item) => {
                      const done = !!checkedTasks[item.id];
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleTask(item.id)}
                          className={`checklist-row ${done ? "done" : ""}`}
                        >
                          <div style={{ marginTop: 2, flexShrink: 0 }}>
                            {done ? (
                              <CheckSquare style={{ width: 15, height: 15, color: "#16a34a" }} />
                            ) : (
                              <Square style={{ width: 15, height: 15, color: "#9ca3af" }} />
                            )}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "wrap" }}>
                              <span className="cl-task">{item.task}</span>
                              {item.important && !done && (
                                <span className="badge badge-red" style={{ fontSize: "0.63rem", padding: "1px 6px" }}>
                                  Required
                                </span>
                              )}
                            </div>
                            {item.deadline && (
                              <span className="cl-due">Due: {item.deadline}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab: FAQs */}
              {activeTab === "faqs" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <p style={{ fontSize: "0.74rem", color: "#9ca3af", marginBottom: "0.1rem" }}>
                    Common questions parents typically ask in class groups:
                  </p>
                  {result.frequentlyAskedQuestions.map((faq, idx) => (
                    <div key={idx} className="faq-item">
                      <div className="faq-q">
                        <span className="faq-q-marker">Q</span>
                        <span>{faq.question}</span>
                      </div>
                      <div className="faq-a">{faq.answer}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Settings style={{ width: 15, height: 15, color: "#2563eb" }} />
                <span className="modal-title">API Key Settings</span>
              </div>
              <button className="modal-close" onClick={() => setShowSettingsModal(false)}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            <p style={{ fontSize: "0.8rem", color: "#6b7280", lineHeight: 1.55 }}>
              NoticeBridge includes a built-in engine for offline and demo use. To enable live Gemini AI analysis and real multilingual translation, add an API key below.
            </p>

            <div className="info-box">
              <strong>For Vercel Deployment:</strong>
              <div style={{ marginTop: "0.25rem", color: "#374151" }}>
                Add{" "}
                <code
                  style={{
                    background: "#fff",
                    padding: "1px 5px",
                    borderRadius: 4,
                    color: "#b45309",
                    border: "1px solid #e2e8f0",
                    fontFamily: "monospace",
                  }}
                >
                  GEMINI_API_KEY
                </code>{" "}
                under <strong>Settings &gt; Environment Variables</strong> in your Vercel project.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Gemini API Key (optional — for local use)</label>
              <input
                type="password"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="form-input"
                style={{ fontFamily: "monospace" }}
              />
              <span style={{ fontSize: "0.7rem", color: "#9ca3af" }}>
                Stored in browser localStorage only. Free key at{" "}
                <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>
                  aistudio.google.com
                </a>
                .
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button onClick={() => setShowSettingsModal(false)} className="btn btn-ghost">
                Cancel
              </button>
              <button onClick={() => handleSaveApiKey(customApiKey)} className="btn btn-primary">
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="app-footer">
        <span>NoticeBridge — School Circular Communication Engine</span>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span>Deployable on Vercel</span>
          <span>·</span>
          <a
            href="https://github.com/srhagul30/School-project-.git"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#2563eb", textDecoration: "none", fontWeight: 500 }}
          >
            GitHub
          </a>
        </div>
      </footer>
    </main>
  );
}
