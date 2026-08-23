export type Note = {
  id: string;
  name: string;
  language: string;
  content: string;
  updatedAt: number;
};

const COLLECTION_KEY = "notes:collection";
const ACTIVE_KEY = "notes:active";

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // localStorage unavailable (private mode, disabled, quota) — skip persisting.
  }
}

function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function newNote(): Note {
  return {
    id: crypto.randomUUID(),
    name: "Untitled",
    language: "markdown",
    content: "",
    updatedAt: Date.now(),
  };
}

export function loadCollection(): Note[] {
  const raw = safeGet(COLLECTION_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCollection(notes: Note[]): void {
  if (notes.length === 0) {
    safeRemove(COLLECTION_KEY);
    return;
  }
  safeSet(COLLECTION_KEY, JSON.stringify(notes));
}

export function loadActiveId(): string | null {
  return safeGet(ACTIVE_KEY);
}

export function saveActiveId(id: string): void {
  safeSet(ACTIVE_KEY, id);
}
