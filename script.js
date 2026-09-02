// Загрузка данных из GitHub
let voteData = {
    date: new Date().toISOString().split('T')[0],
    leftOption: 'Перс 1',
    rightOption: 'Перс 2',
    votes1: 0,
    votes2: 0
};

// Флаг, загружены ли данные
let dataLoaded = false;

// Загрузка данных из data.json на GitHub
async function loadDataFromGitHub() {
    try {
        // Добавляем timestamp чтобы избежать кэширования
        const response = await fetch('data.json?t=' + new Date().getTime());
        if (response.ok) {
            const data = await response.json();
            voteData = data;
            dataLoaded = true;
            console.log('Данные загружены из GitHub:', voteData);
        }
    } catch (error) {
        console.log('Не удалось загрузить из GitHub, используем localStorage:', error);
        // Если не получилось загрузить из GitHub, пробуем localStorage
        if (localStorage.getItem('voteData')) {
            voteData = JSON.parse(localStorage.getItem('voteData'));
        }
    }
    updateDisplay();
}

// Сохранение в localStorage (для голосования)
function saveToLocal() {
    localStorage.setItem('voteData', JSON.stringify(voteData));
}

// Отображение даты
document.getElementById('current-date').textContent = new Date().toLocaleDateString('ru-RU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});

// Обновление интерфейса
function updateDisplay() {
    document.getElementById('left-title').textContent = voteData.leftOption || 'Перс 1';
    document.getElementById('right-title').textContent = voteData.rightOption || 'Перс 2';
    
    const total = voteData.votes1 + voteData.votes2;
    const percent1 = total > 0 ? Math.round((voteData.votes1 / total) * 100) : 0;
    const percent2 = total > 0 ? Math.round((voteData.votes2 / total) * 100) : 0;
    
    document.getElementById('progress1').style.width = percent1 + '%';
    document.getElementById('progress2').style.width = percent2 + '%';
    document.getElementById('percent1').textContent = percent1 + '%';
    document.getElementById('percent2').textContent = percent2 + '%';
    document.getElementById('total-votes').textContent = total;
}

// Голосование
function vote(option) {
    // Проверка, голосовал ли уже пользователь
    if (sessionStorage.getItem('hasVoted')) {
        alert('Вы уже проголосовали сегодня!');
        return;
    }
    
    if (option === 1) {
        voteData.votes1++;
    } else {
        voteData.votes2++;
    }
    
    // Сохраняем локально
    saveToLocal();
    sessionStorage.setItem('hasVoted', 'true');
    
    updateDisplay();
    
    // Анимация
    alert('✅ Ваш голос учтён!');
}

// Инициализация - загружаем данные из GitHub
loadDataFromGitHub();

// Автообновление каждые 10 секунд (проверяем GitHub)
setInterval(() => {
    loadDataFromGitHub();
}, 10000);
