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
import {
  toPersianDigits,
  updateUrlParams,
  hideUI,
  syncShowNamesWithUrl,
  getShowNamesFromUrl,
  syncCircleMarkersWithUrl,
  getCircleMarkersFromUrl,
} from "./utils.js";
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

// Function to toggle circle markers
window.toggleCircleMarkers = function (enable) {
  console.log("toggleCircleMarkers called with enable =", enable); // Debug log

  // Set the global state
  setUseCircleMarkers(enable);

  // Synchronize toggle state with URL
  syncCircleMarkersWithUrl(enable);

  // If enabling circle markers, disable labels
  if (enable) {
    // Turn off labels
    setShowLabels(false);
    setClusterLabels(false);
    syncShowNamesWithUrl(false);

    // Update the label toggle UI
    const labelToggle = document.getElementById("labelToggle");
    if (labelToggle) {
      labelToggle.checked = false;
    }
  }

  // Reapply filters to update all markers
  // applyFilters();
// if (window.originalData) {
//   applyFilters();
// }
  // Update the toggle switch UI to match the state
  const circleToggle = document.getElementById("circleToggle");
  if (circleToggle && circleToggle.checked !== enable) {
    circleToggle.checked = enable;
  }

  console.log("toggleCircleMarkers completed"); // Debug log
};

const refreshData = async () => {
  try {
    const data = await fetchData();

    if (data) {
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

      // Delay UI creation until after map and data are ready
      // Create site type filter
      const siteTypes = getUniqueSiteTypes(data);
      createSiteTypeFilter(siteTypes, () => applyFilters());
      setUIFromURL();
      initializeLabelToggle();
      initializeCircleToggle();
      applyInitialToggleStates();
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

refreshData();

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
window.clearClusterGroup = clearClusterGroup;

document.addEventListener("DOMContentLoaded", function () {
  // Apply hideUI to handle UI visibility based on URL parameter
  hideUI();

  // Note: Toggle initialization is now handled in a controlled sequence
  // after site type filters are created in the fetchData callback

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

// Check URL for showNames parameter, otherwise disable labels by default
const showNamesFromUrl = getShowNamesFromUrl();
setShowLabels(showNamesFromUrl);
setClusterLabels(showNamesFromUrl);

iranBorder(map);

// Setup zoom-based marker labels (show labels at zoom level 13 and higher)
setupZoomBasedLabels(map, 13);

// Function to apply initial toggle states from URL parameters
function applyInitialToggleStates() {
  console.log("Applying initial toggle states");

  // Get states from URL
  const showNamesFromUrl = getShowNamesFromUrl();
  const showCirclesFromUrl = getCircleMarkersFromUrl();

  // Handle the case where both toggles might be enabled in URL
  // Priority: if both are true, prefer showNames
  if (showNamesFromUrl && showCirclesFromUrl) {
    console.log(
      "Both showNames and showCircles are true in URL, preferring showNames"
    );
    window.toggleLabels(true);
    // This will automatically disable circle markers
  } else {
    // Apply individual states
    if (window.location.search.includes("showNames")) {
      console.log("Applying showNames from URL:", showNamesFromUrl);
      window.toggleLabels(showNamesFromUrl);
    }

    if (window.location.search.includes("showCircles") && !showNamesFromUrl) {
      console.log("Applying showCircles from URL:", showCirclesFromUrl);
      window.toggleCircleMarkers(showCirclesFromUrl);
    }
  }
}

// Function to toggle labels manually
window.toggleLabels = function (enable) {
  console.log("toggleLabels called with enable =", enable); // Debug log

  // Set the global state
  setShowLabels(enable);
  setClusterLabels(enable);

  // Synchronize toggle state with URL
  syncShowNamesWithUrl(enable);

  // If enabling labels, disable circle markers
  if (enable) {
    // Turn off circle markers
    window.toggleCircleMarkers(false);
  }

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

var counterWorker = new Worker("./js/worker.js");
counterWorker.onmessage = function (event) {
  const { counter, delay } = event.data;
  console.log("Counter Worker Message: ", counter, ", Delay: ", delay);
  refreshData();
};
