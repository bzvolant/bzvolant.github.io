export function convertCoordinates(entry) {
  if (entry.coordinates && entry.coordinates.lat && entry.coordinates.lng) {
    return [entry.coordinates.lat, entry.coordinates.lng];
  }
  return null;
}
