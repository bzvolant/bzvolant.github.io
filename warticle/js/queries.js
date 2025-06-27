// Flag to prevent recursion
let isApplyingFilters = false;

// Unified function to handle all URL filter operations
export function handleURLFilters(action) {
  switch (action) {
    case "saveToURL":
      // Get filter values from UI
      const selectedTime = document.getElementById("timeFilter").value;
      const selectedTypes = Array.from(
        document.querySelectorAll(
          "#siteTypeFilterContainer input[type=checkbox]:checked"
        )
      ).map((cb) => cb.value);

      // Update URL parameters
      const saveParams = new URLSearchParams(window.location.search);

      // Handle time filter
      if (selectedTime) {
        saveParams.set("time", selectedTime);
      } else {
        saveParams.delete("time");
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

      return { selectedTime, selectedTypes };

    case "loadFromURL":
      // Read parameters from URL
      const loadParams = new URLSearchParams(window.location.search);
      const timeValue = loadParams.get("time");
      const typeValues = loadParams.get("type")
        ? loadParams.get("type").split(",")
        : [];

      // Update time dropdown
      const timeDropdown = document.getElementById("timeFilter");
      if (timeValue) {
        timeDropdown.value = timeValue;
      }

      // Update type checkboxes
      const typeCheckboxes = document.querySelectorAll(
        "#siteTypeFilterContainer input[type=checkbox]"
      );
      typeCheckboxes.forEach((checkbox) => {
        checkbox.checked = typeValues.includes(checkbox.value);
      });

      // Apply filters without updating URL again
      if (!isApplyingFilters && (timeValue || typeValues.length > 0)) {
        isApplyingFilters = true;
        // Use stored data for filtering
        if (window.originalData) {
          // Import dynamically to avoid circular dependency
          import('./filters.js').then(({ applyFilters }) => {
            applyFilters({
              data: window.originalData,
              timeValue: timeValue,
              selectedTypes: typeValues,
              updateURL: false,
              fromUI: false,
            });
            isApplyingFilters = false;
          });
        }
      }

      return { timeValue, typeValues };

    case "checkURLFilters":
      // Check if URL has filter parameters
      const checkParams = new URLSearchParams(window.location.search);
      const hasTimeFilter = checkParams.has("time");
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
