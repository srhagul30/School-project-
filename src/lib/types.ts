export type Urgency = "High" | "Medium" | "Low";

export type Category =
  | "Exams"
  | "Events"
  | "Fees & Permissions"
  | "Emergency"
  | "Trips"
  | "General";

export type Tone = "friendly" | "formal" | "brief" | "urgent";

export interface KeyDetails {
  eventDate: string;
  timings: string;
  venue: string;
  feeOrAmount: string;
  dressCode: string;
  deadline: string;
  contactPerson: string;
}

/** A fact found in the circular, as UTF-16 offsets into the processed text. */
export interface FactSpan {
  start: number;
  end: number;
  kind: "date" | "time" | "money" | "contact";
}

/** Machine-readable event timing, used for the "Add to calendar" export. */
export interface CalendarHint {
  /** YYYY-MM-DD, or empty when no single event date exists. */
  date: string;
  /** HH:MM, 24-hour, or empty. */
  start: string;
  /** HH:MM, 24-hour, or empty. */
  end: string;
}

export interface NoticeResult {
  title: string;
  urgency: Urgency;
  category: Category;
  whatsappNotice: string;
  translatedNotice: string;
  smsNotice: string;
  audioScript: string;
  targetLanguage: string;
  keyDetails: KeyDetails;
  calendar: CalendarHint;
  spans: FactSpan[];
  meta: {
    engine: "gemini" | "offline";
    model: string;
    originalWords: number;
    summaryWords: number;
    /** Seconds to read the original circular, at 200 wpm. */
    originalReadSeconds: number;
    /** Seconds to read the WhatsApp message, at 200 wpm. */
    summaryReadSeconds: number;
    /** Set when the offline engine could only partially translate. */
    translationNote?: string | null;
    /** Set when Gemini was requested but failed and we fell back. */
    fallbackReason?: string;
  };
}

