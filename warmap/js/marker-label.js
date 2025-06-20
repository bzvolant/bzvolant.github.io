// marker-label.js
// This file adds functionality for adding permanent labels to markers

// Function to add a permanent label to a marker
export function addMarkerLabel(marker, displayName, options = {}) {
    if (!marker || !displayName) return;
    
    // Create custom icon with label
    const icon = marker.getIcon();
    const originalIconUrl = icon.options.iconUrl;
    const originalIconSize = icon.options.iconSize;
    
    // Create a div icon with the SVG and text label overlaid
    const customIcon = L.divIcon({
        html: `
            <div class="marker-with-label-container">
                <div class="marker-icon-wrapper">
                    <img src="${originalIconUrl}" class="marker-svg" width="${originalIconSize[0]}" height="${originalIconSize[1]}">
                    <div class="marker-label-overlay">${displayName}</div>
                </div>
            </div>
        `,
        className: 'custom-div-icon',
        iconSize: [Math.max(originalIconSize[0], 80), originalIconSize[1]], // Make sure it's wide enough for text
        iconAnchor: [Math.max(originalIconSize[0], 80)/2, originalIconSize[1]/2] // Center anchor
    });
    
    // Replace the marker's icon with our custom icon
    marker.setIcon(customIcon);
    
    return marker;
}

// Function to remove labels from markers
export function removeMarkerLabel(marker) {
    if (!marker) {
        console.error("Cannot remove label: marker is null or undefined");
        return null;
    }
    
    try {
        // Get the original icon URL from the marker
        let originalIconUrl = null;
        
        try {
            // First try to extract iconUrl from the HTML content
            const divIcon = marker.getIcon();
            if (divIcon && divIcon.options && divIcon.options.html) {
                const htmlContent = divIcon.options.html;
                const match = htmlContent.match(/src="([^"]+)"/);
                if (match && match[1]) {
                    originalIconUrl = match[1];
                    console.log(`Extracted icon URL from HTML: ${originalIconUrl}`);
                }
            } 
            // If can't get from HTML, try getting from marker options
            else if (marker.options && marker.options.icon && marker.options.icon.options && marker.options.icon.options.iconUrl) {
                originalIconUrl = marker.options.icon.options.iconUrl;
                console.log(`Got icon URL from marker options: ${originalIconUrl}`);
            }
        } catch (error) {
            console.error("Error extracting icon URL:", error);
        }
        
        // If we have a marker type, try to determine icon from that
        if (!originalIconUrl && marker.options && marker.options.type) {
            // Try to get icon based on marker type
            const type = marker.options.type;
            if (typeof type === 'string') {
                const possibleIcon = `svg/${type.toLowerCase()}.svg`;
                // Basic check for known types
                if (['industry', 'energy', 'civilian', 'injured', 'military', 
                     'nuclear', 'oil', 'personofinterest', 'utility'].includes(type.toLowerCase())) {
                    originalIconUrl = possibleIcon;
                    console.log(`Determined icon URL from type: ${originalIconUrl}`);
                }
            }
        }
        
        // Use default icon if we couldn't determine the original
        if (!originalIconUrl) {
            originalIconUrl = 'svg/un.svg';
            console.warn("Using default UN icon as fallback");
        }
        
        // Create new standard icon with the original icon URL
        const originalIcon = L.icon({
            iconUrl: originalIconUrl,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -8]
        });
        
        // Replace the div icon with the original icon
        marker.setIcon(originalIcon);
        
        return marker;
    } catch (error) {
        console.error("Error removing marker label:", error);
        
        // Fallback to default icon if everything else fails
        try {
            const defaultIcon = L.icon({
                iconUrl: 'svg/un.svg',
                iconSize: [32, 32],
                iconAnchor: [16, 16],
                popupAnchor: [0, -8]
            });
            marker.setIcon(defaultIcon);
            console.warn("Used fallback icon due to error");
        } catch (fallbackError) {
            console.error("Fallback icon also failed:", fallbackError);
        }
        
        return marker;
    }
}

// Function to toggle visibility of all marker labels
export function toggleMarkerLabels(map, visible) {
    if (!map) {
        console.error("toggleMarkerLabels: Map is not available");
        return;
    }
    
    console.log(`toggleMarkerLabels called with visible=${visible}`); // Debug log
    
    try {
        let markerCount = 0;
        // Get all markers and toggle their labels
        map.eachLayer(layer => {
            try {
                if (layer instanceof L.Marker) {
                    markerCount++;
                    if (visible) {
                        // Get the display name from the marker options
                        const displayName = layer.options.title || 'Unknown';
                        console.log(`Adding background label to marker: ${displayName}`); // Debug log
                        // Use the background style for better visibility
                        addMarkerWithBackground(layer, displayName);
                    } else {
                        console.log("Removing label from marker"); // Debug log
                        removeMarkerLabel(layer);
                    }
                }
            } catch (layerError) {
                console.error("Error processing layer:", layerError);
            }
        });
        
        console.log(`Processed ${markerCount} markers`); // Debug log
    } catch (error) {
        console.error("Error in toggleMarkerLabels:", error);
    }
}

// Function to show labels only at certain zoom levels
export function setupZoomBasedLabels(map, minZoom = 13) {
    if (!map) return;
    
    // We no longer add 'zoomend' handler here because it's handled in script.js
    // This prevents duplicate event handlers that can cause icon replacement
    
    // Just do initial setup based on current zoom
    const initialZoom = map.getZoom();
    toggleMarkerLabels(map, initialZoom >= minZoom);
}

// Function to add a marker with background label (alternative style)
export function addMarkerWithBackground(marker, displayName, options = {}) {
    if (!marker || !displayName) {
        console.error("Cannot add background to marker: invalid marker or displayName");
        return marker;
    }
    
    console.log(`Adding background to marker with displayName: ${displayName}`); // Debug log
    
    try {
        // Create custom icon with label
        let originalIconUrl = null;
        
        try {
            const icon = marker.getIcon();
            // Check if icon and options exist and iconUrl is valid
            if (icon && icon.options) {
                if (icon.options.iconUrl) {
                    originalIconUrl = icon.options.iconUrl;
                    console.log(`Got icon URL: ${originalIconUrl}`);
                } else if (icon.options.html) {
                    // Try to extract from HTML content
                    const match = icon.options.html.match(/src="([^"]+)"/);
                    if (match && match[1]) {
                        originalIconUrl = match[1];
                        console.log(`Extracted icon URL from HTML: ${originalIconUrl}`);
                    }
                }
            }
            
            // If we can't get the icon URL, try to determine it from marker options
            if (!originalIconUrl && marker.options) {
                if (marker.options.icon && marker.options.icon.options && marker.options.icon.options.iconUrl) {
                    originalIconUrl = marker.options.icon.options.iconUrl;
                    console.log(`Got icon URL from marker options: ${originalIconUrl}`);
                } else if (marker.options.type) {
                    // Try to determine icon from marker type
                    const type = marker.options.type;
                    if (typeof type === 'string') {
                        const possibleIcon = `svg/${type.toLowerCase()}.svg`;
                        // Check if the type is one we know about
                        if (['industry', 'energy', 'civilian', 'injured', 'military', 
                             'nuclear', 'oil', 'personofinterest', 'utility'].includes(type.toLowerCase())) {
                            originalIconUrl = possibleIcon;
                            console.log(`Determined icon URL from type: ${originalIconUrl}`);
                        }
                    }
                }
            }
        } catch (iconError) {
            console.error("Error getting icon URL:", iconError);
        }
        
        // Use default icon if we couldn't determine one
        if (!originalIconUrl) {
            originalIconUrl = 'svg/un.svg';
            console.warn(`Using default icon for marker: ${displayName}`);
        }
        
        // Create a div icon with background that contains both text and icon
        const customIcon = L.divIcon({
            html: `
                <div class="marker-with-background">
                    <img src="${originalIconUrl}" class="marker-background-icon" onerror="this.src='svg/un.svg';">
                    <span class="marker-background-text">${displayName}</span>
                </div>
            `,
            className: 'custom-div-icon',
            iconSize: [180, 36], // Larger size for better visibility [240, 36]
            iconAnchor:  [160, 20], // Center anchor [221.5, 21.5]
        });
        
        // Replace the marker's icon with our custom icon
        marker.setIcon(customIcon);
        console.log("Successfully added background to marker"); // Debug log
    } catch (error) {
        console.error("Error adding background to marker:", error);
    }
    
    return marker;
}

// Direct function to apply labels to all markers on the map
export function applyLabelsToAllMarkers(map, forceRefresh = false) {
    if (!map) {
        console.error("applyLabelsToAllMarkers: Map is not available");
        return;
    }
    
    // Get the current global state for showing labels
    const labelsEnabled = window.showLabels !== undefined ? window.showLabels : true;
    console.log("Applying labels to all markers, showLabels =", labelsEnabled, "forceRefresh =", forceRefresh);
    
    try {
        // Only use force refresh in extreme cases where markers are corrupted
        // We recommend avoiding this entirely as it causes visible flickering
        if (forceRefresh) {
            console.warn("Force refreshing markers - this may cause flickering!");
            
            // Store all marker positions and properties
            const markersInfo = [];
            map.eachLayer(layer => {
                if (layer instanceof L.Marker) {
                    try {
                        // Gather all relevant information from the marker
                        const info = {
                            latlng: layer.getLatLng(),
                            options: layer.options || {},
                            popup: layer.getPopup() ? layer.getPopup().getContent() : null
                        };
                        
                        // Try to get the icon URL if possible
                        try {
                            const icon = layer.getIcon();
                            if (icon && icon.options) {
                                if (icon.options.iconUrl) {
                                    info.iconUrl = icon.options.iconUrl;
                                } else if (icon.options.html) {
                                    // Try to extract from HTML
                                    const match = icon.options.html.match(/src="([^"]+)"/);
                                    if (match && match[1]) {
                                        info.iconUrl = match[1];
                                    }
                                }
                            }
                        } catch (iconError) {
                            console.warn("Could not get icon info:", iconError);
                        }
                        
                        markersInfo.push(info);
                    } catch (e) {
                        console.error("Error getting marker info:", e);
                    }
                }
            });
            
            // Remove all existing markers
            map.eachLayer(layer => {
                if (layer instanceof L.Marker) {
                    try {
                        map.removeLayer(layer);
                    } catch (e) {
                        console.error("Error removing layer:", e);
                    }
                }
            });
            
            // Re-add markers with labels
            markersInfo.forEach(info => {
                try {
                    // Prepare icon if we have a URL
                    if (info.iconUrl) {
                        info.options.icon = L.icon({
                            iconUrl: info.iconUrl,
                            iconSize: [32, 32],
                            iconAnchor: [16, 16],
                            popupAnchor: [0, -8]
                        });
                    }
                    
                    const marker = L.marker(info.latlng, info.options).addTo(map);
                    
                    if (info.popup) {
                        marker.bindPopup(info.popup);
                    }
                    
                    // Add label to marker if labels are enabled
                    const displayName = info.options.title || 'Unknown';
                    if (labelsEnabled) {
                        addMarkerWithBackground(marker, displayName);
                    }
                } catch (e) {
                    console.error("Error re-adding marker:", e);
                }
            });
            
            console.log(`Re-added ${markersInfo.length} markers with labels=${labelsEnabled}`);
        } else {
            // Just process markers that need label changes (more efficient)
            let updateCount = 0;
            let skipCount = 0;
            
            map.eachLayer(layer => {
                if (layer instanceof L.Marker) {
                    try {
                        const displayName = layer.options.title || 'Unknown';
                        
                        // Check if this marker already has the correct label state
                        let hasLabel = false;
                        try {
                            const icon = layer.getIcon();
                            hasLabel = icon && icon.options && icon.options.html && 
                                     icon.options.html.includes('marker-with-background');
                        } catch (iconError) {
                            console.warn("Error checking icon state:", iconError);
                        }
                        
                        // Only update markers that need changes
                        if (labelsEnabled && !hasLabel) {
                            addMarkerWithBackground(layer, displayName);
                            updateCount++;
                        } else if (!labelsEnabled && hasLabel) {
                            removeMarkerLabel(layer);
                            updateCount++;
                        } else {
                            skipCount++;
                        }
                    } catch (e) {
                        console.error("Error processing marker label:", e);
                    }
                }
            });
            
            console.log(`Updated ${updateCount} markers, skipped ${skipCount} already correct markers`);
        }
    } catch (error) {
        console.error("Error in applyLabelsToAllMarkers:", error);
    }
}
