"use client";

import { useMemo, useState } from "react";
import {
  CalendarPlus,
  Check,
  Copy,
  Pencil,
  Printer,
  Send,
  Square,
  SquareCheck,
  Volume2,
  VolumeOff,
} from "lucide-react";
import { WhatsAppText, plainText } from "@/lib/whatsapp-format";
import { buildIcs, canExportCalendar, downloadFile, slug } from "@/lib/ics";
import { findLanguage } from "@/lib/languages";
import type { NoticeResult } from "@/lib/types";
import { useSpeech } from "./useSpeech";
import { PrintHandout } from "./PrintHandout";

type TabId = "whatsapp" | "translation" | "sms" | "details" | "checklist" | "faqs";

interface Props {
  result: NoticeResult | null;
  loading: boolean;
  language: string;
  schoolName: string;
  onToast: (msg: string) => void;
}

export function ResultPanel({ result, loading, language, schoolName, onToast }: Props) {
  if (loading && !result) return <LoadingState language={language} />;
  if (!result) return <EmptyState />;
  return <Result result={result} loading={loading} schoolName={schoolName} onToast={onToast} />;
}

/* ------------------------------------------------------------------ */

function EmptyState() {
  return (
    <div className="panel panel-output is-empty">
      <div className="panel-head">
        <h2 className="panel-title">Parent message</h2>
      </div>
      <div className="chat chat-empty" aria-hidden="true">
        <div className="bubble bubble-ghost">
          <span style={{ width: "62%" }} />
          <span style={{ width: "88%" }} />
          <span style={{ width: "40%" }} />
          <span style={{ width: "74%" }} />
          <span style={{ width: "55%" }} />
        </div>
      </div>
      <p className="empty-copy">
        Choose a sample or paste a circular, then select <strong>Write parent message</strong>. You&rsquo;ll get the
        WhatsApp message, a translated version, an SMS, the key facts and a checklist for parents.
      </p>
    </div>
  );
}

function LoadingState({ language }: { language: string }) {
  return (
    <div className="panel panel-output" aria-busy="true">
      <div className="panel-head">
        <h2 className="panel-title">Parent message</h2>
      </div>
      <div className="skeleton-title" />
      <div className="chat">
        <div className="bubble bubble-ghost is-loading">
          <span style={{ width: "62%" }} />
          <span style={{ width: "88%" }} />
          <span style={{ width: "40%" }} />
          <span style={{ width: "74%" }} />
        </div>
      </div>
      <p className="empty-copy">Reading the circular and preparing the {language} version…</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Result({
  result: r,
  loading,
  schoolName,
  onToast,
}: {
  result: NoticeResult;
  loading: boolean;
  schoolName: string;
  onToast: (msg: string) => void;
}) {
  const [tab, setTab] = useState<TabId>("whatsapp");
  const [texts, setTexts] = useState({ whatsapp: r.whatsappNotice, translation: r.translatedNotice, sms: r.smsNotice });
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const lang = findLanguage(r.targetLanguage);
  const isTranslated = r.targetLanguage !== "Simple English";

  const tabs: { id: TabId; label: string }[] = [
    { id: "whatsapp", label: "WhatsApp" },
    ...(isTranslated ? [{ id: "translation" as TabId, label: lang.native }] : []),
    { id: "sms", label: "SMS" },
    { id: "details", label: "Key facts" },
    { id: "checklist", label: "Checklist" },
    { id: "faqs", label: "Parent questions" },
  ];

  const urgencyClass = r.urgency === "High" ? "tag-high" : r.urgency === "Medium" ? "tag-medium" : "tag-low";
  const doneCount = r.actionChecklist.filter((a) => checked[a.id]).length;

  return (
    <div className={`panel panel-output ${loading ? "is-refreshing" : ""}`}>
      <div className="result-head">
        <div className="tags">
          <span className={`tag ${urgencyClass}`}>{r.urgency} priority</span>
          <span className="tag">{r.category}</span>
          <span className="engine-tag" title={r.meta.model}>
            {r.meta.engine === "gemini" ? `Written by ${r.meta.model}` : "Offline reader"}
          </span>
        </div>
        <h2 className="result-title">{r.title}</h2>
        <p className="readtime">
          <span>
            Circular <b>{duration(r.meta.originalReadSeconds)}</b> to read
          </span>
          <svg width="28" height="8" viewBox="0 0 28 8" aria-hidden="true">
            <path d="M0 4h26M22 1l4 3-4 3" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          <span>
            Message <b>{duration(r.meta.summaryReadSeconds)}</b>
          </span>
        </p>
      </div>

      <div className="tabs" role="tablist" aria-label="Output formats">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            className="tab"
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.id === "checklist" && (
              <span className="tab-count">
                {doneCount}/{r.actionChecklist.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="tabpanel">
        {tab === "whatsapp" && (
          <MessageView
            text={texts.whatsapp}
            onChange={(v) => setTexts((t) => ({ ...t, whatsapp: v }))}
            original={r.whatsappNotice}
            speech={{ text: r.audioScript, lang: "en-IN" }}
            onToast={onToast}
            channel="whatsapp"
          />
        )}
        {tab === "translation" && (
          <MessageView
            text={texts.translation}
            onChange={(v) => setTexts((t) => ({ ...t, translation: v }))}
            original={r.translatedNotice}
            speech={{ text: plainText(texts.translation), lang: lang.speech, fallback: r.audioScript }}
            rtl={lang.rtl}
            note={r.meta.translationNote}
            onToast={onToast}
            channel="whatsapp"
          />
        )}
        {tab === "sms" && (
          <MessageView
            text={texts.sms}
            onChange={(v) => setTexts((t) => ({ ...t, sms: v }))}
            original={r.smsNotice}
            onToast={onToast}
            channel="sms"
          />
        )}
        {tab === "details" && <Details result={r} schoolName={schoolName} onToast={onToast} />}
        {tab === "checklist" && (
          <Checklist
            result={r}
            checked={checked}
            onToggle={(id) => setChecked((c) => ({ ...c, [id]: !c[id] }))}
            onToast={onToast}
          />
        )}
        {tab === "faqs" && (
          <dl className="faqs">
            {r.faqs.map((f, i) => (
              <div key={i} className="faq">
                <dt>{f.question}</dt>
                <dd>{f.answer}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      {r.meta.fallbackReason && (
        <p className="note">
          Gemini couldn&rsquo;t be reached ({r.meta.fallbackReason}). These results are from the offline reader.
        </p>
      )}

      <PrintHandout result={r} schoolName={schoolName} />
    </div>
  );
}

function duration(seconds: number): string {
  if (seconds < 90) return `${seconds} sec`;
  const m = Math.floor(seconds / 60);
  const s = Math.round((seconds % 60) / 5) * 5;
  return s ? `${m} min ${s} sec` : `${m} min`;
}

/* ------------------------------------------------------------------ */

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for browsers that block the async clipboard API.
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

function MessageView({
  text,
  onChange,
  original,
  speech,
  rtl,
  note,
  onToast,
  channel,
}: {
  text: string;
  onChange: (v: string) => void;
  original: string;
  speech?: { text: string; lang: string; fallback?: string };
  rtl?: boolean;
  note?: string;
  onToast: (msg: string) => void;
  channel: "whatsapp" | "sms";
}) {
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { supported, speaking, speak, stop, hasVoice } = useSpeech();
  const time = useMemo(
    () => new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date()),
    []
  );

  const onCopy = async () => {
    const ok = await copyText(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } else onToast("Couldn't copy. Select the text and copy it manually.");
  };

  const onListen = () => {
    if (!speech) return;
    if (speaking) return stop();
    if (hasVoice(speech.lang)) speak(speech.text, speech.lang);
    else if (speech.fallback) {
      onToast("This browser has no voice for that language, so the English version is being read.");
      speak(speech.fallback, "en-IN");
    } else speak(speech.text, speech.lang);
  };

  const share = () => {
    if (channel === "sms") {
      window.location.href = `sms:?&body=${encodeURIComponent(text)}`;
      return;
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="message">
      {note && <p className="note">{note}</p>}

      {editing ? (
        <textarea
          className="message-edit"
          value={text}
          onChange={(e) => onChange(e.target.value)}
          dir={rtl ? "rtl" : "auto"}
          aria-label="Edit message"
          autoFocus
        />
      ) : (
        <div className={`chat ${channel === "sms" ? "chat-sms" : ""}`}>
          <div className="bubble" dir={rtl ? "rtl" : "auto"}>
            {channel === "sms" ? text : <WhatsAppText text={text} />}
            <span className="bubble-time">{time}</span>
          </div>
        </div>
      )}

      <div className="message-bar">
        <span className="message-meta">
          {channel === "sms" ? `${text.length} / 320 characters` : `${text.split(/\s+/).filter(Boolean).length} words`}
          {text !== original && (
            <>
              {" "}
              <button type="button" className="link-btn" onClick={() => onChange(original)}>
                Undo edits
              </button>
            </>
          )}
        </span>
        <div className="message-actions">
          {speech && supported && (
            <button type="button" className="btn btn-quiet btn-sm" onClick={onListen} aria-pressed={speaking}>
              {speaking ? <VolumeOff size={15} aria-hidden /> : <Volume2 size={15} aria-hidden />}
              {speaking ? "Stop" : "Listen"}
            </button>
          )}
          <button type="button" className="btn btn-quiet btn-sm" onClick={() => setEditing((e) => !e)} aria-pressed={editing}>
            {editing ? <Check size={15} aria-hidden /> : <Pencil size={15} aria-hidden />}
            {editing ? "Done" : "Edit"}
          </button>
          <button type="button" className="btn btn-quiet btn-sm" onClick={onCopy}>
            {copied ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button type="button" className="btn btn-send btn-sm" onClick={share}>
            <Send size={15} aria-hidden />
            {channel === "sms" ? "Open in Messages" : "Send on WhatsApp"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const FACT_ROWS: { key: keyof NoticeResult["keyDetails"]; label: string }[] = [
  { key: "eventDate", label: "Date" },
  { key: "timings", label: "Time" },
  { key: "venue", label: "Venue" },
  { key: "deadline", label: "Deadline" },
  { key: "feeOrAmount", label: "Fee" },
  { key: "dressCode", label: "What to wear" },
  { key: "contactPerson", label: "Contact" },
];

const isEmpty = (v: string) => /^(not mentioned|none mentioned|n\/a|nil|none)$/i.test(v.trim());

function Details({ result: r, schoolName, onToast }: { result: NoticeResult; schoolName: string; onToast: (m: string) => void }) {
  const canCal = canExportCalendar(r);
  return (
    <div className="details">
      <dl className="facts">
        {FACT_ROWS.map(({ key, label }) => {
          const v = r.keyDetails[key];
          return (
            <div key={key} className={`fact ${isEmpty(v) ? "is-empty" : ""} ${key === "deadline" && !isEmpty(v) ? "is-deadline" : ""}`}>
              <dt>{label}</dt>
              <dd>{v}</dd>
            </div>
          );
        })}
      </dl>
      <div className="details-actions">
        <button
          type="button"
          className="btn btn-quiet btn-sm"
          disabled={!canCal}
          title={canCal ? "Download an .ics file for Google Calendar, Outlook or Apple Calendar" : "No single event date was found"}
          onClick={() => {
            downloadFile(`${slug(r.title)}.ics`, buildIcs(r, schoolName), "text/calendar;charset=utf-8");
            onToast("Calendar file downloaded. Open it to add the event.");
          }}
        >
          <CalendarPlus size={15} aria-hidden />
          Add to calendar
        </button>
        <button type="button" className="btn btn-quiet btn-sm" onClick={() => window.print()}>
          <Printer size={15} aria-hidden />
          Print handout
        </button>
      </div>
    </div>
  );
}

function Checklist({
  result: r,
  checked,
  onToggle,
  onToast,
}: {
  result: NoticeResult;
  checked: Record<string, boolean>;
  onToggle: (id: string) => void;
  onToast: (m: string) => void;
}) {
  const done = r.actionChecklist.filter((a) => checked[a.id]).length;
  const total = r.actionChecklist.length;
  return (
    <div className="checklist">
      <div className="progress" aria-hidden="true">
        <span style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
      </div>
      <ul>
        {r.actionChecklist.map((a) => {
          const isDone = Boolean(checked[a.id]);
          return (
            <li key={a.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={isDone}
                className={`check-item ${isDone ? "is-done" : ""}`}
                onClick={() => onToggle(a.id)}
              >
                {isDone ? <SquareCheck size={18} aria-hidden /> : <Square size={18} aria-hidden />}
                <span className="check-body">
                  <span className="check-task">{a.task}</span>
                  {(a.deadline || a.important) && (
                    <span className="check-meta">
                      {a.important && <span className="req">Required</span>}
                      {a.deadline && <span>{/^within/i.test(a.deadline) ? a.deadline : `By ${a.deadline}`}</span>}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="details-actions">
        <span className="message-meta">
          {done} of {total} done
        </span>
        <button
          type="button"
          className="btn btn-quiet btn-sm"
          onClick={async () => {
            const list = r.actionChecklist
              .map((a, i) => `${i + 1}. ${a.task}${a.deadline ? ` (${a.deadline})` : ""}`)
              .join("\n");
            const ok = await copyText(`${r.title}\n\n${list}`);
            onToast(ok ? "Checklist copied." : "Couldn't copy the checklist.");
          }}
        >
          <Copy size={15} aria-hidden />
          Copy checklist
        </button>
      </div>
    </div>
  );
}
