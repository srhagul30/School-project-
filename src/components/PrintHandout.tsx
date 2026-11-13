import type { NoticeResult } from "@/lib/types";
import { plainText } from "@/lib/whatsapp-format";

/** A one-page parent handout, visible only when printing. */
export function PrintHandout({
  result: r,
  schoolName,
  message,
}: {
  result: NoticeResult;
  schoolName: string;
  message: string;
}) {
  const rows: [string, string][] = [
    ["Date", r.keyDetails.eventDate],
    ["Time", r.keyDetails.timings],
    ["Venue", r.keyDetails.venue],
    ["Deadline", r.keyDetails.deadline],
    ["Fee", r.keyDetails.feeOrAmount],
    ["What to wear", r.keyDetails.dressCode],
    ["Contact", r.keyDetails.contactPerson],
  ].filter(([, v]) => !/^(not mentioned|none mentioned)$/i.test(v)) as [string, string][];

  return (
    <article className="print-only handout">
      <header>
        <p className="handout-school">{schoolName}</p>
        <h1>{r.title}</h1>
      </header>
      <table>
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k}>
              <th>{k}</th>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Message to parents</h2>
      <p className="handout-message">{plainText(message)}</p>
      {r.targetLanguage !== "Simple English" && (
        <>
          <h2>{r.targetLanguage}</h2>
          <p className="handout-message">{plainText(r.translatedNotice)}</p>
        </>
      )}
      <footer className="handout-foot">Prepared with NoticeBridge. Please check the original circular for full details.</footer>
    </article>
  );
}
