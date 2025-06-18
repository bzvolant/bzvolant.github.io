import { calculateCoordinates } from './data.js';
import { addMarker, clearMarkers } from './markers.js';
import { createPopup } from './popup.js';
import { setURLFromUI } from './queries.js';

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
      const marker = addMarker(latLong, entry.siteType || entry.type);
      if (marker) {
        // Create and bind popup
        const popup = L.popup().setContent(popupContent);
        marker.bindPopup(popup);
      }
    }
  });

  // Log and return count
  const count = filteredData.length;
  console.log(`Displayed ${count} markers after filtering`);
  return count;
}

