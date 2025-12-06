/**
 * Library Readers Management System
 * Task: Find the oldest reader (with the earliest year of library membership)
 * 
 * Two implementations:
 * 1. Prototype-based inheritance (functional style)
 * 2. ES6 class/extends
 */

// ============================================================================
// IMPLEMENTATION 1: Prototype-based Inheritance (Functional Style)
// ============================================================================

/**
 * Base class for library reader (prototype-based)
 * @param {string} lastName - Last name
 * @param {string} firstName - First name
 * @param {string} middleName - Middle name
 * @param {number} membershipYear - Year when person became a library reader
 */
function BaseReader(lastName, firstName, middleName, membershipYear) {
    this.lastName = lastName || '';
    this.firstName = firstName || '';
    this.middleName = middleName || '';
    this.membershipYear = membershipYear || new Date().getFullYear();
}

// Getter methods
BaseReader.prototype.getLastName = function() {
    return this.lastName;
};

BaseReader.prototype.getFirstName = function() {
    return this.firstName;
};

BaseReader.prototype.getMiddleName = function() {
    return this.middleName;
};

BaseReader.prototype.getMembershipYear = function() {
    return this.membershipYear;
};

BaseReader.prototype.getFullName = function() {
    return `${this.lastName} ${this.firstName} ${this.middleName}`.trim();
};

// Setter methods
BaseReader.prototype.setLastName = function(lastName) {
    this.lastName = lastName || '';
};

BaseReader.prototype.setFirstName = function(firstName) {
    this.firstName = firstName || '';
};

BaseReader.prototype.setMiddleName = function(middleName) {
    this.middleName = middleName || '';
};

BaseReader.prototype.setMembershipYear = function(year) {
    this.membershipYear = year || new Date().getFullYear();
};

// Method to add object using HTML form components
BaseReader.prototype.addFromForm = function(formData) {
    this.setLastName(formData.lastName || '');
    this.setFirstName(formData.firstName || '');
    this.setMiddleName(formData.middleName || '');
    this.setMembershipYear(parseInt(formData.membershipYear) || new Date().getFullYear());
};

// Method to display all objects in array
BaseReader.prototype.displayAll = function(containerId, readers) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!readers || readers.length === 0) {
        container.innerHTML = '<p class="text-muted">Нет читателей в базе данных.</p>';
        return;
    }
    
    let html = '<div class="table-responsive"><table class="table table-striped table-hover"><thead><tr>';
    html += '<th>№</th><th>Фамилия</th><th>Имя</th><th>Отчество</th><th>Год начала чтения</th>';
    html += '</tr></thead><tbody>';
    
    readers.forEach((reader, index) => {
        html += '<tr>';
        html += `<td>${index + 1}</td>`;
        html += `<td>${reader.getLastName()}</td>`;
        html += `<td>${reader.getFirstName()}</td>`;
        html += `<td>${reader.getMiddleName()}</td>`;
        html += `<td>${reader.getMembershipYear()}</td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
};

// Method to display result (oldest reader)
BaseReader.prototype.displayResult = function(containerId, readers) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!readers || readers.length === 0) {
        container.innerHTML = '<p class="text-muted">Нет читателей для анализа.</p>';
        return;
    }
    
    // Find oldest reader (earliest membership year)
    let oldestReader = readers[0];
    for (let i = 1; i < readers.length; i++) {
        if (readers[i].getMembershipYear() < oldestReader.getMembershipYear()) {
            oldestReader = readers[i];
        }
    }
    
    const currentYear = new Date().getFullYear();
    const yearsAsReader = currentYear - oldestReader.getMembershipYear();
    
    let html = '<div class="alert alert-success">';
    html += '<h5><i class="fas fa-trophy"></i> Самый "старый" читатель библиотеки:</h5>';
    html += '<div class="mt-3">';
    html += `<p><strong>ФИО:</strong> ${oldestReader.getFullName()}</p>`;
    html += `<p><strong>Год начала чтения:</strong> ${oldestReader.getMembershipYear()}</p>`;
    html += `<p><strong>Читает библиотеку:</strong> ${yearsAsReader} ${this.getYearWord(yearsAsReader)}</p>`;
    html += '</div>';
    html += '</div>';
    
    container.innerHTML = html;
};

BaseReader.prototype.getYearWord = function(years) {
    if (years % 10 === 1 && years % 100 !== 11) return 'год';
    if ([2, 3, 4].includes(years % 10) && ![12, 13, 14].includes(years % 100)) return 'года';
    return 'лет';
};

/**
 * Derived class for library reader with ticket number (prototype-based)
 * @param {string} lastName - Last name
 * @param {string} firstName - First name
 * @param {string} middleName - Middle name
 * @param {number} membershipYear - Year when person became a library reader
 * @param {string} ticketNumber - Library ticket number
 */
function ReaderWithTicket(lastName, firstName, middleName, membershipYear, ticketNumber) {
    // Call parent constructor
    BaseReader.call(this, lastName, firstName, middleName, membershipYear);
    this.ticketNumber = ticketNumber || '';
}

// Prototype inheritance
ReaderWithTicket.prototype = Object.create(BaseReader.prototype);
ReaderWithTicket.prototype.constructor = ReaderWithTicket;

// Additional getter
ReaderWithTicket.prototype.getTicketNumber = function() {
    return this.ticketNumber;
};

// Additional setter
ReaderWithTicket.prototype.setTicketNumber = function(ticketNumber) {
    this.ticketNumber = ticketNumber || '';
};

// Override addFromForm to include ticket number
ReaderWithTicket.prototype.addFromForm = function(formData) {
    BaseReader.prototype.addFromForm.call(this, formData);
    this.setTicketNumber(formData.ticketNumber || '');
};

// Override displayAll to include ticket number
ReaderWithTicket.prototype.displayAll = function(containerId, readers) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!readers || readers.length === 0) {
        container.innerHTML = '<p class="text-muted">Нет читателей в базе данных.</p>';
        return;
    }
    
    let html = '<div class="table-responsive"><table class="table table-striped table-hover"><thead><tr>';
    html += '<th>№</th><th>Фамилия</th><th>Имя</th><th>Отчество</th><th>Год начала чтения</th><th>Номер билета</th>';
    html += '</tr></thead><tbody>';
    
    readers.forEach((reader, index) => {
        html += '<tr>';
        html += `<td>${index + 1}</td>`;
        html += `<td>${reader.getLastName()}</td>`;
        html += `<td>${reader.getFirstName()}</td>`;
        html += `<td>${reader.getMiddleName()}</td>`;
        html += `<td>${reader.getMembershipYear()}</td>`;
        html += `<td>${reader.getTicketNumber()}</td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
};

// Override displayResult to include ticket number
ReaderWithTicket.prototype.displayResult = function(containerId, readers) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!readers || readers.length === 0) {
        container.innerHTML = '<p class="text-muted">Нет читателей для анализа.</p>';
        return;
    }
    
    // Find oldest reader (earliest membership year)
    let oldestReader = readers[0];
    for (let i = 1; i < readers.length; i++) {
        if (readers[i].getMembershipYear() < oldestReader.getMembershipYear()) {
            oldestReader = readers[i];
        }
    }
    
    const currentYear = new Date().getFullYear();
    const yearsAsReader = currentYear - oldestReader.getMembershipYear();
    
    let html = '<div class="alert alert-success">';
    html += '<h5><i class="fas fa-trophy"></i> Самый "старый" читатель библиотеки:</h5>';
    html += '<div class="mt-3">';
    html += `<p><strong>ФИО:</strong> ${oldestReader.getFullName()}</p>`;
    html += `<p><strong>Год начала чтения:</strong> ${oldestReader.getMembershipYear()}</p>`;
    html += `<p><strong>Номер читательского билета:</strong> ${oldestReader.getTicketNumber()}</p>`;
    html += `<p><strong>Читает библиотеку:</strong> ${yearsAsReader} ${this.getYearWord(yearsAsReader)}</p>`;
    html += '</div>';
    html += '</div>';
    
    container.innerHTML = html;
};

// ============================================================================
// IMPLEMENTATION 2: ES6 Class/Extends
// ============================================================================

/**
 * Base class for library reader (ES6 class)
 */
class BaseReaderClass {
    constructor(lastName = '', firstName = '', middleName = '', membershipYear = new Date().getFullYear()) {
        this._lastName = lastName;
        this._firstName = firstName;
        this._middleName = middleName;
        this._membershipYear = membershipYear;
    }
    
    // Getters
    get lastName() {
        return this._lastName;
    }
    
    get firstName() {
        return this._firstName;
    }
    
    get middleName() {
        return this._middleName;
    }
    
    get membershipYear() {
        return this._membershipYear;
    }
    
    get fullName() {
        return `${this._lastName} ${this._firstName} ${this._middleName}`.trim();
    }
    
    // Setters
    set lastName(value) {
        this._lastName = value || '';
    }
    
    set firstName(value) {
        this._firstName = value || '';
    }
    
    set middleName(value) {
        this._middleName = value || '';
    }
    
    set membershipYear(value) {
        this._membershipYear = value || new Date().getFullYear();
    }
    
    // Method to add object using HTML form components
    addFromForm(formData) {
        this.lastName = formData.lastName || '';
        this.firstName = formData.firstName || '';
        this.middleName = formData.middleName || '';
        this.membershipYear = parseInt(formData.membershipYear) || new Date().getFullYear();
    }
    
    // Method to display all objects in array
    displayAll(containerId, readers) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (!readers || readers.length === 0) {
            container.innerHTML = '<p class="text-muted">Нет читателей в базе данных.</p>';
            return;
        }
        
        let html = '<div class="table-responsive"><table class="table table-striped table-hover"><thead><tr>';
        html += '<th>№</th><th>Фамилия</th><th>Имя</th><th>Отчество</th><th>Год начала чтения</th>';
        html += '</tr></thead><tbody>';
        
        readers.forEach((reader, index) => {
            html += '<tr>';
            html += `<td>${index + 1}</td>`;
            html += `<td>${reader.lastName}</td>`;
            html += `<td>${reader.firstName}</td>`;
            html += `<td>${reader.middleName}</td>`;
            html += `<td>${reader.membershipYear}</td>`;
            html += '</tr>';
        });
        
        html += '</tbody></table></div>';
        container.innerHTML = html;
    }
    
    // Method to display result (oldest reader)
    displayResult(containerId, readers) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (!readers || readers.length === 0) {
            container.innerHTML = '<p class="text-muted">Нет читателей для анализа.</p>';
            return;
        }
        
        // Find oldest reader (earliest membership year)
        let oldestReader = readers[0];
        for (let i = 1; i < readers.length; i++) {
            if (readers[i].membershipYear < oldestReader.membershipYear) {
                oldestReader = readers[i];
            }
        }
        
        const currentYear = new Date().getFullYear();
        const yearsAsReader = currentYear - oldestReader.membershipYear;
        
        let html = '<div class="alert alert-success">';
        html += '<h5><i class="fas fa-trophy"></i> Самый "старый" читатель библиотеки:</h5>';
        html += '<div class="mt-3">';
        html += `<p><strong>ФИО:</strong> ${oldestReader.fullName}</p>`;
        html += `<p><strong>Год начала чтения:</strong> ${oldestReader.membershipYear}</p>`;
        html += `<p><strong>Читает библиотеку:</strong> ${yearsAsReader} ${this.getYearWord(yearsAsReader)}</p>`;
        html += '</div>';
        html += '</div>';
        
        container.innerHTML = html;
    }
    
    getYearWord(years) {
        if (years % 10 === 1 && years % 100 !== 11) return 'год';
        if ([2, 3, 4].includes(years % 10) && ![12, 13, 14].includes(years % 100)) return 'года';
        return 'лет';
    }
}

/**
 * Derived class for library reader with ticket number (ES6 class)
 */
class ReaderWithTicketClass extends BaseReaderClass {
    constructor(lastName = '', firstName = '', middleName = '', membershipYear = new Date().getFullYear(), ticketNumber = '') {
        super(lastName, firstName, middleName, membershipYear);
        this._ticketNumber = ticketNumber;
    }
    
    // Additional getter
    get ticketNumber() {
        return this._ticketNumber;
    }
    
    // Additional setter
    set ticketNumber(value) {
        this._ticketNumber = value || '';
    }
    
    // Override addFromForm to include ticket number
    addFromForm(formData) {
        super.addFromForm(formData);
        this.ticketNumber = formData.ticketNumber || '';
    }
    
    // Override displayAll to include ticket number
    displayAll(containerId, readers) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (!readers || readers.length === 0) {
            container.innerHTML = '<p class="text-muted">Нет читателей в базе данных.</p>';
            return;
        }
        
        let html = '<div class="table-responsive"><table class="table table-striped table-hover"><thead><tr>';
        html += '<th>№</th><th>Фамилия</th><th>Имя</th><th>Отчество</th><th>Год начала чтения</th><th>Номер билета</th>';
        html += '</tr></thead><tbody>';
        
        readers.forEach((reader, index) => {
            html += '<tr>';
            html += `<td>${index + 1}</td>`;
            html += `<td>${reader.lastName}</td>`;
            html += `<td>${reader.firstName}</td>`;
            html += `<td>${reader.middleName}</td>`;
            html += `<td>${reader.membershipYear}</td>`;
            html += `<td>${reader.ticketNumber}</td>`;
            html += '</tr>';
        });
        
        html += '</tbody></table></div>';
        container.innerHTML = html;
    }
    
    // Override displayResult to include ticket number
    displayResult(containerId, readers) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (!readers || readers.length === 0) {
            container.innerHTML = '<p class="text-muted">Нет читателей для анализа.</p>';
            return;
        }
        
        // Find oldest reader (earliest membership year)
        let oldestReader = readers[0];
        for (let i = 1; i < readers.length; i++) {
            if (readers[i].membershipYear < oldestReader.membershipYear) {
                oldestReader = readers[i];
            }
        }
        
        const currentYear = new Date().getFullYear();
        const yearsAsReader = currentYear - oldestReader.membershipYear;
        
        let html = '<div class="alert alert-success">';
        html += '<h5><i class="fas fa-trophy"></i> Самый "старый" читатель библиотеки:</h5>';
        html += '<div class="mt-3">';
        html += `<p><strong>ФИО:</strong> ${oldestReader.fullName}</p>`;
        html += `<p><strong>Год начала чтения:</strong> ${oldestReader.membershipYear}</p>`;
        html += `<p><strong>Номер читательского билета:</strong> ${oldestReader.ticketNumber}</p>`;
        html += `<p><strong>Читает библиотеку:</strong> ${yearsAsReader} ${this.getYearWord(yearsAsReader)}</p>`;
        html += '</div>';
        html += '</div>';
        
        container.innerHTML = html;
    }
}

// ============================================================================
// Manager Classes for both implementations
// ============================================================================

/**
 * Manager for prototype-based implementation
 */
function LibraryReadersManagerPrototype() {
    this.readers = this.loadFromStorage('prototype') || [];
    this.ReaderClass = ReaderWithTicket;
}

LibraryReadersManagerPrototype.prototype.addReader = function(formData) {
    const reader = new this.ReaderClass();
    reader.addFromForm(formData);
    this.readers.push(reader);
    this.saveToStorage('prototype');
    return reader;
};

LibraryReadersManagerPrototype.prototype.displayAll = function(containerId) {
    if (this.readers.length === 0) return;
    const reader = new this.ReaderClass();
    reader.displayAll(containerId, this.readers);
};

LibraryReadersManagerPrototype.prototype.displayResult = function(containerId) {
    if (this.readers.length === 0) return;
    const reader = new this.ReaderClass();
    reader.displayResult(containerId, this.readers);
};

LibraryReadersManagerPrototype.prototype.saveToStorage = function(key) {
    const data = this.readers.map(r => ({
        lastName: r.getLastName(),
        firstName: r.getFirstName(),
        middleName: r.getMiddleName(),
        membershipYear: r.getMembershipYear(),
        ticketNumber: r.getTicketNumber()
    }));
    localStorage.setItem(`libraryReaders_${key}`, JSON.stringify(data));
};

LibraryReadersManagerPrototype.prototype.loadFromStorage = function(key) {
    const stored = localStorage.getItem(`libraryReaders_${key}`);
    if (!stored) return [];
    
    const data = JSON.parse(stored);
    return data.map(item => {
        const reader = new this.ReaderClass(
            item.lastName,
            item.firstName,
            item.middleName,
            item.membershipYear,
            item.ticketNumber
        );
        return reader;
    });
};

LibraryReadersManagerPrototype.prototype.clearAll = function() {
    this.readers = [];
    this.saveToStorage('prototype');
};

/**
 * Manager for ES6 class implementation
 */
class LibraryReadersManagerClass {
    constructor() {
        this.readers = this.loadFromStorage('class') || [];
        this.ReaderClass = ReaderWithTicketClass;
    }
    
    addReader(formData) {
        const reader = new this.ReaderClass();
        reader.addFromForm(formData);
        this.readers.push(reader);
        this.saveToStorage('class');
        return reader;
    }
    
    displayAll(containerId) {
        if (this.readers.length === 0) return;
        const reader = new this.ReaderClass();
        reader.displayAll(containerId, this.readers);
    }
    
    displayResult(containerId) {
        if (this.readers.length === 0) return;
        const reader = new this.ReaderClass();
        reader.displayResult(containerId, this.readers);
    }
    
    saveToStorage(key) {
        const data = this.readers.map(r => ({
            lastName: r.lastName,
            firstName: r.firstName,
            middleName: r.middleName,
            membershipYear: r.membershipYear,
            ticketNumber: r.ticketNumber
        }));
        localStorage.setItem(`libraryReaders_${key}`, JSON.stringify(data));
    }
    
    loadFromStorage(key) {
        const stored = localStorage.getItem(`libraryReaders_${key}`);
        if (!stored) return [];
        
        const data = JSON.parse(stored);
        return data.map(item => {
            return new this.ReaderClass(
                item.lastName,
                item.firstName,
                item.middleName,
                item.membershipYear,
                item.ticketNumber
            );
        });
    }
    
    clearAll() {
        this.readers = [];
        this.saveToStorage('class');
    }
}

// Export managers for use in HTML
window.LibraryReadersManagerPrototype = LibraryReadersManagerPrototype;
window.LibraryReadersManagerClass = LibraryReadersManagerClass;

