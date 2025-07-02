// Function to process location data
export function processLocationData(data) {
  return data.map((location) => ({
    ...location,
    siteType: [
      "oil",
      "military",
      "civilian",
      "nuclear",
      "utility",
      "personofinterest",
    ].includes(location.siteType)
      ? location.siteType
      : "other",
    Coordinates: location.Coordinates
      ? location.Coordinates.split(",").map((c) => parseFloat(c.trim()))
      : null,
  }));
}

// Convert Coordinates
export function calculateCoordinates(entry) {
  if (entry.coordinates && entry.coordinates.lat && entry.coordinates.lng) {
    return [entry.coordinates.lat, entry.coordinates.lng];
  }
  if (Array.isArray(entry.Coordinates) && entry.Coordinates.length === 2) {
    return entry.Coordinates;
  }
  if (typeof entry.Coordinates === 'string') {
    const parts = entry.Coordinates.split(',').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return parts;
    }
  }
  return null;
}


// Extract unique site types from data
export function getUniqueSiteTypes(data) {
  const types = new Set();
  data.forEach((entry) => {
    if (entry.siteType) {
      if (Array.isArray(entry.siteType)) {
        entry.siteType.forEach((type) => types.add(type));
      } else if (typeof entry.siteType === 'string') {
        entry.siteType.split(',').map(t => t.trim()).forEach(type => types.add(type));
      }
    }
  });
  return Array.from(types);
}

// Function to split entries into single siteType objects
export function splitIntoSingleTypes(jsonData) {
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

// Function to extract displayName from an entry
export function getDisplayName(entry) {
    if (entry && typeof entry === 'object') {
        // Check for displayName directly
        if (entry.displayName) {
            return entry.displayName;
        }
        
        // Fallback to name field if it exists
        if (entry.name) {
            return entry.name;
        }
        
        // Fallback to a combination of city and province if available
        if (entry.City || entry.Province) {
            const parts = [];
            if (entry.City) parts.push(entry.City);
            if (entry.Province) parts.push(entry.Province);
            return parts.join(', ');
        }
        
        // Fallback to site type as a last resort
        if (entry.siteType) {
            if (Array.isArray(entry.siteType)) {
                return entry.siteType[0];
            }
            return entry.siteType;
        }
        
        if (entry.type) {
            return entry.type;
        }
    }
    return 'Unknown';
}

