use actix_web::{web, App, HttpServer};
use actix_files::{Files, NamedFile};
mod handlers;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(Files::new("/static", "./static").show_files_listing())
            .route("/health", web::get().to(handlers::health_check))
            .route("/api/imagery", web::get().to(handlers::get_imagery))
            .route("/", web::get().to(handlers::serve_frontend))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}