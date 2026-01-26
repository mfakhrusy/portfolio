export type GuestEntry = {
  id: string;
  name: string;
  message: string;
  website?: string;
  status: "approved" | "pending_review" | "rejected";
  createdAt: string;
};

export type CreateGuestEntryRequest = {
  name: string;
  message: string;
  website?: string;
};

const isDev = ["localhost", "127.0.0.1", "0.0.0.0"].includes(
  window.location.hostname,
);
export function isGuestBookEnabled(): boolean {
  if (typeof window === "undefined") return false;
  if (isDev) {
    return true;
  }
  const host = window.location.hostname;
  return (
    host.endsWith(".fahru.me") ||
    host === "fahru.me" ||
    host.endsWith(".fakhrusy.com") ||
    host === "fakhrusy.com"
  );
}

const API_BASE_URL = isDev
  ? "http://localhost:3000/api/guestbook"
  : "https://api.3d-lab.fahru.me/api/guestbook";

export async function fetchGuestEntries(): Promise<GuestEntry[]> {
  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) throw new Error("Failed to fetch guest entries");
    return response.json();
  } catch (error) {
    console.warn("API unavailable, falling back to empty list", error);
    return [];
  }
}

export async function createGuestEntry(
  request: CreateGuestEntryRequest,
): Promise<GuestEntry> {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) throw new Error("Failed to create guest entry");
  return response.json();
}

export type UpdateGuestEntryRequest = {
  message: string;
  website?: string;
};

export async function updateGuestEntry(
  id: string,
  request: UpdateGuestEntryRequest,
): Promise<GuestEntry> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) throw new Error("Failed to update guest entry");
  return response.json();
}

export async function deleteGuestEntry(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Failed to delete guest entry");
}

const OWNED_ENTRY_KEY = "ownedGuestEntryId";

export function getOwnedEntryId(): string | null {
  return localStorage.getItem(OWNED_ENTRY_KEY);
}

export function setOwnedEntryId(id: string): void {
  localStorage.setItem(OWNED_ENTRY_KEY, id);
}

export function clearOwnedEntryId(): void {
  localStorage.removeItem(OWNED_ENTRY_KEY);
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
