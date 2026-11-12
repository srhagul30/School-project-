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

export interface ChecklistItem {
  id: string;
  task: string;
  deadline?: string;
  important: boolean;
}

export interface Faq {
  question: string;
  answer: string;
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
  actionChecklist: ChecklistItem[];
  faqs: Faq[];
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
    translationNote?: string;
    /** Set when Gemini was requested but failed and we fell back. */
    fallbackReason?: string;
  };
}

export interface ProcessRequest {
  circularText: string;
  schoolName: string;
  targetLanguage: string;
  tone: Tone;
  useEmoji: boolean;
}
