const formsCriteria = {
    chatModerator: {
        title: 'Модератор чата',
        icon: '💬',
        fields: [
            { id: 'minecraft', type: 'text', label: 'Ник в Minecraft', required: true },
            { id: 'discord', type: 'text', label: 'Ник в Discord', required: true },
            { id: 'telegram', type: 'text', label: 'Ник в Telegram', required: true },
            { id: 'age', type: 'number', label: 'Возраст', required: true },
            { id: 'timezone', type: 'text', label: 'Часовой пояс', required: true },
            { id: 'timePerDay', type: 'text', label: 'Время в день на модерацию', required: true },
            { id: 'experience', type: 'textarea', label: 'Опыт модерации чатов', required: true },
            { id: 'spamReaction', type: 'textarea', label: 'Реакция на спам', required: true },
            { id: 'swearReaction', type: 'textarea', label: 'Реакция на мат', required: true },
            { id: 'provocationReaction', type: 'textarea', label: 'Реакция на провокацию', required: true },
            { id: 'motivation', type: 'textarea', label: 'Почему подходишь на роль', required: true },
            { id: 'mic', type: 'select', label: 'Есть ли микрофон', options: ['Да', 'Нет'], required: true }
        ]
    },
    voiceModerator: {
        title: 'Модератор голосового чата',
        icon: '🎙️',
        fields: [
            { id: 'minecraft', type: 'text', label: 'Ник в Minecraft', required: true },
            { id: 'discord', type: 'text', label: 'Ник в Discord', required: true },
            { id: 'telegram', type: 'text', label: 'Ник в Telegram', required: true },
            { id: 'age', type: 'number', label: 'Возраст', required: true },
            { id: 'mic', type: 'select', label: 'Качественный микрофон', options: ['Да', 'Нет'], required: true },
            { id: 'screamReaction', type: 'textarea', label: 'Реакция на крики', required: true },
            { id: 'rulesReaction', type: 'textarea', label: 'Реакция на нарушение правил', required: true },
            { id: 'conflictReaction', type: 'textarea', label: 'Решение конфликтов', required: true },
            { id: 'experience', type: 'textarea', label: 'Опыт модерации голосовых чатов', required: true },
            { id: 'timePerDay', type: 'text', label: 'Время в день', required: true },
            { id: 'motivation', type: 'textarea', label: 'Почему хочешь стать модератором', required: true }
        ]
    },
    supportManager: {
        title: 'Менеджер техподдержки',
        icon: '🧰',
        fields: [
            { id: 'minecraft', type: 'text', label: 'Ник в Minecraft', required: true },
            { id: 'discord', type: 'text', label: 'Ник в Discord', required: true },
            { id: 'telegram', type: 'text', label: 'Ник в Telegram', required: true },
            { id: 'age', type: 'number', label: 'Возраст', required: true },
            { id: 'experience', type: 'textarea', label: 'Опыт в поддержке пользователей', required: true },
            { id: 'solvedCases', type: 'textarea', label: 'Решенные ситуации', required: true },
            { id: 'techSkills', type: 'textarea', label: 'Навыки работы с БД/логами/консолью', required: true },
            { id: 'timePerDay', type: 'text', label: 'Время в день на поддержку', required: true },
            { id: 'motivation', type: 'textarea', label: 'Почему подходишь на роль', required: true }
        ]
    },
    serverModerator: {
        title: 'Модератор сервера',
        icon: '🛡️',
        fields: [
            { id: 'minecraft', type: 'text', label: 'Ник в Minecraft', required: true },
            { id: 'discord', type: 'text', label: 'Ник в Discord', required: true },
            { id: 'telegram', type: 'text', label: 'Ник в Telegram', required: true },
            { id: 'age', type: 'number', label: 'Возраст', required: true },
            { id: 'experience', type: 'textarea', label: 'Опыт модерации серверов', required: true },
            { id: 'cheaterReaction', type: 'textarea', label: 'Действия при обнаружении читера', required: true },
            { id: 'conflictSolution', type: 'textarea', label: 'Решение конфликтов между игроками', required: true },
            { id: 'timePerDay', type: 'text', label: 'Время в день в игре', required: true },
            { id: 'motivation', type: 'textarea', label: 'Почему хочешь быть модератором', required: true }
        ]
    },
    techAdmin: {
        title: 'Технический администратор',
        icon: '🧠',
        fields: [
            { id: 'minecraft', type: 'text', label: 'Ник в Minecraft', required: true },
            { id: 'discord', type: 'text', label: 'Ник в Discord', required: true },
            { id: 'telegram', type: 'text', label: 'Ник в Telegram', required: true },
            { id: 'age', type: 'number', label: 'Возраст', required: true },
            { id: 'serverExperience', type: 'textarea', label: 'Опыт работы с серверами и плагинами', required: true },
            { id: 'discordExperience', type: 'textarea', label: 'Опыт с ботами и интеграциями', required: true },
            { id: 'responsibilities', type: 'textarea', label: 'Возможные задачи', required: true },
            { id: 'emergency', type: 'select', label: 'Доступность вне игры', options: ['Да', 'Нет'], required: true },
            { id: 'motivation', type: 'textarea', label: 'Почему хочешь быть тех. админом', required: true }
        ]
    }
}; 