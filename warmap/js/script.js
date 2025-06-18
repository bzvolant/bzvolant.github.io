//initialize the map with Leaflet

function initializeMap() {
  const params = new URLSearchParams(window.location.search);
  const zoom = parseInt(params.get('zoom')) || 6;
  const lat = parseFloat(params.get('lat')) || 32.4279;
  const lng = parseFloat(params.get('lng')) || 53.688;

  const map = L.map("map", {
    attributionControl: false,
    zoomControl: false,
    minZoom: 4,
  }).setView([lat, lng], zoom);

  
  L.tileLayer(
    "https://api.maptiler.com/maps/ed349839-de1f-47a1-8141-12b8d65c537d/{z}/{x}/{y}.png?key=pOZklUXrqCoxcxehsMzC",
    {
      maxZoom: 18,
    }
  ).addTo(map);
  return map;
}
const map = initializeMap();

// Handle UI visibility based on URL parameter
hideUI();

// Update URL when map view changes
function updateUrlParams() {
  const center = map.getCenter();
  const params = new URLSearchParams(window.location.search);
  params.set('zoom', map.getZoom());
  params.set('lat', center.lat.toFixed(6));
  params.set('lng', center.lng.toFixed(6));
  // Preserve hideUI parameter if it exists
  const hideUI = params.get('hideUI');
  if (hideUI === 'true') {
    params.set('hideUI', 'true');
  }
  window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
}

map.on('zoomend moveend', updateUrlParams);

// Functions

// Convert Coordinates
function calculateCoordinates(entry) {
  if (entry.coordinates && entry.coordinates.lat && entry.coordinates.lng) {
    return [entry.coordinates.lat, entry.coordinates.lng];
  }
  return null;
}

// Add Marker
function addMarker(map, latLong, type) {
  // Get the appropriate icon
  const icon = getSiteTypeIcon(type);
  
  // Create marker with icon
  const marker = L.marker(latLong, { icon: icon }).addTo(map);
  marker.bindPopup(`<strong>${type || "Unknown"}</strong>`);
}

// Filter entries by time
function filterByTime(entries, days) {
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
function filterByType(entries, selectedTypes) {
  if (!selectedTypes || selectedTypes.length === 0) return entries;

  return entries.filter((entry) => {
    // Handle siteType as array
    if (entry.siteType && Array.isArray(entry.siteType)) {
      // Check if any of the entry's site types match any of the selected types
      return entry.siteType.some((type) => selectedTypes.includes(type));
    }
    // Handle siteType as string
    else if (entry.siteType && typeof entry.siteType === "string") {
      return selectedTypes.includes(entry.siteType);
    }
    // Fallback to type field
    else if (entry.type) {
      return selectedTypes.includes(entry.type);
    }

    return false;
  });
}

// Extract unique site types from data
function getUniqueSiteTypes(data) {
  console.log("Data for site types:", data); // Debug log

  const types = new Set();

  data.forEach((entry) => {
    // Handle siteType as array
    if (entry.siteType && Array.isArray(entry.siteType)) {
      console.log("Found siteType array:", entry.siteType); // Debug log
      entry.siteType.forEach((type) => {
        if (type) {
          types.add(type);
          console.log("Added type from array:", type);
        }
      });
    }
    // Handle siteType as string
    else if (entry.siteType && typeof entry.siteType === "string") {
      types.add(entry.siteType);
      console.log("Found siteType string:", entry.siteType); // Debug log
    }
    // Try fallback to type field
    else if (entry.type) {
      types.add(entry.type);
      console.log("Using type field fallback:", entry.type); // Debug log
    } else {
      console.log("Entry has no usable siteType or type field:", entry); // Debug log
    }
  });

  // If still no types found, create default categories
  if (types.size === 0) {
    console.log("No types found in data, creating default categories");
    [
      "industry",
      "energy",
      "military",
      "civilian",
      "nuclear",
      "oil",
      "utility",
      "personofinterest",
      "other",
    ].forEach((t) => types.add(t));
  }

  const uniqueTypes = Array.from(types).sort();
  console.log("Unique types found:", uniqueTypes); // Debug log
  return uniqueTypes;
}

// Create time filter UI
function createTimeFilter() {
  // Check if container exists
  let filterContainer = document.querySelector(".filter-container");
  if (!filterContainer) {
    filterContainer = document.createElement("div");
    filterContainer.className = "filter-container";
    document.body.insertBefore(
      filterContainer,
      document.getElementById("map").nextSibling
    );
  }

  const filterGroup = document.createElement("div");
  filterGroup.className = "filter-group";
  filterContainer.appendChild(filterGroup);

  const label = document.createElement("label");
  label.htmlFor = "timeFilter";
  label.className = "filter-label";
  label.textContent = "Filter by Time:";
  filterGroup.appendChild(label);

  const select = document.createElement("select");
  select.id = "timeFilter";
  select.className = "dropdown";
  filterGroup.appendChild(select);

  const options = [
    { value: "", text: "All" },
    { value: "1", text: "Last 24 Hours" },
    { value: "2", text: "Last 2 Days" },
    { value: "3", text: "Last 3 Days" },
    { value: "7", text: "Last 7 Days" },
    { value: "14", text: "Last 14 Days" },
    { value: "30", text: "Last 30 Days" },
  ];

  options.forEach((option) => {
    const optEl = document.createElement("option");
    optEl.value = option.value;
    optEl.textContent = option.text;
    select.appendChild(optEl);
  });

  // Add event listener for filter change
  select.addEventListener("change", function () {
    applyFilters();
  });

  return select;
}

// Create site type filter UI
function createSiteTypeFilter(types) {
  console.log("Creating site type filter with types:", types); // Debug log

  // Create container if it doesn't exist already
  let filterContainer = document.querySelector(".filter-container");
  if (!filterContainer) {
    filterContainer = document.createElement("div");
    filterContainer.className = "filter-container";
    document.body.insertBefore(
      filterContainer,
      document.getElementById("map").nextSibling
    );
  }

  // Remove any existing site type container first to avoid duplicates
  const existingSiteTypeContainer = document.getElementById(
    "siteTypeFilterContainer"
  );
  if (existingSiteTypeContainer) {
    existingSiteTypeContainer.remove();
  }

  const siteTypeContainer = document.createElement("div");
  siteTypeContainer.className = "filter-group";
  siteTypeContainer.id = "siteTypeFilterContainer";
  siteTypeContainer.style.backgroundColor = "rgba(245, 245, 245, 0.8)";
  siteTypeContainer.style.padding = "8px";
  siteTypeContainer.style.borderRadius = "5px";
  filterContainer.appendChild(siteTypeContainer);

  const label = document.createElement("label");
  label.className = "filter-label";
  label.textContent = "Filter by Site Type:";
  label.style.color = "#333";
  label.style.fontSize = "14px";
  label.style.fontWeight = "bold";
  label.style.display = "block";
  label.style.marginBottom = "8px";
  siteTypeContainer.appendChild(label);

  // Create checkbox container
  const checkboxContainer = document.createElement("div");
  checkboxContainer.className = "checkbox-container";
  checkboxContainer.style.display = "flex";
  checkboxContainer.style.flexDirection = "column";
  checkboxContainer.style.marginTop = "5px";
  checkboxContainer.style.maxHeight = "150px";
  checkboxContainer.style.overflowY = "auto";
  checkboxContainer.style.border = "1px solid #ddd";
  checkboxContainer.style.padding = "5px";
  checkboxContainer.style.borderRadius = "3px";
  siteTypeContainer.appendChild(checkboxContainer);

  // Handle case where no types are found
  if (!types || types.length === 0) {
    const noTypesMessage = document.createElement("div");
    noTypesMessage.textContent = "No site types found in data";
    noTypesMessage.style.fontStyle = "italic";
    noTypesMessage.style.color = "#888";
    noTypesMessage.style.padding = "5px";
    checkboxContainer.appendChild(noTypesMessage);
    console.log("No site types found, added message"); // Debug log
    return siteTypeContainer;
  }

  // Add "Select All" option
  const allWrapper = document.createElement("div");
  allWrapper.style.display = "flex";
  allWrapper.style.alignItems = "center";
  allWrapper.style.marginBottom = "8px";
  allWrapper.style.borderBottom = "1px solid #ddd";
  allWrapper.style.paddingBottom = "5px";

  const allCheckbox = document.createElement("input");
  allCheckbox.type = "checkbox";
  allCheckbox.id = "type-all";
  allCheckbox.className = "type-checkbox-all";
  allCheckbox.style.marginRight = "5px";

  const allLabel = document.createElement("label");
  allLabel.htmlFor = "type-all";
  allLabel.textContent = "Select All";
  allLabel.style.fontWeight = "bold";
  allLabel.style.fontSize = "14px";
  allLabel.style.marginLeft = "3px";

  allWrapper.appendChild(allCheckbox);
  allWrapper.appendChild(allLabel);
  checkboxContainer.appendChild(allWrapper);

  // Add event listener for "Select All"
  allCheckbox.addEventListener("change", function () {
    const isChecked = this.checked;
    const typeCheckboxes = document.querySelectorAll(".type-checkbox");
    typeCheckboxes.forEach((cb) => {
      cb.checked = isChecked;
    });
    applyFilters();
  });

  types.forEach((type) => {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.marginBottom = "5px";
    wrapper.style.padding = "3px";
    wrapper.style.borderRadius = "3px";
    wrapper.style.backgroundColor = "rgba(255, 255, 255, 0.5)";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = type;
    checkbox.id = `type-${type}`;
    checkbox.className = "type-checkbox";
    checkbox.style.marginRight = "5px";

    const checkboxLabel = document.createElement("label");
    checkboxLabel.htmlFor = `type-${type}`;
    checkboxLabel.textContent = type.charAt(0).toUpperCase() + type.slice(1); // Capitalize first letter
    checkboxLabel.style.fontSize = "13px";
    checkboxLabel.style.marginLeft = "3px";

    wrapper.appendChild(checkbox);
    wrapper.appendChild(checkboxLabel);
    checkboxContainer.appendChild(wrapper);
    console.log("Added checkbox for type:", type); // Debug log

    // Add event listener
    checkbox.addEventListener("change", function () {
      // Update "Select All" checkbox
      const allTypeCheckboxes = document.querySelectorAll(".type-checkbox");    const allChecked = Array.from(allTypeCheckboxes).every(
      (cb) => cb.checked
    );
    document.getElementById("type-all").checked = allChecked;

    applyFilters();
  });
  });

  return siteTypeContainer;
}

// Function to get the appropriate icon for a site type
function getSiteTypeIcon(siteType) {
  // Default icon if no match is found
  let iconUrl = "svg/un.svg";

  // Handle different siteType formats
  if (Array.isArray(siteType) && siteType.length > 0) {
    // For arrays, use the first type that has a matching SVG
    for (const type of siteType) {
      const possibleIcon = `svg/${type.toLowerCase()}.svg`;
      // Check if the SVG exists for this type
      if (
        [
          "industry",
          "energy",
          "civilian",
          "injured",
          "military",
          "nuclear",
          "oil",
          "personofinterest",
          "utility",
        ].includes(type.toLowerCase())
      ) {
        iconUrl = possibleIcon;
        break; // Use the first matching icon
      }
    }
  } else if (typeof siteType === "string") {
    // For strings, check if the SVG exists
    const normalizedType = siteType.toLowerCase();
    if (
      [
        "industry",
        "energy",
        "civilian",
        "injured",
        "military",
        "nuclear",
        "oil",
        "personofinterest",
        "utility",
      ].includes(normalizedType)
    ) {
      iconUrl = `svg/${normalizedType}.svg`;
    }
  }

  // Create and return the icon
  return L.icon({
    iconUrl: iconUrl,
    iconSize: [24, 24], // Size of the icon
    iconAnchor: [12, 12], // Point of the icon which corresponds to marker's location
    popupAnchor: [0, -12], // Point from which the popup should open relative to the iconAnchor
  });
}

// Function to calculate total casualties from different data formats
function calculateCasualties(entry) {
  // Initialize result structure
  const result = {
    military: { injured: 0, killed: 0 },
    civilian: { injured: 0, killed: 0 },
    uncategorised: { injured: 0, killed: 0 },
    totalInjured: 0,
    totalKilled: 0,
    total: 0
  };
  
  // Process military casualties
  if (entry.militaryCasualties) {
    if (typeof entry.militaryCasualties === 'object') {
      // Handle object format with injured/dead properties
      result.military.injured = parseInt(entry.militaryCasualties.injured || 0);
      result.military.killed = parseInt(entry.militaryCasualties.dead || 0);
    } else if (typeof entry.militaryCasualties === 'string') {
      // Handle string format "injured,dead"
      const parts = entry.militaryCasualties.split(',');
      result.military.injured = parseInt(parts[0] || 0);
      result.military.killed = parseInt(parts[1] || 0);
    }
  }
  
  // Process civilian casualties
  if (entry.civilianCasualties) {
    if (typeof entry.civilianCasualties === 'object') {
      result.civilian.injured = parseInt(entry.civilianCasualties.injured || 0);
      result.civilian.killed = parseInt(entry.civilianCasualties.dead || 0);
    } else if (typeof entry.civilianCasualties === 'string') {
      const parts = entry.civilianCasualties.split(',');
      result.civilian.injured = parseInt(parts[0] || 0);
      result.civilian.killed = parseInt(parts[1] || 0);
    }
  }
  
  // Process uncategorised casualties
  if (entry.uncategorisedCasualties) {
    if (typeof entry.uncategorisedCasualties === 'object') {
      result.uncategorised.injured = parseInt(entry.uncategorisedCasualties.injured || 0);
      result.uncategorised.killed = parseInt(entry.uncategorisedCasualties.dead || 0);
    } else if (typeof entry.uncategorisedCasualties === 'string') {
      const parts = entry.uncategorisedCasualties.split(',');
      result.uncategorised.injured = parseInt(parts[0] || 0);
      result.uncategorised.killed = parseInt(parts[1] || 0);
    }
  }
  
  // Calculate totals
  result.totalInjured = result.military.injured + result.civilian.injured + result.uncategorised.injured;
  result.totalKilled = result.military.killed + result.civilian.killed + result.uncategorised.killed;
  result.total = result.totalInjured + result.totalKilled;
  
  return result;
}

// Function to convert numbers to Persian digits
function toPersianDigits(n) {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return n.toString().replace(/\d/g, x => persianDigits[x]);
}

// Keep track of all markers
let allMarkers = [];

// Clear all markers from the map
function clearMarkers() {
  allMarkers.forEach((marker) => {
    map.removeLayer(marker);
  });
  allMarkers = [];
}

// Unified function to handle all URL filter operations
function handleURLFilters(action) {
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
      if (timeValue || typeValues.length > 0) {
        // Use stored data for filtering
        if (window.originalData) {
          applyFilters({
            data: window.originalData,
            timeValue: timeValue,
            selectedTypes: typeValues,
            updateURL: false,
            fromUI: false
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

// Synchronize URL with UI state
// Synchronize URL with UI state - now uses handleURLFilters
function setURLFromUI() {
  return handleURLFilters("saveToURL");
}

// Set UI state from URL parameters
// Set UI state from URL parameters - now uses handleURLFilters
function setUIFromURL() {
  return handleURLFilters("loadFromURL");
}

// Function to handle UI visibility
function hideUI() {
  const params = new URLSearchParams(window.location.search);
  const UI = params.get('UI') === 'false';
  
  const filterContainer = document.querySelector('.filter-container');
  const infoSection = document.querySelector('.info-section');
  
  if (UI) {
    if (filterContainer) filterContainer.style.display = 'none';
    if (infoSection) infoSection.style.display = 'none';
  } else {
    if (filterContainer) filterContainer.style.display = '';
    if (infoSection) infoSection.style.display = '';
  }
}

// Unified function for all filter operations
function applyFilters(options = {}) {
  // Default options
  const defaults = {
    data: window.originalData,
    timeValue: null,
    selectedTypes: [],
    updateURL: true,
    fromUI: true
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
      // Get the appropriate icon based on site type
      const icon = getSiteTypeIcon(entry.siteType || entry.type);
      
      // Create marker with the icon
      const marker = L.marker(latLong, { icon: icon }).addTo(map);
      
      // Use rich popup content that includes all properties
      const popupContent = createPopup(entry);
      
      // Create popup
      const popup = L.popup().setContent(popupContent);
      
      // Bind the popup to the marker
      marker.bindPopup(popup);
      
      allMarkers.push(marker);
    }
  });
  
  // Log and return count
  const count = filteredData.length;
  console.log(`Displayed ${count} markers after filtering`);
  return count;
}

// Generate rich popup content with all available properties
function createPopup(entry) {
  if (!entry) return 'اطلاعاتی موجود نیست';
  
  let content = '';
  
  // Add title if available
  if (entry.displayName) {
    content = `<strong>${entry.displayName}</strong><br><br>`;
  }
  
  // Create a table for properties
  content += '<table>';
  
  // Add site type(s)
  let siteTypeDisplay = "Unknown";
  if (entry.siteType && Array.isArray(entry.siteType) && entry.siteType.length > 0) {
    siteTypeDisplay = entry.siteType.map(type => 
      type.charAt(0).toUpperCase() + type.slice(1)
    ).join(", ");
  } else if (entry.siteType && typeof entry.siteType === 'string') {
    siteTypeDisplay = entry.siteType.charAt(0).toUpperCase() + entry.siteType.slice(1);
  } else if (entry.type) {
    siteTypeDisplay = entry.type;
  }
  content += `<tr><td>Site Type:</td><td>${siteTypeDisplay}</td></tr>`;
  
  // Add date and time if available
  if (entry.date) {
    const dateObj = new Date(entry.date);
    const formattedDate = dateObj.toLocaleDateString();
    content += `<tr><td>Date:</td><td>${formattedDate}</td></tr>`;
  }
  
  if (entry.time) {
    content += `<tr><td>Time:</td><td>${entry.time}</td></tr>`;
  }
  
  // Add location info if available
  if (entry.Province) {
    content += `<tr><td>Province:</td><td>${entry.Province}</td></tr>`;
  }
  
  if (entry.City) {
    content += `<tr><td>City:</td><td>${entry.City}</td></tr>`;
  }
  
  if (entry.Address) {
    content += `<tr><td>Address:</td><td>${entry.Address}</td></tr>`;
  }
  
  // Add coordinates
  if (entry.coordinates && entry.coordinates.lat && entry.coordinates.lng) {
    content += `<tr><td>Coordinates:</td><td>${entry.coordinates.lat}, ${entry.coordinates.lng}</td></tr>`;
  } else if (entry.Coordinates) {
    content += `<tr><td>Coordinates:</td><td>${entry.Coordinates}</td></tr>`;
  }
  
  // Add details if available
  if (entry.Details || entry.details) {
    const detailsText = entry.Details || entry.details || '';
    content += `<tr><td>Details:</td><td>${detailsText}</td></tr>`;
  }
  
  // Calculate casualties
  const casualties = calculateCasualties(entry);
  
  // Add casualties section if there are any
  if (casualties.total > 0) {
    content += '<tr><td colspan="2" class="section-header">Casualties</td></tr>';
    
    // Military casualties
    if (casualties.military.injured > 0 || casualties.military.killed > 0) {
      content += `<tr><td>Military:</td><td>Injured: ${toPersianDigits(casualties.military.injured)}, Dead: ${toPersianDigits(casualties.military.killed)}</td></tr>`;
    }
    
    // Civilian casualties
    if (casualties.civilian.injured > 0 || casualties.civilian.killed > 0) {
      content += `<tr><td>Civilian:</td><td>Injured: ${toPersianDigits(casualties.civilian.injured)}, Dead: ${toPersianDigits(casualties.civilian.killed)}</td></tr>`;
    }
    
    // Uncategorised casualties
    if (casualties.uncategorised.injured > 0 || casualties.uncategorised.killed > 0) {
      content += `<tr><td>Uncategorised:</td><td>Injured: ${toPersianDigits(casualties.uncategorised.injured)}, Dead: ${toPersianDigits(casualties.uncategorised.killed)}</td></tr>`;
    }
    
    // Total casualties
    content += `<tr><td>Total:</td><td>Injured: ${toPersianDigits(casualties.totalInjured)}, Dead: ${toPersianDigits(casualties.totalKilled)}, All: ${toPersianDigits(casualties.total)}</td></tr>`;
  }
  
  // Add individuals/people if available
  if (entry.individuals && entry.individuals.length > 0) {
    content += '<tr><td colspan="2" class="section-header">Individuals</td></tr>';
    entry.individuals.forEach(person => {
      content += `<tr><td>${person.role || 'Person'}:</td><td>${person.name}</td></tr>`;
    });
  } else if (entry.people && entry.people.length > 0) {
    content += '<tr><td colspan="2" class="section-header">People</td></tr>';
    entry.people.forEach(person => {
      content += `<tr><td>${person.category || person.role || 'Person'}:</td><td>${person.name}</td></tr>`;
    });
  }
  
  // Display all other properties that aren't already shown
  const excludedProps = [
    'displayName', 'siteType', 'type', 'date', 'time', 'Province', 'City', 
    'Address', 'coordinates', 'Coordinates', 'Details', 'details',
    'militaryCasualties', 'civilianCasualties', 'uncategorisedCasualties',
    'individuals', 'people'
  ];
  
  let hasOtherProps = false;
  
  // Check if there are other properties to display
  for (const prop in entry) {
    if (!excludedProps.includes(prop) && entry[prop] !== null && entry[prop] !== undefined) {
      hasOtherProps = true;
      break;
    }
  }
  
  // Add other properties section if any exist
  if (hasOtherProps) {
    content += '<tr><td colspan="2" class="section-header">Additional Information</td></tr>';
    
    for (const prop in entry) {
      if (!excludedProps.includes(prop) && entry[prop] !== null && entry[prop] !== undefined) {
        let valueDisplay = '';
        
        // Format different value types appropriately
        if (typeof entry[prop] === 'object' && entry[prop] !== null) {
          valueDisplay = JSON.stringify(entry[prop]);
        } else {
          valueDisplay = entry[prop].toString();
        }
        
        // Format property name (capitalize first letter, add spaces before caps)
        const formattedProp = prop
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase());
        
        // Reverse the order of cells for RTL display
        content += `<tr><td>${valueDisplay}</td><td>${formattedProp}:</td></tr>`;
      }
    }
  }
  
  // Close table and container
  content += '</table></div>';
  
  return content;
}

// Function to split entries into single siteType objects
function splitIntoSingleTypes(jsonData) {
  let result = [];
  
  jsonData.forEach(entry => {
    if (!entry.siteType) {
      // If no siteType, just add the entry as is
      result.push(entry);
      return;
    }

    // Convert siteType to array of types
    let types = [];
    if (typeof entry.siteType === 'string') {
      types = entry.siteType.split(',').map(t => t.trim()).filter(t => t);
    } else if (Array.isArray(entry.siteType)) {
      types = entry.siteType.filter(t => t);
    }

    // If no valid types found, use the original entry
    if (types.length === 0) {
      result.push(entry);
      return;
    }

    // Create a new entry for each type
    types.forEach(type => {
      result.push({
        ...entry,
        siteType: type
      });
    });
  });

  return result;
}

// Initialize time filter
const timeFilterDropdown = createTimeFilter();

// Fetch data from the JSON
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
        fromUI: false
      });
    }

    // Create site type filter with a slight delay to ensure DOM is ready
    setTimeout(() => {
      const siteTypes = getUniqueSiteTypes(data);
      createSiteTypeFilter(siteTypes);

      // Set UI state from URL on initial load (after filters are created)
      setUIFromURL();
    }, 1);
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });
