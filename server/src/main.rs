use axum::{
    extract::{ConnectInfo, Request, State},
    middleware::{self, Next},
    response::Response,
    routing::{get, post},
    Router,
};
use dotenvy::dotenv;
use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;
use std::env;
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

pub mod handlers;
pub mod models;

#[tokio::main]
async fn main() {
    dotenv().ok();

    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            env::var("RUST_LOG").unwrap_or_else(|_| "guestbook_server=debug,tower_http=debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to connect to database");

    // Initialize database table if it doesn't exist (basic migration for this scale)
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS guest_entries (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            message TEXT NOT NULL,
            website TEXT,
            status TEXT NOT NULL DEFAULT 'approved',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        "#,
    )
    .execute(&pool)
    .await
    .expect("Failed to run migration");

    let app = Router::new()
        .route("/api/guestbook", get(handlers::get_entries).post(handlers::create_entry))
        .route("/admin", get(handlers::admin_dashboard)) // Protected
        .route("/admin/approve/:id", post(handlers::approve_entry)) // Protected
        .route("/admin/reject/:id", post(handlers::reject_entry)) // Protected
        .route_layer(middleware::from_fn(localhost_only_admin))
        .layer(TraceLayer::new_for_http())
        .layer(CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any))
        .with_state(pool);

    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    tracing::info!("listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>())
        .await
        .unwrap();
}

async fn localhost_only_admin(
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    req: Request,
    next: Next,
) -> Result<Response, axum::http::StatusCode> {
    if req.uri().path().starts_with("/admin") {
        let ip = addr.ip();
        let is_allowed = ip.is_loopback() || is_docker_network(&ip);
        if !is_allowed {
            tracing::warn!("Blocked admin access from non-localhost IP: {}", ip);
            return Err(axum::http::StatusCode::FORBIDDEN);
        }
    }
    Ok(next.run(req).await)
}

fn is_docker_network(ip: &std::net::IpAddr) -> bool {
    match ip {
        std::net::IpAddr::V4(ipv4) => {
            let octets = ipv4.octets();
            // Docker bridge networks: 172.16.0.0 - 172.31.255.255
            octets[0] == 172 && (16..=31).contains(&octets[1])
        }
        _ => false,
    }
}
