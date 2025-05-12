// Управление пользователями
const usersDB = {
    // Получить всех пользователей
    getAllUsers: function() {
        const users = localStorage.getItem('users');
        console.log('Получение всех пользователей:', users);
        return users ? JSON.parse(users) : [];
    },

    // Получить пользователя по логину
    getUserByLogin: function(login) {
        const users = this.getAllUsers();
        const user = users.find(user => user.login === login);
        console.log('Поиск пользователя по логину:', { login, found: user });
        return user;
    },

    // Добавить нового пользователя
    addUser: function(user) {
        const users = this.getAllUsers();
        // Проверяем, не существует ли уже пользователь с таким логином
        if (this.getUserByLogin(user.login)) {
            console.log('Пользователь уже существует:', user.login);
            return false;
        }
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        console.log('Добавлен новый пользователь:', user);
        return true;
    },

    // Обновить данные пользователя
    updateUser: function(login, newData) {
        const users = this.getAllUsers();
        const index = users.findIndex(user => user.login === login);
        if (index === -1) {
            console.log('Пользователь не найден для обновления:', login);
            return false;
        }
        
        users[index] = { ...users[index], ...newData };
        localStorage.setItem('users', JSON.stringify(users));
        console.log('Обновлены данные пользователя:', { login, newData });
        return true;
    },

    // Удалить пользователя
    deleteUser: function(login) {
        const users = this.getAllUsers();
        const filteredUsers = users.filter(user => user.login !== login);
        if (filteredUsers.length === users.length) {
            console.log('Пользователь не найден для удаления:', login);
            return false;
        }
        
        localStorage.setItem('users', JSON.stringify(filteredUsers));
        console.log('Удален пользователь:', login);
        return true;
    },

    // Проверить логин и пароль
    validateUser: function(login, password) {
        const user = this.getUserByLogin(login);
        const isValid = user && user.password === password;
        console.log('Проверка пользователя:', { login, password, user, isValid });
        return isValid;
    }
};

// Инициализация базы данных с администратором по умолчанию
function initUsersDB() {
    console.log('Начало инициализации базы данных');
    
    // Проверяем, существует ли уже база данных
    const existingUsers = localStorage.getItem('users');
    if (existingUsers) {
        console.log('База данных уже существует:', existingUsers);
        return;
    }
    
    // Создаем администратора
    const adminUser = {
        login: 'admin',
        password: '1234',
        role: 'admin',
        name: 'Администратор',
        email: 'admin@example.com'
    };
    
    const success = usersDB.addUser(adminUser);
    console.log('Инициализация базы данных завершена:', { success, adminUser });
    
    // Проверяем, что администратор создан
    const users = usersDB.getAllUsers();
    console.log('Текущие пользователи в базе:', users);
}

// Инициализируем базу при загрузке
console.log('Загрузка модуля users.js');
initUsersDB(); 