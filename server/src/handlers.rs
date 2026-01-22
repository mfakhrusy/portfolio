use crate::models::{CreateGuestEntryRequest, EntryStatus, GuestEntry};
use askama::Template;
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::{Html, IntoResponse, Json},
};
use sqlx::PgPool;
use uuid::Uuid;

// Mod words for simple bad-word filtering
const BAD_WORDS: &[&str] = &["badword", "provocative", "dangerous"]; // Extend this list

pub async fn get_entries(State(pool): State<PgPool>) -> Result<Json<Vec<GuestEntry>>, StatusCode> {
    let entries = sqlx::query_as::<_, GuestEntry>(
        "SELECT * FROM guest_entries WHERE status = 'approved' ORDER BY created_at DESC",
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| {
        tracing::error!("Failed to fetch entries: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(entries))
}

pub async fn create_entry(
    State(pool): State<PgPool>,
    Json(payload): Json<CreateGuestEntryRequest>,
) -> Result<Json<GuestEntry>, StatusCode> {
    // Simple Moderation Logic
    let mut status = EntryStatus::Approved;
    let message_lower = payload.message.to_lowercase();
    let name_lower = payload.name.to_lowercase();

    for word in BAD_WORDS {
        if message_lower.contains(word) || name_lower.contains(word) {
            status = EntryStatus::PendingReview;
            break;
        }
    }

    let entry = sqlx::query_as::<_, GuestEntry>(
        r#"
        INSERT INTO guest_entries (name, message, website, status)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        "#,
    )
    .bind(payload.name)
    .bind(payload.message)
    .bind(payload.website)
    .bind(status.as_str())
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        tracing::error!("Failed to create entry: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(entry))
}

// Admin Templates
#[derive(Template)]
#[template(source = "
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Guestbook Admin</title>
    <style>
        body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .entry { border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 5px; }
        .entry.pending_review { border-left: 5px solid orange; background-color: #fff8e1; }
        .entry.rejected { border-left: 5px solid red; opacity: 0.6; }
        .actions { margin-top: 10px; }
        button { cursor: pointer; padding: 5px 10px; margin-right: 5px; }
        .approve { background-color: #4CAF50; color: white; border: none; }
        .reject { background-color: #f44336; color: white; border: none; }
    </style>
</head>
<body>
    <h1>Guestbook Admin</h1>
    <a href='/admin?filter=pending'>Show Pending Only</a> | <a href='/admin'>Show All</a>
    <hr>
    {% for entry in entries %}
        <div class='entry {{ entry.status }}'>
            <strong>{{ entry.name }}</strong> ({{ entry.created_at }})<br>
            <p>{{ entry.message }}</p>
            {% if let Some(website) = entry.website %}
                <small><a href='{{ website }}' target='_blank'>{{ website }}</a></small><br>
            {% endif %}
            Status: <strong>{{ entry.status }}</strong>
            <div class='actions'>
                {% if entry.status != \"approved\" %}
                <form action='/admin/approve/{{ entry.id }}' method='POST' style='display:inline'>
                    <button type='submit' class='approve'>Approve</button>
                </form>
                {% endif %}
                {% if entry.status != \"rejected\" %}
                <form action='/admin/reject/{{ entry.id }}' method='POST' style='display:inline'>
                    <button type='submit' class='reject'>Reject</button>
                </form>
                {% endif %}
            </div>
        </div>
    {% endfor %}
</body>
</html>
", ext = "html")]
struct AdminDashboardTemplate {
    entries: Vec<GuestEntry>,
}

pub async fn admin_dashboard(State(pool): State<PgPool>) -> impl IntoResponse {
    // Basic Auth Check handled by middleware in main.rs routing
    // Re-implemented slightly differently here because middleware approach in main.rs needs to be applied to specific routes
    // But since we are creating the handler now, I'll rely on the middleware being applied in main.rs
    
    let entries = sqlx::query_as::<_, GuestEntry>(
        "SELECT * FROM guest_entries ORDER BY CASE WHEN status = 'pending_review' THEN 0 ELSE 1 END, created_at DESC",
    )
    .fetch_all(&pool)
    .await
    .unwrap_or_default();

    Html(AdminDashboardTemplate { entries }.render().unwrap())
}

pub async fn approve_entry(
    Path(id): Path<Uuid>,
    State(pool): State<PgPool>,
) -> impl IntoResponse {
    let _ = sqlx::query("UPDATE guest_entries SET status = 'approved' WHERE id = $1")
        .bind(id)
        .execute(&pool)
        .await;
    
    // Redirect back to admin
    (StatusCode::SEE_OTHER, [("Location", "/admin")])
}

pub async fn reject_entry(
    Path(id): Path<Uuid>,
    State(pool): State<PgPool>,
) -> impl IntoResponse {
    let _ = sqlx::query("UPDATE guest_entries SET status = 'rejected' WHERE id = $1")
        .bind(id)
        .execute(&pool)
        .await;

    (StatusCode::SEE_OTHER, [("Location", "/admin")])
}
