export interface Language {
  name: string;
  native: string;
  /** BCP-47 tag used to pick a speech-synthesis voice. */
  speech: string;
  rtl?: boolean;
}

export const LANGUAGES: Language[] = [
  { name: "Tamil", native: "தமிழ்", speech: "ta-IN" },
  { name: "Hindi", native: "हिन्दी", speech: "hi-IN" },
  { name: "Telugu", native: "తెలుగు", speech: "te-IN" },
  { name: "Kannada", native: "ಕನ್ನಡ", speech: "kn-IN" },
  { name: "Malayalam", native: "മലയാളം", speech: "ml-IN" },
  { name: "Marathi", native: "मराठी", speech: "mr-IN" },
  { name: "Bengali", native: "বাংলা", speech: "bn-IN" },
  { name: "Gujarati", native: "ગુજરાતી", speech: "gu-IN" },
  { name: "Urdu", native: "اردو", speech: "ur-IN", rtl: true },
  { name: "Arabic", native: "العربية", speech: "ar-SA", rtl: true },
  { name: "Spanish", native: "Español", speech: "es-ES" },
  { name: "French", native: "Français", speech: "fr-FR" },
  { name: "Simple English", native: "Simple English", speech: "en-IN" },
];

export function findLanguage(name: string): Language {
  return LANGUAGES.find((l) => l.name === name) ?? LANGUAGES[0];
}

/**
 * Labels used by the offline engine to produce a partial translation
 * when no AI key is configured. Values (dates, amounts, names) stay as-is.
 */
export interface OfflineLabels {
  heading: string;
  subject: string;
  greeting: string;
  intro: string;
  date: string;
  time: string;
  venue: string;
  fee: string;
  deadline: string;
  contact: string;
  actions: string;
  closing: string;
  signature: string;
}

export const OFFLINE_LABELS: Record<string, OfflineLabels> = {
  Tamil: {
    heading: "பெற்றோருக்கான அறிவிப்பு",
    subject: "பொருள்",
    greeting: "அன்புள்ள பெற்றோர்களே,",
    intro: "பள்ளி சுற்றறிக்கையின் முக்கிய விவரங்கள்:",
    date: "தேதி",
    time: "நேரம்",
    venue: "இடம்",
    fee: "கட்டணம்",
    deadline: "கடைசி தேதி",
    contact: "தொடர்புக்கு",
    actions: "பெற்றோர் செய்ய வேண்டியவை",
    closing: "நன்றி,",
    signature: "பள்ளி நிர்வாகம்",
  },
  Hindi: {
    heading: "अभिभावकों के लिए सूचना",
    subject: "विषय",
    greeting: "प्रिय अभिभावकगण,",
    intro: "विद्यालय परिपत्र की मुख्य बातें:",
    date: "तारीख",
    time: "समय",
    venue: "स्थान",
    fee: "शुल्क",
    deadline: "अंतिम तिथि",
    contact: "संपर्क",
    actions: "अभिभावकों के लिए आवश्यक कार्य",
    closing: "धन्यवाद,",
    signature: "विद्यालय प्रशासन",
  },
  Telugu: {
    heading: "తల్లిదండ్రులకు ముఖ్య సమాచారం",
    subject: "విషయం",
    greeting: "ప్రియమైన తల్లిదండ్రులకు,",
    intro: "పాఠశాల సర్క్యులర్‌లోని ముఖ్యాంశాలు:",
    date: "తేదీ",
    time: "సమయం",
    venue: "స్థలం",
    fee: "రుసుము",
    deadline: "చివరి తేదీ",
    contact: "సంప్రదించండి",
    actions: "తల్లిదండ్రులు చేయవలసినవి",
    closing: "ధన్యవాదాలు,",
    signature: "పాఠశాల యాజమాన్యం",
  },
  Kannada: {
    heading: "ಪೋಷಕರಿಗೆ ಸೂಚನೆ",
    subject: "ವಿಷಯ",
    greeting: "ಆತ್ಮೀಯ ಪೋಷಕರೇ,",
    intro: "ಶಾಲಾ ಸುತ್ತೋಲೆಯ ಮುಖ್ಯಾಂಶಗಳು:",
    date: "ದಿನಾಂಕ",
    time: "ಸಮಯ",
    venue: "ಸ್ಥಳ",
    fee: "ಶುಲ್ಕ",
    deadline: "ಕೊನೆಯ ದಿನಾಂಕ",
    contact: "ಸಂಪರ್ಕಿಸಿ",
    actions: "ಪೋಷಕರು ಮಾಡಬೇಕಾದವು",
    closing: "ಧನ್ಯವಾದಗಳು,",
    signature: "ಶಾಲಾ ಆಡಳಿತ ಮಂಡಳಿ",
  },
  Malayalam: {
    heading: "രക്ഷിതാക്കൾക്കുള്ള അറിയിപ്പ്",
    subject: "വിഷയം",
    greeting: "പ്രിയ രക്ഷിതാക്കളേ,",
    intro: "സ്കൂൾ സർക്കുലറിലെ പ്രധാന വിവരങ്ങൾ:",
    date: "തീയതി",
    time: "സമയം",
    venue: "സ്ഥലം",
    fee: "ഫീസ്",
    deadline: "അവസാന തീയതി",
    contact: "ബന്ധപ്പെടുക",
    actions: "രക്ഷിതാക്കൾ ചെയ്യേണ്ടവ",
    closing: "നന്ദി,",
    signature: "സ്കൂൾ മാനേജ്മെന്റ്",
  },
  Marathi: {
    heading: "पालकांसाठी सूचना",
    subject: "विषय",
    greeting: "प्रिय पालक,",
    intro: "शाळेच्या परिपत्रकातील महत्त्वाचे मुद्दे:",
    date: "दिनांक",
    time: "वेळ",
    venue: "ठिकाण",
    fee: "शुल्क",
    deadline: "अंतिम तारीख",
    contact: "संपर्क",
    actions: "पालकांनी करावयाच्या गोष्टी",
    closing: "धन्यवाद,",
    signature: "शाळा प्रशासन",
  },
  Bengali: {
    heading: "অভিভাবকদের জন্য বিজ্ঞপ্তি",
    subject: "বিষয়",
    greeting: "প্রিয় অভিভাবকগণ,",
    intro: "স্কুলের বিজ্ঞপ্তির মূল তথ্য:",
    date: "তারিখ",
    time: "সময়",
    venue: "স্থান",
    fee: "ফি",
    deadline: "শেষ তারিখ",
    contact: "যোগাযোগ",
    actions: "অভিভাবকদের করণীয়",
    closing: "ধন্যবাদ,",
    signature: "বিদ্যালয় কর্তৃপক্ষ",
  },
  Gujarati: {
    heading: "વાલીઓ માટે સૂચના",
    subject: "વિષય",
    greeting: "પ્રિય વાલીઓ,",
    intro: "શાળાના પરિપત્રની મુખ્ય વિગતો:",
    date: "તારીખ",
    time: "સમય",
    venue: "સ્થળ",
    fee: "ફી",
    deadline: "છેલ્લી તારીખ",
    contact: "સંપર્ક",
    actions: "વાલીઓએ કરવાનું",
    closing: "આભાર,",
    signature: "શાળા વહીવટ",
  },
  Urdu: {
    heading: "والدین کے لیے اطلاع",
    subject: "موضوع",
    greeting: "محترم والدین،",
    intro: "اسکول سرکلر کی اہم تفصیلات:",
    date: "تاریخ",
    time: "وقت",
    venue: "مقام",
    fee: "فیس",
    deadline: "آخری تاریخ",
    contact: "رابطہ",
    actions: "والدین کے کرنے کے کام",
    closing: "شکریہ،",
    signature: "اسکول انتظامیہ",
  },
  Arabic: {
    heading: "إشعار لأولياء الأمور",
    subject: "الموضوع",
    greeting: "أولياء الأمور الكرام،",
    intro: "أهم ما ورد في تعميم المدرسة:",
    date: "التاريخ",
    time: "الوقت",
    venue: "المكان",
    fee: "الرسوم",
    deadline: "آخر موعد",
    contact: "للتواصل",
    actions: "المطلوب من أولياء الأمور",
    closing: "مع الشكر،",
    signature: "إدارة المدرسة",
  },
  Spanish: {
    heading: "Aviso para las familias",
    subject: "Asunto",
    greeting: "Estimadas familias:",
    intro: "Puntos clave del comunicado escolar:",
    date: "Fecha",
    time: "Horario",
    venue: "Lugar",
    fee: "Importe",
    deadline: "Fecha límite",
    contact: "Contacto",
    actions: "Lo que deben hacer",
    closing: "Atentamente,",
    signature: "Dirección del colegio",
  },
  French: {
    heading: "Avis aux parents",
    subject: "Objet",
    greeting: "Chers parents,",
    intro: "Points essentiels de la circulaire :",
    date: "Date",
    time: "Horaires",
    venue: "Lieu",
    fee: "Montant",
    deadline: "Date limite",
    contact: "Contact",
    actions: "À faire par les parents",
    closing: "Cordialement,",
    signature: "La direction",
  },
};
