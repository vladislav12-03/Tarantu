// Инициализация хранилища заявок
function initFormsStorage() {
    if (!localStorage.getItem('forms')) {
        localStorage.setItem('forms', JSON.stringify([]));
    }
}

// Получение всех заявок
function getAllForms() {
    return JSON.parse(localStorage.getItem('forms')) || [];
}

// Получение следующего ID заявки
function getNextFormId() {
    const forms = getAllForms();
    const lastId = forms.length > 0 ? Math.max(...forms.map(f => f.id)) : 10000;
    return lastId + 1;
}

// Добавление новой заявки
function addForm(formData) {
    const forms = getAllForms();
    const newForm = {
        id: getNextFormId(),
        role: formData.role,
        date: new Date().toISOString(),
        status: 'new',
        data: formData
    };
    forms.push(newForm);
    localStorage.setItem('forms', JSON.stringify(forms));
    return newForm;
}

// Обновление статуса заявки
function updateFormStatus(formId, newStatus) {
    const forms = getAllForms();
    const formIndex = forms.findIndex(f => f.id === formId);
    if (formIndex !== -1) {
        forms[formIndex].status = newStatus;
        localStorage.setItem('forms', JSON.stringify(forms));
        return true;
    }
    return false;
}

// Удаление заявки
function deleteForm(formId) {
    const forms = getAllForms();
    const filteredForms = forms.filter(f => f.id !== formId);
    localStorage.setItem('forms', JSON.stringify(filteredForms));
}

// Рендеринг списка заявок
function renderForms() {
    const forms = getAllForms();
    const container = document.getElementById('forms-placeholder');
    if (!container) return;

    if (forms.length === 0) {
        container.innerHTML = '<div class="no-forms">Нет заявок</div>';
        return;
    }

    const html = `
        <div class="forms-controls">
            <div class="search-box">
                <input type="text" id="forms-search" placeholder="Поиск по заявкам...">
            </div>
            <div class="filter-box">
                <select id="forms-filter">
                    <option value="all">Все заявки</option>
                    <option value="new">Новые</option>
                    <option value="approved">Одобренные</option>
                    <option value="rejected">Отклоненные</option>
                </select>
            </div>
        </div>
        <div class="forms-list">
            ${forms.map(form => `
                <div class="form-item" data-id="${form.id}">
                    <div class="form-header">
                        <span class="form-id">#${form.id}</span>
                        <span class="form-role">${formsCriteria[form.role].icon} ${formsCriteria[form.role].title}</span>
                        <span class="form-date">${new Date(form.date).toLocaleDateString()}</span>
                        <span class="form-status ${form.status}">${form.status}</span>
                    </div>
                    <div class="form-content" style="display: none;">
                        <div class="form-details">
                            ${Object.entries(form.data).map(([key, value]) => `
                                <div class="form-field">
                                    <label>${formsCriteria[form.role].fields.find(f => f.id === key)?.label || key}:</label>
                                    <div class="form-value">${value}</div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="form-actions">
                            <button onclick="updateFormStatus(${form.id}, 'approved')" class="btn-approve">Одобрить</button>
                            <button onclick="updateFormStatus(${form.id}, 'rejected')" class="btn-reject">Отклонить</button>
                            <button onclick="deleteForm(${form.id})" class="btn-delete">Удалить</button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    container.innerHTML = html;

    // Добавляем обработчики событий
    document.querySelectorAll('.form-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
        });
    });

    // Поиск
    document.getElementById('forms-search').addEventListener('input', (e) => {
        const searchText = e.target.value.toLowerCase();
        document.querySelectorAll('.form-item').forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(searchText) ? 'block' : 'none';
        });
    });

    // Фильтр по статусу
    document.getElementById('forms-filter').addEventListener('change', (e) => {
        const status = e.target.value;
        document.querySelectorAll('.form-item').forEach(item => {
            if (status === 'all' || item.querySelector('.form-status').textContent === status) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
}

// Показ модального окна для новой заявки
function showNewFormModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Новая заявка</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-role-select">
                    <label>Выберите роль:</label>
                    <select id="form-role">
                        ${Object.entries(formsCriteria).map(([key, role]) => `
                            <option value="${key}">${role.icon} ${role.title}</option>
                        `).join('')}
                    </select>
                </div>
                <div id="form-fields"></div>
            </div>
            <div class="modal-footer">
                <button class="btn-submit">Отправить</button>
                <button class="btn-cancel">Отмена</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Обработчик выбора роли
    document.getElementById('form-role').addEventListener('change', (e) => {
        const role = e.target.value;
        const fields = formsCriteria[role].fields;
        const fieldsContainer = document.getElementById('form-fields');
        
        fieldsContainer.innerHTML = fields.map(field => `
            <div class="form-field">
                <label>${field.label}:</label>
                ${field.type === 'textarea' 
                    ? `<textarea id="${field.id}" ${field.required ? 'required' : ''}></textarea>`
                    : field.type === 'select'
                    ? `<select id="${field.id}" ${field.required ? 'required' : ''}>
                        ${field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                       </select>`
                    : `<input type="${field.type}" id="${field.id}" ${field.required ? 'required' : ''}>`
                }
            </div>
        `).join('');
    });

    // Инициализация полей для первой роли
    document.getElementById('form-role').dispatchEvent(new Event('change'));

    // Обработчики кнопок
    modal.querySelector('.btn-submit').addEventListener('click', () => {
        const role = document.getElementById('form-role').value;
        const formData = { role };
        let isValid = true;

        formsCriteria[role].fields.forEach(field => {
            const element = document.getElementById(field.id);
            if (field.required && !element.value) {
                isValid = false;
                element.classList.add('error');
            } else {
                element.classList.remove('error');
                formData[field.id] = element.value;
            }
        });

        if (isValid) {
            addForm(formData);
            modal.remove();
            renderForms();
        }
    });

    modal.querySelector('.btn-cancel').addEventListener('click', () => modal.remove());
    modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    initFormsStorage();
    renderForms();
}); 