// cluster.js
// Combined function to handle clustering logic, toggling, and marker addition
import { toPersianDigits } from './utils.js';
import { clearMarkers, setShowLabels } from './markers.js';
import { getDisplayName } from './data.js';
import { addMarkerLabel, addMarkerWithBackground } from './marker-label.js';

let allClusterMarkers = [];

let clusterGroup = null;
let clusterEnabled = false;
let showLabels = false; // Default to hide labels

// Set cluster enabled/disabled
export function setClusterLabels(show) {
    console.log("Setting cluster labels to:", show); // Debug log
    showLabels = show;
    // Also update regular markers
    setShowLabels(show);
}

export function ClusteredMarker({ map, latLong, type, getSiteTypeIcon, enable, maxClusterRadius = 30, entry }) {
    // Set cluster enabled/disabled
    if (typeof enable === 'boolean') {
        clusterEnabled = enable;
    }
    // Create cluster group if needed
    if (!clusterGroup && clusterEnabled && map) {
        clusterGroup = L.markerClusterGroup({
            showCoverageOnHover: false, // disables the polygon when hovering clusters
            maxClusterRadius,
            iconCreateFunction: function(cluster) {
                const count = cluster.getChildCount();
                return L.divIcon({
                    html: `<span>${toPersianDigits(count)}</span>`,
                    className: 'marker-cluster',
                    iconSize: [28, 28]
                });
            }
        });
        map.addLayer(clusterGroup);
    }
    // Toggle cluster group on/off
    if (map && clusterGroup) {
        if (clusterEnabled && !map.hasLayer(clusterGroup)) {
            map.addLayer(clusterGroup);
        } else if (!clusterEnabled && map.hasLayer(clusterGroup)) {
            map.removeLayer(clusterGroup);
        }
    }
    
    // Get display name if entry is provided
    const displayName = entry ? getDisplayName(entry) : 'Unknown';
    
    // Add marker
    const icon = getSiteTypeIcon(type);
    let marker;
    if (clusterEnabled && clusterGroup) {
        marker = L.marker(latLong, { 
            icon: icon,
            title: displayName // Keep for reference
        });
        
        // Add permanent label if labels are enabled
        if (showLabels && displayName !== 'Unknown') {
            addMarkerWithBackground(marker, displayName);
        }
        
        clusterGroup.addLayer(marker);
        allClusterMarkers.push(marker);
        return marker;
    } else if (!clusterEnabled && map) {
        marker = L.marker(latLong, { 
            icon: icon,
            title: displayName // Keep for reference
        }).addTo(map);
        
        // Add permanent label if labels are enabled
        if (showLabels && displayName !== 'Unknown') {
            addMarkerWithBackground(marker, displayName);
        }
        
        allClusterMarkers.push(marker);
        return marker;
    }
    return null;
}

export function setClusterEnabled(val) {
    clusterEnabled = !!val;
    // Remove all markers from map if disabling cluster
    if (!clusterEnabled && clusterGroup && window.leafletMap) {
        window.leafletMap.removeLayer(clusterGroup);
        clusterGroup = null;
        clearMarkers(); // Also clear all individual markers
    }
}

export function getClusterEnabled() {
    return clusterEnabled;
}

export function clearClusterGroup() {
    if (clusterGroup) {
        clusterGroup.clearLayers();
    }
    allClusterMarkers.forEach(marker => {
        if (window.leafletMap && window.leafletMap.hasLayer(marker)) {
            window.leafletMap.removeLayer(marker);
        }
    });
    allClusterMarkers = [];
    clearMarkers(); // Always clear all individual markers too
}