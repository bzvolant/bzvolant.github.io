import {
  createSiteTypeFilter,
  createTimeFilter,
  createLabelToggle,
  createCircleMarkerToggle,
} from "./filterUI.js";
import { calculateCasualties } from "./casualties.js";
import {
  processLocationData,
  calculateCoordinates,
  getUniqueSiteTypes,
  splitIntoSingleTypes,
} from "./data.js";
import { filterByTime, filterByType, applyFilters } from "./filters.js";
import { toPersianDigits, updateUrlParams, hideUI, syncShowNamesWithUrl, getShowNamesFromUrl, syncCircleMarkersWithUrl, getCircleMarkersFromUrl } from "./utils.js";
import {
  initializeMarkerSystem,
  getSiteTypeIcon,
  addMarker,
  addCircleMarker,
  clearMarkers,
  setShowLabels,
  setUseCircleMarkers,
  getUseCircleMarkers,
} from "./markers.js";
import { createPopup } from "./popup.js";
import { handleURLFilters, setURLFromUI, setUIFromURL } from "./queries.js";
import { initializeMap, iranBorder, getMapInstance } from "./map.js";
import {
  ClusteredMarker,
  setClusterEnabled,
  getClusterEnabled,
  clearClusterGroup,
  setClusterLabels,
} from "./cluster.js";
import { fetchData } from "./fetch.js";
import {
  setupZoomBasedLabels,
  toggleMarkerLabels,
  applyLabelsToAllMarkers,
} from "./marker-label.js";

const map = initializeMap();
initializeMarkerSystem(map);
hideUI();

// Update URL on map view changes, but don't let it break our labels
map.on("zoomend moveend", function (e) {
  // First update the URL params
  updateUrlParams();

  // Apply hideUI to ensure UI visibility state is maintained
  hideUI();

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

  // Get show names state from URL
  const showNamesFromUrl = getShowNamesFromUrl();
  
  // Create the label toggle using the consistent filterUI approach
  labelToggle = createLabelToggle((checked) => {
    console.log("Label toggle changed to:", checked);
    window.toggleLabels(checked);
    
    // Synchronize toggle state with URL
    syncShowNamesWithUrl(checked);
  }, showNamesFromUrl); // Use URL parameter value for initial state
}

// Call this after a delay to ensure DOM is ready
setTimeout(initializeLabelToggle, 500);

// Check URL for showNames parameter, otherwise disable labels by default
const showNamesFromUrl = getShowNamesFromUrl();
setShowLabels(showNamesFromUrl);
setClusterLabels(showNamesFromUrl);

iranBorder(map);

// Setup zoom-based marker labels (show labels at zoom level 13 and higher)
setupZoomBasedLabels(map, 13);

// Call the function to initialize labels on startup
initializeLabelsOnStartup();

// Function to toggle labels manually
window.toggleLabels = function (enable) {
  console.log("toggleLabels called with enable =", enable); // Debug log

  // Set the global state
  setShowLabels(enable);
  setClusterLabels(enable);
  
  // Synchronize toggle state with URL
  syncShowNamesWithUrl(enable);

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
  const labelToggle = document.getElementById("labelToggle");
  if (labelToggle && labelToggle.checked !== enable) {
    labelToggle.checked = enable;
  }

  console.log("toggleLabels completed"); // Debug log
};

// Variable to store the circle marker toggle reference
let circleToggle;

// Initialize circle marker toggle
function initializeCircleToggle() {
  console.log("Initializing circle marker toggle");

  // Get circle markers state from URL
  const showCirclesFromUrl = getCircleMarkersFromUrl();
  
  // Create the circle toggle using the consistent filterUI approach
  circleToggle = createCircleMarkerToggle((checked) => {
    console.log("Circle toggle changed to:", checked);
    window.toggleCircleMarkers(checked);
    
    // Synchronize toggle state with URL
    syncCircleMarkersWithUrl(checked);
  }, showCirclesFromUrl); // Use URL parameter value for initial state
}

// Call this after a delay to ensure DOM is ready
setTimeout(initializeCircleToggle, 600);

// Function to toggle circle markers
window.toggleCircleMarkers = function (enable) {
  console.log("toggleCircleMarkers called with enable =", enable); // Debug log

  // Set the global state
  setUseCircleMarkers(enable);
  
  // Synchronize toggle state with URL
  syncCircleMarkersWithUrl(enable);

  // Reapply filters to update all markers
  applyFilters();

  // Update the toggle switch UI to match the state
  const circleToggle = document.getElementById("circleToggle");
  if (circleToggle && circleToggle.checked !== enable) {
    circleToggle.checked = enable;
  }

  console.log("toggleCircleMarkers completed"); // Debug log
};

// Function to initialize labels state on startup
function initializeLabelsOnStartup() {
  setTimeout(() => {
    console.log("Initializing labels on startup");

    // Check URL for showNames parameter
    const showNamesFromUrl = getShowNamesFromUrl();
    const hasShowNamesParam = window.location.search.includes("showNames");

    // Find the toggle by ID
    const labelToggle = document.getElementById("labelToggle");
    if (labelToggle) {
      // If URL has showNames parameter, use that value, otherwise default to false
      const shouldShowLabels = hasShowNamesParam ? showNamesFromUrl : false;
      console.log("Found labelToggle, setting to:", shouldShowLabels);
      labelToggle.checked = shouldShowLabels;

      // Trigger change event
      const event = new Event("change");
      labelToggle.dispatchEvent(event);
    } else {
      console.log(
        "Label toggle not found yet, calling window.toggleLabels directly"
      );
      // Call the global toggle function directly
      window.toggleLabels(false);
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

window.addClusteredMarker = function (latLong, type, entry) {
  return ClusteredMarker({
    map,
    latLong,
    type,
    getSiteTypeIcon,
    enable: getClusterEnabled(),
    entry,
  });
};
setClusterEnabled(false);
applyFilters();
window.clearClusterGroup = clearClusterGroup;

document.addEventListener("DOMContentLoaded", function () {
  // Apply hideUI to handle UI visibility based on URL parameter
  hideUI();

  // Check for showNames parameter in URL and apply on page load
  const showNamesFromUrl = getShowNamesFromUrl();
  if (window.location.search.includes("showNames")) {
    console.log("URL has showNames parameter:", showNamesFromUrl);
    // Apply after a delay to ensure toggle is initialized
    setTimeout(() => {
      window.toggleLabels(showNamesFromUrl);
    }, 800);
  }

  // Check for showCircles parameter in URL and apply on page load
  const showCirclesFromUrl = getCircleMarkersFromUrl();
  if (window.location.search.includes("showCircles")) {
    console.log("URL has showCircles parameter:", showCirclesFromUrl);
    // Apply after a delay to ensure toggle is initialized
    setTimeout(() => {
      window.toggleCircleMarkers(showCirclesFromUrl);
    }, 1000);
  }

  const showLabelsBtn = document.getElementById("showLabelsBtn");
  if (showLabelsBtn) {
    showLabelsBtn.addEventListener("click", function () {
      console.log("Manual button clicked to toggle labels");

      // Find the toggle by ID and toggle its state
      const labelToggle = document.getElementById("labelToggle");
      if (labelToggle) {
        console.log("Found labelToggle, toggling state");
        // Toggle the current state
        labelToggle.checked = !labelToggle.checked;

        // Trigger change event
        const event = new Event("change");
        labelToggle.dispatchEvent(event);
      } else {
        console.error(
          "labelToggle not found, calling global function directly"
        );

        // Call the global function directly - use true to show labels
        // since this button is typically used to show labels
        if (window.toggleLabels) {
          window.toggleLabels(true);
        }
      }
    });
  } else {
    console.error("showLabelsBtn not found");
  }
});

var counterWorker = new Worker("./js/worker.js");
counterWorker.onmessage = function (event) {
  const { counter, delay } = event.data;
  console.log("Counter Worker Message: ", counter, ", Delay: ", delay);
};
