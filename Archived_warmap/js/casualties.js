// Function to calculate total casualties from different data formats
export function calculateCasualties(entry) {
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
