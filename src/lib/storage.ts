"use client";

import type { NoticeResult } from "./types";

/** Browser storage can be missing or throw (private mode, quotas); never let it break the app. */
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export const KEYS = {
  settings: "nb:settings",
  draft: "nb:draft",
  history: "nb:history",
};

export interface Settings {
  apiKey: string;
  language: string;
  tone: "friendly" | "formal" | "brief" | "urgent";
  useEmoji: boolean;
}

export interface Draft {
  schoolName: string;
  circularText: string;
}

export interface HistoryEntry {
  id: string;
  savedAt: number;
  schoolName: string;
  circularText: string;
  result: NoticeResult;
}

export const HISTORY_LIMIT = 12;
