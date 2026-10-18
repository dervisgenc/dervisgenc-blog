const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Europe/Istanbul",
});

const shortDayFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

const compactNumber = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return dateFormatter.format(new Date(iso));
}

/** Formats a YYYY-MM-DD day for chart axes. */
export function formatDay(day: string): string {
  return shortDayFormatter.format(new Date(`${day}T00:00:00Z`));
}

export function formatCount(value: number): string {
  return value < 1000 ? String(value) : compactNumber.format(value);
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}
