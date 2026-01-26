import { createSignal, onMount, For, Show } from "solid-js";
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
  type GuestEntry,
} from "./guestBookApi";
import "./MobileGuestBook.css";

const MAX_MESSAGE_LENGTH = 280;

export function MobileGuestBook() {
  if (!isGuestBookEnabled()) return null;

  const [isMinimized, setIsMinimized] = createSignal(false);
  const [activeTab, setActiveTab] = createSignal<"form" | "list">("list");
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

      const storedPending = localStorage.getItem("pendingGuestEntries");
      let localPending: GuestEntry[] = [];
      if (storedPending) {
        try {
          localPending = JSON.parse(storedPending);
        } catch (e) {
          console.error("Failed to parse pending entries", e);
        }
      }

      const serverIds = new Set(serverEntries.map((e) => e.id));
      const stillPending = localPending.filter((e) => !serverIds.has(e.id));

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
      });

      if (newEntry.status === "pending_review") {
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
      setActiveTab("list");

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
    if (charCount() > MAX_MESSAGE_LENGTH)
      return "mobile-guest-book-char-count-error";
    if (charCount() > MAX_MESSAGE_LENGTH * 0.9)
      return "mobile-guest-book-char-count-warning";
    return "";
  };

  const ownedEntry = () => {
    const id = ownedEntryId();
    if (!id) return null;
    return entries().find((e) => e.id === id) || null;
  };

  return (
    <div
      class="mobile-guest-book"
      classList={{ "mobile-guest-book-minimized": isMinimized() }}
    >
      <div class="mobile-guest-book-header">
        <span class="mobile-guest-book-title">GUEST TERMINAL</span>
        <button
          class="mobile-guest-book-toggle"
          onClick={() => setIsMinimized(!isMinimized())}
          title={isMinimized() ? "Maximize" : "Minimize"}
        >
          <span class="mobile-guest-book-toggle-icon">
            {isMinimized() ? "□" : "−"}
          </span>
        </button>
      </div>

      {!isMinimized() && (
        <div class="mobile-guest-book-body">
          <div class="mobile-guest-book-tabs">
            <button
              class="mobile-guest-book-tab"
              classList={{
                "mobile-guest-book-tab-active": activeTab() === "list",
              }}
              onClick={() => setActiveTab("list")}
            >
              Visitor Log [{entries().length}]
            </button>
            <button
              class="mobile-guest-book-tab"
              classList={{
                "mobile-guest-book-tab-active": activeTab() === "form",
              }}
              onClick={() => setActiveTab("form")}
            >
              {ownedEntry() ? "Your Entry" : "Sign Book"}
            </button>
          </div>

          <Show when={activeTab() === "form"}>
            <div class="mobile-guest-book-form-panel">
              <Show when={status()}>
                <div
                  class={`mobile-guest-book-status ${
                    status()?.type === "success"
                      ? "mobile-guest-book-status-success"
                      : "mobile-guest-book-status-error"
                  }`}
                >
                  {status()?.text}
                </div>
              </Show>

              <Show
                when={ownedEntry()}
                fallback={
                  <form onSubmit={handleSubmit}>
                    <div class="mobile-guest-book-field">
                      <label class="mobile-guest-book-label">
                        <span class="mobile-guest-book-label-icon">&gt;</span>
                        Name
                      </label>
                      <input
                        type="text"
                        class="mobile-guest-book-input"
                        placeholder="Enter your name..."
                        value={name()}
                        onInput={(e) => setName(e.currentTarget.value)}
                        disabled={isSubmitting()}
                        maxLength={50}
                      />
                    </div>

                    <div class="mobile-guest-book-field">
                      <label class="mobile-guest-book-label">
                        <span class="mobile-guest-book-label-icon">&gt;</span>
                        Message
                      </label>
                      <textarea
                        class="mobile-guest-book-input mobile-guest-book-textarea"
                        placeholder="Leave a message..."
                        value={message()}
                        onInput={(e) => setMessage(e.currentTarget.value)}
                        disabled={isSubmitting()}
                      />
                      <div
                        class={`mobile-guest-book-char-count ${charCountClass()}`}
                      >
                        {charCount()}/{MAX_MESSAGE_LENGTH}
                      </div>
                    </div>

                    <div class="mobile-guest-book-field">
                      <label class="mobile-guest-book-label">
                        <span class="mobile-guest-book-label-icon">&gt;</span>
                        Website
                        <span class="mobile-guest-book-label-optional">
                          (optional)
                        </span>
                      </label>
                      <input
                        type="url"
                        class="mobile-guest-book-input"
                        placeholder="https://yoursite.com"
                        value={website()}
                        onInput={(e) => setWebsite(e.currentTarget.value)}
                        disabled={isSubmitting()}
                      />
                    </div>

                    <button
                      type="submit"
                      class="mobile-guest-book-submit"
                      disabled={
                        isSubmitting() || !name().trim() || !message().trim()
                      }
                    >
                      <span class="mobile-guest-book-submit-icon">⏎</span>
                      {isSubmitting() ? "Submitting..." : "Submit Entry"}
                    </button>
                  </form>
                }
              >
                {(entry) => (
                  <div class="mobile-guest-book-owned-panel">
                    <div class="mobile-guest-book-owned-status">
                      <Show
                        when={entry().status === "approved"}
                        fallback={
                          <span class="mobile-guest-book-status-badge mobile-guest-book-status-pending">
                            ⏳ PENDING REVIEW
                          </span>
                        }
                      >
                        <span class="mobile-guest-book-status-badge mobile-guest-book-status-approved">
                          ✓ APPROVED
                        </span>
                      </Show>
                    </div>

                    <Show
                      when={editingId() === entry().id}
                      fallback={
                        <div class="mobile-guest-book-owned-content">
                          <div class="mobile-guest-book-owned-name">
                            @{entry().name}
                          </div>
                          <div class="mobile-guest-book-owned-message">
                            "{entry().message}"
                          </div>
                          <Show when={entry().website}>
                            <div class="mobile-guest-book-owned-website">
                              <a
                                href={entry().website}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {entry().website}
                              </a>
                            </div>
                          </Show>
                          <div class="mobile-guest-book-owned-time">
                            Submitted {formatRelativeTime(entry().createdAt)}
                          </div>

                          <div class="mobile-guest-book-owned-actions">
                            <button
                              class="mobile-guest-book-action-btn mobile-guest-book-edit-btn"
                              onClick={() => handleEdit(entry())}
                              disabled={isSubmitting()}
                            >
                              Edit
                            </button>
                            <button
                              class="mobile-guest-book-action-btn mobile-guest-book-delete-btn"
                              onClick={() => handleDelete(entry().id)}
                              disabled={isSubmitting()}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      }
                    >
                      <div class="mobile-guest-book-edit-form">
                        <div class="mobile-guest-book-field">
                          <label class="mobile-guest-book-label">
                            <span class="mobile-guest-book-label-icon">
                              &gt;
                            </span>
                            Message
                          </label>
                          <textarea
                            class="mobile-guest-book-input mobile-guest-book-textarea"
                            value={editMessage()}
                            onInput={(e) =>
                              setEditMessage(e.currentTarget.value)
                            }
                            disabled={isSubmitting()}
                          />
                          <div
                            class={`mobile-guest-book-char-count ${editMessage().length > MAX_MESSAGE_LENGTH ? "mobile-guest-book-char-count-error" : ""}`}
                          >
                            {editMessage().length}/{MAX_MESSAGE_LENGTH}
                          </div>
                        </div>
                        <div class="mobile-guest-book-field">
                          <label class="mobile-guest-book-label">
                            <span class="mobile-guest-book-label-icon">
                              &gt;
                            </span>
                            Website
                            <span class="mobile-guest-book-label-optional">
                              (optional)
                            </span>
                          </label>
                          <input
                            type="url"
                            class="mobile-guest-book-input"
                            placeholder="https://yoursite.com"
                            value={editWebsite()}
                            onInput={(e) =>
                              setEditWebsite(e.currentTarget.value)
                            }
                            disabled={isSubmitting()}
                          />
                        </div>
                        <div class="mobile-guest-book-edit-actions">
                          <button
                            class="mobile-guest-book-action-btn mobile-guest-book-save-btn"
                            onClick={handleSaveEdit}
                            disabled={isSubmitting() || !editMessage().trim()}
                          >
                            {isSubmitting() ? "Saving..." : "Save"}
                          </button>
                          <button
                            class="mobile-guest-book-action-btn mobile-guest-book-cancel-btn"
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
          </Show>

          <Show when={activeTab() === "list"}>
            <div class="mobile-guest-book-list-panel">
              <div class="mobile-guest-book-list">
                <Show when={isLoading()}>
                  <div class="mobile-guest-book-loading">Loading entries</div>
                </Show>

                <Show when={!isLoading() && entries().length === 0}>
                  <div class="mobile-guest-book-empty">
                    <div class="mobile-guest-book-empty-icon">📝</div>
                    <div class="mobile-guest-book-empty-text">
                      No entries yet. Be the first to sign!
                    </div>
                  </div>
                </Show>

                <Show when={!isLoading() && entries().length > 0}>
                  <For each={entries()}>
                    {(entry) => (
                      <div
                        class="mobile-guest-book-entry"
                        classList={{
                          "mobile-guest-book-entry-owned":
                            entry.id === ownedEntryId(),
                        }}
                      >
                        <div class="mobile-guest-book-entry-header">
                          <Show
                            when={entry.website}
                            fallback={
                              <span class="mobile-guest-book-entry-name">
                                {entry.name}
                              </span>
                            }
                          >
                            <a
                              href={entry.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              class="mobile-guest-book-entry-name mobile-guest-book-entry-link"
                            >
                              {entry.name}
                            </a>
                          </Show>
                          <div class="mobile-guest-book-entry-meta">
                            <span class="mobile-guest-book-entry-time">
                              {formatRelativeTime(entry.createdAt)}
                            </span>
                            <Show when={entry.id === ownedEntryId()}>
                              <span class="mobile-guest-book-entry-yours">
                                [YOU]
                              </span>
                            </Show>
                          </div>
                        </div>
                        <div class="mobile-guest-book-entry-message">
                          {entry.message}
                        </div>
                      </div>
                    )}
                  </For>
                </Show>
              </div>
            </div>
          </Show>
        </div>
      )}
    </div>
  );
}
