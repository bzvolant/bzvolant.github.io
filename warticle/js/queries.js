// Flag to prevent recursion
let isApplyingFilters = false;

// Unified function to handle all URL filter operations
export function handleURLFilters(action) {
  switch (action) {
    case "saveToURL":
      // Get filter values from UI
      // Get start and end date values from the new date fields
      const startFieldEl = document.querySelector('.time-fields-wrapper .date-group:first-child input[type="date"]');
      const endFieldEl = document.querySelector('.time-fields-wrapper .date-group:last-child input[type="date"]');
      const selectedStart = startFieldEl ? startFieldEl.value : "";
      const selectedEnd = endFieldEl ? endFieldEl.value : "";
      const selectedTypes = Array.from(
        document.querySelectorAll(
          "#siteTypeFilterContainer input[type=checkbox]:checked"
        )
      ).map((cb) => cb.value);

      // Update URL parameters
      const saveParams = new URLSearchParams(window.location.search);

      // Handle time filter (date range)
      if (selectedStart) {
        saveParams.set("start", selectedStart);
      } else {
        saveParams.delete("start");
      }
      if (selectedEnd) {
        saveParams.set("end", selectedEnd);
      } else {
        saveParams.delete("end");
      }

      // Handle type filter
      if (selectedTypes.length > 0) {
        saveParams.set("type", selectedTypes.join(","));
      } else {
        saveParams.delete("type");
      }

      // Update browser URL
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${saveParams.toString()}`
      );

      return { selectedStart, selectedEnd, selectedTypes };

    case "loadFromURL":
      // Read parameters from URL
      const loadParams = new URLSearchParams(window.location.search);
      const startValue = loadParams.get("start");
      const endValue = loadParams.get("end");
      const typeValues = loadParams.get("type")
        ? loadParams.get("type").split(",")
        : [];

      // Update date fields
      const startFieldEl2 = document.querySelector('.time-fields-wrapper .date-group:first-child input[type="date"]');
      const endFieldEl2 = document.querySelector('.time-fields-wrapper .date-group:last-child input[type="date"]');
      if (startFieldEl2 && startValue) startFieldEl2.value = startValue;
      if (endFieldEl2 && endValue) endFieldEl2.value = endValue;

      // Update type checkboxes
      const typeCheckboxes = document.querySelectorAll(
        "#siteTypeFilterContainer input[type=checkbox]"
      );
      typeCheckboxes.forEach((checkbox) => {
        checkbox.checked = typeValues.includes(checkbox.value);
      });

      // Apply filters without updating URL again
      if (!isApplyingFilters && ((startValue && endValue) || typeValues.length > 0)) {
        isApplyingFilters = true;
        // Use stored data for filtering
        if (window.originalData) {
          // Import dynamically to avoid circular dependency
          import('./filters.js').then(({ applyFilters }) => {
            applyFilters({
              data: window.originalData,
              startDate: startValue,
              endDate: endValue,
              selectedTypes: typeValues,
              updateURL: false,
              fromUI: false,
            });
            isApplyingFilters = false;
          });
        }
      }

      return { startValue, endValue, typeValues };

    case "checkURLFilters":
      // Check if URL has filter parameters
      const checkParams = new URLSearchParams(window.location.search);
      const hasTimeFilter = checkParams.has("start") && checkParams.has("end");
      const hasTypeFilter = checkParams.has("type");

      return { hasTimeFilter, hasTypeFilter };

    default:
      console.error("Unknown URL filter action:", action);
      return {};
  }
}

// Function to synchronize URL with UI state
export function setURLFromUI() {
  return handleURLFilters("saveToURL");

}

// Function to set UI state from URL parameters
export function setUIFromURL() {
  return handleURLFilters("loadFromURL");
}
