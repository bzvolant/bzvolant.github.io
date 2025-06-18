export function initializeMap() {
  const params = new URLSearchParams(window.location.search);
  const zoom = parseInt(params.get("zoom")) || 6;
  const lat = parseFloat(params.get("lat")) || 32.4279;
  const lng = parseFloat(params.get("lng")) || 53.688;

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

  window.leafletMap = map;

  return map;
}

export async function iranBorder(map) {
    const response = await fetch('data/iran-border.geojson');
    const geojson = await response.json();
    const borderLayer = L.geoJSON(geojson, {
        style: {
            color: "#666",
            weight: 2,
            fill: false,
        }
    }).addTo(map);
    return borderLayer;
}