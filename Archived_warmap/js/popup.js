import { calculateCasualties } from "./casualties.js";
import { toPersianDigits, toFarsiDate, translateToFarsi } from "./utils.js";



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
        console.log("Translating siteType array:", entry.siteType); // Debug log
        siteTypeDisplay = entry.siteType.map(translateToFarsi).join("، "); // Translate each type
      } else {
        console.log("Translating single siteType:", entry.siteType); // Debug log
        siteTypeDisplay = translateToFarsi(entry.siteType); // Translate single type
      }
    } else if (entry.type) {
      console.log("Translating fallback type:", entry.type); // Debug log
      siteTypeDisplay = translateToFarsi(entry.type); // Translate fallback type
    }
    content += `<span> نوع: ${siteTypeDisplay}</span><br>`;

    // Date
    if (entry.date) {
      const dateObj = new Date(entry.date);
      const farsiDate = toFarsiDate(dateObj);
      content += `<span>تاریخ: ${farsiDate}</span><br>`;
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
      content += `<span>تلفات: ${toPersianDigits(casualties.total)} نفر</span><br>`;
    }

    // Add link
    if (entry.link) {
      content += `<a href='${entry.link}' target='_blank'>لینک </a><br>`;
    }

    // Add main image
    if (entry.mainImage) {
      content += `<img src='${entry.mainImage}' alt='Main Image' style='max-width: 100%; height: auto;'><br>`;
    }

    // Add people details
    if (entry.people && Array.isArray(entry.people)) {
      content += `<div class='people-section'>`;
      entry.people.forEach(person => {
        content += `<div class='person'>`;
        if (person.image) {
          content += `<img src='${person.image}' alt='${person.name}' style='max-width: 50px; height: auto;'>`;
        }
        if (person.name || person.role) {
          content += `<div class='person-detail'>`;
          if (person.name) {
            content += `<span>${person.name}</span>`;
          }
          if (person.role) {
            content += `<span>(${person.role})</span>`;
          }
          content += `</div>`;
        }
        content += `</div>`;
      });
      content += `</div>`;
    }


    // Only one main div for styling
    return `<div class='leaflet-popup-content'>${content}</div>`;
  } catch (error) {
    console.error("Error creating popup:", error, "Entry:", entry);
    return "Error creating popup content";
  }
}
