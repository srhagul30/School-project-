"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { HistoryEntry } from "@/lib/storage";

interface Props {
  entries: HistoryEntry[];
  onOpen: (e: HistoryEntry) => void;
  onClear: () => void;
  icon: ReactNode;
}

const fmt = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export function HistoryMenu({ entries, onOpen, onClear, icon }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="menu" ref={ref}>
      <button
        type="button"
        className="btn btn-quiet"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
      >
        {icon}
        <span className="hide-sm">Recent</span>
        {entries.length > 0 && <span className="count">{entries.length}</span>}
      </button>
      {open && (
        <div className="menu-pop" role="menu">
          {entries.length === 0 ? (
            <p className="menu-empty">Notices you write will be listed here, in this browser only.</p>
          ) : (
            <>
              <ul>
                {entries.map((e) => (
                  <li key={e.id}>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        onOpen(e);
                        setOpen(false);
                      }}
                    >
                      <span className="menu-title">{e.result.title}</span>
                      <span className="menu-meta">
                        {e.schoolName || "School"}, {e.result.targetLanguage}, {fmt.format(e.savedAt)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <button type="button" className="menu-clear" onClick={onClear}>
                Clear recent notices
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
