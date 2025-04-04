// Wait for the DOM to be loaded before initializing the app
document.addEventListener('DOMContentLoaded', function() {
    // Splash Screen Logic
    document.getElementById('start-button').addEventListener('click', function() {
        document.getElementById('splash-screen').classList.add('slide-up');
        document.getElementById('main-app').classList.remove('hidden');
        
        // Initialize map after splash screen is hidden
        setTimeout(function() {
            initializeMap();
        }, 800); // Slightly less than animation time
    });
});

function initializeMap() {
    // Initialize Leaflet map
    const map = L.map('map', {
        preferCanvas: true,
        zoomControl: false
    }).setView([20, 0], 2);
    
    // Set map data-loaded attribute to true when tiles load
    map.on('load', function() {
        document.getElementById('map').setAttribute('data-loaded', 'true');
    });
    
    // Ensure map is marked as loaded
    setTimeout(function() {
        document.getElementById('map').setAttribute('data-loaded', 'true');
    }, 2000);
    
    // Add zoom control to top-right
    L.control.zoom({
        position: 'topright'
    }).addTo(map);
    
    // Add OSM tile layer with dark theme
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Eagle-Eye by Hexguard',
        maxZoom: 19
    }).addTo(map);
    
    // Add a coordinates display control
    const coordsDisplay = L.control({
        position: 'bottomleft'
    });
    
    coordsDisplay.onAdd = function() {
        const div = L.DomUtil.create('div', 'coords-display');
        div.innerHTML = 'Coordinates: Click on map';
        return div;
    };
    coordsDisplay.addTo(map);
    
    // Update coordinates on mouse move
    map.on('mousemove', function(e) {
        const lat = e.latlng.lat.toFixed(6);
        const lng = e.latlng.lng.toFixed(6);
        document.querySelector('.coords-display').innerHTML = `Coordinates: ${lat}, ${lng}`;
    });
    
    // Eagle Eye Control Panel (TOP LEFT)
    const mainControl = L.control({
        position: 'topleft'
    });
    
    mainControl.onAdd = function() {
        const div = L.DomUtil.create('div', 'eagle-eye-control');
        
        // Add logo
        div.innerHTML = `<div class="eagle-eye-logo"><i class="fas fa-eye"></i> EAGLE-EYE</div>`;
        
        // Add EOS Viewer Button
        div.innerHTML += `
            <div class="date-control">
                <input type="date" id="imagery-date" placeholder="Select Date">
            </div>
            <button id="get-imagery" class="eagle-eye-btn">Get EOS Imagery</button>
            <button id="locate-me" class="eagle-eye-btn">Get My Location</button>
        `;
        
        return div;
    };
    mainControl.addTo(map);

    // Drawing Controls (BOTTOM RIGHT)
    const drawControl = L.control({
        position: 'bottomright'
    });
    
    drawControl.onAdd = function() {
        const div = L.DomUtil.create('div', 'eagle-eye-control');
        div.innerHTML = `
            <button id="add-marker" class="eagle-eye-btn btn-marker"><i class="fas fa-map-marker-alt"></i> Add Marker</button>
            <button id="draw-polygon" class="eagle-eye-btn btn-polygon"><i class="fas fa-draw-polygon"></i> Draw Area</button>
            <button id="capture" class="eagle-eye-btn btn-capture"><i class="fas fa-camera"></i> Capture</button>
        `;
        return div;
    };
    drawControl.addTo(map);
    
    // Add measurement control
    const measureControl = L.control.measure({
        position: 'bottomright',
        primaryLengthUnit: 'kilometers',
        secondaryLengthUnit: 'miles',
        primaryAreaUnit: 'sqkilometers',
        secondaryAreaUnit: 'acres',
        activeColor: '#00e8fc',
        completedColor: '#9d4edd'
    });
    measureControl.addTo(map);
    
    // Initialize the Leaflet Draw plugin
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    
    // Event Listeners for custom buttons
    
    // Get EOS Imagery
    document.getElementById('get-imagery').addEventListener('click', function() {
        const center = map.getCenter();
        const zoom = map.getZoom();
        const date = document.getElementById('imagery-date').value;
        
        // Validate coordinates before making API request
        if (!center) {
            alert('Please navigate to an area of interest on the map first.');
            return;
        }
        
        // Build API URL with date if provided
        let url = `/api/imagery?lat=${center.lat}&lng=${center.lng}&z=${zoom}`;
        if (date) {
            url += `&date=${date}`;
            // Add visual indicator that date was included
            this.classList.add('with-date');
        } else {
            this.classList.remove('with-date');
        }
        
        // Create popup
        const popupContent = `
            <div class="popup-content">
                <h4>EOS Imagery Request</h4>
                <p>Coordinates: ${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}</p>
                ${date ? `<p>Date: ${date}</p>` : ''}
                <a href="${url}" class="open-link" target="_blank">Open in EOS Viewer <i class="fas fa-external-link-alt"></i></a>
            </div>
        `;
        
        L.popup()
            .setLatLng(center)
            .setContent(popupContent)
            .openOn(map);
    });
    
    // Get user's geolocation
    document.getElementById('locate-me').addEventListener('click', function() {
        if (navigator.geolocation) {
            // Show loading indicator
            const loadingPopup = L.popup()
                .setLatLng(map.getCenter())
                .setContent('<div class="loading-pulse"></div> Getting your location...')
                .openOn(map);
            
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    const userLat = position.coords.latitude;
                    const userLng = position.coords.longitude;
                    const userLocation = L.latLng(userLat, userLng);
                    
                    // Close loading popup
                    map.closePopup();
                    
                    // Set view to user's location
                    map.setView(userLocation, 14);
                    
                    // Add a marker at user's location
                    const userMarker = L.marker(userLocation).addTo(map);
                    userMarker.bindPopup('Your Location').openPopup();
                },
                function(error) {
                    // Close loading popup
                    map.closePopup();
                    
                    // Show error
                    alert('Error getting your location: ' + error.message);
                }
            );
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    });
    
    // Add Marker Button
    document.getElementById('add-marker').addEventListener('click', function() {
        // Enable marker placement mode
        map.once('click', function(e) {
            const marker = L.marker(e.latlng).addTo(map);
            
            // Create popup with coordinates
            const popupContent = `
                <div class="popup-content">
                    <h4>Marker</h4>
                    <p>Coordinates: ${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}</p>
                </div>
            `;
            
            marker.bindPopup(popupContent).openPopup();
            
            // Add to the drawn items layer for management
            drawnItems.addLayer(marker);
        });
        
        // Visual feedback
        this.innerHTML = '<i class="fas fa-crosshairs"></i> Click on Map';
        
        // Reset button text after click
        map.once('click', () => {
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-map-marker-alt"></i> Add Marker';
            }, 100);
        });
    });
    
    // Draw Polygon Button
    document.getElementById('draw-polygon').addEventListener('click', function() {
        // Create a temporary drawing control
        const drawingControl = new L.Control.Draw({
            draw: {
                marker: false,
                circlemarker: false,
                circle: false,
                rectangle: false,
                polyline: false,
                polygon: {
                    shapeOptions: {
                        color: '#00e8fc',
                        fillColor: '#1e0e38',
                        fillOpacity: 0.3
                    }
                }
            },
            edit: {
                featureGroup: drawnItems
            }
        });
        
        // Add the drawing control temporarily
        map.addControl(drawingControl);
        
        // Simulate a click on the polygon button
        document.querySelector('.leaflet-draw-draw-polygon').click();
        
        // Remove the drawing control after the polygon is created
        map.on('draw:created', function() {
            map.removeControl(drawingControl);
        });
        
        // Also remove if drawing is canceled
        map.on('draw:drawstop', function() {
            map.removeControl(drawingControl);
        });
    });
    
    // Handle drawn items
    map.on('draw:created', function(e) {
        const layer = e.layer;
        drawnItems.addLayer(layer);
        
        // If it's a polygon, add area information
        if (e.layerType === 'polygon') {
            // Calculate area in square kilometers
            const latlngs = layer.getLatLngs()[0];
            const area = L.GeometryUtil.geodesicArea(latlngs) / 1000000; // convert to km²
            
            // Add a popup with area information
            layer.bindPopup(`<div class="popup-content"><h4>Area</h4>${area.toFixed(2)} km²</div>`);
        }
    });
    
    // Capture Button
    document.getElementById('capture').addEventListener('click', function() {
        // Visual feedback
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        // Use html2canvas to take a screenshot of the map
        html2canvas(document.getElementById('map')).then(function(canvas) {
            // Convert canvas to a data URL
            const imgData = canvas.toDataURL('image/png');
            
            // Create a link element to download the image
            const link = document.createElement('a');
            link.href = imgData;
            link.download = `eagle-eye-capture-${new Date().toISOString().split('T')[0]}.png`;
            
            // Append the link to the body and click it
            document.body.appendChild(link);
            link.click();
            
            // Remove the link from the DOM
            document.body.removeChild(link);
            
            // Reset button text
            setTimeout(() => {
                document.getElementById('capture').innerHTML = '<i class="fas fa-camera"></i> Capture';
            }, 1000);
        });
    });
    
    // Listen for date selection and update button styling
    document.getElementById('imagery-date').addEventListener('change', function() {
        if (this.value) {
            document.getElementById('get-imagery').classList.add('with-date');
        } else {
            document.getElementById('get-imagery').classList.remove('with-date');
        }
    });
    
    // Add different base maps as layers
    const baseMaps = {
        "Street": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }),
        "Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }),
        "Terrain": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
        })
    };
    
    // Add layer control to top right
    L.control.layers(baseMaps, null, {
        position: 'topright',
        collapsed: false
    }).addTo(map);
    
    // Set initial base map
    baseMaps["Street"].addTo(map);
}