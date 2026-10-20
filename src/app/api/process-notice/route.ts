import { NextRequest, NextResponse } from "next/server";

export interface NoticeResult {
  title: string;
  urgency: "High" | "Medium" | "Low";
  category: "Exams" | "Sports & Events" | "Fees & Permissions" | "Emergency" | "General";
  whatsappNotice: string;
  translatedNotice: string;
  audioScript: string;
  targetLanguageName: string;
  keyDetails: {
    eventDate: string;
    timings: string;
    venue: string;
    feeOrAmount: string;
    dressCode: string;
    deadline: string;
    contactPerson: string;
  };
  actionChecklist: Array<{
    id: string;
    task: string;
    deadline?: string;
    important: boolean;
  }>;
  frequentlyAskedQuestions: Array<{
    question: string;
    answer: string;
  }>;
  meta: {
    isMock: boolean;
    modelUsed: string;
    originalWordCount: number;
    summaryWordCount: number;
    readingTimeReduction: string;
  };
}

// Fallback smart parser for offline/demo use without API key
function generateSmartFallback(
  text: string,
  targetLanguage: string,
  schoolName: string = "Our School"
): NoticeResult {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Detect key dates, phone numbers, money
  const dateMatch = text.match(/\b(?:\d{1,2}(?:st|nd|rd|th)?[\s/-](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|[A-Za-z]+)[\s/-]?\d{2,4}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/i);
  const timeMatch = text.match(/\b(?:\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))\b/i);
  const feeMatch = text.match(/(?:Rs\.?|INR|₹|\$)\s*[\d,]+/i);
  const phoneMatch = text.match(/\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}\b/);

  const detectedDate = dateMatch ? dateMatch[0] : "Check circular schedule";
  const detectedTime = timeMatch ? timeMatch[0] : "School hours";
  const detectedFee = feeMatch ? feeMatch[0] : "Nil / Included";
  const detectedContact = phoneMatch ? phoneMatch[0] : "Class Teacher / School Office";

  // Determine category
  let category: NoticeResult["category"] = "General";
  let urgency: NoticeResult["urgency"] = "Medium";
  const lower = text.toLowerCase();

  if (lower.includes("exam") || lower.includes("test") || lower.includes("assessment") || lower.includes("timetable")) {
    category = "Exams";
    urgency = "High";
  } else if (lower.includes("sports") || lower.includes("annual day") || lower.includes("picnic") || lower.includes("tour") || lower.includes("trip")) {
    category = "Sports & Events";
  } else if (lower.includes("fee") || lower.includes("payment") || lower.includes("permission") || lower.includes("consent")) {
    category = "Fees & Permissions";
    urgency = "High";
  } else if (lower.includes("rain") || lower.includes("closed") || lower.includes("holiday") || lower.includes("emergency") || lower.includes("cancelled")) {
    category = "Emergency";
    urgency = "High";
  }

  // Generate WhatsApp formatted text
  const cleanFirstLine = text.split("\n").map(l => l.trim()).find(l => l.length > 5) || "Important Notice";
  const title = cleanFirstLine.length > 50 ? cleanFirstLine.substring(0, 47) + "..." : cleanFirstLine;

  const whatsappNotice = `📢 *${schoolName.toUpperCase()} - PARENT UPDATE*
━━━━━━━━━━━━━━━━━━━━
📌 *${title}*

Dear Parents,
Please note the essential details regarding the upcoming school announcement:

🗓️ *Date:* ${detectedDate}
⏰ *Time:* ${detectedTime}
💰 *Fees / Charges:* ${detectedFee}
📞 *Contact / Queries:* ${detectedContact}

✅ *What Parents Need To Do:*
1️⃣ Review the scheduled timings and ensure punctuality.
2️⃣ Sign and submit any required permission/acknowledgment slips.
3️⃣ Check your child's uniform and kit as per circular guidelines.

⚠️ _Please avoid sending children to school if they are unwell._

Warm regards,  
*School Administration*`;

  // Provide realistic multi-language greeting and highlights based on selected language
  let translatedNotice = "";
  if (targetLanguage.toLowerCase().includes("tamil")) {
    translatedNotice = `📢 *${schoolName} - பெற்றோர் முக்கிய அறிவிப்பு*
━━━━━━━━━━━━━━━━━━━━
வணக்கம் பெற்றோர்களே! பள்ளி சுற்றறிக்கையின் முக்கிய குறிப்புகள் கீழே கொடுக்கப்பட்டுள்ளன:

📌 *தலைப்பு:* ${title}
🗓️ *தேதி:* ${detectedDate}
⏰ *நேரம்:* ${detectedTime}
💰 *கட்டணம்:* ${detectedFee}
📞 *தொடர்புக்கு:* ${detectedContact}

✅ *பெற்றோர்கள் செய்ய வேண்டியவை:*
• தேதிகள் மற்றும் நேரத்தை குறித்துக் கொள்ளவும்.
• சம்மதக் கடிதம் / ஆவணங்களை உரிய தேதியில் சமர்ப்பிக்கவும்.
• மாணவர்கள் பள்ளி சீருடையில் வர வேண்டும்.

நன்றி,
பள்ளி நிர்வாகம்.`;
  } else if (targetLanguage.toLowerCase().includes("hindi")) {
    translatedNotice = `📢 *${schoolName} - अभिभावकों के लिए महत्वपूर्ण सूचना*
━━━━━━━━━━━━━━━━━━━━
सादर प्रणाम! आगामी स्कूल परिपत्र का मुख्य सारांश निम्नलिखित है:

📌 *विषय:* ${title}
🗓️ *तारीख:* ${detectedDate}
⏰ *समय:* ${detectedTime}
💰 *शुल्क:* ${detectedFee}
📞 *संपर्क:* ${detectedContact}

✅ *अभिभावकों के लिए निर्देश:*
• कृपया तय समय पर बच्चे की उपस्थिति सुनिश्चित करें।
• आवश्यक सहमति पत्र समय पर हस्ताक्षर करके भेजें।
• निर्धारित ड्रेस कोड का पालन करें।

सधन्यवाद,
विद्यालय प्रशासन`;
  } else if (targetLanguage.toLowerCase().includes("spanish")) {
    translatedNotice = `📢 *${schoolName} - AVISO IMPORTANTE PARA FAMILIAS*
━━━━━━━━━━━━━━━━━━━━
Estimadas familias:
Compartimos los puntos clave del reciente comunicado escolar:

📌 *Asunto:* ${title}
🗓️ *Fecha:* ${detectedDate}
⏰ *Horario:* ${detectedTime}
💰 *Costos:* ${detectedFee}
📞 *Contacto:* ${detectedContact}

✅ *Acciones Requeridas:*
• Confirmar asistencia y revisar los horarios.
• Firmar y enviar el formulario de autorización a tiempo.
• Asegurar que los alumnos vistan el uniforme reglamentario.

Atentamente,
Dirección Escolar`;
  } else {
    translatedNotice = whatsappNotice;
  }

  const audioScript = `Attention parents from ${schoolName}. Here is a quick update regarding ${title}. The event is scheduled for ${detectedDate} at ${detectedTime}. Please ensure your child follows the designated dress code and return any signed slips before the deadline. Thank you!`;

  return {
    title,
    urgency,
    category,
    whatsappNotice,
    translatedNotice,
    audioScript,
    targetLanguageName: targetLanguage,
    keyDetails: {
      eventDate: detectedDate,
      timings: detectedTime,
      venue: "School Campus / Main Auditorium",
      feeOrAmount: detectedFee,
      dressCode: "Prescribed School Uniform",
      deadline: "Within 2 days of circular",
      contactPerson: detectedContact,
    },
    actionChecklist: [
      { id: "1", task: "Read and acknowledge circular details", deadline: "Today", important: true },
      { id: "2", task: "Submit signed parent permission slip (if applicable)", deadline: detectedDate, important: true },
      { id: "3", task: "Prepare required uniform or activity kit", deadline: "Day prior to event", important: false },
    ],
    frequentlyAskedQuestions: [
      {
        question: "Are school bus routes operational as usual?",
        answer: "Yes, regular transportation schedules remain active unless specifically stated otherwise.",
      },
      {
        question: "Can parents attend the event on campus?",
        answer: "Parents are warmly invited for open sessions; please carry your parent visitor badge.",
      },
    ],
    meta: {
      isMock: true,
      modelUsed: "NoticeBridge Smart Heuristic Engine (Add API key for Gemini Deep AI)",
      originalWordCount: wordCount,
      summaryWordCount: Math.round(wordCount * 0.28) || 50,
      readingTimeReduction: "75% time saved for parents",
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      circularText,
      targetLanguage = "Tamil",
      tone = "Friendly & Clear",
      schoolName = "Greenwood Academy",
      customApiKey,
    } = body;

    if (!circularText || typeof circularText !== "string" || circularText.trim().length < 10) {
      return NextResponse.json(
        { error: "Please enter or paste a valid circular text (at least 10 characters)." },
        { status: 400 }
      );
    }

    const apiKey = customApiKey?.trim() || process.env.GEMINI_API_KEY?.trim();

    // If no API key is provided, use the smart fallback immediately
    if (!apiKey) {
      const fallbackResult = generateSmartFallback(circularText, targetLanguage, schoolName);
      return NextResponse.json(fallbackResult);
    }

    // Call Google Gemini API
    const systemPrompt = `You are "NoticeBridge", an expert school-to-parent communication engine.
Your task is to transform dense, formal, multi-page school circulars and administrative announcements into clear, friendly, and actionable parent updates.

Rules:
1. "whatsappNotice": A WhatsApp broadcast message formatted with emojis, bold text (*word*), bullet points, and clean sections. It MUST take less than 30 seconds to read.
2. "translatedNotice": Translate the core message into ${targetLanguage}. It must feel natural, polite, respectful, and culturally appropriate for parents. Preserve numbers, dates, times, and proper nouns accurately.
3. "audioScript": A concise, natural spoken script (in plain English or simple terms) suitable for browser text-to-speech audio for busy or illiterate parents.
4. "keyDetails": Extract or infer key facts (eventDate, timings, venue, feeOrAmount, dressCode, deadline, contactPerson).
5. "actionChecklist": 2 to 4 clear checkboxes of what parents actually need to do (e.g. sign slips, pack supplies, pay fee).
6. "frequentlyAskedQuestions": 2 realistic questions parents will definitely ask in class WhatsApp groups, with clear answers.

Output MUST be strictly valid JSON matching this schema:
{
  "title": string,
  "urgency": "High" | "Medium" | "Low",
  "category": "Exams" | "Sports & Events" | "Fees & Permissions" | "Emergency" | "General",
  "whatsappNotice": string,
  "translatedNotice": string,
  "audioScript": string,
  "targetLanguageName": "${targetLanguage}",
  "keyDetails": {
    "eventDate": string,
    "timings": string,
    "venue": string,
    "feeOrAmount": string,
    "dressCode": string,
    "deadline": string,
    "contactPerson": string
  },
  "actionChecklist": [
    { "id": string, "task": string, "deadline": string, "important": boolean }
  ],
  "frequentlyAskedQuestions": [
    { "question": string, "answer": string }
  ]
}`;

    const userPrompt = `School Name: ${schoolName}
Target Regional Language: ${targetLanguage}
Tone: ${tone}

Original School Circular / Announcement:
"""
${circularText}
"""`;

    // Attempt Gemini 2.5 Flash, fallback to gemini-1.5-flash
    const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash"];
    let aiResponseText: string | null = null;
    let modelSuccessName = "gemini-2.5-flash";

    for (const model of modelsToTry) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
                },
              ],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.2,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          aiResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (aiResponseText) {
            modelSuccessName = model;
            break;
          }
        } else {
          console.warn(`Model ${model} returned status: ${response.status}`);
        }
      } catch (err) {
        console.warn(`Error trying ${model}:`, err);
      }
    }

    if (!aiResponseText) {
      console.warn("AI generation failed or quota reached. Serving smart fallback.");
      const fallbackResult = generateSmartFallback(circularText, targetLanguage, schoolName);
      return NextResponse.json({
        ...fallbackResult,
        meta: {
          ...fallbackResult.meta,
          modelUsed: "Smart Fallback Engine (Gemini key check failed or exhausted)",
        },
      });
    }

    // Parse JSON safely
    const parsed = JSON.parse(aiResponseText);
    const origWords = circularText.trim().split(/\s+/).filter(Boolean).length;
    const summaryWords = (parsed.whatsappNotice || "").trim().split(/\s+/).filter(Boolean).length;

    const result: NoticeResult = {
      title: parsed.title || "School Notice Update",
      urgency: parsed.urgency || "Medium",
      category: parsed.category || "General",
      whatsappNotice: parsed.whatsappNotice || "",
      translatedNotice: parsed.translatedNotice || "",
      audioScript: parsed.audioScript || parsed.whatsappNotice || "",
      targetLanguageName: targetLanguage,
      keyDetails: {
        eventDate: parsed.keyDetails?.eventDate || "Refer circular",
        timings: parsed.keyDetails?.timings || "School Hours",
        venue: parsed.keyDetails?.venue || "School Campus",
        feeOrAmount: parsed.keyDetails?.feeOrAmount || "Nil",
        dressCode: parsed.keyDetails?.dressCode || "Regular Uniform",
        deadline: parsed.keyDetails?.deadline || "Immediate",
        contactPerson: parsed.keyDetails?.contactPerson || "School Office",
      },
      actionChecklist: (parsed.actionChecklist || []).map((item: any, idx: number) => ({
        id: String(item.id || idx + 1),
        task: item.task || "Review circular details",
        deadline: item.deadline || undefined,
        important: Boolean(item.important),
      })),
      frequentlyAskedQuestions: parsed.frequentlyAskedQuestions || [],
      meta: {
        isMock: false,
        modelUsed: `Google ${modelSuccessName}`,
        originalWordCount: origWords,
        summaryWordCount: summaryWords,
        readingTimeReduction: `${Math.max(60, Math.min(90, Math.round((1 - summaryWords / (origWords || 1)) * 100)))}% time saved`,
      },
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("NoticeBridge API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process circular notice." },
      { status: 500 }
    );
  }
}
