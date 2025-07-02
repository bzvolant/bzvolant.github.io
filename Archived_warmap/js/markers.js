// Marker management system
import { getDisplayName } from './data.js';
import { addMarkerLabel, addMarkerWithBackground } from './marker-label.js';
import { darkenColor } from './utils.js';
let mapInstance = null;
let allMarkers = [];
let showLabels = false; // Default to hide labels
// Variable to track if we're using circle markers
let useCircleMarkers = false;

// Expose the showLabels state to the window object for other modules to access
window.showLabels = showLabels;

// Initialize the marker system with a map instance
export function initializeMarkerSystem(map) {
    mapInstance = map;
    allMarkers = [];
}

// Set whether labels should be displayed
export function setShowLabels(show) {
    console.log("Setting showLabels to:", show); // Debug log
    showLabels = show;
    window.showLabels = show; // Update the window object
}

// Set whether to use circle markers
export function setUseCircleMarkers(use) {
    console.log("Setting useCircleMarkers to:", use);
    useCircleMarkers = use;
    window.useCircleMarkers = use; // Update the window object
}

// Get whether circle markers are being used
export function getUseCircleMarkers() {
    return useCircleMarkers;
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
        iconSize: [32, 32], // Size of the icon
        iconAnchor: [16, 16], // Point of the icon which corresponds to marker's location
        popupAnchor: [0, -8], // Point from which the popup should open relative to the iconAnchor
    });
}

// Add a marker to the map
export function addMarker(latLong, type, entry) {
    if (!mapInstance) {
        console.error('Map not initialized. Call initializeMarkerSystem first.');
        return null;
    }

    // Get the appropriate icon
    const icon = getSiteTypeIcon(type);
    
    // Get display name if entry is provided
    const displayName = entry ? getDisplayName(entry) : 'Unknown';
    console.log(`Adding marker with displayName: ${displayName}, showLabels: ${showLabels}`); // Debug log

    // Create marker with icon (no title needed as we'll use div labels)
    const marker = L.marker(latLong, { 
        icon: icon,
        title: displayName // Keep this for reference even though we'll use div labels
    }).addTo(mapInstance);
    
    // Add permanent label if labels are enabled
    if (showLabels && displayName !== 'Unknown') {
        console.log(`Adding label to marker: ${displayName}`); // Debug log
        addMarkerWithBackground(marker, displayName);
    } else {
        console.log(`Not adding label to marker: showLabels=${showLabels}, displayName=${displayName}`); // Debug why labels aren't showing
    }
    
    allMarkers.push(marker);
    
    return marker;
}

// Function to add a circle marker to the map
export function addCircleMarker(latLong, type, entry) {
    if (!mapInstance) {
        console.error('Map not initialized. Call initializeMarkerSystem first.');
        return null;
    }

    // Determine the color based on the type
    let color = '#3388ff'; // Default blue
    
    // Map site types to colors
    const typeColor = {
        'military': '#ff0000', // Red
        'civilian': '#00ff00', // Green
        'energy': '#ffff00', // Yellow
        'industry': '#ff8c00', // Orange
        'nuclear': '#800080', // Purple
        'oil': '#000000', // Black
        'personofinterest': '#ff00ff', // Magenta
        'utility': '#00ffff', // Cyan
        'injured': '#ff6347', // Tomato
    };
    
    // Get the normalized type
    const normalizedType = Array.isArray(type) ? type[0].toLowerCase() : 
                          (typeof type === 'string' ? type.toLowerCase() : 'unknown');
    
    // Set color based on type
    if (typeColor[normalizedType]) {
        color = typeColor[normalizedType];
    }
    
    // Get display name if entry is provided
    const displayName = entry ? getDisplayName(entry) : 'Unknown';
    
    // Create circle marker

    const circleMarker = L.circleMarker(latLong, {
        radius: 6,
        fillColor: color,
        color: darkenColor(color, 0.4),
        weight: 1,
        opacity: 1,
        fillOpacity: 0.9,
        title: displayName
    }).addTo(mapInstance);
    
    // Add permanent label if labels are enabled
    if (showLabels && displayName !== 'Unknown') {
        // Create tooltip with permanent option
        circleMarker.bindTooltip(displayName, {
            permanent: true,
            direction: 'top',
            className: 'circle-marker-label'
        });
    }
    
    // Store the marker reference
    allMarkers.push(circleMarker);
    
    return circleMarker;
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

