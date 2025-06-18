// Function to initialize the map
function initializeMap() {
  const map = L.map("map", {
    attributionControl: false,
    zoomControl: false,
    minZoom: 4,
  }).setView([32.4279, 53.688], 6);

  L.tileLayer(
    "https://api.maptiler.com/maps/ed349839-de1f-47a1-8141-12b8d65c537d/{z}/{x}/{y}.png?key=pOZklUXrqCoxcxehsMzC",
    {
      maxZoom: 18,
    }
  ).addTo(map);
  return map;
}
const map = initializeMap();

// Function to process location data
function processLocationData(data) {
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

// Fetch JSON data before initializing the map and other components
fetch("data/locations.json")
  .then((response) => response.json())
  .then((data) => {
    const locations = processLocationData(data);

    const clusterGroup = initializeClusterGroup();
    addMarkersToClusterGroup(locations, clusterGroup);

    const uniqueTypes = [
      "oil",
      "military",
      "civilian",
      "nuclear",
      "utility",
      "personofinterest",
      "other",
    ];
    const typeFilterContainer = document.getElementById(
      "siteTypeFilterContainer"
    );
    const timeFilterDropdown = document.getElementById("timeFilter");

    createFilters(uniqueTypes, typeFilterContainer, timeFilterDropdown);

    // Function to create filters
    function createFilters(
      uniqueTypes,
      typeFilterContainer,
      timeFilterDropdown
    ) {
      timeFilterDropdown.classList.add(
        "rounded",
        "border-white-100",
        "focus:ring-blue-400",
        "focus:border-gray-400",
        "p-2",
        "shadow-sm"
      );

      uniqueTypes.forEach((type) => {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = type;
        checkbox.id = `type-${type}`;

        const label = document.createElement("label");
        label.htmlFor = `type-${type}`;
        label.textContent = type;

        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.alignItems = "center";
        wrapper.appendChild(checkbox);
        wrapper.appendChild(label);

        typeFilterContainer.appendChild(wrapper);
      });
    }

    // Calculate total casualties for the location
    function calculateCasualties(location) {
      const totalInjured =
        (location.militaryCasualties
          ? parseInt(location.militaryCasualties.split(",")[0])
          : 0) +
        (location.civilianCasualties
          ? parseInt(location.civilianCasualties.split(",")[0])
          : 0) +
        (location.uncategorisedCasualties
          ? parseInt(location.uncategorisedCasualties.split(",")[0])
          : 0);

      const totalKilled =
        (location.militaryCasualties
          ? parseInt(location.militaryCasualties.split(",")[1])
          : 0) +
        (location.civilianCasualties
          ? parseInt(location.civilianCasualties.split(",")[1])
          : 0) +
        (location.uncategorisedCasualties
          ? parseInt(location.uncategorisedCasualties.split(",")[1])
          : 0);

      return {
        totalInjured,
        totalKilled,
        totalCasualties: totalInjured + totalKilled,
      };
    }

    // Function to initialize marker cluster group
    function initializeClusterGroup() {
      return L.markerClusterGroup({
        showCoverageOnHover: false,
        iconCreateFunction: function (cluster) {
          const markers = cluster.getAllChildMarkers();
          const casualtySum = markers.reduce(
            (sum, marker) => sum + (marker.options.casualties || 0),
            0
          );
          return L.divIcon({
            html: `<div style='color: red; font-weight: bold; font-family: volant; font-size: 24px;'>${casualtySum
              .toString()
              .replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d])}</div>`,
            className: "casualties-label",
            iconSize: L.point(40, 40),
          });
        },
      });
    }

    // Function to add markers to cluster group
    function addMarkersToClusterGroup(locations, clusterGroup) {
      locations.forEach((location) => {
        if (location.Coordinates) {
          const { totalInjured, totalKilled, totalCasualties } =
            calculateCasualties(location);
          const persianDigits = totalCasualties
            .toString()
            .replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
          const label = L.divIcon({
            className: "casualties-label",
            html: `<div style='color: red; font-weight: bold; font-family: volant; font-size: 24px;'>${persianDigits}</div>`,
          });
          const icon = L.icon({
            iconUrl: "svg/un.svg",
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15],
          });
          const marker = L.marker(location.Coordinates, {
            icon: label,
            casualties: totalCasualties,
          });

          //   marker.bindPopup(
          //     `<table>
          //       <tr><td>Site Type:</td><td>${location.siteType}</td></tr>
          //       <tr><td>Total Injured:</td><td>${totalInjured}</td></tr>
          //       <tr><td>Total Killed:</td><td>${totalKilled}</td></tr>
          //       <tr><td>Total Casualties:</td><td>${totalCasualties}</td></tr>
          //     </table>`
          //   );

          clusterGroup.addLayer(marker);
        }
      });
    }

    // Function to update the map with filtered locations
    const updateMapFilteredLocations = (filteredLocations) => {
      // Remove existing markers and circles from the map
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Circle) {
          map.removeLayer(layer);
        }
      });

      // Check if casualties checkbox is present and checked
      const casualtiesCheckbox = document.getElementById("filter-casualties");
      const showCasualtiesLabels =
        casualtiesCheckbox && casualtiesCheckbox.checked;

      // Add markers for each filtered location
      filteredLocations.forEach((location) => {
        const svgPath = `svg/${location.siteType}.svg`;
        fetch(svgPath, { method: "HEAD" }).then((response) => {
          const iconUrl = response.ok ? svgPath : "svg/un.svg";
          const icon = L.icon({
            iconUrl,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15],
          });

          if (location.Coordinates && location.Coordinates.length === 2) {
            const [lat, lng] = location.Coordinates;
            const marker = L.marker([lat, lng], { icon }).addTo(map);

            // Calculate total casualties for the location
            const { totalInjured, totalKilled, totalCasualties } =
              calculateCasualties(location);

            // Add total casualties to the pop-up content
            const popupContent = `
                                <strong>${location.displayName}</strong><br>
                                ${
                                  location.Details
                                    ? `<em>${location.Details}</em><br>`
                                    : ""
                                }
                                ${
                                  location.Province
                                    ? `<strong>Province:</strong> ${location.Province}<br>`
                                    : ""
                                }
                                ${
                                  location.City
                                    ? `<strong>City:</strong> ${location.City}<br>`
                                    : ""
                                }
                                ${
                                  location.Address
                                    ? `<strong>Address:</strong> ${location.Address}<br>`
                                    : ""
                                }
                                ${
                                  location.date
                                    ? `<strong>Date:</strong> ${location.date}<br>`
                                    : ""
                                }
                                ${
                                  location.time
                                    ? `<strong>Time:</strong> ${location.time}<br>`
                                    : ""
                                }
                                ${
                                  location.militaryCasualties
                                    ? `<strong>Military Casualties:</strong> ${
                                        location.militaryCasualties.split(
                                          ","
                                        )[0]
                                      } Injured, ${
                                        location.militaryCasualties.split(
                                          ","
                                        )[1]
                                      } Killed<br>`
                                    : ""
                                }
                                ${
                                  location.civilianCasualties
                                    ? `<strong>Civilian Casualties:</strong> ${
                                        location.civilianCasualties.split(
                                          ","
                                        )[0]
                                      } Injured, ${
                                        location.civilianCasualties.split(
                                          ","
                                        )[1]
                                      } Killed<br>`
                                    : ""
                                }
                                ${
                                  location.uncategorisedCasualties
                                    ? `<strong>Uncategorised Casualties:</strong> ${
                                        location.uncategorisedCasualties.split(
                                          ","
                                        )[0]
                                      } Injured, ${
                                        location.uncategorisedCasualties.split(
                                          ","
                                        )[1]
                                      } Killed<br>`
                                    : ""
                                }
                                <strong>Total Injured:</strong> ${totalInjured}<br>
                                <strong>Total Killed:</strong> ${totalKilled}<br>
                                <strong>Total Casualties:</strong> ${totalCasualties}<br>
                                ${
                                  location.individuals &&
                                  location.individuals.length > 0
                                    ? `<strong>Individuals:</strong><br>${location.individuals
                                        .map(
                                          (ind) => `- ${ind.name} (${ind.role})`
                                        )
                                        .join("<br>")}`
                                    : ""
                                }
                            `;
            marker.bindPopup(popupContent);

            // Add total casualties to the label marker
            if (showCasualtiesLabels) {
              const label = L.divIcon({
                className: "casualties-label",
                html: `<div style='color: red; font-weight: bold;'>${totalCasualties}</div>`,
              });
              const labelMarker = L.marker([lat, lng], { icon: label }).addTo(
                map
              );
            }
          }
        });
      });
    };

    // Update the map with filtered locations based on date, casualties, and type filters
    const updateMap = (filteredLocations) => {
      // Remove existing markers and circles from the map
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Circle) {
          map.removeLayer(layer);
        }
      });

      // Check if casualties checkbox is present and checked
      const casualtiesCheckbox = document.getElementById("filter-casualties");
      const showCasualtiesLabels =
        casualtiesCheckbox && casualtiesCheckbox.checked;

      // Filter locations based on casualties if checkbox is checked
      if (showCasualtiesLabels) {
        filteredLocations = filteredLocations.filter((location) => {
          const { totalCasualties } = calculateCasualties(location);
          return totalCasualties > 0;
        });
      }

      // Filter locations based on date
      const selectedTime = document.getElementById("timeFilter").value;
      if (selectedTime) {
        const daysAgo = parseInt(selectedTime, 10);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
        filteredLocations = filteredLocations.filter((location) => {
          let dateObj = null;
          if (location.date) {
            dateObj = new Date(location.date);
          }
          return dateObj && dateObj >= cutoffDate;
        });
      }

      // Add markers for each filtered location
      filteredLocations.forEach((location) => {
        const { totalInjured, totalKilled, totalCasualties } =
          calculateCasualties(location);
        const icon = L.icon({
          iconUrl: `svg/${location.siteType}.svg`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
          popupAnchor: [0, -15],
        });

        if (location.Coordinates) {
          const marker = L.marker(location.Coordinates, { icon }).addTo(map);

          // Add pop-up content
          marker.bindPopup(
            `<table>
              <tr><td>Site Type:</td><td>${location.siteType}</td></tr>
              <tr><td>Total Injured:</td><td>${totalInjured}</td></tr>
              <tr><td>Total Killed:</td><td>${totalKilled}</td></tr>
              <tr><td>Total Casualties:</td><td>${totalCasualties}</td></tr>
            </table>`
          );
        }
      });

      // Update marker cluster group
      clusterGroup.clearLayers();
      filteredLocations.forEach((location) => {
        if (location.Coordinates) {
          const { totalCasualties } = calculateCasualties(location);
          const marker = L.marker(location.Coordinates, {
            casualties: totalCasualties,
          });
          clusterGroup.addLayer(marker);
        }
      });
    };

    // Function to filter locations based on selected site types and time
    const filterLocations = () => {
      const selectedTypes = Array.from(
        typeFilterContainer.querySelectorAll("input[type=checkbox]:checked")
      ).map((cb) => cb.value);
      const selectedTime = timeFilterDropdown.value;

      let filteredLocations = locations;
      if (selectedTypes.length > 0) {
        filteredLocations = filteredLocations.filter((location) =>
          selectedTypes.includes(location.siteType)
        );
      }
      if (selectedTime) {
        const daysAgo = parseInt(selectedTime, 10);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
        filteredLocations = filteredLocations.filter((location) => {
          let dateObj = null;
          if (location.date) {
            dateObj = new Date(location.date);
          }
          return dateObj && dateObj >= cutoffDate;
        });
      }

      // Update URL parameters based on filters
      const urlParams = new URLSearchParams(window.location.search);
      if (selectedTypes.length > 0) {
        urlParams.set("type", selectedTypes.join(","));
      } else {
        urlParams.delete("type");
      }

      if (selectedTime) {
        urlParams.set("time", selectedTime);
      } else {
        urlParams.delete("time");
      }

      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${urlParams.toString()}`
      );

      // Update the map with filtered locations
      updateMapFilteredLocations(filteredLocations);
    };

    // Calculate the sum of all killed and injured
    const calculateCasualtiesSum = (locations) => {
      let totalInjured = 0;
      let totalKilled = 0;

      locations.forEach((location) => {
        if (location.militaryCasualties) {
          const [injured, killed] = location.militaryCasualties
            .split(",")
            .map(Number);
          totalInjured += injured;
          totalKilled += killed;
        }
        if (location.civilianCasualties) {
          const [injured, killed] = location.civilianCasualties
            .split(",")
            .map(Number);
          totalInjured += injured;
          totalKilled += killed;
        }
        if (location.uncategorisedCasualties) {
          const [injured, killed] = location.uncategorisedCasualties
            .split(",")
            .map(Number);
          totalInjured += injured;
          totalKilled += killed;
        }
      });

      console.log(
        `Total Injured: ${totalInjured}, Total Killed: ${totalKilled}`
      );
    };

    // Call the function to calculate casualties sum
    calculateCasualtiesSum(locations);

    // --- SYNCHRONIZE UI AND URL FILTERS, AND UPDATE MARKERS (INCLUDING CASUALTIES CHECKBOX) ---

    // Helper: Set UI filters from URL
    function setUIFromURL() {
      const urlParams = new URLSearchParams(window.location.search);
      const selectedTypes = urlParams.get("type")
        ? urlParams.get("type").split(",")
        : [];
      const selectedTime = urlParams.get("time");
      const casualtiesChecked = urlParams.get("casualties") === "true";

      // Update checkboxes
      const typeCheckboxes = document.querySelectorAll(
        "#siteTypeFilterContainer input[type=checkbox]"
      );
      typeCheckboxes.forEach((checkbox) => {
        checkbox.checked = selectedTypes.includes(checkbox.value);
      });

      // Update dropdown
      const timeDropdown = document.getElementById("timeFilter");
      if (selectedTime) {
        timeDropdown.value = selectedTime;
      } else {
        timeDropdown.value = "";
      }

      // Update casualties checkbox
      const casualtiesCheckbox = document.getElementById("filter-casualties");
      if (casualtiesCheckbox) {
        casualtiesCheckbox.checked = casualtiesChecked;
      }
    }

    // Helper: Set URL from UI filters
    function setURLFromUI() {
      const selectedTypes = Array.from(
        document.querySelectorAll(
          "#siteTypeFilterContainer input[type=checkbox]:checked"
        )
      ).map((cb) => cb.value);
      const selectedTime = document.getElementById("timeFilter").value;
      const casualtiesCheckbox = document.getElementById("filter-casualties");
      const urlParams = new URLSearchParams(window.location.search);
      if (selectedTypes.length > 0) {
        urlParams.set("type", selectedTypes.join(","));
      } else {
        urlParams.delete("type");
      }
      if (selectedTime) {
        urlParams.set("time", selectedTime);
      } else {
        urlParams.delete("time");
      }
      if (casualtiesCheckbox && casualtiesCheckbox.checked) {
        urlParams.set("casualties", "true");
      } else {
        urlParams.delete("casualties");
      }
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${urlParams.toString()}`
      );
    }

    // Helper: Filter locations based on current UI (which is always in sync with URL)
    function getFilteredLocations() {
      const selectedTypes = Array.from(
        document.querySelectorAll(
          "#siteTypeFilterContainer input[type=checkbox]:checked"
        )
      ).map((cb) => cb.value);
      const selectedTime = document.getElementById("timeFilter").value;
      let filtered = locations;
      if (selectedTypes.length > 0) {
        filtered = filtered.filter((location) =>
          selectedTypes.includes(location.siteType)
        );
      }
      if (selectedTime) {
        const daysAgo = parseInt(selectedTime, 10);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
        filtered = filtered.filter((location) => {
          let dateObj = null;
          if (location.date) {
            dateObj = new Date(location.date);
          }
          return dateObj && dateObj >= cutoffDate;
        });
      }
      return filtered;
    }

    // Update the map with filtered locations and casualties toggle
    function updateMapWithCasualtiesToggle(filteredLocations) {
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Circle) {
          map.removeLayer(layer);
        }
      });
      const casualtiesCheckbox = document.getElementById("filter-casualties");
      const showCasualtiesLabels =
        casualtiesCheckbox && casualtiesCheckbox.checked;
      filteredLocations.forEach((location) => {
        const svgPath = `svg/${location.siteType}.svg`;
        if (showCasualtiesLabels) {
          // Show only casualties label markers
          const { totalInjured, totalKilled, totalCasualties } =
            calculateCasualties(location);
          if (location.Coordinates && location.Coordinates.length === 2) {
            const [lat, lng] = location.Coordinates;
            const label = L.divIcon({
              className: "casualties-label",
              //   html: `<div style='color: red; font-weight: bold;'>${totalCasualties}</div>`,
              html: ``,
            });
            const labelMarker = L.marker([lat, lng], { icon: label }).addTo(
              map
            );

            // Add pop-up with detailed information
            const popupContent = `
                            <strong>${location.displayName}</strong><br>
                            ${
                              location.Details
                                ? `<em>${location.Details}</em><br>`
                                : ""
                            }
                            ${
                              location.Province
                                ? `<strong>Province:</strong> ${location.Province}<br>`
                                : ""
                            }
                            ${
                              location.City
                                ? `<strong>City:</strong> ${location.City}<br>`
                                : ""
                            }
                            ${
                              location.Address
                                ? `<strong>Address:</strong> ${location.Address}<br>`
                                : ""
                            }
                            ${
                              location.date
                                ? `<strong>Date:</strong> ${location.date}<br>`
                                : ""
                            }
                            ${
                              location.time
                                ? `<strong>Time:</strong> ${location.time}<br>`
                                : ""
                            }
                            ${
                              location.militaryCasualties
                                ? `<strong>Military Casualties:</strong> ${
                                    location.militaryCasualties.split(",")[0]
                                  } Injured, ${
                                    location.militaryCasualties.split(",")[1]
                                  } Killed<br>`
                                : ""
                            }
                            ${
                              location.civilianCasualties
                                ? `<strong>Civilian Casualties:</strong> ${
                                    location.civilianCasualties.split(",")[0]
                                  } Injured, ${
                                    location.civilianCasualties.split(",")[1]
                                  } Killed<br>`
                                : ""
                            }
                            ${
                              location.uncategorisedCasualties
                                ? `<strong>Uncategorised Casualties:</strong> ${
                                    location.uncategorisedCasualties.split(
                                      ","
                                    )[0]
                                  } Injured, ${
                                    location.uncategorisedCasualties.split(
                                      ","
                                    )[1]
                                  } Killed<br>`
                                : ""
                            }
                            <strong>Total Injured:</strong> ${totalInjured}<br>
                            <strong>Total Killed:</strong> ${totalKilled}<br>
                            <strong>Total Casualties:</strong> ${totalCasualties}<br>
                            ${
                              location.individuals &&
                              location.individuals.length > 0
                                ? `<strong>Individuals:</strong><br>${location.individuals
                                    .map((ind) => `- ${ind.name} (${ind.role})`)
                                    .join("<br>")}`
                                : ""
                            }
                        `;
            labelMarker.bindPopup(popupContent);
          }
        } else {
          // Show SVG markers
          fetch(svgPath, { method: "HEAD" }).then((response) => {
            const iconUrl = response.ok ? svgPath : "svg/un.svg";
            const icon = L.icon({
              iconUrl,
              iconSize: [30, 30],
              iconAnchor: [15, 15],
              popupAnchor: [0, -15],
            });
            if (location.Coordinates && location.Coordinates.length === 2) {
              const [lat, lng] = location.Coordinates;
              const marker = L.marker([lat, lng], { icon }).addTo(map);

              // Calculate total casualties for the location
              const { totalInjured, totalKilled, totalCasualties } =
                calculateCasualties(location);

              // Add total casualties to the pop-up content
              const popupContent = `
                                    <strong>${location.displayName}</strong><br>
                                    ${
                                      location.Details
                                        ? `<em>${location.Details}</em><br>`
                                        : ""
                                    }
                                    ${
                                      location.Province
                                        ? `<strong>Province:</strong> ${location.Province}<br>`
                                        : ""
                                    }
                                    ${
                                      location.City
                                        ? `<strong>City:</strong> ${location.City}<br>`
                                        : ""
                                    }
                                    ${
                                      location.Address
                                        ? `<strong>Address:</strong> ${location.Address}<br>`
                                        : ""
                                    }
                                    ${
                                      location.date
                                        ? `<strong>Date:</strong> ${location.date}<br>`
                                        : ""
                                    }
                                    ${
                                      location.time
                                        ? `<strong>Time:</strong> ${location.time}<br>`
                                        : ""
                                    }
                                    ${
                                      location.militaryCasualties
                                        ? `<strong>Military Casualties:</strong> ${
                                            location.militaryCasualties.split(
                                              ","
                                            )[0]
                                          } Injured, ${
                                            location.militaryCasualties.split(
                                              ","
                                            )[1]
                                          } Killed<br>`
                                        : ""
                                    }
                                    ${
                                      location.civilianCasualties
                                        ? `<strong>Civilian Casualties:</strong> ${
                                            location.civilianCasualties.split(
                                              ","
                                            )[0]
                                          } Injured, ${
                                            location.civilianCasualties.split(
                                              ","
                                            )[1]
                                          } Killed<br>`
                                        : ""
                                    }
                                    ${
                                      location.uncategorisedCasualties
                                        ? `<strong>Uncategorised Casualties:</strong> ${
                                            location.uncategorisedCasualties.split(
                                              ","
                                            )[0]
                                          } Injured, ${
                                            location.uncategorisedCasualties.split(
                                              ","
                                            )[1]
                                          } Killed<br>`
                                        : ""
                                    }
                                    <strong>Total Injured:</strong> ${totalInjured}<br>
                                    <strong>Total Killed:</strong> ${totalKilled}<br>
                                    <strong>Total Casualties:</strong> ${totalCasualties}<br>
                                    ${
                                      location.individuals &&
                                      location.individuals.length > 0
                                        ? `<strong>Individuals:</strong><br>${location.individuals
                                            .map(
                                              (ind) =>
                                                `- ${ind.name} (${ind.role})`
                                            )
                                            .join("<br>")}`
                                        : ""
                                    }
                                `;
              marker.bindPopup(popupContent);
            }
          });
        }
      });
    }

    // Main: On page load, sync UI from URL and update markers
    setUIFromURL();
    updateMapWithCasualtiesToggle(getFilteredLocations());

    // Main: On UI change, update URL and markers
    typeFilterContainer.addEventListener("change", () => {
      setURLFromUI();
      updateMapWithCasualtiesToggle(getFilteredLocations());
    });
    timeFilterDropdown.addEventListener("change", () => {
      setURLFromUI();
      updateMapWithCasualtiesToggle(getFilteredLocations());
    });
    const casualtiesCheckbox = document.getElementById("filter-casualties");
    if (casualtiesCheckbox) {
      casualtiesCheckbox.addEventListener("change", () => {
        setURLFromUI();
        updateMapWithCasualtiesToggle(getFilteredLocations());
      });
    }
    // If browser navigation changes URL, sync UI and markers
    window.addEventListener("popstate", () => {
      setUIFromURL();
      updateMapWithCasualtiesToggle(getFilteredLocations());
    });
    // --- END SYNC LOGIC ---

    casualtiesCheckbox.addEventListener("change", () => {
      if (casualtiesCheckbox.checked) {
        map.addLayer(clusterGroup);
      } else {
        map.removeLayer(clusterGroup);
      }
    });

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("casualties") === "true") {
      map.addLayer(clusterGroup);
    } else {
      map.removeLayer(clusterGroup);
    }

    // Add event listener to casualties checkbox to grey out site type checkboxes
    if (casualtiesCheckbox) {
      casualtiesCheckbox.addEventListener("change", () => {
        const typeCheckboxes = document.querySelectorAll(
          "#siteTypeFilterContainer input[type=checkbox]"
        );
        typeCheckboxes.forEach((checkbox) => {
          checkbox.disabled = casualtiesCheckbox.checked;
          checkbox.style.opacity = casualtiesCheckbox.checked ? 0.5 : 1;
        });
      });
    }

    // Add event listener to casualties checkbox to uncheck and grey out site type checkboxes
    if (casualtiesCheckbox) {
      casualtiesCheckbox.addEventListener("change", () => {
        const typeCheckboxes = document.querySelectorAll(
          "#siteTypeFilterContainer input[type=checkbox]"
        );
        typeCheckboxes.forEach((checkbox) => {
          checkbox.checked = false; // Uncheck all site type checkboxes
          checkbox.disabled = casualtiesCheckbox.checked; // Grey out if casualties checkbox is checked
          checkbox.style.opacity = casualtiesCheckbox.checked ? 0.5 : 1;
        });
      });
    }
  });
