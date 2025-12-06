/**
 * Contacts Table Manager
 * Управление таблицей контактов сотрудников с сортировкой, пагинацией, фильтрацией
 */

class ContactsTableManager {
    constructor() {
        this.staffData = [];
        this.filteredData = [];
        this.displayedData = [];
        this.currentPage = 1;
        this.itemsPerPage = 3;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.selectedRows = new Set();
        
        this.init();
    }
    
    init() {
        this.showPreloader();
        this.setupEventListeners();
        
        
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.loadData();
            }, 500); 
        });
        
        
        if (document.readyState === 'complete') {
            setTimeout(() => {
                this.loadData();
            }, 500);
        }
    }
    
    setupEventListeners() {
        
        document.getElementById('addStaffBtn').addEventListener('click', () => this.toggleAddForm());
        document.getElementById('cancelBtn').addEventListener('click', () => this.toggleAddForm());
        
        
        document.getElementById('staffForm').addEventListener('submit', (e) => this.handleSubmit(e));
        
        
        document.getElementById('photoUrl').addEventListener('blur', () => this.validateUrl());
        document.getElementById('phone').addEventListener('blur', () => this.validatePhone());
        
        
        ['name', 'position', 'description', 'photoUrl', 'phone', 'email'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => this.checkFormValidity());
        });
        
        
        document.getElementById('searchBtn').addEventListener('click', () => this.filterData());
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.filterData();
        });
        
        
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', () => this.sortTable(header.dataset.column));
        });
        
        
        document.getElementById('selectAll').addEventListener('change', (e) => {
            this.toggleSelectAll(e.target.checked);
        });
        
        
        document.getElementById('premiateBtn').addEventListener('click', () => this.premiateSelected());
    }
    
    showPreloader() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.display = 'flex';
        }
    }
    
    hidePreloader() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.display = 'none';
        }
    }
    
    async loadData() {
        this.showPreloader();
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const response = await fetch('/api/staff/');
            const data = await response.json();
            this.staffData = data.staff || [];
            this.filteredData = [...this.staffData];
            this.displayedData = [...this.filteredData];
            this.renderTable();
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Ошибка загрузки данных');
        } finally {
            setTimeout(() => {
                this.hidePreloader();
            }, 300);
        }
    }
    
    renderTable() {
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '';
        
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageData = this.displayedData.slice(startIndex, endIndex);
        
        pageData.forEach((staff, index) => {
            const row = this.createTableRow(staff, startIndex + index);
            tbody.appendChild(row);
        });
        
        this.renderPagination();
        this.updatePremiateButton();
    }
    
    createTableRow(staff, index) {
        const tr = document.createElement('tr');
        tr.dataset.index = index;
        tr.style.cursor = 'pointer';
        tr.addEventListener('click', (e) => {
            if (e.target.type !== 'checkbox') {
                this.showDetails(staff);
            }
        });
        
        tr.innerHTML = `
            <td>
                <input type="checkbox" class="row-checkbox" data-id="${staff.id}" 
                       ${this.selectedRows.has(staff.id) ? 'checked' : ''}>
            </td>
            <td>${this.escapeHtml(staff.name)}</td>
            <td>${this.escapeHtml(staff.position)}</td>
            <td>${this.escapeHtml(staff.description.substring(0, 50))}${staff.description.length > 50 ? '...' : ''}</td>
            <td>
                ${staff.photo ? `<img src="${staff.photo}" alt="Фото">` : '<div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #e91e63 0%, #ff6b35 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.5rem;">' + (staff.name.charAt(0).toUpperCase()) + '</div>'}
            </td>
            <td>${this.escapeHtml(staff.phone)}</td>
            <td>${this.escapeHtml(staff.email)}</td>
        `;
        
        // Обработчик чекбокса
        const checkbox = tr.querySelector('.row-checkbox');
        checkbox.addEventListener('change', (e) => {
            e.stopPropagation();
            if (e.target.checked) {
                this.selectedRows.add(staff.id);
            } else {
                this.selectedRows.delete(staff.id);
            }
            this.updatePremiateButton();
            this.updateSelectAll();
        });
        
        return tr;
    }
    
    renderPagination() {
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';
        
        const totalPages = Math.ceil(this.displayedData.length / this.itemsPerPage);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '<li class="page-item"><span class="page-link text-muted">Показаны все записи</span></li>';
            return;
        }
        
        // Предыдущая
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${this.currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" href="#" data-page="${this.currentPage - 1}">
            <i class="fas fa-chevron-left me-1"></i>Предыдущая
        </a>`;
        if (this.currentPage > 1) {
            prevLi.querySelector('a').addEventListener('click', (e) => {
                e.preventDefault();
                this.goToPage(this.currentPage - 1);
            });
        }
        pagination.appendChild(prevLi);
        
        
        let startPage = Math.max(1, this.currentPage - 2);
        let endPage = Math.min(totalPages, this.currentPage + 2);
        
        
        if (this.currentPage <= 3) {
            startPage = 1;
            endPage = Math.min(5, totalPages);
        }
        
        
        if (this.currentPage >= totalPages - 2) {
            startPage = Math.max(1, totalPages - 4);
            endPage = totalPages;
        }
        
        
        if (startPage > 1) {
            const firstLi = document.createElement('li');
            firstLi.className = 'page-item';
            firstLi.innerHTML = `<a class="page-link" href="#" data-page="1">1</a>`;
            firstLi.querySelector('a').addEventListener('click', (e) => {
                e.preventDefault();
                this.goToPage(1);
            });
            pagination.appendChild(firstLi);
            
            if (startPage > 2) {
                const dotsLi = document.createElement('li');
                dotsLi.className = 'page-item disabled';
                dotsLi.innerHTML = '<span class="page-link">...</span>';
                pagination.appendChild(dotsLi);
            }
        }
        
        
        for (let i = startPage; i <= endPage; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === this.currentPage ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
            li.querySelector('a').addEventListener('click', (e) => {
                e.preventDefault();
                this.goToPage(i);
            });
            pagination.appendChild(li);
        }
        
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const dotsLi = document.createElement('li');
                dotsLi.className = 'page-item disabled';
                dotsLi.innerHTML = '<span class="page-link">...</span>';
                pagination.appendChild(dotsLi);
            }
            
            const lastLi = document.createElement('li');
            lastLi.className = 'page-item';
            lastLi.innerHTML = `<a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a>`;
            lastLi.querySelector('a').addEventListener('click', (e) => {
                e.preventDefault();
                this.goToPage(totalPages);
            });
            pagination.appendChild(lastLi);
        }
        
        
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${this.currentPage === totalPages ? 'disabled' : ''}`;
        nextLi.innerHTML = `<a class="page-link" href="#" data-page="${this.currentPage + 1}">
            Следующая<i class="fas fa-chevron-right ms-1"></i>
        </a>`;
        if (this.currentPage < totalPages) {
            nextLi.querySelector('a').addEventListener('click', (e) => {
                e.preventDefault();
                this.goToPage(this.currentPage + 1);
            });
        }
        pagination.appendChild(nextLi);
    }
    
    async goToPage(page) {
        const totalPages = Math.ceil(this.displayedData.length / this.itemsPerPage);
        if (page < 1 || page > totalPages) return;
        
        this.showPreloader();
        this.currentPage = page;
        
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        this.renderTable();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        setTimeout(() => {
            this.hidePreloader();
        }, 200);
    }
    
    async sortTable(column) {
        this.showPreloader();
        
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }
        
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        this.displayedData.sort((a, b) => {
            let aVal = a[column] || '';
            let bVal = b[column] || '';
            
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (this.sortDirection === 'asc') {
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            } else {
                return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
        });
        
        
        document.querySelectorAll('.sortable').forEach(header => {
            const icon = header.querySelector('i');
            if (header.dataset.column === column) {
                icon.className = this.sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
            } else {
                icon.className = 'fas fa-sort';
            }
        });
        
        this.currentPage = 1;
        this.renderTable();
        
        setTimeout(() => {
            this.hidePreloader();
        }, 200);
    }
    
    async filterData() {
        this.showPreloader();
        
        const searchText = document.getElementById('searchInput').value.toLowerCase().trim();
        
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (!searchText) {
            this.displayedData = [...this.filteredData];
        } else {
            this.displayedData = this.filteredData.filter(staff => {
                return (
                    staff.name.toLowerCase().includes(searchText) ||
                    staff.position.toLowerCase().includes(searchText) ||
                    staff.description.toLowerCase().includes(searchText) ||
                    staff.phone.toLowerCase().includes(searchText) ||
                    staff.email.toLowerCase().includes(searchText)
                );
            });
        }
        
        this.currentPage = 1;
        this.renderTable();
        
        setTimeout(() => {
            this.hidePreloader();
        }, 200);
    }
    
    showDetails(staff) {
        const detailsCard = document.getElementById('detailsCard');
        const detailsContent = document.getElementById('detailsContent');
        
        detailsContent.innerHTML = `
            <div class="row">
                <div class="col-md-4">
                    ${staff.photo ? `<img src="${staff.photo}" alt="Фото" class="img-fluid rounded mb-3">` : '<p>Фото отсутствует</p>'}
                </div>
                <div class="col-md-8">
                    <h5>${this.escapeHtml(staff.name)}</h5>
                    <p><strong>Должность:</strong> ${this.escapeHtml(staff.position)}</p>
                    <p><strong>Описание:</strong> ${this.escapeHtml(staff.description)}</p>
                    <p><strong>Телефон:</strong> ${this.escapeHtml(staff.phone)}</p>
                    <p><strong>Email:</strong> ${this.escapeHtml(staff.email)}</p>
                </div>
            </div>
        `;
        
        detailsCard.style.display = 'block';
        detailsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    toggleAddForm() {
        const form = document.getElementById('addForm');
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
        
        if (form.style.display === 'none') {
            document.getElementById('staffForm').reset();
            document.getElementById('validationResult').innerHTML = '';
            this.clearValidationErrors();
        }
    }
    
    validateUrl() {
        const urlInput = document.getElementById('photoUrl');
        const url = urlInput.value.trim();
        const feedback = document.getElementById('urlFeedback');
        
        const urlPattern = /^http?:\/\/.+(\.php|\.html)$/;
        const isValid = urlPattern.test(url);
        
        this.setFieldValidation(urlInput, isValid, feedback, 
            isValid ? 'URL валиден' : 'URL должен начинаться с http:// или https:// и заканчиваться на .php или .html');
        
        return isValid;
    }
    
    validatePhone() {
        const phoneInput = document.getElementById('phone');
        const phone = phoneInput.value.trim();
        const feedback = document.getElementById('phoneFeedback');
        const phonePattern = /^(\+375|8)[\s\-]?\(?(\d{2})\)?[\s\-]?(\d{3})[\s\-]?(\d{2})[\s\-]?(\d{2})$/;
        const isValid = phonePattern.test(phone);
        
        this.setFieldValidation(phoneInput, isValid, feedback,
            isValid ? 'Телефон валиден' : 'Неверный формат телефона. Примеры: 80291112233, 8 (029) 1112233, +375 (29) 111-22-33');
        
        return isValid;
    }
    
    setFieldValidation(input, isValid, feedback, message) {
        if (isValid) {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
            feedback.textContent = message;
            feedback.className = 'valid-feedback';
        } else {
            input.classList.remove('is-valid');
            input.classList.add('is-invalid');
            feedback.textContent = message;
            feedback.className = 'invalid-feedback';
            input.style.borderColor = '#dc3545';
            input.style.backgroundColor = '#fff5f5';
        }
    }
    
    clearValidationErrors() {
        ['photoUrl', 'phone'].forEach(id => {
            const input = document.getElementById(id);
            input.classList.remove('is-invalid', 'is-valid');
            input.style.borderColor = '';
            input.style.backgroundColor = '';
        });
    }
    
    checkFormValidity() {
        const name = document.getElementById('name').value.trim();
        const position = document.getElementById('position').value.trim();
        const description = document.getElementById('description').value.trim();
        const photoUrl = document.getElementById('photoUrl').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        
        const urlValid = this.validateUrl();
        const phoneValid = this.validatePhone();
        
        const allFilled = name && position && description && photoUrl && phone && email;
        const allValid = urlValid && phoneValid;
        
        document.getElementById('submitBtn').disabled = !(allFilled && allValid);
        
        
        const resultDiv = document.getElementById('validationResult');
        if (allFilled && allValid) {
            resultDiv.innerHTML = '<div class="alert alert-success">Все поля заполнены корректно</div>';
        } else if (allFilled) {
            resultDiv.innerHTML = '<div class="alert alert-warning">Проверьте правильность заполнения полей</div>';
        } else {
            resultDiv.innerHTML = '';
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateUrl() || !this.validatePhone()) {
            alert('Пожалуйста, исправьте ошибки в форме');
            return;
        }
        
        this.showPreloader();
        
        const newStaff = {
            id: Date.now(), 
            name: document.getElementById('name').value.trim(),
            position: document.getElementById('position').value.trim(),
            description: document.getElementById('description').value.trim(),
            photo: document.getElementById('photoUrl').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim()
        };
        
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        
        this.staffData.unshift(newStaff);
        this.filteredData = [...this.staffData];
        this.displayedData = [...this.filteredData];
        
        if (this.sortColumn) {
            await this.sortTable(this.sortColumn);
        } else {
            this.currentPage = 1;
            this.renderTable();
        }
        
        this.toggleAddForm();
        
        setTimeout(() => {
            this.hidePreloader();
            alert('Сотрудник успешно добавлен в таблицу!');
        }, 200);
    }
    
    toggleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.row-checkbox');
        checkboxes.forEach(cb => {
            cb.checked = checked;
            const staffId = parseInt(cb.dataset.id);
            if (checked) {
                this.selectedRows.add(staffId);
            } else {
                this.selectedRows.delete(staffId);
            }
        });
        this.updatePremiateButton();
    }
    
    updateSelectAll() {
        const checkboxes = document.querySelectorAll('.row-checkbox');
        const allChecked = checkboxes.length > 0 && Array.from(checkboxes).every(cb => cb.checked);
        document.getElementById('selectAll').checked = allChecked;
    }
    
    updatePremiateButton() {
        const btn = document.getElementById('premiateBtn');
        btn.style.display = this.selectedRows.size > 0 ? 'inline-block' : 'none';
    }
    
    premiateSelected() {
        if (this.selectedRows.size === 0) {
            alert('Выберите сотрудников для премирования');
            return;
        }
        
        const selectedStaff = this.staffData.filter(staff => this.selectedRows.has(staff.id));
        const surnames = selectedStaff.map(staff => {
            const parts = staff.name.split(' ');
            return parts[0];
        });
        
        let text = 'Премировать следующих сотрудников: ';
        if (surnames.length === 1) {
            text += surnames[0];
        } else if (surnames.length === 2) {
            text += `${surnames[0]} и ${surnames[1]}`;
        } else {
            text += surnames.slice(0, -1).join(', ') + ` и ${surnames[surnames.length - 1]}`;
        }
        text += '. За отличную работу и высокие показатели.';
        
        const resultDiv = document.getElementById('premiateResult');
        const textDiv = document.getElementById('premiateText');
        textDiv.textContent = text;
        resultDiv.style.display = 'block';
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        this.selectedRows.clear();
        document.getElementById('selectAll').checked = false;
        document.querySelectorAll('.row-checkbox').forEach(cb => cb.checked = false);
        this.updatePremiateButton();
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}


document.addEventListener('DOMContentLoaded', () => {

    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.display = 'flex';
    }
    
    window.contactsTable = new ContactsTableManager();
});

