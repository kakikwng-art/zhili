import type { CalEvent } from "./types";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function escapeIcs(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  let remaining = line;
  chunks.push(remaining.slice(0, 75));
  remaining = remaining.slice(75);
  while (remaining.length > 74) {
    chunks.push(` ${remaining.slice(0, 74)}`);
    remaining = remaining.slice(74);
  }
  if (remaining.length > 0) chunks.push(` ${remaining}`);
  return chunks.join("\r\n");
}

function dateStamp(date: Date): string {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

function nextDateKey(key: string): string {
  const [year, month, day] = key.split("-").map(Number);
  const next = new Date(year ?? 1970, (month ?? 1) - 1, (day ?? 1) + 1);
  return `${next.getFullYear()}${pad(next.getMonth() + 1)}${pad(next.getDate())}`;
}

function compactDate(key: string): string {
  return key.replaceAll("-", "");
}

function eventToIcs(event: CalEvent): string {
  const lines = [
    "BEGIN:VEVENT",
    `UID:${event.id}@zhili`,
    `DTSTAMP:${dateStamp(new Date(event.updatedAt))}`,
  ];

  if (event.time) {
    const compact = `${compactDate(event.date)}T${event.time.replace(":", "")}00`;
    lines.push(`DTSTART:${compact}`);
  } else {
    lines.push(`DTSTART;VALUE=DATE:${compactDate(event.date)}`);
    lines.push(`DTEND;VALUE=DATE:${nextDateKey(event.date)}`);
  }

  lines.push(`SUMMARY:${escapeIcs(event.title)}`);
  if (event.note) lines.push(`DESCRIPTION:${escapeIcs(event.note)}`);
  if (event.category) lines.push(`CATEGORIES:${escapeIcs(event.category)}`);
  lines.push("END:VEVENT");
  return lines.map(foldLine).join("\r\n");
}

export function eventsToIcs(events: CalEvent[]): string {
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Zhili//Paper Calendar//ZH",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...events.map(eventToIcs),
    "END:VCALENDAR",
  ];
  return `${body.join("\r\n")}\r\n`;
}
