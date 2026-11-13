"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { History, Settings2 } from "lucide-react";
import { CircularPanel } from "./CircularPanel";
import { ResultPanel } from "./ResultPanel";
import { SettingsDialog } from "./SettingsDialog";
import { HistoryMenu } from "./HistoryMenu";
import { Toast, useToast } from "./Toast";
import { SAMPLES } from "@/lib/samples";
import {
  HISTORY_LIMIT,
  KEYS,
  isCurrentResult,
  load,
  save,
  type Draft,
  type HistoryEntry,
  type Settings,
} from "@/lib/storage";
import type { NoticeResult } from "@/lib/types";

const DEFAULT_SETTINGS: Settings = { apiKey: "", language: "Tamil", tone: "friendly", useEmoji: true };
const DEFAULT_DRAFT: Draft = { schoolName: SAMPLES[0].schoolName, circularText: SAMPLES[0].text };

export function NoticeApp() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [draft, setDraft] = useState<Draft>(DEFAULT_DRAFT);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [serverAi, setServerAi] = useState<boolean | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NoticeResult | null>(null);
  const [resultId, setResultId] = useState<string>("");
  const [resultSchool, setResultSchool] = useState("");
  // The exact text the current result was made from; fact highlights only apply to it.
  const [processedText, setProcessedText] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { toast, showToast } = useToast();
  const resultRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  /* Restore saved state once, after hydration. */
  useEffect(() => {
    const restore = () => {
      setSettings({ ...DEFAULT_SETTINGS, ...load<Partial<Settings>>(KEYS.settings, {}) });
      setDraft(load<Draft>(KEYS.draft, DEFAULT_DRAFT));
      setHistory(load<HistoryEntry[]>(KEYS.history, []).filter((h) => isCurrentResult(h.result)));
      setHydrated(true);
    };
    restore();
    fetch("/api/py/status")
      .then((r) => r.json())
      .then((d) => setServerAi(Boolean(d.serverAi)))
      .catch(() => setServerAi(false));
  }, []);

  useEffect(() => {
    if (hydrated) save(KEYS.settings, settings);
  }, [settings, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => save(KEYS.draft, draft), 400);
    return () => clearTimeout(t);
  }, [draft, hydrated]);

  const aiActive = Boolean(settings.apiKey) || serverAi === true;

  const generate = useCallback(async () => {
    if (loading) return;
    const text = draft.circularText.trim();
    if (text.length < 40) {
      setError("Paste the full circular first — a few sentences at least.");
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/py/process-notice", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(settings.apiKey ? { "x-gemini-key": settings.apiKey } : {}),
        },
        body: JSON.stringify({
          circularText: text,
          schoolName: draft.schoolName,
          targetLanguage: settings.language,
          tone: settings.tone,
          useEmoji: settings.useEmoji,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.error || (typeof data.detail === "string" ? data.detail : "");
        throw new Error(
          msg || (res.status >= 500 ? "The Python API isn't responding. If you're running locally, start it with npm run dev." : `The server returned an error (${res.status}).`)
        );
      }

      const r = data as NoticeResult;
      const id = `${Date.now()}`;
      setResult(r);
      setResultId(id);
      setResultSchool(draft.schoolName || "School");
      setProcessedText(text);

      const entry: HistoryEntry = {
        id,
        savedAt: Date.now(),
        schoolName: draft.schoolName,
        circularText: text,
        result: r,
      };
      setHistory((prev) => {
        const next = [entry, ...prev.filter((h) => h.circularText !== text || h.result.targetLanguage !== r.targetLanguage)].slice(0, HISTORY_LIMIT);
        save(KEYS.history, next);
        return next;
      });

      if (r.meta.fallbackReason) {
        showToast("Gemini didn't respond, so the offline reader was used.");
      }
      requestAnimationFrame(() => {
        if (window.matchMedia("(max-width: 960px)").matches) {
          resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError((err as Error).message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }, [draft, settings, loading, showToast]);

  /* Ctrl/Cmd + Enter generates from anywhere on the page. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        generate();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [generate]);

  const openHistory = (h: HistoryEntry) => {
    setDraft({ schoolName: h.schoolName, circularText: h.circularText });
    setResult(h.result);
    setResultId(h.id);
    setResultSchool(h.schoolName || "School");
    setProcessedText(h.circularText);
    setError(null);
  };

  const clearHistory = () => {
    setHistory([]);
    save(KEYS.history, []);
  };

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="wordmark" aria-label="NoticeBridge home">
            NoticeBridge
          </Link>
          <div className="header-actions">
            <span className={`engine-status ${aiActive ? "is-ai" : ""}`} title={aiActive ? "Messages are written by Gemini" : "Using the built-in reader. Add a Gemini key in Settings for full translations."}>
              <span className="engine-dot" aria-hidden="true" />
              <span className="hide-sm">
                {serverAi === null && !settings.apiKey ? "Checking…" : aiActive ? "Gemini connected" : "Offline reader"}
              </span>
            </span>
            <HistoryMenu entries={history} onOpen={openHistory} onClear={clearHistory} icon={<History size={16} aria-hidden />} />
            <button type="button" className="btn btn-quiet" onClick={() => setSettingsOpen(true)}>
              <Settings2 size={16} aria-hidden />
              <span className="hide-sm">Settings</span>
            </button>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="intro container">
          <h1>Turn a three-page circular into a message parents will read.</h1>
          <p>
            Paste or upload a school circular. Get a WhatsApp-ready notice, a version in the parents&rsquo; language,
            the key dates and a checklist of what they need to do.
          </p>
        </section>

        <section className="workspace container" aria-label="Notice workspace">
          <CircularPanel
            draft={draft}
            onDraftChange={setDraft}
            settings={settings}
            onSettingsChange={(s) => setSettings((prev) => ({ ...prev, ...s }))}
            loading={loading}
            error={error}
            onGenerate={generate}
            onError={setError}
            marks={result && !loading && draft.circularText.trim() === processedText ? result.spans : null}
            hasResult={Boolean(result)}
          />
          <div ref={resultRef} className="result-column">
            <ResultPanel
              key={resultId}
              result={result}
              loading={loading}
              language={settings.language}
              schoolName={resultSchool}
              onToast={showToast}
            />
          </div>
        </section>
      </main>

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        apiKey={settings.apiKey}
        serverAi={serverAi === true}
        onSave={(apiKey) => {
          setSettings((s) => ({ ...s, apiKey }));
          showToast(apiKey ? "Gemini key saved in this browser." : "Gemini key removed.");
        }}
      />
      <Toast message={toast} />
    </>
  );
}
