// Function to log the hour and minutes of data fetch
function logFetchTime() {
  const now = new Date();
  console.log(`Data fetched at: ${now.getHours()}:${now.getMinutes()}`);
}

// Function to fetch data
export async function fetchData() {
  const response = await fetch(
    "https://cojboaykyg.execute-api.eu-west-1.amazonaws.com/default/SanityWarmapAPI"
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  logFetchTime();
  return await response.json();
}

// Function to start fetch repeatedly at a specific time, adjusting for past time
export async function updateFetch(hour, minute) {
  fetchData()
    .then((data) => {
      console.log("Data fetched successfully:", data);
      // Add logic to update the map with new data
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });

  setInterval(() => {
    fetchData()
      .then((data) => {
        console.log("Data fetched successfully:", data);
        // Add logic to update the map with new data
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, 60 * 1000); // Repeat every 1 minute
}
