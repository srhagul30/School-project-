"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  apiKey: string;
  serverAi: boolean;
  onSave: (key: string) => void;
}

export function SettingsDialog({ open, onClose, apiKey, serverAi, onSave }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [value, setValue] = useState(apiKey);
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  // Reset the field to the saved value each time the dialog opens.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setValue(apiKey);
      setReveal(false);
    }
  }

  return (
    <dialog
      ref={ref}
      className="dialog"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="settings-title"
    >
      <form
        method="dialog"
        className="dialog-body"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(value.trim());
          onClose();
        }}
      >
        <div className="dialog-head">
          <h2 id="settings-title">Settings</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close settings">
            <X size={18} />
          </button>
        </div>

        <p className="muted">
          NoticeBridge works without AI using its built-in reader. With a Gemini key, messages are written by
          Google&rsquo;s Gemini and translated in full.
        </p>

        {serverAi && (
          <p className="callout">This deployment already has a Gemini key configured. You only need your own key to use a different account.</p>
        )}

        <label className="field">
          <span className="field-label">Your Gemini API key</span>
          <div className="input-group">
            <input
              className="input mono"
              type={reveal ? "text" : "password"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="AIza…"
              autoComplete="off"
              spellCheck={false}
            />
            <button type="button" className="btn btn-quiet btn-sm" onClick={() => setReveal((r) => !r)}>
              {reveal ? "Hide" : "Show"}
            </button>
          </div>
          <span className="field-help">
            Stored only in this browser and sent with each request over HTTPS. Get a free key from{" "}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">
              Google AI Studio
            </a>
            .
          </span>
        </label>

        <div className="dialog-actions">
          {apiKey && (
            <button
              type="button"
              className="btn btn-quiet btn-danger"
              onClick={() => {
                onSave("");
                onClose();
              }}
            >
              Remove key
            </button>
          )}
          <span className="spacer" />
          <button type="button" className="btn btn-quiet" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save key
          </button>
        </div>
      </form>
    </dialog>
  );
}
