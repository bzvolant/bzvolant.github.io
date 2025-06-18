// Marker management system
let mapInstance = null;
let allMarkers = [];

// Initialize the marker system with a map instance
export function initializeMarkerSystem(map) {
    mapInstance = map;
    allMarkers = [];
}

// Get the appropriate icon for a site type
export function getSiteTypeIcon(siteType) {
    // Default icon if no match is found
    let iconUrl = "svg/un.svg";

    // Handle different siteType formats
    if (Array.isArray(siteType) && siteType.length > 0) {
        // For arrays, use the first type that has a matching SVG
        for (const type of siteType) {
            const possibleIcon = `svg/${type.toLowerCase()}.svg`;
            // Check if the SVG exists for this type
            if ([
                "industry",
                "energy",
                "civilian",
                "injured",
                "military",
                "nuclear",
                "oil",
                "personofinterest",
                "utility",
            ].includes(type.toLowerCase())) {
                iconUrl = possibleIcon;
                break; // Use the first matching icon
            }
        }
    } else if (typeof siteType === "string") {
        // For strings, check if the SVG exists
        const normalizedType = siteType.toLowerCase();
        if ([
            "industry",
            "energy",
            "civilian",
            "injured",
            "military",
            "nuclear",
            "oil",
            "personofinterest",
            "utility",
        ].includes(normalizedType)) {
            iconUrl = `svg/${normalizedType}.svg`;
        }
    }

    // Create and return the icon
    return L.icon({
        iconUrl: iconUrl,
        iconSize: [24, 24], // Size of the icon
        iconAnchor: [12, 12], // Point of the icon which corresponds to marker's location
        popupAnchor: [0, -12], // Point from which the popup should open relative to the iconAnchor
    });
}

// Add a marker to the map
export function addMarker(latLong, type) {
    if (!mapInstance) {
        console.error('Map not initialized. Call initializeMarkerSystem first.');
        return null;
    }

    // Get the appropriate icon
    const icon = getSiteTypeIcon(type);

    // Create marker with icon
    const marker = L.marker(latLong, { icon: icon }).addTo(mapInstance);
    allMarkers.push(marker);
    
    return marker;
}

// Clear all markers from the map
export function clearMarkers() {
    if (!mapInstance) {
        console.error('Map not initialized. Call initializeMarkerSystem first.');
        return;
    }

    allMarkers.forEach((marker) => {
        mapInstance.removeLayer(marker);
    });
    allMarkers = [];
}
