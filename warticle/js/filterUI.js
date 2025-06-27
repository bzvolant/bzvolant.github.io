import { toPersianDigits, translateToFarsi } from "./utils.js";

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

  // Apply RTL alignment to text and numbers
  const siteTypeContainer = document.createElement("div");
  siteTypeContainer.className = "filter-group-type";
  siteTypeContainer.id = "siteTypeFilterContainer";
  filterContainer.appendChild(siteTypeContainer);

  const label = document.createElement("label");
  label.className = "filter-label";
  label.textContent = "فیلتر بر اساس نوع سایت:"; // Farsi translation
  siteTypeContainer.appendChild(label);

  const checkboxContainer = document.createElement("div");
  checkboxContainer.className = "checkbox-container";
  siteTypeContainer.appendChild(checkboxContainer);

  // Handle case where no types are found
  if (!types || types.length === 0) {
    const noTypesMessage = document.createElement("div");
    noTypesMessage.className = "no-types-message";
    noTypesMessage.textContent = "هیچ نوع سایتی در داده‌ها یافت نشد"; // Farsi translation
    checkboxContainer.appendChild(noTypesMessage);
    console.log("No site types found, added message"); // Debug log
    return siteTypeContainer;
  }

  // Add "Select All" option
  const allWrapper = document.createElement("div");
  allWrapper.className = "all-wrapper";

  const allCheckbox = document.createElement("input");
  allCheckbox.type = "checkbox";
  allCheckbox.id = "type-all";
  allCheckbox.className = "type-checkbox-all";
  allWrapper.appendChild(allCheckbox);

  const allLabel = document.createElement("label");
  allLabel.htmlFor = "type-all";
  allLabel.className = "all-label";
  allLabel.textContent = "انتخاب همه"; // Farsi translation
  allWrapper.appendChild(allLabel);

  checkboxContainer.appendChild(allWrapper);

  // Add individual checkboxes for each type
  types.forEach((type) => {
    const wrapper = document.createElement("div");
    wrapper.className = "checkbox-wrapper";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `type-${type}`;
    checkbox.className = "type-checkbox";
    checkbox.value = type; // Set the value to the type
    wrapper.appendChild(checkbox);

    const label = document.createElement("label");
    label.htmlFor = `type-${type}`;
    label.className = "type-label";
    // Translate the type to Farsi
    label.textContent = translateToFarsi(type);
    wrapper.appendChild(label);

    checkboxContainer.appendChild(wrapper);
  });

  // Add event listeners
  allCheckbox.addEventListener("change", () => {
    const checkboxes = checkboxContainer.querySelectorAll(".type-checkbox");
    checkboxes.forEach((checkbox) => {
      checkbox.checked = allCheckbox.checked;
    });
    console.log("Select All changed. All checkboxes set to:", allCheckbox.checked); // Debug log
    onFilter();
  });

  checkboxContainer.addEventListener("change", (event) => {
    if (event.target.classList.contains("type-checkbox")) {
      const checkboxes = checkboxContainer.querySelectorAll(".type-checkbox");
      const allChecked = Array.from(checkboxes).every(
        (checkbox) => checkbox.checked
      );
      allCheckbox.checked = allChecked;
      console.log("Individual checkbox changed. Select All set to:", allChecked); // Debug log
      onFilter();
    }
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
  filterGroup.className = "filter-group-time";
  filterContainer.appendChild(filterGroup);

  const label = document.createElement("label");
  label.htmlFor = "timeFilter";
  label.className = "filter-label";
  label.textContent = "فیلتر بر اساس زمان:"; // Farsi translation
  filterGroup.appendChild(label);

  const select = document.createElement("select");
  select.id = "timeFilter";
  select.className = "dropdown";
  filterGroup.appendChild(select);

  const options = [
    { value: "", text: "ابتدا تا کنون" },
    { value: "1", text: "۲۴ ساعت گذشته" },
    { value: "2", text: "۲ روز گذشته" },
    { value: "3", text: "۳ روز گذشته" },
    { value: "7", text: "۷ روز گذشته" },
    { value: "14", text: "۱۴ روز گذشته" },
    { value: "30", text: "۳۰ روز گذشته" },
  ];

  options.forEach((option) => {
    const optEl = document.createElement("option");
    optEl.value = option.value;
    optEl.textContent = option.text; // Numbers are already in Persian
    select.appendChild(optEl);
  });

  // Add event listener for filter change
  select.addEventListener("change", function () {
    onFilter();
  });

  return select;
}

// Create label toggle UI with initial state option
export function createLabelToggle(onToggle, initialChecked = false) {
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

  // Remove any existing label toggle group to avoid duplicates
  const existingLabelGroup = filterContainer.querySelector('.filter-group-names');
  if (existingLabelGroup) {
    existingLabelGroup.remove();
  }
  const filterGroup = document.createElement("div");
  filterGroup.className = "filter-group-names";
  filterContainer.appendChild(filterGroup);

  const label = document.createElement("label");
  label.className = "filter-label";
  label.textContent = "نمایش نام‌ها:"; // Show Names in Farsi
  filterGroup.appendChild(label);

  const toggleContainer = document.createElement("div");
  toggleContainer.className = "toggle-container";
  filterGroup.appendChild(toggleContainer);

  const toggleSwitch = document.createElement("label");
  toggleSwitch.className = "switch";
  toggleContainer.appendChild(toggleSwitch);

  // Create the checkbox
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = "labelToggle";
  checkbox.checked = initialChecked; // Set initial state
  toggleSwitch.appendChild(checkbox);

  // Create the slider
  const slider = document.createElement("span");
  slider.className = "slider";
  toggleSwitch.appendChild(slider);

  // Add event listener
  checkbox.addEventListener("change", function() {
    onToggle(this.checked);
  });
  
  // Trigger initial callback if checked
  if (initialChecked) {
    onToggle(true);
  }

  return checkbox;
}

// Create circle marker toggle UI with initial state option
export function createCircleMarkerToggle(onToggle, initialChecked = false) {
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

  // Remove any existing circle marker toggle group to avoid duplicates
  const existingCircleGroup = filterContainer.querySelector('.filter-group-circles');
  if (existingCircleGroup) {
    existingCircleGroup.remove();
  }
  const filterGroup = document.createElement("div");
  filterGroup.className = "filter-group-circles";
  filterContainer.appendChild(filterGroup);

  const label = document.createElement("label");
  label.className = "filter-label";
  label.textContent = "نمایش نقطه‌ای:"; // Show Circles in Farsi
  filterGroup.appendChild(label);

  const toggleContainer = document.createElement("div");
  toggleContainer.className = "toggle-container";
  filterGroup.appendChild(toggleContainer);

  const toggleSwitch = document.createElement("label");
  toggleSwitch.className = "switch";
  toggleContainer.appendChild(toggleSwitch);

  // Create the checkbox
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = "circleToggle";
  checkbox.checked = initialChecked; // Set initial state
  toggleSwitch.appendChild(checkbox);

  // Create the slider
  const slider = document.createElement("span");
  slider.className = "slider";
  toggleSwitch.appendChild(slider);

  // Add event listener
  checkbox.addEventListener("change", function() {
    onToggle(this.checked);
  });
  
  // Trigger initial callback if checked
  if (initialChecked) {
    onToggle(true);
  }

  return checkbox;
}
