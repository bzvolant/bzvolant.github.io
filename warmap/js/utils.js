// Function to convert numbers to Persian digits
export function toPersianDigits(n) {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return n.toString().replace(/\d/g, x => persianDigits[x]);
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
  window.history.replaceState(
    {},
    "",
    `${window.location.pathname}?${params.toString()}`
  );
}

// Function to handle UI visibility
export function hideUI() {
  const params = new URLSearchParams(window.location.search);
  const UI = params.get("UI") === "false";

  const filterContainer = document.querySelector(".filter-container");
  const infoSection = document.querySelector(".info-section");

  if (UI) {
    if (filterContainer) filterContainer.style.display = "none";
    if (infoSection) infoSection.style.display = "none";
  } else {
    if (filterContainer) filterContainer.style.display = "";
    if (infoSection) infoSection.style.display = "";
  }
}

export function toFarsiDate(date) {
  const farsiDate = new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
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
