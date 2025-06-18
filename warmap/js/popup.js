import { calculateCasualties } from "./casualties.js";
import { toPersianDigits } from "./utils.js";

// Generate a simple popup with just the most important info
export function createPopup(entry) {
  try {
    if (!entry) return "اطلاعاتی موجود نیست";

    let content = "";

    // Title
    if (entry.displayName) {
      content += `<strong>${entry.displayName}</strong><br>`;
    }

    // Site type
    let siteTypeDisplay = "Unknown";
    if (entry.siteType) {
      if (Array.isArray(entry.siteType)) {
        siteTypeDisplay = entry.siteType.join(", ");
      } else {
        siteTypeDisplay = entry.siteType;
      }
    } else if (entry.type) {
      siteTypeDisplay = entry.type;
    }
    content += `<span>Type: ${siteTypeDisplay}</span><br>`;

    // Date
    if (entry.date) {
      const dateObj = new Date(entry.date);
      content += `<span>Date: ${dateObj.toLocaleDateString()}</span><br>`;
    }

    // Location
    if (entry.Province) {
      content += `<span>Province: ${entry.Province}</span><br>`;
    }
    if (entry.City) {
      content += `<span>City: ${entry.City}</span><br>`;
    }

    // Details
    if (entry.Details || entry.details) {
      content += `<span>${entry.Details || entry.details}</span><br>`;
    }

    // Casualties (summary only)
    const casualties = calculateCasualties(entry);
    if (casualties.total > 0) {
      content += `<span>Casualties: ${toPersianDigits(casualties.total)}</span><br>`;
    }

    // Only one main div for styling
    return `<div class='leaflet-popup-content'>${content}</div>`;
  } catch (error) {
    console.error("Error creating popup:", error, "Entry:", entry);
    return "Error creating popup content";
  }
}
