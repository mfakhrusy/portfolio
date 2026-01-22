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

// In production, this should be an environment variable.
// For now, we default to localhost:3000.
export const API_BASE_URL = "http://localhost:3000/api/guestbook";

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
