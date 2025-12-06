/**
 * Range Input Generator for Home Page
 * Allows users to generate and configure range input elements dynamically
 */

class RangeInputGenerator {
    constructor() {
        this.container = document.getElementById('rangeInputsContainer');
        this.checkbox = document.getElementById('generateRangeCheckbox');
        this.elements = this.loadFromStorage();
        this.elementCounter = this.elements.length;
        
        this.init();
    }
    
    init() {
        // Load saved elements on page load
        this.renderAll();
        
        // Listen for checkbox changes
        if (this.checkbox) {
            this.checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.generateNewElement();
                    e.target.checked = false; // Reset checkbox
                }
            });
        }
    }
    
    generateNewElement() {
        const elementId = `range-input-${++this.elementCounter}`;
        const elementData = {
            id: elementId,
            name: `range_${this.elementCounter}`,
            min: 0,
            max: 100,
            step: 1,
            value: 50,
            list: '',
            disabled: false
        };
        
        this.elements.push(elementData);
        this.saveToStorage();
        this.renderElement(elementData);
    }
    
    renderElement(elementData) {
        const elementWrapper = document.createElement('div');
        elementWrapper.className = 'card mb-3 range-element-wrapper';
        elementWrapper.id = `wrapper-${elementData.id}`;
        elementWrapper.dataset.elementId = elementData.id;
        
        elementWrapper.innerHTML = `
            <div class="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
                <h6 class="mb-0">Range Input: ${elementData.name}</h6>
                <button type="button" class="btn btn-sm btn-danger delete-element-btn" data-element-id="${elementData.id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <!-- Range Input Preview -->
                        <div class="mb-3">
                            <label class="form-label"><strong>Preview:</strong></label>
                            <div class="border p-3 rounded bg-light">
                                <input type="range" 
                                       id="${elementData.id}" 
                                       class="form-range range-preview"
                                       name="${elementData.name}"
                                       min="${elementData.min}"
                                       max="${elementData.max}"
                                       step="${elementData.step}"
                                       value="${elementData.value}"
                                       ${elementData.list ? `list="${elementData.list}"` : ''}
                                       ${elementData.disabled ? 'disabled' : ''}>
                                <output for="${elementData.id}" class="d-block text-center mt-2">
                                    <strong>Value: <span class="range-value-display">${elementData.value}</span></strong>
                                </output>
                                ${elementData.list ? `<datalist id="${elementData.list}"></datalist>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <!-- Attribute Configuration -->
                        <div class="mb-3">
                            <label for="name-${elementData.id}" class="form-label">Name:</label>
                            <input type="text" 
                                   class="form-control attribute-input" 
                                   id="name-${elementData.id}"
                                   data-attribute="name"
                                   data-element-id="${elementData.id}"
                                   value="${elementData.name}">
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="min-${elementData.id}" class="form-label">Min:</label>
                                <input type="number" 
                                       class="form-control attribute-input" 
                                       id="min-${elementData.id}"
                                       data-attribute="min"
                                       data-element-id="${elementData.id}"
                                       value="${elementData.min}">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="max-${elementData.id}" class="form-label">Max:</label>
                                <input type="number" 
                                       class="form-control attribute-input" 
                                       id="max-${elementData.id}"
                                       data-attribute="max"
                                       data-element-id="${elementData.id}"
                                       value="${elementData.max}">
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="step-${elementData.id}" class="form-label">Step:</label>
                                <input type="number" 
                                       class="form-control attribute-input" 
                                       id="step-${elementData.id}"
                                       data-attribute="step"
                                       data-element-id="${elementData.id}"
                                       value="${elementData.step}"
                                       step="0.1">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="value-${elementData.id}" class="form-label">Value:</label>
                                <input type="number" 
                                       class="form-control attribute-input" 
                                       id="value-${elementData.id}"
                                       data-attribute="value"
                                       data-element-id="${elementData.id}"
                                       value="${elementData.value}"
                                       min="${elementData.min}"
                                       max="${elementData.max}"
                                       step="${elementData.step}">
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="list-${elementData.id}" class="form-label">List (datalist ID):</label>
                            <input type="text" 
                                   class="form-control attribute-input" 
                                   id="list-${elementData.id}"
                                   data-attribute="list"
                                   data-element-id="${elementData.id}"
                                   value="${elementData.list}"
                                   placeholder="Optional datalist ID">
                            <small class="form-text text-muted">Optional: ID of a datalist element for predefined values</small>
                        </div>
                        
                        <div class="form-check mb-3">
                            <input class="form-check-input attribute-input" 
                                   type="checkbox" 
                                   id="disabled-${elementData.id}"
                                   data-attribute="disabled"
                                   data-element-id="${elementData.id}"
                                   ${elementData.disabled ? 'checked' : ''}>
                            <label class="form-check-label" for="disabled-${elementData.id}">
                                Disabled
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        if (this.container) {
            this.container.appendChild(elementWrapper);
        }
        
        // Attach event listeners
        this.attachEventListeners(elementData.id);
        
        // Update preview on value change
        const rangeInput = document.getElementById(elementData.id);
        const valueDisplay = elementWrapper.querySelector('.range-value-display');
        if (rangeInput && valueDisplay) {
            rangeInput.addEventListener('input', (e) => {
                valueDisplay.textContent = e.target.value;
                this.updateElementAttribute(elementData.id, 'value', e.target.value);
            });
        }
    }
    
    attachEventListeners(elementId) {
        // Delete button
        const deleteBtn = document.querySelector(`[data-element-id="${elementId}"].delete-element-btn`);
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.deleteElement(elementId);
            });
        }
        
        // Attribute inputs
        const attributeInputs = document.querySelectorAll(`[data-element-id="${elementId}"].attribute-input`);
        attributeInputs.forEach(input => {
            const attribute = input.dataset.attribute;
            
            if (input.type === 'checkbox') {
                input.addEventListener('change', (e) => {
                    this.updateElementAttribute(elementId, attribute, e.target.checked);
                });
            } else {
                input.addEventListener('input', (e) => {
                    this.updateElementAttribute(elementId, attribute, e.target.value);
                });
            }
        });
    }
    
    updateElementAttribute(elementId, attribute, value) {
        const elementData = this.elements.find(el => el.id === elementId);
        if (!elementData) return;
        
        // Update data
        if (attribute === 'disabled') {
            elementData[attribute] = value;
        } else if (attribute === 'min' || attribute === 'max' || attribute === 'step' || attribute === 'value') {
            elementData[attribute] = parseFloat(value) || 0;
        } else {
            elementData[attribute] = value;
        }
        
        // Update preview element
        const previewElement = document.getElementById(elementId);
        if (previewElement) {
            if (attribute === 'disabled') {
                if (value) {
                    previewElement.setAttribute('disabled', 'disabled');
                } else {
                    previewElement.removeAttribute('disabled');
                }
            } else if (attribute === 'list') {
                if (value) {
                    previewElement.setAttribute('list', value);
                    // Create or update datalist
                    let datalist = document.getElementById(value);
                    if (!datalist) {
                        datalist = document.createElement('datalist');
                        datalist.id = value;
                        previewElement.parentElement.appendChild(datalist);
                    }
                } else {
                    previewElement.removeAttribute('list');
                }
            } else {
                previewElement.setAttribute(attribute, value);
            }
            
            // Update value display
            const valueDisplay = previewElement.closest('.card-body').querySelector('.range-value-display');
            if (valueDisplay && attribute === 'value') {
                valueDisplay.textContent = value;
            }
            
            // Update min/max constraints on value input
            if (attribute === 'min' || attribute === 'max') {
                const valueInput = document.getElementById(`value-${elementId}`);
                if (valueInput) {
                    valueInput.setAttribute('min', elementData.min);
                    valueInput.setAttribute('max', elementData.max);
                }
            }
        }
        
        this.saveToStorage();
    }
    
    deleteElement(elementId) {
        if (confirm('Are you sure you want to delete this element?')) {
            this.elements = this.elements.filter(el => el.id !== elementId);
            const wrapper = document.getElementById(`wrapper-${elementId}`);
            if (wrapper) {
                wrapper.remove();
            }
            this.saveToStorage();
        }
    }
    
    renderAll() {
        this.elements.forEach(elementData => {
            this.renderElement(elementData);
        });
        
        // Update counter to avoid ID conflicts
        if (this.elements.length > 0) {
            const maxId = Math.max(...this.elements.map(el => {
                const match = el.id.match(/\d+$/);
                return match ? parseInt(match[0]) : 0;
            }));
            this.elementCounter = maxId;
        }
    }
    
    saveToStorage() {
        localStorage.setItem('rangeInputElementsHome', JSON.stringify(this.elements));
    }
    
    loadFromStorage() {
        const stored = localStorage.getItem('rangeInputElementsHome');
        return stored ? JSON.parse(stored) : [];
    }
}

// Initialize range generator when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('rangeInputsContainer')) {
        window.rangeGeneratorHome = new RangeInputGenerator();
    }
});

