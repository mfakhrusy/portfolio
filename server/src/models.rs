use serde::{Deserialize, Serialize};
use sqlx::types::chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct GuestEntry {
    pub id: Uuid,
    pub name: String,
    pub message: String,
    pub website: Option<String>,
    pub status: String, // "approved", "pending_review", "rejected"
    #[serde(rename = "createdAt")]
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateGuestEntryRequest {
    pub name: String,
    pub message: String,
    pub website: Option<String>,
}

pub enum EntryStatus {
    Approved,
    PendingReview,
    Rejected,
}

impl EntryStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            EntryStatus::Approved => "approved",
            EntryStatus::PendingReview => "pending_review",
            EntryStatus::Rejected => "rejected",
        }
    }
}
