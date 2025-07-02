// Function to convert numbers to Persian digits
export function toPersianDigits(n) {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return n.toString().replace(/\d/g, (x) => persianDigits[x]);
}

// Update URL when map view changes
export function updateUrlParams() {
  // Get map reference from window for global access
  const map = window.leafletMap;
  if (!map) {
    console.error("updateUrlParams: Map not initialized");
    return;
  }

  const center = map.getCenter();
  const params = new URLSearchParams(window.location.search);
  params.set("zoom", map.getZoom());
  params.set("lat", center.lat.toFixed(6));
  params.set("lng", center.lng.toFixed(6));
  
  // Preserve hideUI parameter if it exists
  const hideUI = params.get("hideUI");
  if (hideUI === "true") {
    params.set("hideUI", "true");
  }
  // Preserve showNames parameter if it exists
  const showNames = params.get("showNames");
  if (showNames !== null) {
    params.set("showNames", showNames);
  }
  // Preserve showCircles parameter if it exists
  const showCircles = params.get("showCircles");
  if (showCircles !== null) {
    params.set("showCircles", showCircles);
  }
  window.history.replaceState(
    {},
    "",
    `${window.location.pathname}?${params.toString()}`
  );
}

// Function to handle UI visibility
export function hideUI() {
  const params = new URLSearchParams(window.location.search);
  const hideUIParam = params.get("hideUI") === "true";
  
  console.log("hideUI function called. hideUI param:", hideUIParam);

  // Get all possible UI containers
  const filterContainer = document.querySelector(".filter-container");
  const filterContainers = document.querySelectorAll(".filter-container");
  const infoSection = document.querySelector(".info-section");
  const filterGroups = document.querySelectorAll(".filter-group, .filter-group-type, .filter-group-time, .filter-group-names, .filter-group-circles");
  
  if (hideUIParam) {
    console.log("Hiding UI elements");
    
    // Hide main containers
    if (filterContainer) filterContainer.style.display = "none";
    if (infoSection) infoSection.style.display = "none";
    
    // Hide all filter containers (in case there are multiple)
    filterContainers.forEach(container => {
      container.style.display = "none";
    });
    
    // Hide all filter groups
    filterGroups.forEach(group => {
      group.style.display = "none";
    });
  } else {
    console.log("Showing UI elements");
    
    // Show main containers
    if (filterContainer) filterContainer.style.display = "";
    if (infoSection) infoSection.style.display = "";
    
    // Show all filter containers
    filterContainers.forEach(container => {
      container.style.display = "";
    });
    
    // Show all filter groups
    filterGroups.forEach(group => {
      group.style.display = "";
    });
  }
}

export function toFarsiDate(date) {
  const farsiDate = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);

  return toPersianDigits(farsiDate); // Use toPersianDigits to convert digits
}

// Function to convert types to Farsi
export function translateToFarsi(type) {
  const wordTranslations = {
    military: "نظامی",
    utility: "خدماتی",
    oil: "نفتی",
    nuclear: "هسته‌ای",
    target: "هدف",
    injured: "مجروح",
    killed: "کشته",
    other: "سایر",
    personofinterest: "شخص مورد نظر",
    civilian: "غیرنظامی",
    energy: "انرژی",
    industry: "صنعتی",
    site: "محل",
    siteType: "نوع",
    unknown: "ناشناخته",
    government: "دولتی",
    casualties: "تلفات",
    transport: "حمل و نقل",
  };

  return wordTranslations[type] || type; // Return translation or original type if not found
}

// Function to synchronize show names toggle with URL
export function syncShowNamesWithUrl(enable) {
  // Get current URL parameters
  const params = new URLSearchParams(window.location.search);

  // Update showNames parameter
  params.set("showNames", enable.toString());

  // Update URL without reloading the page
  window.history.replaceState(
    {},
    "",
    `${window.location.pathname}?${params.toString()}`
  );
}

// Function to get show names state from URL
export function getShowNamesFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("showNames") === "true";
}

// Function to synchronize circle markers toggle with URL
export function syncCircleMarkersWithUrl(enable) {
  // Get current URL parameters
  const params = new URLSearchParams(window.location.search);

  // Update showCircles parameter
  params.set("showCircles", enable.toString());

  // Update URL without reloading the page
  window.history.replaceState(
    {},
    "",
    `${window.location.pathname}?${params.toString()}`
  );
}

// Function to get circle markers state from URL
export function getCircleMarkersFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("showCircles") === "true";
}

export function darkenColor(hex, percent) {
  // Remove '#' if present
  hex = hex.replace(/^#/, "");
  // Parse r, g, b
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  // Decrease each channel by percent
  r = Math.floor(r * (1 - percent));
  g = Math.floor(g * (1 - percent));
  b = Math.floor(b * (1 - percent));
  // Clamp to [0,255]
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  // Convert back to hex
  return (
    "#" +
    r.toString(16).padStart(2, "0") +
    g.toString(16).padStart(2, "0") +
    b.toString(16).padStart(2, "0")
  );
}
