# Eagle-Eye

An OSINT-focused local web app for satellite imagery analysis from multiple providers including EOS LandViewer.

Eagle-Eye is focused on providing a tool for non-technical users to access satellite imagery.  It uses a simple-to-use web interface to allow users to search for and view satellite imagery and perform simple analysis tasks.

## OSINT Capabilities

- Geospatial intelligence gathering
- Change detection over time
- Infrastructure monitoring
- Incident verification
- Cybersecurity reconnaissance

## Current Features

- Coordinate-based imagery retrieval from EOS LandViewer
- URL parameter parsing for quick access
- Basic metadata display

## Planned Integrations

### Satellite Services
- Sentinel Hub
- Landsat
- Planet Labs
- Maxar

### OSINT Features
- Historical imagery comparison
- Metadata extraction
- Automated change detection
- Export capabilities for reports
- API for integration with other OSINT tools

## Security Considerations

⚠️ **Important**: 
- This tool should only be used for legitimate research
- Be aware of local laws regarding satellite imagery
- Some providers may track usage patterns

## Installation
```bash
# Clone repository
git clone https://github.com/your-repo/eagle-eye.git
cd eagle-eye

# Build and run
cargo build --release
cargo run
```

## Usage Examples

### Basic Coordinate Search
`http://localhost:8080/?lat=12.99979&lng=77.66641`

### Advanced Parameters
`http://localhost:8080/?lat=12.99979&lng=77.66641&source=sentinel&date=2025-03-01`

## Contributing

This project welcomes contributions from the OSINT and cybersecurity communities.
