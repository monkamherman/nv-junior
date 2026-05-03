export interface ErrorLogEntry {
  id: string;
  timestamp: string;
  code: string;
  message: string;
  traceId?: string;
  context?: string;
}

const STORAGE_KEY = 'app:error-log';
const MAX_ENTRIES = 50;

function readEntries(): ErrorLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ErrorLogEntry[]) : [];
  } catch {
    return [];
  }
}

function writeEntries(entries: ErrorLogEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

export function recordError(entry: Omit<ErrorLogEntry, 'id' | 'timestamp'>) {
  const entries = readEntries();
  entries.unshift({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ...entry,
  });
  writeEntries(entries);
}

export function exportRecordedErrors(): ErrorLogEntry[] {
  return readEntries();
}
