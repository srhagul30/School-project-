"use client";

import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { FileUp, Loader2 } from "lucide-react";
import { SAMPLES } from "@/lib/samples";
import { LANGUAGES } from "@/lib/languages";
import { findSpans, wordCount, type SpanKind } from "@/lib/extract";
import type { Draft, Settings } from "@/lib/storage";

const TONES: { value: Settings["tone"]; label: string }[] = [
  { value: "friendly", label: "Friendly" },
  { value: "formal", label: "Formal" },
  { value: "brief", label: "Brief" },
  { value: "urgent", label: "Urgent" },
];

const KIND_LABEL: Record<SpanKind, string> = {
  date: "Dates",
  time: "Times",
  money: "Amounts",
  contact: "Contacts",
};

interface Props {
  draft: Draft;
  onDraftChange: (d: Draft) => void;
  settings: Settings;
  onSettingsChange: (s: Partial<Settings>) => void;
  loading: boolean;
  error: string | null;
  onGenerate: () => void;
  onError: (msg: string | null) => void;
  showMarks: boolean;
}

export function CircularPanel({
  draft,
  onDraftChange,
  settings,
  onSettingsChange,
  loading,
  error,
  onGenerate,
  onError,
  showMarks,
}: Props) {
  const [view, setView] = useState<"edit" | "marked">("edit");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    const detect = () => setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
    detect();
  }, []);

  // Show the marked-up circular as soon as the first result arrives.
  const [prevShowMarks, setPrevShowMarks] = useState(showMarks);
  if (showMarks !== prevShowMarks) {
    setPrevShowMarks(showMarks);
    if (showMarks) setView("marked");
  }

  const words = wordCount(draft.circularText);
  const spans = useMemo(() => findSpans(draft.circularText), [draft.circularText]);
  const counts = useMemo(() => {
    const c: Partial<Record<SpanKind, number>> = {};
    for (const s of spans) c[s.kind] = (c[s.kind] ?? 0) + 1;
    return c;
  }, [spans]);

  const activeSample = SAMPLES.find((s) => s.text === draft.circularText)?.id;

  async function readFile(file: File) {
    onError(null);
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      setUploading(true);
      try {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/extract-text", { method: "POST", body: form });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Couldn't read that PDF.");
        onDraftChange({ ...draft, circularText: data.text });
        setView("edit");
      } catch (e) {
        onError((e as Error).message);
      } finally {
        setUploading(false);
      }
      return;
    }
    if (file.type.startsWith("text/") || /\.(txt|md)$/i.test(file.name)) {
      const text = await file.text();
      onDraftChange({ ...draft, circularText: text });
      setView("edit");
      return;
    }
    onError("Upload a PDF or a .txt file. For Word documents, copy the text and paste it here.");
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  }

  return (
    <div className="panel panel-input">
      <div className="panel-head">
        <h2 className="panel-title">Circular</h2>
        <div className="panel-tools">
          <button
            type="button"
            className="btn btn-quiet btn-sm"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 size={15} className="spin" aria-hidden /> : <FileUp size={15} aria-hidden />}
            {uploading ? "Reading PDF…" : "Upload PDF"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,.pdf,text/plain,.txt,.md"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) readFile(f);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      <div className="samples" role="group" aria-label="Sample circulars">
        <span className="samples-label">Try a sample</span>
        {SAMPLES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`chip ${activeSample === s.id ? "is-active" : ""}`}
            aria-pressed={activeSample === s.id}
            onClick={() => {
              onDraftChange({ schoolName: s.schoolName, circularText: s.text });
              onSettingsChange({ language: s.language });
              onError(null);
              setView("edit");
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <label className="field">
        <span className="field-label">School name</span>
        <input
          className="input"
          value={draft.schoolName}
          onChange={(e) => onDraftChange({ ...draft, schoolName: e.target.value })}
          placeholder="Taken from the circular if left blank"
          autoComplete="organization"
        />
      </label>

      <div className="sheet-wrap">
        <div className="sheet-bar">
          {showMarks ? (
            <div className="segmented" role="tablist" aria-label="Circular view">
              <button role="tab" type="button" aria-selected={view === "edit"} onClick={() => { setView("edit"); requestAnimationFrame(() => textRef.current?.focus()); }}>
                Edit text
              </button>
              <button role="tab" type="button" aria-selected={view === "marked"} onClick={() => setView("marked")}>
                Marked facts
              </button>
            </div>
          ) : (
            <span className="sheet-hint">Paste the text, or drop a PDF here.</span>
          )}
          <span className="sheet-count">
            {words.toLocaleString()} {words === 1 ? "word" : "words"}
            {words > 0 && <> &middot; {Math.max(1, Math.round(words / 200))} min read</>}
          </span>
        </div>

        <div
          className={`sheet ${dragging ? "is-dragging" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          {view === "marked" && showMarks ? (
            <MarkedText text={draft.circularText} spans={spans} />
          ) : (
            <textarea
              ref={textRef}
              className="sheet-text"
              value={draft.circularText}
              onChange={(e) => onDraftChange({ ...draft, circularText: e.target.value })}
              placeholder={"Paste the full circular here, including the subject line and any numbered instructions."}
              spellCheck={false}
              aria-label="Circular text"
            />
          )}
          {dragging && <div className="drop-hint">Drop a PDF or text file</div>}
        </div>

        {view === "marked" && showMarks && (
          <div className="legend" aria-label="Highlight legend">
            {(Object.keys(KIND_LABEL) as SpanKind[]).map((k) => (
              <span key={k} className={`legend-item mark-${k}`}>
                <i aria-hidden="true" />
                {KIND_LABEL[k]} <b>{counts[k] ?? 0}</b>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="options">
        <label className="field">
          <span className="field-label">Parents&rsquo; language</span>
          <select
            className="input select"
            value={settings.language}
            onChange={(e) => onSettingsChange({ language: e.target.value })}
          >
            {LANGUAGES.map((l) => (
              <option key={l.name} value={l.name}>
                {l.name === l.native ? l.name : `${l.name} — ${l.native}`}
              </option>
            ))}
          </select>
        </label>

        <div className="field">
          <span className="field-label" id="tone-label">Tone</span>
          <div className="segmented segmented-fill" role="radiogroup" aria-labelledby="tone-label">
            {TONES.map((t) => (
              <button
                key={t.value}
                type="button"
                role="radio"
                aria-checked={settings.tone === t.value}
                onClick={() => onSettingsChange({ tone: t.value })}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <label className="check">
        <input
          type="checkbox"
          checked={settings.useEmoji}
          onChange={(e) => onSettingsChange({ useEmoji: e.target.checked })}
        />
        <span>Use emoji as line markers in the WhatsApp message</span>
      </label>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="generate-row">
        <button type="button" className="btn btn-primary btn-lg" onClick={onGenerate} disabled={loading || uploading}>
          {loading ? (
            <>
              <Loader2 size={18} className="spin" aria-hidden /> Writing the message…
            </>
          ) : (
            "Write parent message"
          )}
        </button>
        <kbd className="shortcut" aria-label="Keyboard shortcut">
          {isMac ? "⌘" : "Ctrl"} + Enter
        </kbd>
      </div>
    </div>
  );
}

function MarkedText({ text, spans }: { text: string; spans: ReturnType<typeof findSpans> }) {
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  spans.forEach((s, i) => {
    if (s.start > cursor) parts.push(text.slice(cursor, s.start));
    parts.push(
      <mark key={i} className={`mark-${s.kind}`}>
        {text.slice(s.start, s.end)}
      </mark>
    );
    cursor = s.end;
  });
  parts.push(text.slice(cursor));
  return (
    <div className="sheet-text sheet-marked" tabIndex={0} aria-label="Circular with extracted facts highlighted">
      {parts}
    </div>
  );
}
