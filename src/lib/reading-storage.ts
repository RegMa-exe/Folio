export type ReadingTheme = "classic" | "ivory" | "beige" | "dark";

export type BookState = {
  page: number;
  bookmarks: number[];
};

const PREFIX = "bookflow:book:";
const THEME_KEY = "bookflow:theme";
const SOUND_KEY = "bookflow:sound";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Stable-enough identity for a book without uploading it anywhere. */
export function bookKey(name: string, size: number, pageCount: number) {
  return `${PREFIX}${name}:${size}:${pageCount}`;
}

export function loadBookState(key: string): BookState {
  if (typeof window === "undefined") return { page: 1, bookmarks: [] };
  const state = safeParse<Partial<BookState>>(localStorage.getItem(key), {});
  return {
    page: typeof state.page === "number" && state.page > 0 ? state.page : 1,
    bookmarks: Array.isArray(state.bookmarks) ? state.bookmarks : [],
  };
}

export function saveBookState(key: string, state: BookState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    /* storage full or unavailable — reading still works */
  }
}

export function loadTheme(): ReadingTheme {
  if (typeof window === "undefined") return "classic";
  const value = localStorage.getItem(THEME_KEY);
  return value === "ivory" || value === "beige" || value === "dark" ? value : "classic";
}

export function saveTheme(theme: ReadingTheme) {
  if (typeof window !== "undefined") localStorage.setItem(THEME_KEY, theme);
}

export function loadSound(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(SOUND_KEY) !== "off";
}

export function saveSound(on: boolean) {
  if (typeof window !== "undefined") localStorage.setItem(SOUND_KEY, on ? "on" : "off");
}
