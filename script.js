// Загрузка данных
let voteData = {
    date: new Date().toISOString().split('T')[0],
    leftOption: 'Перс 1',
    rightOption: 'Перс 2',
    votes1: 0,
    votes2: 0
};

// Проверка localStorage
if (localStorage.getItem('voteData')) {
    voteData = JSON.parse(localStorage.getItem('voteData'));
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
    document.getElementById('left-title').textContent = voteData.leftOption;
    document.getElementById('right-title').textContent = voteData.rightOption;
    
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
    
    localStorage.setItem('voteData', JSON.stringify(voteData));
    sessionStorage.setItem('hasVoted', 'true');
    
    updateDisplay();
    
    // Анимация
    alert('✅ Ваш голос учтён!');
}

// Инициализация
updateDisplay();

// Автообновление каждые 30 секунд
setInterval(() => {
    if (localStorage.getItem('voteData')) {
        voteData = JSON.parse(localStorage.getItem('voteData'));
        updateDisplay();
    }
}, 30000);