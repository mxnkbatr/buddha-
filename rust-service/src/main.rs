use axum::{
    routing::{get, post},
    Router,
    Json,
};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;

#[tokio::main]
async fn main() {
    // initialize tracing
    tracing_subscriber::fmt::init();

    let app = Router::new()
        .route("/", get(root))
        .route("/process", post(process_data))
        .layer(CorsLayer::permissive());

    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    println!("Rust Service listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn root() -> &'static str {
    "Hello from Rust Microservice!"
}

#[derive(Deserialize)]
struct DataPayload {
    items: Vec<i32>,
}

#[derive(Serialize)]
struct ProcessedResult {
    sum: i32,
    sorted: Vec<i32>,
    message: String,
}

async fn process_data(Json(payload): Json<DataPayload>) -> Json<ProcessedResult> {
    let mut items = payload.items;
    items.sort();
    let sum: i32 = items.iter().sum();

    Json(ProcessedResult {
        sum,
        sorted: items,
        message: "Processed by Rust!".to_string(),
    })
}
