import { createSiteTypeFilter, createTimeFilter } from "./filterUI.js";
import { calculateCasualties } from "./casualties.js";
import { processLocationData, calculateCoordinates, getUniqueSiteTypes, splitIntoSingleTypes } from "./data.js";
import { filterByTime, filterByType, applyFilters } from "./filters.js";
import { toPersianDigits, updateUrlParams, hideUI } from "./utils.js";
import { initializeMarkerSystem, getSiteTypeIcon, addMarker, clearMarkers } from "./markers.js";
import { createPopup } from "./popup.js";
import { handleURLFilters, setURLFromUI, setUIFromURL } from "./queries.js";
import { initializeMap, iranBorder } from "./map.js";

const map = initializeMap();
initializeMarkerSystem(map);
hideUI();
map.on("zoomend moveend", updateUrlParams);
createTimeFilter(() => applyFilters());
iranBorder(map);
fetch(
  "https://cojboaykyg.execute-api.eu-west-1.amazonaws.com/default/SanityWarmapAPI"
)
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then((data) => {
    // Split data into single siteType entries
    window.originalData = splitIntoSingleTypes(data);

    // Debug: Log the first entry to see structure
    if (data && data.length > 0) {
      console.log("First data entry:", data[0]);
      console.log("First entry type:", data[0].type);
      console.log("Sample entries:");
      for (let i = 0; i < Math.min(5, data.length); i++) {
        console.log(`Entry ${i}:`, data[i]);
      }
    }

    // Check if URL has filter parameters
    const { hasTimeFilter, hasTypeFilter } =
      handleURLFilters("checkURLFilters");

    // If no filter in URL, show all markers
    if (!hasTimeFilter && !hasTypeFilter) {
      applyFilters({
        data: data,
        timeValue: null,
        selectedTypes: [],
        updateURL: false,
        fromUI: false,
      });
    }

    // Create site type filter with a slight delay to ensure DOM is ready
    setTimeout(() => {
      const siteTypes = getUniqueSiteTypes(data);
      createSiteTypeFilter(siteTypes, () => applyFilters());

      // Set UI state from URL on initial load (after filters are created)
      setUIFromURL();
    }, 1);
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });
