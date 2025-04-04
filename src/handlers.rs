use actix_web::{Responder, web, HttpResponse};
use serde::Deserialize;
use serde_json::json;

#[derive(Debug, Deserialize)]
pub struct Coordinates {
    pub lat: f64,
    pub lng: f64,
    pub z: Option<u8>,
    pub date: Option<String>, // Optional date parameter in YYYY-MM-DD format
}

pub async fn health_check() -> impl Responder {
    "Eagle-Eye OSINT Service ✔"
}

pub async fn get_imagery(coords: web::Query<Coordinates>) -> impl Responder {
    // Validate coordinates
    if coords.lat < -90.0 || coords.lat > 90.0 || coords.lng < -180.0 || coords.lng > 180.0 {
        return HttpResponse::BadRequest().json("Invalid coordinates");
    }

    // Validate date format if provided (YYYY-MM-DD)
    if let Some(date) = &coords.date {
        if !is_valid_date_format(date) {
            return HttpResponse::BadRequest().json("Invalid date format. Use YYYY-MM-DD");
        }
    }

    // Construct EOS URL with optional date parameter
    let mut eos_url = format!(
        "https://eos.com/landviewer/?lat={}&lng={}&z={}",
        coords.lat,
        coords.lng,
        coords.z.unwrap_or(12)
    );
    
    // Add date parameter if provided
    if let Some(date) = &coords.date {
        // Parse date components for EOS format
        let parts: Vec<&str> = date.split('-').collect();
        if parts.len() == 3 {
            let year = parts[0];
            let month = parts[1];
            let day = parts[2];
            
            // Add date parameters to URL
            eos_url.push_str(&format!("&fromDate={}&toDate={}", date, date));
            
            // Add menu selection for time-based imagery
            eos_url.push_str("&menuItem=timelapseBasic");
        }
    } else {
        // If no date, use high-resolution imagery menu
        eos_url.push_str("&menuItem=hrImages");
    }

    HttpResponse::Ok().json(json!({"url": eos_url}))
}

// Helper function to validate date format
fn is_valid_date_format(date: &str) -> bool {
    // Basic validation for YYYY-MM-DD format
    let parts: Vec<&str> = date.split('-').collect();
    
    if parts.len() != 3 {
        return false;
    }
    
    // Check parts can be parsed as numbers
    if parts[0].len() != 4 || parts[1].len() != 2 || parts[2].len() != 2 {
        return false;
    }
    
    // Check if all parts are digits
    parts.iter().all(|part| part.chars().all(|c| c.is_digit(10)))
}

pub async fn serve_frontend() -> impl Responder {
    HttpResponse::Ok()
        .content_type("text/html")
        .body(include_str!("../static/index.html"))
}