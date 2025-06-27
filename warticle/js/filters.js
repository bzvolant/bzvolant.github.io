import { calculateCoordinates } from './data.js';
import { addMarker, addCircleMarker, clearMarkers } from './markers.js';
import { createPopup } from './popup.js';
import { setURLFromUI } from './queries.js';
import { getMapInstance } from './map.js';
import { toggleMarkerLabels } from './marker-label.js';

// Filter entries by time
export function filterByTime(entries, days) {
  if (!days) return entries;

  const now = new Date();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - parseInt(days, 10));

  return entries.filter((entry) => {
    if (!entry.date) return false;
    const entryDate = new Date(entry.date);
    return entryDate >= cutoffDate;
  });
}

// Filter entries by type
export function filterByType(entries, selectedTypes) {
  if (!selectedTypes || selectedTypes.length === 0) return entries;
  return entries.filter((entry) => selectedTypes.includes(entry.siteType || entry.type));
}

// Unified function for all filter operations
export function applyFilters(options = {}) {
  // Default options
  const defaults = {
    data: window.originalData,
    timeValue: null,
    selectedTypes: [],
    updateURL: true,
    fromUI: true,
  };

  // Merge provided options with defaults
  const config = { ...defaults, ...options };

  // If no data, return early
  if (!config.data) {
    console.warn("No data available for filtering");
    return 0;
  }

  // If getting values from UI
  if (config.fromUI) {
    // Get time filter value
    config.timeValue = document.getElementById("timeFilter").value;

    // Get selected type values
    config.selectedTypes = Array.from(
      document.querySelectorAll(
        "#siteTypeFilterContainer input[type=checkbox]:checked"
      )
    ).map((cb) => cb.value);
  }

  // Update URL if requested
  if (config.updateURL) {
    setURLFromUI();
  }

  // Apply filters to data
  let filteredData = config.data;

  // Apply time filter if specified
  if (config.timeValue) {
    filteredData = filterByTime(filteredData, config.timeValue);
  }

  // Apply type filter if specified
  if (config.selectedTypes && config.selectedTypes.length > 0) {
    filteredData = filterByType(filteredData, config.selectedTypes);
  }

  // Clear existing markers
  clearMarkers();
  if (window.clearClusterGroup) {
    window.clearClusterGroup();
  }

  // Add filtered markers
  filteredData.forEach((entry) => {
    const latLong = calculateCoordinates(entry);
    if (latLong) {
      // Create marker and get rich popup content
      console.log('Creating popup for entry:', {
        siteType: entry.siteType,
        type: entry.type,
        militaryCasualties: entry.militaryCasualties,
        civilianCasualties: entry.civilianCasualties,
        uncategorisedCasualties: entry.uncategorisedCasualties
      });
      const popupContent = createPopup(entry);
      console.log('Generated popup content:', popupContent);
      
      // Check if we should use circle markers
      let marker;
      if (window.useCircleMarkers) {
        // Use circle markers
        marker = addCircleMarker(latLong, entry.siteType || entry.type, entry);
      } else {
        // Use addClusteredMarker if available, otherwise fallback to addMarker
        if (typeof window.addClusteredMarker === 'function') {
          marker = window.addClusteredMarker(latLong, entry.siteType || entry.type, entry);
        } else {
          marker = addMarker(latLong, entry.siteType || entry.type, entry);
        }
      }
      if (marker) {
        // Create and bind popup
        const popup = L.popup().setContent(popupContent);
        marker.bindPopup(popup);
      }
    }
  });

  // Make sure labels are shown or hidden according to the current settings
  const map = getMapInstance();
  if (map) {
    // This ensures labels are correctly shown/hidden based on current settings
    const labelToggle = document.getElementById('labelToggle');
    if (labelToggle) {
      toggleMarkerLabels(map, labelToggle.checked);
    }
  }

  // Log and return count
  const count = filteredData.length;
  console.log(`Displayed ${count} markers after filtering`);
  
  // Force label refresh
  const labelToggle = document.getElementById('labelToggle');
  if (labelToggle && labelToggle.checked) {
    console.log("Force refreshing labels"); // Debug log
    const map = getMapInstance();
    if (map) {
      toggleMarkerLabels(map, true);
    }
  }
  
  return count;
}

