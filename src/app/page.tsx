import { NoticeApp } from "@/components/NoticeApp";

const STEPS = [
  {
    title: "Paste or upload the circular",
    body: "Drop in the PDF the office sent, or paste the text. Nothing is saved on our server.",
  },
  {
    title: "Check what was found",
    body: "Dates, times, amounts and phone numbers are marked on the circular so you can verify them at a glance.",
  },
  {
    title: "Send it to parents",
    body: "Share the WhatsApp message, the translated version or the SMS. Parents can add the event to their calendar.",
  },
];

export default function Home() {
  return (
    <>
      <NoticeApp />

      <section className="steps" aria-labelledby="steps-heading">
        <div className="container">
          <h2 id="steps-heading" className="steps-heading">How it works</h2>
          <ol className="steps-list">
            {STEPS.map((s, i) => (
              <li key={s.title} className="step">
                <span className="step-num" aria-hidden="true">{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>

          <div className="notes">
            <div>
              <h3>Works without an AI key</h3>
              <p>
                The built-in reader extracts facts from the circular itself and never invents details. Connect a
                Gemini key for full translations and better-written messages.
              </p>
            </div>
            <div>
              <h3>Private by default</h3>
              <p>
                Circulars are processed and discarded. Your recent notices and any key you add stay in this
                browser only.
              </p>
            </div>
            <div>
              <h3>Thirteen languages</h3>
              <p>
                Tamil, Hindi, Telugu, Kannada, Malayalam, Marathi, Bengali, Gujarati, Urdu, Arabic, Spanish,
                French and simple English.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container footer-inner">
          <span className="wordmark wordmark-sm">NoticeBridge</span>
          <span>Built for school offices and class teachers.</span>
          <a href="https://github.com/srhagul30/School-project-" target="_blank" rel="noopener noreferrer">
            Source on GitHub
          </a>
        </div>
      </footer>
    </>
  );
}
