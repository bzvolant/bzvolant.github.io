import { createSiteTypeFilter, createTimeFilter, createLabelToggle } from "./filterUI.js";
import { calculateCasualties } from "./casualties.js";
import {
  processLocationData,
  calculateCoordinates,
  getUniqueSiteTypes,
  splitIntoSingleTypes,
} from "./data.js";
import { filterByTime, filterByType, applyFilters } from "./filters.js";
import { toPersianDigits, updateUrlParams, hideUI } from "./utils.js";
import {
  initializeMarkerSystem,
  getSiteTypeIcon,
  addMarker,
  clearMarkers,
  setShowLabels,
} from "./markers.js";
import { createPopup } from "./popup.js";
import { handleURLFilters, setURLFromUI, setUIFromURL } from "./queries.js";
import { initializeMap, iranBorder, getMapInstance } from "./map.js";
import { ClusteredMarker, setClusterEnabled, getClusterEnabled, clearClusterGroup, setClusterLabels } from "./cluster.js";
import { fetchData } from "./fetch.js";
import { setupZoomBasedLabels, toggleMarkerLabels, applyLabelsToAllMarkers } from "./marker-label.js";

const map = initializeMap();
initializeMarkerSystem(map);
hideUI();

// Update URL on map view changes, but don't let it break our labels
map.on("zoomend moveend", function(e) {
  // First update the URL params
  updateUrlParams();
  
  // Then make sure our labels persist if they're supposed to be visible
  if (window.showLabels) {
    // Get the current map instance
    const currentMap = getMapInstance();
    if (currentMap) {
      console.log(`Ensuring labels persist after map ${e.type}`);
      
      // Never force refresh on map movement - always false
      applyLabelsToAllMarkers(currentMap, false);
    }
  }
});
createTimeFilter(() => applyFilters());

// Variable to store the label toggle reference
let labelToggle;

// Initialize label toggle (now uses createLabelToggle from filterUI.js)
function initializeLabelToggle() {
  console.log("Initializing label toggle");
  
  // Create the label toggle using the consistent filterUI approach
  labelToggle = createLabelToggle((checked) => {
    console.log("Label toggle changed to:", checked);
    window.toggleLabels(checked);
  }, true); // Start with labels enabled by default
}

// Call this after a delay to ensure DOM is ready
setTimeout(initializeLabelToggle, 500);

// Enable labels by default
setShowLabels(true);
setClusterLabels(true);

iranBorder(map);

// Setup zoom-based marker labels (show labels at zoom level 13 and higher)
setupZoomBasedLabels(map, 13);

// Call the function to enable labels on startup
enableLabelsOnStartup();

// Function to toggle labels manually
window.toggleLabels = function(enable) {
  console.log("toggleLabels called with enable =", enable); // Debug log
  
  // Set the global state
  setShowLabels(enable);
  setClusterLabels(enable);
  
  // Get the map instance
  const currentMap = getMapInstance();
  
  // Apply the change to all existing markers
  if (currentMap) {
    // Always use applyLabelsToAllMarkers with forceRefresh=false to prevent flickering
    applyLabelsToAllMarkers(currentMap, false);
    
    // No need to re-apply filters - that's only necessary if markers are completely recreated
    // This helps avoid icon replacement
  } else {
    console.error("Map instance not available for toggleLabels"); // Debug log
    // Fall back to re-applying filters if map is not accessible
    applyFilters();
  }
  
  // Update the toggle switch UI to match the state
  const labelToggle = document.getElementById('labelToggle');
  if (labelToggle && labelToggle.checked !== enable) {
    labelToggle.checked = enable;
  }
  
  console.log("toggleLabels completed"); // Debug log
};

// Function to explicitly enable labels on startup after a short delay
function enableLabelsOnStartup() {
  setTimeout(() => {
    console.log("Enabling labels on startup");
    
    // Find the toggle by ID and set it to checked
    const labelToggle = document.getElementById('labelToggle');
    if (labelToggle) {
      console.log("Found labelToggle, setting to checked");
      labelToggle.checked = true;
      
      // Trigger change event
      const event = new Event('change');
      labelToggle.dispatchEvent(event);
    } else {
      console.log("Label toggle not found yet, calling window.toggleLabels directly");
      // Call the global toggle function directly
      window.toggleLabels(true);
    }
  }, 1500); // Increased delay to ensure everything is loaded
}

fetchData()
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

window.addClusteredMarker = function(latLong, type, entry) {
  return ClusteredMarker({
    map,
    latLong,
    type,
    getSiteTypeIcon,
    enable: getClusterEnabled(),
    entry
  });
};
setClusterEnabled(false);
applyFilters();
window.clearClusterGroup = clearClusterGroup;

var counterWorker = new Worker("./js/worker.js");
counterWorker.onmessage = function(event) {
  const { counter, delay } = event.data;
  console.log("Counter Worker Message: ", counter, ", Delay: ", delay);
}