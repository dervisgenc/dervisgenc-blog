const TRANSLITERATION: Record<string, string> = {
  ç: "c", ğ: "g", ı: "i", İ: "i", ö: "o", ş: "s", ü: "u",
  Ç: "c", Ğ: "g", Ö: "o", Ş: "s", Ü: "u",
};

/** Turns a title into a URL slug: lowercase ASCII letters, digits and dashes. */
export function slugify(title: string): string {
  return title
    .replace(/[çğıİöşüÇĞÖŞÜ]/g, (char) => TRANSLITERATION[char] ?? char)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}
