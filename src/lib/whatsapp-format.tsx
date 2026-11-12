import { Fragment, type ReactNode } from "react";

/**
 * Renders WhatsApp's lightweight markup (*bold*, _italic_, ~strike~, ```mono```)
 * so the preview looks the way the message will look in the app.
 */
const TOKEN = /(```[\s\S]+?```|\*[^*\n]+\*|_[^_\n]+_|~[^~\n]+~)/g;

function renderInline(line: string, keyPrefix: string): ReactNode[] {
  const parts = line.split(TOKEN);
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.length > 2 && part.startsWith("*") && part.endsWith("*")) return <strong key={key}>{part.slice(1, -1)}</strong>;
    if (part.length > 2 && part.startsWith("_") && part.endsWith("_")) return <em key={key}>{part.slice(1, -1)}</em>;
    if (part.length > 2 && part.startsWith("~") && part.endsWith("~")) return <s key={key}>{part.slice(1, -1)}</s>;
    if (part.startsWith("```") && part.endsWith("```")) return <code key={key}>{part.slice(3, -3)}</code>;
    return <Fragment key={key}>{part}</Fragment>;
  });
}

export function WhatsAppText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {renderInline(line, String(i))}
          {i < lines.length - 1 && <br />}
        </Fragment>
      ))}
    </>
  );
}

/** Strips WhatsApp markup and emoji, for speech or plain-text use. */
export function plainText(text: string): string {
  return text
    .replace(/```/g, "")
    .replace(/[*_~]/g, "")
    .replace(/[\p{Extended_Pictographic}\u{FE0F}]/gu, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}
