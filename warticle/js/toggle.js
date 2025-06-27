// Toggle Utilities 

// Create a simple toggle switch
export function createToggleSwitch(options = {}) {
    // Default options
    const defaultOptions = {
        id: 'toggle-' + Math.random().toString(36).substring(2, 9), // Random ID if not provided
        labelText: 'Toggle',
        initialState: false,
        onChange: () => {},
        containerClass: 'toggle-switch-container',
        labelClass: 'toggle-switch-label',
        toggleClass: 'toggle-switch',
        sliderClass: 'toggle-slider'
    };
    
    // Merge with provided options
    const config = { ...defaultOptions, ...options };
    
    // Create container
    const container = document.createElement('div');
    container.className = config.containerClass;
    
    // Create label
    const label = document.createElement('span');
    label.className = config.labelClass;
    label.textContent = config.labelText;
    container.appendChild(label);
    
    // Create toggle switch
    const toggleContainer = document.createElement('label');
    toggleContainer.className = config.toggleClass;
    
    // Create checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = config.id;
    checkbox.checked = config.initialState;
    toggleContainer.appendChild(checkbox);
    
    // Create slider
    const slider = document.createElement('span');
    slider.className = config.sliderClass;
    toggleContainer.appendChild(slider);
    
    // Add toggle to container
    container.appendChild(toggleContainer);
    
    // Add event listener
    checkbox.addEventListener('change', function() {
        console.log(`Toggle switch ${config.id} changed to: ${this.checked}`);
        config.onChange(this.checked);
    });
    
    // Trigger initial callback if checked
    if (config.initialState) {
        console.log(`Initial state of toggle ${config.id} is: ${config.initialState}`);
        config.onChange(true);
    }
    
    // Return an object with the elements and methods
    return {
        container,
        checkbox,
        toggle: function(state) {
            console.log(`Manual toggle of ${config.id} to: ${state}`);
            checkbox.checked = state;
            // Trigger change event
            const event = new Event('change');
            checkbox.dispatchEvent(event);
        },
        getState: function() {
            return checkbox.checked;
        }
    };
}
