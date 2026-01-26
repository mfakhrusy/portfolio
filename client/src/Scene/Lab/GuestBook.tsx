import { createSignal, onMount, For, Show } from "solid-js";
import { DraggableTerminal } from "./DraggableTerminal";
import {
  fetchGuestEntries,
  createGuestEntry,
  updateGuestEntry,
  deleteGuestEntry,
  formatRelativeTime,
  isGuestBookEnabled,
  getOwnedEntryId,
  setOwnedEntryId,
  clearOwnedEntryId,
  getSourceName,
  sourceToUrl,
  type GuestEntry,
} from "./guestBookApi";
import "./GuestBook.css";

const MAX_MESSAGE_LENGTH = 280;

export function GuestBook() {
  if (!isGuestBookEnabled()) return null;

  const [isMinimized, setIsMinimized] = createSignal(true);
  const [entries, setEntries] = createSignal<GuestEntry[]>([]);
  const [isLoading, setIsLoading] = createSignal(false);
  const [isSubmitting, setIsSubmitting] = createSignal(false);

  const [name, setName] = createSignal("");
  const [message, setMessage] = createSignal("");
  const [website, setWebsite] = createSignal("");
  const [status, setStatus] = createSignal<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [editingId, setEditingId] = createSignal<string | null>(null);
  const [editMessage, setEditMessage] = createSignal("");
  const [editWebsite, setEditWebsite] = createSignal("");
  const [ownedEntryId, setOwnedEntryIdState] = createSignal<string | null>(
    null,
  );

  const loadEntries = async () => {
    setIsLoading(true);
    try {
      const serverEntries = await fetchGuestEntries();

      // Load local pending entries
      const storedPending = localStorage.getItem("pendingGuestEntries");
      let localPending: GuestEntry[] = [];
      if (storedPending) {
        try {
          localPending = JSON.parse(storedPending);
        } catch (e) {
          console.error("Failed to parse pending entries", e);
        }
      }

      // Filter out local pending entries that are now in the server response (approved or rejected - if rejected they won't be in server list but we should probably clear them if we knew, simple approach: remove if ID exists in server list)
      // Actually, if it's approved, it's in serverEntries. If rejected, it's NOT in serverEntries.
      // We need to keep "pending" ones that are NOT in serverEntries yet.
      // But wait, if it was rejected, we don't want to show it anymore?
      // Or we show it as rejected? The API only returns approved.
      // For now, let's just show localPending items that are NOT in serverEntries.
      // If a user refreshes and it's still not approved, they still see it.
      // If it WAS rejected, it will permanently stay in localPending until they clear cache?
      // Improve: maybe check age? Or just accept this limitation for now.

      // Better approach: We can't know if it was rejected without querying specially.
      // Let's just merge. If ID matches, server wins (it's approved).

      const serverIds = new Set(serverEntries.map((e) => e.id));
      const stillPending = localPending.filter((e) => !serverIds.has(e.id));

      // Clean up localStorage - remove items that are now on server
      if (stillPending.length !== localPending.length) {
        localStorage.setItem(
          "pendingGuestEntries",
          JSON.stringify(stillPending),
        );
      }

      setEntries([...stillPending, ...serverEntries]);
    } catch {
      console.error("Failed to load guest entries");
    } finally {
      setIsLoading(false);
    }
  };

  onMount(() => {
    loadEntries();
    setOwnedEntryIdState(getOwnedEntryId());
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    const trimmedName = name().trim();
    const trimmedMessage = message().trim();

    if (!trimmedName || !trimmedMessage) {
      setStatus({ type: "error", text: "ERROR: All fields required" });
      return;
    }

    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      setStatus({ type: "error", text: "ERROR: Message too long" });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const trimmedWebsite = website().trim();
      const newEntry = await createGuestEntry({
        name: trimmedName,
        message: trimmedMessage,
        website: trimmedWebsite || undefined,
        source: getSourceName(),
      });

      if (newEntry.status === "pending_review") {
        // Save to local storage
        const storedPending = localStorage.getItem("pendingGuestEntries");
        const localPending: GuestEntry[] = storedPending
          ? JSON.parse(storedPending)
          : [];
        localPending.unshift(newEntry);
        localStorage.setItem(
          "pendingGuestEntries",
          JSON.stringify(localPending),
        );

        setStatus({
          type: "success",
          text: "SENT FOR REVIEW (VISIBLE TO YOU)",
        });
      } else {
        setStatus({ type: "success", text: "ENTRY LOGGED SUCCESSFULLY" });
      }

      setEntries((prev) => [newEntry, ...prev]);
      setName("");
      setMessage("");
      setWebsite("");
      setOwnedEntryId(newEntry.id);
      setOwnedEntryIdState(newEntry.id);

      setTimeout(() => setStatus(null), 3000);
    } catch {
      setStatus({ type: "error", text: "ERROR: Failed to submit" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (entry: GuestEntry) => {
    setEditingId(entry.id);
    setEditMessage(entry.message);
    setEditWebsite(entry.website || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditMessage("");
    setEditWebsite("");
  };

  const handleSaveEdit = async () => {
    const id = editingId();
    if (!id) return;

    const trimmedMessage = editMessage().trim();
    if (!trimmedMessage) {
      setStatus({ type: "error", text: "ERROR: Message required" });
      return;
    }

    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      setStatus({ type: "error", text: "ERROR: Message too long" });
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedEntry = await updateGuestEntry(id, {
        message: trimmedMessage,
        website: editWebsite().trim() || undefined,
      });

      setEntries((prev) => prev.map((e) => (e.id === id ? updatedEntry : e)));

      const storedPending = localStorage.getItem("pendingGuestEntries");
      if (storedPending) {
        const localPending: GuestEntry[] = JSON.parse(storedPending);
        const updated = localPending.map((e) =>
          e.id === id ? updatedEntry : e,
        );
        localStorage.setItem("pendingGuestEntries", JSON.stringify(updated));
      }

      setEditingId(null);
      setEditMessage("");
      setEditWebsite("");
      setStatus({ type: "success", text: "ENTRY UPDATED" });
      setTimeout(() => setStatus(null), 3000);
    } catch {
      setStatus({ type: "error", text: "ERROR: Failed to update" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete your entry?")) return;

    setIsSubmitting(true);
    try {
      await deleteGuestEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));

      const storedPending = localStorage.getItem("pendingGuestEntries");
      if (storedPending) {
        const localPending: GuestEntry[] = JSON.parse(storedPending);
        const filtered = localPending.filter((e) => e.id !== id);
        localStorage.setItem("pendingGuestEntries", JSON.stringify(filtered));
      }

      clearOwnedEntryId();
      setOwnedEntryIdState(null);
      setStatus({ type: "success", text: "ENTRY DELETED" });
      setTimeout(() => setStatus(null), 3000);
    } catch {
      setStatus({ type: "error", text: "ERROR: Failed to delete" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const charCount = () => message().length;
  const charCountClass = () => {
    if (charCount() > MAX_MESSAGE_LENGTH) return "guest-book-char-count-error";
    if (charCount() > MAX_MESSAGE_LENGTH * 0.9)
      return "guest-book-char-count-warning";
    return "";
  };

  const ownedEntry = () => {
    const id = ownedEntryId();
    if (!id) return null;
    return entries().find((e) => e.id === id) || null;
  };

  return (
    <DraggableTerminal
      title="GUEST TERMINAL"
      initialSize={{ width: 600, height: 400 }}
      minSize={{ width: 500, height: 300 }}
      isMinimized={() => isMinimized()}
      onMinimize={() => setIsMinimized(true)}
      onExpand={() => setIsMinimized(false)}
      fabIcon="📖"
      fabPosition="bottom-right"
      fabIndex={2}
      fabStackDirection="horizontal"
    >
      <div class="guest-book-container">
        {/* Left panel - Form or User's Entry */}
        <div class="guest-book-form-panel">
          <Show when={status()}>
            <div
              class={`guest-book-status ${
                status()?.type === "success"
                  ? "guest-book-status-success"
                  : "guest-book-status-error"
              }`}
            >
              {status()?.text}
            </div>
          </Show>

          <Show
            when={ownedEntry()}
            fallback={
              <>
                <div class="guest-book-form-header">// Sign the Guest Book</div>
                <form onSubmit={handleSubmit}>
                  <div class="guest-book-field">
                    <label class="guest-book-label">
                      <span class="guest-book-label-icon">&gt;</span>
                      Name
                    </label>
                    <input
                      type="text"
                      class="guest-book-input"
                      placeholder="Enter your name..."
                      value={name()}
                      onInput={(e) => setName(e.currentTarget.value)}
                      disabled={isSubmitting()}
                      maxLength={50}
                    />
                  </div>

                  <div class="guest-book-field">
                    <label class="guest-book-label">
                      <span class="guest-book-label-icon">&gt;</span>
                      Message
                    </label>
                    <textarea
                      class="guest-book-input guest-book-textarea"
                      placeholder="Leave a message..."
                      value={message()}
                      onInput={(e) => setMessage(e.currentTarget.value)}
                      disabled={isSubmitting()}
                    />
                    <div class={`guest-book-char-count ${charCountClass()}`}>
                      {charCount()}/{MAX_MESSAGE_LENGTH}
                    </div>
                  </div>

                  <div class="guest-book-field">
                    <label class="guest-book-label">
                      <span class="guest-book-label-icon">&gt;</span>
                      Website
                      <span class="guest-book-label-optional">(optional)</span>
                    </label>
                    <input
                      type="url"
                      class="guest-book-input"
                      placeholder="https://yoursite.com"
                      value={website()}
                      onInput={(e) => setWebsite(e.currentTarget.value)}
                      disabled={isSubmitting()}
                    />
                  </div>

                  <button
                    type="submit"
                    class="guest-book-submit"
                    disabled={
                      isSubmitting() || !name().trim() || !message().trim()
                    }
                  >
                    <span class="guest-book-submit-icon">⏎</span>
                    {isSubmitting() ? "Submitting..." : "Submit Entry"}
                  </button>
                </form>
              </>
            }
          >
            {(entry) => (
              <div class="guest-book-owned-panel">
                <div class="guest-book-form-header">// Your Entry</div>

                <div class="guest-book-owned-status">
                  <Show
                    when={entry().status === "approved"}
                    fallback={
                      <span class="guest-book-status-badge guest-book-status-pending">
                        ⏳ PENDING REVIEW
                      </span>
                    }
                  >
                    <span class="guest-book-status-badge guest-book-status-approved">
                      ✓ APPROVED
                    </span>
                  </Show>
                </div>

                <Show
                  when={editingId() === entry().id}
                  fallback={
                    <div class="guest-book-owned-content">
                      <div class="guest-book-owned-name">@{entry().name}</div>
                      <div class="guest-book-owned-message">
                        "{entry().message}"
                      </div>
                      <Show when={entry().website}>
                        <div class="guest-book-owned-website">
                          <a
                            href={entry().website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {entry().website}
                          </a>
                        </div>
                      </Show>
                      <div class="guest-book-owned-time">
                        Submitted {formatRelativeTime(entry().createdAt)}
                      </div>

                      <div class="guest-book-owned-actions">
                        <button
                          class="guest-book-action-btn guest-book-edit-btn"
                          onClick={() => handleEdit(entry())}
                          disabled={isSubmitting()}
                        >
                          Edit
                        </button>
                        <button
                          class="guest-book-action-btn guest-book-delete-btn"
                          onClick={() => handleDelete(entry().id)}
                          disabled={isSubmitting()}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  }
                >
                  <div class="guest-book-edit-form">
                    <div class="guest-book-field">
                      <label class="guest-book-label">
                        <span class="guest-book-label-icon">&gt;</span>
                        Message
                      </label>
                      <textarea
                        class="guest-book-input guest-book-textarea"
                        value={editMessage()}
                        onInput={(e) => setEditMessage(e.currentTarget.value)}
                        disabled={isSubmitting()}
                      />
                      <div
                        class={`guest-book-char-count ${editMessage().length > MAX_MESSAGE_LENGTH ? "guest-book-char-count-error" : ""}`}
                      >
                        {editMessage().length}/{MAX_MESSAGE_LENGTH}
                      </div>
                    </div>
                    <div class="guest-book-field">
                      <label class="guest-book-label">
                        <span class="guest-book-label-icon">&gt;</span>
                        Website
                        <span class="guest-book-label-optional">
                          (optional)
                        </span>
                      </label>
                      <input
                        type="url"
                        class="guest-book-input"
                        placeholder="https://yoursite.com"
                        value={editWebsite()}
                        onInput={(e) => setEditWebsite(e.currentTarget.value)}
                        disabled={isSubmitting()}
                      />
                    </div>
                    <div class="guest-book-edit-actions">
                      <button
                        class="guest-book-action-btn guest-book-save-btn"
                        onClick={handleSaveEdit}
                        disabled={isSubmitting() || !editMessage().trim()}
                      >
                        {isSubmitting() ? "Saving..." : "Save"}
                      </button>
                      <button
                        class="guest-book-action-btn guest-book-cancel-btn"
                        onClick={handleCancelEdit}
                        disabled={isSubmitting()}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </Show>
              </div>
            )}
          </Show>
        </div>

        {/* Right panel - Guest list */}
        <div class="guest-book-list-panel">
          <div class="guest-book-list-header">
            // Visitor Log [{entries().length}]
          </div>

          <div class="guest-book-list">
            <Show when={isLoading()}>
              <div class="guest-book-loading">Loading entries</div>
            </Show>

            <Show when={!isLoading() && entries().length === 0}>
              <div class="guest-book-empty">
                <div class="guest-book-empty-icon">📝</div>
                <div class="guest-book-empty-text">
                  No entries yet. Be the first to sign!
                </div>
              </div>
            </Show>

            <Show when={!isLoading() && entries().length > 0}>
              <For each={entries()}>
                {(entry) => (
                  <div
                    class="guest-book-entry"
                    classList={{
                      "guest-book-entry-owned": entry.id === ownedEntryId(),
                    }}
                  >
                    <div class="guest-book-entry-header">
                      <Show
                        when={entry.website}
                        fallback={
                          <span class="guest-book-entry-name">
                            {entry.name}
                          </span>
                        }
                      >
                        <a
                          href={entry.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="guest-book-entry-name guest-book-entry-link"
                        >
                          {entry.name}
                        </a>
                      </Show>
                      <div class="guest-book-entry-meta">
                        <span class="guest-book-entry-time">
                          {formatRelativeTime(entry.createdAt)}
                        </span>
                        <Show when={entry.id === ownedEntryId()}>
                          <span class="guest-book-entry-yours">[YOU]</span>
                        </Show>
                      </div>
                    </div>
                    <div class="guest-book-entry-message">{entry.message}</div>
                    <Show when={entry.source}>
                      <div class="guest-book-entry-source">
                        from{" "}
                        <a
                          href={sourceToUrl(entry.source!)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {entry.source}
                        </a>
                      </div>
                    </Show>
                  </div>
                )}
              </For>
            </Show>
          </div>
        </div>
      </div>
    </DraggableTerminal>
  );
}
