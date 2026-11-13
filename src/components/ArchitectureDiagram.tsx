/**
 * Architecture flow: browser -> Python API on Vercel -> parent-ready outputs.
 * Pure HTML/CSS so it reflows from a horizontal flow on desktop to a
 * vertical one on phones.
 */

const PIPELINE = [
  {
    step: "Read the PDF",
    file: "pdf_text.py",
    detail: "pypdf pulls the text out, then re-joins lines the PDF wrapped.",
    only: "PDF uploads",
  },
  {
    step: "Find the facts",
    file: "patterns.py",
    detail: "Dates, times, amounts, phone numbers and emails, with their positions for highlighting.",
  },
];

const OUTPUTS = ["WhatsApp message", "Tamil and 11 more languages", "SMS under 320 characters", "Key facts", "Calendar file (.ics)", "Printable handout"];

function Arrow({ label }: { label: string }) {
  return (
    <div className="arch-arrow" aria-hidden="true">
      <span className="arch-arrow-label">{label}</span>
      <span className="arch-arrow-line" />
    </div>
  );
}

function Down() {
  return <div className="arch-down" aria-hidden="true" />;
}

export function ArchitectureDiagram() {
  return (
    <section className="arch" aria-labelledby="arch-heading">
      <div className="container">
        <div className="arch-head">
          <h2 id="arch-heading">How it&rsquo;s built</h2>
          <p>
            The page you&rsquo;re using is a Next.js interface. Every decision about the circular — reading the PDF,
            finding the facts, writing and translating the message — is made by a Python API running on Vercel.
          </p>
        </div>

        <figure className="arch-flow">
          <figcaption className="sr-only">
            The browser sends the circular to the Python API. The API reads the PDF, finds the facts, then writes the
            message with Gemini if a key is set, or with the offline reader otherwise. The result returns to the browser
            as JSON and is shown as a WhatsApp message, translation, SMS, key facts, calendar file and handout.
          </figcaption>

          {/* Lane 1 */}
          <div className="arch-lane">
            <p className="arch-lane-title">In the browser</p>
            <div className="arch-node">
              <strong>Teacher</strong>
              <span>Uploads the circular PDF or pastes the text, and picks the parents&rsquo; language.</span>
            </div>
            <Down />
            <div className="arch-node">
              <strong>Next.js interface</strong>
              <span>Shows the circular with facts marked, previews and edits the message, reads it aloud.</span>
            </div>
          </div>

          <Arrow label="POST /api/py" />

          {/* Lane 2: Python */}
          <div className="arch-lane arch-lane-python">
            <p className="arch-lane-title">
              Python API <span>FastAPI on Vercel</span>
            </p>
            {PIPELINE.map((p, i) => (
              <div key={p.file}>
                {i > 0 && <Down />}
                <div className="arch-node">
                  <strong>
                    {p.step} <code>{p.file}</code>
                  </strong>
                  <span>{p.detail}</span>
                  {p.only && <em className="arch-only">Only for {p.only}</em>}
                </div>
              </div>
            ))}
            <Down />
            <div className="arch-branch">
              <div className="arch-node arch-node-ai">
                <strong>
                  Gemini 3.8 Flash <code>gemini.py</code>
                </strong>
                <span>Writes and translates the message from a strict JSON schema. Every field is checked.</span>
                <em className="arch-only">When a Gemini key is set</em>
              </div>
              <div className="arch-or" aria-hidden="true">or</div>
              <div className="arch-node">
                <strong>
                  Offline reader <code>offline.py</code>
                </strong>
                <span>Rule-based: classifies the notice, picks out what parents must do, composes the messages.</span>
                <em className="arch-only">Always available, and the fallback if Gemini fails</em>
              </div>
            </div>
            <Down />
            <div className="arch-node">
              <strong>
                Calendar export <code>calendar_ics.py</code>
              </strong>
              <span>Turns the event date and time into a file for Google Calendar, Outlook or Apple Calendar.</span>
            </div>
          </div>

          <Arrow label="JSON" />

          {/* Lane 3 */}
          <div className="arch-lane">
            <p className="arch-lane-title">For parents</p>
            <ul className="arch-outputs">
              {OUTPUTS.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
            <div className="arch-node arch-node-quiet">
              <strong>Nothing is stored</strong>
              <span>Circulars are processed in memory and discarded. Recent notices stay in the browser.</span>
            </div>
          </div>
        </figure>
      </div>
    </section>
  );
}
