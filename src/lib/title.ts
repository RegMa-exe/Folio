/**
 * Derives a human-readable book title from a raw PDF filename.
 * Strips extensions, hashes, UUIDs, URL-like prefixes, and
 * converts separators to spaces with title casing.
 */
export function cleanTitle(filename: string): string {
  let t = filename.replace(/\.pdf$/i, "");

  // Remove URL-like prefixes (e.g. "ilide.info-")
  t = t.replace(/^[a-z0-9.-]+\.[a-z]{2,4}[-_]/i, "");

  // Remove hash-like suffixes (e.g. "_ajfdb37953be714aa66eec6e8dbba8c7")
  t = t.replace(/[_-][a-f0-9]{16,}$/i, "");

  // Remove UUID-like strings
  t = t.replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, "");

  // Remove trailing "pr" or similar short codes after a separator
  t = t.replace(/[-_]pr$/i, "");

  // Replace separators with spaces
  t = t.replace(/[_-]+/g, " ");

  // Collapse whitespace
  t = t.trim().replace(/\s+/g, " ");

  // Title case each word, but keep small words lowercase
  const small = new Set(["a", "an", "and", "the", "of", "in", "on", "to", "for", "with", "an"]);
  t = t
    .split(" ")
    .map((word, i) => {
      const lower = word.toLowerCase();
      if (i > 0 && small.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");

  // If nothing left, fall back to a shortened original
  if (!t) {
    t = filename.replace(/\.pdf$/i, "").replace(/[_-]/g, " ").trim();
  }

  // Truncate gracefully
  const MAX = 80;
  if (t.length > MAX) {
    t = t.slice(0, MAX).trimEnd() + "…";
  }

  return t;
}
