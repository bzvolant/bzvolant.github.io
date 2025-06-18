// Create site type filter UI
export function createSiteTypeFilter(types, onFilter) {
  console.log("Creating site type filter with types:", types); // Debug log

  // Create container if it doesn't exist already
  let filterContainer = document.querySelector(".filter-container");
  if (!filterContainer) {
    filterContainer = document.createElement("div");
    filterContainer.className = "filter-container";
    document.body.insertBefore(
      filterContainer,
      document.getElementById("map").nextSibling
    );
  }

  // Remove any existing site type container first to avoid duplicates
  const existingSiteTypeContainer = document.getElementById(
    "siteTypeFilterContainer"
  );
  if (existingSiteTypeContainer) {
    existingSiteTypeContainer.remove();
  }

  const siteTypeContainer = document.createElement("div");
  siteTypeContainer.className = "filter-group";
  siteTypeContainer.id = "siteTypeFilterContainer";
  siteTypeContainer.style.backgroundColor = "rgba(245, 245, 245, 0.8)";
  siteTypeContainer.style.padding = "8px";
  siteTypeContainer.style.borderRadius = "5px";
  filterContainer.appendChild(siteTypeContainer);

  const label = document.createElement("label");
  label.className = "filter-label";
  label.textContent = "Filter by Site Type:";
  label.style.color = "#333";
  label.style.fontSize = "14px";
  label.style.fontWeight = "bold";
  label.style.display = "block";
  label.style.marginBottom = "8px";
  siteTypeContainer.appendChild(label);

  // Create checkbox container
  const checkboxContainer = document.createElement("div");
  checkboxContainer.className = "checkbox-container";
  checkboxContainer.style.display = "flex";
  checkboxContainer.style.flexDirection = "column";
  checkboxContainer.style.marginTop = "5px";
  checkboxContainer.style.maxHeight = "150px";
  checkboxContainer.style.overflowY = "auto";
  checkboxContainer.style.border = "1px solid #ddd";
  checkboxContainer.style.padding = "5px";
  checkboxContainer.style.borderRadius = "3px";
  siteTypeContainer.appendChild(checkboxContainer);

  // Handle case where no types are found
  if (!types || types.length === 0) {
    const noTypesMessage = document.createElement("div");
    noTypesMessage.textContent = "No site types found in data";
    noTypesMessage.style.fontStyle = "italic";
    noTypesMessage.style.color = "#888";
    noTypesMessage.style.padding = "5px";
    checkboxContainer.appendChild(noTypesMessage);
    console.log("No site types found, added message"); // Debug log
    return siteTypeContainer;
  }

  // Add "Select All" option
  const allWrapper = document.createElement("div");
  allWrapper.style.display = "flex";
  allWrapper.style.alignItems = "center";
  allWrapper.style.marginBottom = "8px";
  allWrapper.style.borderBottom = "1px solid #ddd";
  allWrapper.style.paddingBottom = "5px";

  const allCheckbox = document.createElement("input");
  allCheckbox.type = "checkbox";
  allCheckbox.id = "type-all";
  allCheckbox.className = "type-checkbox-all";
  allCheckbox.style.marginRight = "5px";

  const allLabel = document.createElement("label");
  allLabel.htmlFor = "type-all";
  allLabel.textContent = "Select All";
  allLabel.style.fontWeight = "bold";
  allLabel.style.fontSize = "14px";
  allLabel.style.marginLeft = "3px";

  allWrapper.appendChild(allCheckbox);
  allWrapper.appendChild(allLabel);
  checkboxContainer.appendChild(allWrapper);

  // Add event listener for "Select All"
  allCheckbox.addEventListener("change", function () {
    const isChecked = this.checked;
    const typeCheckboxes = document.querySelectorAll(".type-checkbox");
    typeCheckboxes.forEach((cb) => {
      cb.checked = isChecked;
    });
    onFilter();
  });

  types.forEach((type) => {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.marginBottom = "5px";
    wrapper.style.padding = "3px";
    wrapper.style.borderRadius = "3px";
    wrapper.style.backgroundColor = "rgba(255, 255, 255, 0.5)";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = type;
    checkbox.id = `type-${type}`;
    checkbox.className = "type-checkbox";
    checkbox.style.marginRight = "5px";

    const checkboxLabel = document.createElement("label");
    checkboxLabel.htmlFor = `type-${type}`;
    checkboxLabel.textContent = type.charAt(0).toUpperCase() + type.slice(1); // Capitalize first letter
    checkboxLabel.style.fontSize = "13px";
    checkboxLabel.style.marginLeft = "3px";

    wrapper.appendChild(checkbox);
    wrapper.appendChild(checkboxLabel);
    checkboxContainer.appendChild(wrapper);
    console.log("Added checkbox for type:", type); // Debug log

    // Add event listener
    checkbox.addEventListener("change", function () {
      // Update "Select All" checkbox
      const allTypeCheckboxes = document.querySelectorAll(".type-checkbox");
      const allChecked = Array.from(allTypeCheckboxes).every(
        (cb) => cb.checked
      );
      document.getElementById("type-all").checked = allChecked;

      onFilter();
    });
  });

  return siteTypeContainer;
}


// Create time filter UI
export function createTimeFilter(onFilter) {
  // Check if container exists
  let filterContainer = document.querySelector(".filter-container");
  if (!filterContainer) {
    filterContainer = document.createElement("div");
    filterContainer.className = "filter-container";
    document.body.insertBefore(
      filterContainer,
      document.getElementById("map").nextSibling
    );
  }

  const filterGroup = document.createElement("div");
  filterGroup.className = "filter-group";
  filterContainer.appendChild(filterGroup);

  const label = document.createElement("label");
  label.htmlFor = "timeFilter";
  label.className = "filter-label";
  label.textContent = "Filter by Time:";
  filterGroup.appendChild(label);

  const select = document.createElement("select");
  select.id = "timeFilter";
  select.className = "dropdown";
  filterGroup.appendChild(select);

  const options = [
    { value: "", text: "All" },
    { value: "1", text: "Last 24 Hours" },
    { value: "2", text: "Last 2 Days" },
    { value: "3", text: "Last 3 Days" },
    { value: "7", text: "Last 7 Days" },
    { value: "14", text: "Last 14 Days" },
    { value: "30", text: "Last 30 Days" },
  ];

  options.forEach((option) => {
    const optEl = document.createElement("option");
    optEl.value = option.value;
    optEl.textContent = option.text;
    select.appendChild(optEl);
  });

  // Add event listener for filter change
  select.addEventListener("change", function () {
    onFilter();
  });

  return select;
}
