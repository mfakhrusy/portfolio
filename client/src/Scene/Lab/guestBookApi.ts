export type GuestEntry = {
  id: string;
  name: string;
  message: string;
  website?: string;
  createdAt: string;
};

export type CreateGuestEntryRequest = {
  name: string;
  message: string;
  website?: string;
};

export const API_BASE_URL = "/api/guestbook";

const MOCK_ENTRIES: GuestEntry[] = [
  {
    id: "1",
    name: "Alice",
    message: "Love the 3D effects! The terminal UI is so cool.",
    website: "https://alice.dev",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    name: "Bob",
    message: "Great portfolio, very creative approach!",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    name: "Charlie",
    message: "The sci-fi aesthetic is on point.",
    website: "https://charlie.io",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export async function fetchGuestEntries(): Promise<GuestEntry[]> {
  // TODO: Replace with actual API call
  // const response = await fetch(API_BASE_URL);
  // if (!response.ok) throw new Error("Failed to fetch guest entries");
  // return response.json();

  await new Promise((resolve) => setTimeout(resolve, 500));
  return [...MOCK_ENTRIES];
}

export async function createGuestEntry(
  request: CreateGuestEntryRequest,
): Promise<GuestEntry> {
  // TODO: Replace with actual API call
  // const response = await fetch(API_BASE_URL, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(request),
  // });
  // if (!response.ok) throw new Error("Failed to create guest entry");
  // return response.json();

  await new Promise((resolve) => setTimeout(resolve, 300));
  const newEntry: GuestEntry = {
    id: Date.now().toString(),
    name: request.name,
    message: request.message,
    website: request.website,
    createdAt: new Date().toISOString(),
  };
  MOCK_ENTRIES.unshift(newEntry);
  return newEntry;
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
