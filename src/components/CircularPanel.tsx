"use client";

import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { Download, FileText, FileUp, Loader2 } from "lucide-react";
import { SAMPLES, type SampleCircular } from "@/lib/samples";
import { LANGUAGES } from "@/lib/languages";
import type { Draft, Settings } from "@/lib/storage";
import type { FactSpan } from "@/lib/types";

const TONES: { value: Settings["tone"]; label: string }[] = [
  { value: "friendly", label: "Friendly" },
  { value: "formal", label: "Formal" },
  { value: "brief", label: "Brief" },
  { value: "urgent", label: "Urgent" },
];

const KIND_LABEL: Record<FactSpan["kind"], string> = {
  date: "Dates",
  time: "Times",
  money: "Amounts",
  contact: "Contacts",
};

const wordCount = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;

interface Props {
  draft: Draft;
  onDraftChange: (d: Draft) => void;
  settings: Settings;
  onSettingsChange: (s: Partial<Settings>) => void;
  loading: boolean;
  error: string | null;
  onGenerate: () => void;
  onError: (msg: string | null) => void;
  /** Fact spans from the Python API, or null when the text no longer matches the result. */
  marks: FactSpan[] | null;
  hasResult: boolean;
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
  marks,
  hasResult,
}: Props) {
  const [view, setView] = useState<"edit" | "marked">("edit");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    const detect = () => setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
    detect();
  }, []);

  // Switch to the marked-up circular whenever a fresh set of marks arrives.
  const [prevMarks, setPrevMarks] = useState(marks);
  if (marks !== prevMarks) {
    setPrevMarks(marks);
    setView(marks ? "marked" : "edit");
  }

  const words = wordCount(draft.circularText);
  const counts = useMemo(() => {
    const c: Partial<Record<FactSpan["kind"], number>> = {};
    for (const s of marks ?? []) c[s.kind] = (c[s.kind] ?? 0) + 1;
    return c;
  }, [marks]);

  const activeSample = SAMPLES.find((s) => s.text === draft.circularText)?.id;

  async function uploadPdf(file: File, schoolName?: string) {
    onError(null);
    setUploading(file.name);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/py/extract-text", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Couldn't read that PDF.");
      onDraftChange({ schoolName: schoolName ?? draft.schoolName, circularText: data.text });
      setView("edit");
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setUploading(null);
    }
  }

  async function readFile(file: File) {
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      return uploadPdf(file);
    }
    if (file.type.startsWith("text/") || /\.(txt|md)$/i.test(file.name)) {
      onError(null);
      onDraftChange({ ...draft, circularText: await file.text() });
      setView("edit");
      return;
    }
    onError("Upload a PDF or a .txt file. For Word documents, copy the text and paste it here.");
  }

  /** Sends a demo PDF through the same upload path a real PDF takes. */
  async function loadDemoPdf(s: SampleCircular) {
    try {
      const blob = await fetch(`/demo/${s.file}`).then((r) => {
        if (!r.ok) throw new Error();
        return r.blob();
      });
      onSettingsChange({ language: s.language });
      await uploadPdf(new File([blob], s.file, { type: "application/pdf" }), s.schoolName);
    } catch {
      onError("Couldn't load that demo PDF.");
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  }

  const showMarked = view === "marked" && marks;

  return (
    <div className="panel panel-input">
      <div className="panel-head">
        <h2 className="panel-title">Circular</h2>
        <div className="panel-tools">
          <button
            type="button"
            className="btn btn-quiet btn-sm"
            onClick={() => fileRef.current?.click()}
            disabled={Boolean(uploading)}
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

      <details className="demo-pdfs">
        <summary>
          <FileText size={15} aria-hidden />
          Demo PDFs from a Salem school
          <span className="demo-count">{SAMPLES.length}</span>
        </summary>
        <p className="demo-intro">
          Real-looking circulars from a fictional matriculation school in Fairlands, Salem. Upload one to see the PDF
          reader at work, or download them to use in a presentation.
        </p>
        <ul>
          {SAMPLES.map((s) => (
            <li key={s.id}>
              <span className="demo-name">{s.label}</span>
              <span className="demo-actions">
                <button
                  type="button"
                  className="btn btn-quiet btn-sm"
                  onClick={() => loadDemoPdf(s)}
                  disabled={Boolean(uploading)}
                >
                  {uploading === s.file ? <Loader2 size={14} className="spin" aria-hidden /> : <FileUp size={14} aria-hidden />}
                  Upload
                </button>
                <a className="btn btn-quiet btn-sm" href={`/demo/${s.file}`} download>
                  <Download size={14} aria-hidden />
                  <span className="sr-only">Download {s.label} PDF</span>
                </a>
              </span>
            </li>
          ))}
        </ul>
      </details>

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
          {marks ? (
            <div className="segmented" role="tablist" aria-label="Circular view">
              <button
                role="tab"
                type="button"
                aria-selected={view === "edit"}
                onClick={() => {
                  setView("edit");
                  requestAnimationFrame(() => textRef.current?.focus());
                }}
              >
                Edit text
              </button>
              <button role="tab" type="button" aria-selected={view === "marked"} onClick={() => setView("marked")}>
                Marked facts
              </button>
            </div>
          ) : (
            <span className="sheet-hint">
              {hasResult ? "Text changed. Write the message again to refresh the marked facts." : "Paste the text, or drop a PDF here."}
            </span>
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
          {showMarked ? (
            <MarkedText text={draft.circularText.trim()} spans={marks} />
          ) : (
            <textarea
              ref={textRef}
              className="sheet-text"
              value={draft.circularText}
              onChange={(e) => onDraftChange({ ...draft, circularText: e.target.value })}
              placeholder="Paste the full circular here, including the subject line and any numbered instructions."
              spellCheck={false}
              aria-label="Circular text"
            />
          )}
          {dragging && <div className="drop-hint">Drop a PDF or text file</div>}
        </div>

        {showMarked && (
          <div className="legend" aria-label="Highlight legend">
            {(Object.keys(KIND_LABEL) as FactSpan["kind"][]).map((k) => (
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
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={onGenerate}
          disabled={loading || Boolean(uploading)}
        >
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

function MarkedText({ text, spans }: { text: string; spans: FactSpan[] }) {
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  spans.forEach((s, i) => {
    if (s.start < cursor || s.end > text.length) return;
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
