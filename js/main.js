document.addEventListener('DOMContentLoaded', function() {
    console.log('Загрузка main.js');
    
    // Проверяем, находимся ли мы на странице входа
    const isLoginPage = window.location.pathname.includes('login.html');
    console.log('Текущая страница:', { isLoginPage, path: window.location.pathname });
    
    // Проверяем авторизацию
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    console.log('Текущий пользователь:', currentUser);
    
    if (!isLoginPage && !currentUser) {
        console.log('Нет авторизации, перенаправление на страницу входа');
        window.location.href = 'login.html';
        return;
    }

    // Если мы на странице входа, не выполняем остальной код
    if (isLoginPage) {
        console.log('На странице входа, выход из main.js');
        return;
    }

    // Проверяем, является ли текущий пользователь администратором
    const userData = currentUser;
    console.log('Данные пользователя из localStorage:', userData);
    const isAdmin = userData && userData.role === 'admin';
    console.log('Статус администратора:', isAdmin);

    const menuItems = document.querySelectorAll('.sidebar-menu li');
    const contentArea = document.getElementById('content-area');

    // --- Новости (общий массив для главной и админки) ---
    let news = [];

    function renderNews() {
        // Главная страница
        const mainNewsList = document.querySelector('.news-list');
        if (mainNewsList) {
            mainNewsList.innerHTML = news.length === 0 ? '<span style="color:#888;">Пока нет новостей</span>' : '';
            news.forEach(item => {
                mainNewsList.innerHTML += `<div class="news-item"><span class="news-date">${item.date}</span>: <span class="news-text">${item.text}</span></div>`;
            });
        }
        // Админ-панель
        const adminNewsList = document.getElementById('admin-news-list');
        if (adminNewsList) {
            adminNewsList.innerHTML = news.length === 0 ? '<span style="color:#888;">Пока нет новостей</span>' : '';
            news.forEach((item, idx) => {
                adminNewsList.innerHTML += `<div class="admin-news-item"><span class="admin-news-date">${item.date}</span><span class="admin-news-text">${item.text}</span><button class="delete-news-btn" data-idx="${idx}">Удалить</button></div>`;
            });
            // Навешиваем обработчики на кнопки удаления
            adminNewsList.querySelectorAll('.delete-news-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const idx = +this.getAttribute('data-idx');
                    news.splice(idx, 1);
                    renderNews();
                });
            });
        }
    }

    // --- ОТЧЁТЫ ---
    let reports = [];

    async function loadReports() {
        try {
            const res = await fetch('/api/reports');
            if (!res.ok) throw new Error('Ошибка загрузки отчётов');
            reports = await res.json();
            renderReports();
        } catch (err) {
            console.error('Ошибка при загрузке отчётов:', err);
        }
    }

    let lastReportSearch = '';
    let reportSearchVisible = false;
    function renderReports(filter = '') {
        if (filter !== undefined) lastReportSearch = filter;
        const reportsSection = document.getElementById('content-area');
        if (!reportsSection) return;
        let html = `<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
            <h2 style="margin:0;">Отчёты</h2>
            <div style="display:flex;align-items:center;gap:6px;">
                <button id="show-report-search" style="background:#23283a;border:none;border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 1px 4px 0 rgba(0,0,0,0.10);transition:background 0.2s;">
                    <svg width="22" height="22" viewBox="0 0 22 22"><circle cx="10" cy="10" r="7" stroke="#bbb" stroke-width="2" fill="none"/><line x1="16" y1="16" x2="20" y2="20" stroke="#bbb" stroke-width="2" stroke-linecap="round"/></svg>
                </button>
                <input id="report-search" type="text" placeholder="Поиск..." value="${lastReportSearch.replace(/"/g, '&quot;')}" style="width:180px;${reportSearchVisible ? 'display:block;' : 'display:none;'}margin-left:0;padding:8px 12px;border-radius:8px;border:1.5px solid #44495e;background:#181c24;color:#fff;font-size:1.02rem;outline:none;transition:width 0.2s;">
            </div>
        </div>
        <button id="add-report-btn" style="margin-bottom:20px;margin-top:14px;" class="admin-btn">Добавить отчёт</button>`;
        
        let filteredReports = reports;
        if (lastReportSearch) {
            const f = lastReportSearch.toLowerCase();
            filteredReports = reports.filter(r => {
                return (
                    String(r.id).includes(f) ||
                    (r.player && r.player.toLowerCase().includes(f)) ||
                    (r.reason && r.reason.toLowerCase().includes(f)) ||
                    (r.article && r.article.toLowerCase().includes(f)) ||
                    (r.punishment && r.punishment.toLowerCase().includes(f)) ||
                    (r.admin && r.admin.toLowerCase().includes(f)) ||
                    (r.date && r.date.toLowerCase().includes(f)) ||
                    (r.proof && r.proof.toLowerCase().includes(f))
                );
            });
        }
        
        if (filteredReports.length === 0) {
            html += '<div style="color:#888;">Пока нет отчётов</div>';
        } else {
            html += '<div class="reports-list">';
            filteredReports.forEach(r => {
                html += `<div class="report-block" data-id="${r.id}">
                    <div class="report-summary">
                        <span class="report-num">#${String(r.id).padStart(4,'0')}</span>
                        <button class="expand-report-btn" style="float:right; background:none; border:none; cursor:pointer; font-size:1.2em;">&#9654;</button>
                    </div>
                    <div class="report-details" style="display:none; margin-top:10px;">
                        <div><b>👤 Игрок:</b> ${r.player}</div>
                        <div><b>📆 Дата:</b> ${new Date(r.date).toLocaleString()}</div>
                        <div><b>🚨 Причина:</b> ${r.reason}</div>
                        <div><b>📜 Статья:</b> ${r.article}</div>
                        <div><b>⏳ Наказание:</b> ${r.punishment}</div>
                        <div><b>📷 Доказательства:</b> ${r.proof ? r.proof : '<span style=\'color:#888\'>—</span>'}</div>
                        <div><b>👮‍♂️ Админ:</b> ${r.admin}</div>
                    </div>
                </div>`;
            });
            html += '</div>';
        }
        
        reportsSection.innerHTML = html;
        
        // Навешиваем обработчики
        document.querySelectorAll('.expand-report-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const block = this.closest('.report-block');
                const details = block.querySelector('.report-details');
                const expanded = details.style.display === 'block';
                this.innerHTML = expanded ? '&#9654;' : '&#9660;';
                details.style.display = expanded ? 'none' : 'block';
            });
        });
        
        // Поиск
        const searchInput = document.getElementById('report-search');
        const showSearchBtn = document.getElementById('show-report-search');
        if (showSearchBtn && searchInput) {
            showSearchBtn.addEventListener('click', function() {
                reportSearchVisible = !reportSearchVisible;
                renderReports(lastReportSearch);
                setTimeout(() => {
                    if (reportSearchVisible && document.getElementById('report-search')) {
                        document.getElementById('report-search').focus();
                    }
                }, 0);
            });
        }
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                renderReports(this.value);
            });
        }
    }

    // Обработчик сохранения отчёта
    const saveReportBtn = document.getElementById('save-report-btn');
    const cancelReportBtn = document.getElementById('cancel-report-btn');
    if (cancelReportBtn) {
        cancelReportBtn.addEventListener('click', () => {
            document.getElementById('add-report-modal').style.display = 'none';
        });
    }
    if (saveReportBtn) {
        saveReportBtn.addEventListener('click', async () => {
            const player = document.getElementById('report-player').value.trim();
            const reason = document.getElementById('report-reason').value.trim();
            const article = document.getElementById('report-article').value.trim();
            const punishment = document.getElementById('report-punishment').value;
            const proof = document.getElementById('report-proof').value.trim();
            const error = document.getElementById('report-error');
            
            if (!player || !reason || !article || !punishment) {
                error.textContent = 'Заполните все обязательные поля!';
                return;
            }
            
            try {
                const admin = userData && userData.login ? userData.login : '—';
                const res = await fetch('/api/reports', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ player, reason, article, punishment, proof, admin })
                });
                
                if (!res.ok) throw new Error('Ошибка сохранения отчёта');
                
                document.getElementById('add-report-modal').style.display = 'none';
                await loadReports(); // Перезагружаем отчёты
            } catch (err) {
                console.error('Ошибка при сохранении отчёта:', err);
                error.textContent = 'Ошибка сохранения отчёта';
            }
        });
    }

    const sections = {
        dashboard: {
            title: 'Главный экран',
            text: `
                <div class="dashboard-block clock-main">
                    <div id="clock-time"></div>
                    <div id="clock-date-main"></div>
                    <div id="clock-date-alt"></div>
                </div>
                <div class="dashboard-block news-block">
                    <h3>Новости проекта:</h3>
                    <div class="news-list"></div>
                </div>
            `
        },
        reports: {
            title: 'Отчёты',
            text: '<div id="reports-placeholder"></div>'
        },
        forms: {
            title: 'Анкеты',
            text: `
                <div class="section-header">
                    <h2>Заявки на роли</h2>
                    <button onclick="showNewFormModal()" class="btn-primary">Новая заявка</button>
                </div>
                <div id="forms-placeholder"></div>
            `
        },
        analytics: {
            title: 'Отчёты',
            text: '<div id="reports-placeholder"></div>'
        },
        profile: {
            title: 'Профиль',
            text: '<div class="profile-block"><div class="profile-header"><div class="profile-avatar"></div><div class="profile-info"><h2 id="profile-username">Загрузка...</h2><div class="profile-details"><span id="profile-rank" class="profile-rank">Загрузка...</span><span id="profile-id" class="profile-id">Загрузка...</span><span id="profile-last-login" class="profile-last-login">Загрузка...</span></div></div></div></div>'
        },
        settings: {
            title: 'Настройки',
            text: 'Настройки системы и пользователя.'
        }
    };

    // --- Базовая функция renderSection (фикс ReferenceError и дизайн) ---
    function renderSection(section) {
        if (sections[section]) {
            // Обновляем только внутренний HTML, не трогаем класс content-card
            contentArea.innerHTML = `<h2>${sections[section].title}</h2>${sections[section].text}`;
            if (section === 'dashboard') {
                startClock();
                renderNews();
            } else if (section === 'profile') {
                updateProfile();
            } else if (section === 'reports') {
                renderReports();
            }
        }
    }

    // Функция для обновления профиля
    async function updateProfile() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (!currentUser) return;

        // Обновляем данные профиля
        document.getElementById('profile-username').textContent = currentUser.username;
        document.getElementById('profile-rank').textContent = `Ранг ${currentUser.username === 'admin' ? '6' : currentUser.role}`;
        document.getElementById('profile-id').textContent = `ID: ${currentUser.username === 'admin' ? '7777777777' : currentUser.id}`;
        // Получаем последний вход из localStorage
        const lastLogin = localStorage.getItem(`lastLogin_${currentUser.username}`);
        if (lastLogin) {
            document.getElementById('profile-last-login').textContent = `Последний вход: ${lastLogin}`;
        }
        // Обновляем список всех пользователей
        updateUsersList();
    }

    // Функция для обновления списка пользователей
    async function updateUsersList() {
        const usersList = document.getElementById('all-users-list');
        if (!usersList) return;
        let users = [];
        try {
            const res = await fetch('/api/users');
            users = await res.json();
        } catch (e) {
            usersList.innerHTML = '<span style="color:#f44;">Ошибка загрузки пользователей</span>';
            return;
        }
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        usersList.innerHTML = users.map(user => {
            const isOnline = user.username === (currentUser && currentUser.username);
            const lastLogin = localStorage.getItem(`lastLogin_${user.username}`);
            const status = isOnline ? 'online' : 'offline';
            const statusText = isOnline ? 'В сети' : `Последний вход: ${lastLogin || '—'}`;
            return `
                <div class="user-card">
                    <div class="user-name">${user.username}</div>
                    <div class="user-rank">Ранг ${user.username === 'admin' ? '6' : user.role}</div>
                    <div class="user-id">ID: ${user.username === 'admin' ? '7777777777' : user.id}</div>
                    <div class="user-status ${status}">${statusText}</div>
                </div>
            `;
        }).join('');
    }

    // Обновляем профиль при входе
    function updateLastLogin() {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) return;

        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yyyy = now.getFullYear();
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        const date = `${dd}.${mm}.${yyyy} ${hh}:${min}`;
        
        localStorage.setItem(`lastLogin_${currentUser}`, date);
        updateProfile();
    }

    // Обновляем профиль при переключении на вкладку профиля
    const origRenderSection = renderSection;
    renderSection = function(section) {
        origRenderSection(section);
        if (section === 'profile') {
            updateProfile();
        } else if (section === 'reports') {
            renderReports();
        }
    };

    // Обновляем последний вход при загрузке страницы
    updateLastLogin();

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.getAttribute('data-section');
            console.log('Нажата кнопка меню:', section);
            document.querySelector('.sidebar-menu li.active').classList.remove('active');
            item.classList.add('active');
            renderSection(section);
        });
    });

    // Часы и дата
    function startClock() {
        const timeEl = document.getElementById('clock-time');
        const dateMainEl = document.getElementById('clock-date-main');
        const dateAltEl = document.getElementById('clock-date-alt');
        if (!timeEl || !dateMainEl || !dateAltEl) return;
        function updateClock() {
            const now = new Date();
            // Время
            const h = String(now.getHours()).padStart(2, '0');
            const m = String(now.getMinutes()).padStart(2, '0');
            const s = String(now.getSeconds()).padStart(2, '0');
            timeEl.textContent = `${h}:${m}:${s}`;
            // День недели и число
            const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
            const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
            const dayOfWeek = days[now.getDay()];
            const day = now.getDate();
            const month = months[now.getMonth()];
            dateMainEl.textContent = `${dayOfWeek}, ${day} ${month}`;
            // Дата в формате дд.мм.гггг
            const dd = String(day).padStart(2, '0');
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const yyyy = now.getFullYear();
            dateAltEl.textContent = `${dd}.${mm}.${yyyy}`;
        }
        updateClock();
        if (window.clockInterval) clearInterval(window.clockInterval);
        window.clockInterval = setInterval(updateClock, 1000);
    }

    // При загрузке сразу показываем главный экран с часами
    renderSection('dashboard');

    // --- Админ-панель ---
    const adminBtn = document.getElementById('admin-panel-btn');
    const adminModal = document.getElementById('admin-modal');
    const adminPanel = document.getElementById('admin-panel');
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const adminCancelBtn = document.getElementById('admin-cancel-btn');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    const adminPasswordInput = document.getElementById('admin-password');
    const adminError = document.getElementById('admin-error');

    console.log('Найдены элементы админ-панели:', {
        adminBtn: !!adminBtn,
        adminModal: !!adminModal,
        adminPanel: !!adminPanel,
        adminLoginBtn: !!adminLoginBtn,
        adminCancelBtn: !!adminCancelBtn,
        adminLogoutBtn: !!adminLogoutBtn,
        adminPasswordInput: !!adminPasswordInput,
        adminError: !!adminError
    });

    if (adminBtn) {
        // Показываем кнопку админ-панели всем
        adminBtn.style.display = 'block';
        console.log('Кнопка админ-панели:', { display: adminBtn.style.display });
        
        adminBtn.addEventListener('click', () => {
            console.log('Нажата кнопка админ-панели');
            adminModal.style.display = 'flex';
            adminPasswordInput.value = '';
            adminError.textContent = '';
            setTimeout(() => adminPasswordInput.focus(), 100);
        });
    } else {
        console.error('Кнопка админ-панели не найдена!');
    }

    if (adminCancelBtn) {
        adminCancelBtn.addEventListener('click', () => {
            console.log('Нажата кнопка отмены в админ-панели');
            adminModal.style.display = 'none';
        });
    }

    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', async () => {
            console.log('Нажата кнопка входа в админ-панель');
            const inputCode = adminPasswordInput.value;
            console.log('Введенный код:', inputCode);
            
            try {
                const res = await fetch('/api/admin-password');
                const data = await res.json();
                if (res.ok && inputCode === data.password) {
                    console.log('Код верный, открываем админ-панель');
                    adminModal.style.display = 'none';
                    hideAllOverlays();
                    adminPanel.style.display = 'flex';
                    adminError.textContent = '';
                    renderNews();
                } else {
                    console.log('Неверный код');
                    adminError.textContent = 'Неверный пароль';
                }
            } catch (err) {
                console.error('Ошибка при проверке пароля:', err);
                adminError.textContent = 'Ошибка сервера';
            }
        });
    }

    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => {
            console.log('Нажата кнопка выхода из админ-панели');
            adminPanel.style.display = 'none';
        });
    }

    // --- Логин ---
    const logoutBtn = document.getElementById('logout-btn');
    console.log('Кнопка выхода найдена:', !!logoutBtn);

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            alert('Нажата кнопка выхода из системы'); // Временное уведомление для отладки
            console.log('Нажата кнопка выхода из системы');
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    } else {
        console.error('Кнопка выхода не найдена!');
    }

    // --- Добавление новости ---
    const addNewsBtn = document.getElementById('add-news-btn');
    const addNewsModal = document.getElementById('add-news-modal');
    const saveNewsBtn = document.getElementById('save-news-btn');
    const cancelNewsBtn = document.getElementById('cancel-news-btn');
    const newsTextInput = document.getElementById('news-text');
    const newsError = document.getElementById('news-error');

    if (addNewsBtn) {
        addNewsBtn.addEventListener('click', () => {
            console.log('Нажата кнопка добавления новости');
            addNewsModal.style.display = 'flex';
            newsTextInput.value = '';
            newsError.textContent = '';
            setTimeout(() => newsTextInput.focus(), 100);
        });
    }
    if (cancelNewsBtn) {
        cancelNewsBtn.addEventListener('click', () => {
            console.log('Нажата кнопка отмены добавления новости');
            addNewsModal.style.display = 'none';
        });
    }
    if (saveNewsBtn) {
        saveNewsBtn.addEventListener('click', () => {
            console.log('Нажата кнопка сохранения новости');
            saveNews();
        });
        newsTextInput.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                console.log('Нажат Enter в поле текста новости');
                e.preventDefault();
                saveNews();
            }
        });
    }
    function saveNews() {
        const text = newsTextInput.value.trim();
        if (!text) {
            newsError.textContent = 'Введите текст новости';
            return;
        }
        // Автоматически подставляем текущую дату
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yyyy = now.getFullYear();
        const date = `${dd}.${mm}.${yyyy}`;
        news.unshift({date, text});
        addNewsModal.style.display = 'none';
        renderNews();
    }

    // Функция для имитации нажатия кнопки админ-панели
    window.simulateAdminClick = function() {
        console.log('Имитация нажатия кнопки админ-панели');
        if (adminBtn) {
            adminBtn.click();
        } else {
            console.error('Кнопка админ-панели не найдена!');
        }
    };

    // Функция для имитации входа в админ-панель
    window.simulateAdminLogin = function() {
        console.log('Имитация входа в админ-панель');
        if (adminPasswordInput) {
            adminPasswordInput.value = '123456';
            if (adminLoginBtn) {
                adminLoginBtn.click();
            }
        }
    };

    // Функция для полной имитации процесса входа в админ-панель
    window.simulateFullAdminAccess = function() {
        console.log('Запуск полной имитации доступа к админ-панели');
        simulateAdminClick();
        setTimeout(simulateAdminLogin, 500);
    };

    // Выводим инструкцию в консоль
    console.log('Для тестирования админ-панели используйте следующие команды:');
    console.log('simulateAdminClick() - имитирует нажатие кнопки админ-панели');
    console.log('simulateAdminLogin() - имитирует ввод пароля и вход');
    console.log('simulateFullAdminAccess() - выполняет полный процесс входа');

    // Функция для скрытия всех overlay-элементов, кроме админ-панели
    function hideAllOverlays() {
        document.querySelectorAll('.modal-overlay, .login-overlay').forEach(e => e.style.display = 'none');
    }

    // === АВТО-ВЫХОД ПО БЕЗДЕЙСТВИЮ ===
    // Меняй это значение для теста (например, 30*1000 для 30 секунд, 30*60*1000 для 30 минут)
    const INACTIVITY_TIMEOUT = 15*60*1000; // 30 секунд для теста
    let inactivityTimer;
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            localStorage.removeItem('currentUser');
            alert('Вы были автоматически выведены из аккаунта из-за бездействия.');
            window.location.href = 'login.html';
        }, INACTIVITY_TIMEOUT);
    }
    ['mousemove','keydown','mousedown','touchstart','scroll'].forEach(event => {
        window.addEventListener(event, resetInactivityTimer, true);
    });
    resetInactivityTimer();
    // === КОНЕЦ АВТО-ВЫХОДА ===

    // --- Добавление пользователя (только для админа, теперь через сервер) ---
    const addUserModal = document.getElementById('add-user-modal');
    const saveUserBtn = document.getElementById('save-user-btn');
    const cancelUserBtn = document.getElementById('cancel-user-btn');
    const userLoginInput = document.getElementById('user-login');
    const userPasswordInput = document.getElementById('user-password');
    const userRankInput = document.getElementById('user-rank');
    const userError = document.getElementById('user-error');

    // --- Пользователи в админ-панели ---
    async function renderAdminUsers() {
        const usersList = document.getElementById('admin-users-list');
        if (!usersList) return;
        
        try {
            const res = await fetch('/api/users');
            if (!res.ok) throw new Error('Ошибка загрузки пользователей');
            const users = await res.json();
            
            if (users.length === 0) {
                usersList.innerHTML = '<div style="color:#888;padding:20px;text-align:center;">Пока нет пользователей</div>';
                return;
            }

            usersList.innerHTML = users.map(user => `
                <div class="admin-user-item" style="background:#23283a;padding:12px;margin-bottom:8px;border-radius:8px;display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <span style="font-weight:600;color:#fff;">${user.username}</span>
                        <span style="color:#ffb84d;margin-left:8px;">[Ранг ${user.username === 'admin' ? '6' : user.role}]</span>
                    </div>
                    <span style="color:#888;font-size:0.9em;">ID: ${user.id}</span>
                </div>
            `).join('');
        } catch (err) {
            console.error('Ошибка при загрузке пользователей:', err);
            usersList.innerHTML = '<div style="color:#f44;padding:20px;text-align:center;">Ошибка загрузки пользователей</div>';
        }
    }

    // Кнопка "Добавить пользователя" в блоке
    const addUserPanelBtn = document.getElementById('add-user-panel-btn');
    if (addUserPanelBtn) {
        addUserPanelBtn.addEventListener('click', () => {
            addUserModal.style.display = 'flex';
            userError.textContent = '';
            userLoginInput.value = '';
            userPasswordInput.value = '';
            userRankInput.value = '1';
        });
    }
    // После добавления пользователя обновляем список
    if (saveUserBtn) {
        const origSaveUserHandler = saveUserBtn.onclick;
        saveUserBtn.addEventListener('click', async () => {
            const login = userLoginInput.value.trim();
            const password = userPasswordInput.value.trim();
            const rank = userRankInput.value;
            if (!login || !password || !rank) {
                userError.textContent = 'Заполните все поля!';
                return;
            }
            try {
                const res = await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: login, password, role: rank })
                });
                const data = await res.json();
                if (res.ok) {
                    addUserModal.style.display = 'none';
                    alert('Пользователь успешно добавлен!');
                    setTimeout(renderAdminUsers, 100);
                } else {
                    userError.textContent = data.error || 'Ошибка добавления пользователя';
                }
            } catch (e) {
                userError.textContent = 'Ошибка соединения с сервером';
            }
        });
    }
    // Рендерим пользователей при открытии админ-панели
    if (adminPanel) {
        const observerUsers = new MutationObserver(() => {
            if (adminPanel.style.display === 'flex') {
                renderAdminUsers();
            }
        });
        observerUsers.observe(adminPanel, { attributes: true, attributeFilter: ['style'] });
    }

    if (cancelUserBtn) {
        cancelUserBtn.addEventListener('click', () => {
            addUserModal.style.display = 'none';
        });
    }

    // Загружаем отчёты при загрузке страницы
    loadReports();
});

// Глобальная функция для теста админ-панели
window.testAdminPanel = function() {
    console.log('Тестирование админ-панели...');
    const adminBtn = document.getElementById('admin-panel-btn');
    const adminModal = document.getElementById('admin-modal');
    const adminPanel = document.getElementById('admin-panel');
    const adminPasswordInput = document.getElementById('admin-password');
    console.log('Элементы найдены:', {
        adminBtn: !!adminBtn,
        adminModal: !!adminModal,
        adminPanel: !!adminPanel,
        adminPasswordInput: !!adminPasswordInput
    });
    if (adminBtn) {
        console.log('Нажимаем кнопку админ-панели...');
        adminBtn.click();
        setTimeout(() => {
            if (adminPasswordInput) {
                console.log('Вводим пароль...');
                adminPasswordInput.value = '123456';
                const adminLoginBtn = document.getElementById('admin-login-btn');
                if (adminLoginBtn) {
                    console.log('Нажимаем кнопку входа...');
                    adminLoginBtn.click();
                }
            }
        }, 500);
    }
};
console.log('Для теста админ-панели: testAdminPanel()');
