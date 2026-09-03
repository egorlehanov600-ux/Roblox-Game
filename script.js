// Загрузка данных
let tournamentData = {
    days: []
};

// Загрузка из GitHub
async function loadDataFromGitHub() {
    try {
        const response = await fetch('data.json?t=' + new Date().getTime());
        if (response.ok) {
            const data = await response.json();
            tournamentData = data;
            console.log('Данные загружены:', tournamentData);
        }
    } catch (error) {
        console.log('Не удалось загрузить из GitHub:', error);
        if (localStorage.getItem('tournamentData')) {
            tournamentData = JSON.parse(localStorage.getItem('tournamentData'));
        }
    }
    renderTournament();
}

// Отрисовка турнира
function renderTournament() {
    const container = document.getElementById('tournament');
    container.innerHTML = '';
    
    // Сортируем дни: день 1 внизу, день N вверху
    const sortedDays = [...tournamentData.days].sort((a, b) => b.day - a.day);
    
    sortedDays.forEach(dayData => {
        const row = document.createElement('div');
        row.className = 'day-row';
        
        const totalVotes = dayData.votes1 + dayData.votes2;
        const percent1 = totalVotes > 0 ? Math.round((dayData.votes1 / totalVotes) * 100) : 0;
        const percent2 = totalVotes > 0 ? Math.round((dayData.votes2 / totalVotes) * 100) : 0;
        
        // Определяем классы для кругов
        let leftClass = 'circle';
        let rightClass = 'circle';
        
        if (dayData.status === 'finished') {
            if (dayData.winner === 'left') {
                leftClass += ' winner';
                rightClass += ' loser';
            } else if (dayData.winner === 'right') {
                rightClass += ' winner';
                leftClass += ' loser';
            }
        }
        
        row.innerHTML = `
            <div class="${leftClass}" onclick="vote(${dayData.day}, 1)">
                ${dayData.leftOption}
                <div class="vote-count">${percent1}% (${dayData.votes1})</div>
            </div>
            
            <div class="day-box">
                День ${dayData.day}
                <div class="arrow arrow-left"></div>
                <div class="arrow arrow-right"></div>
            </div>
            
            <div class="${rightClass}" onclick="vote(${dayData.day}, 2)">
                ${dayData.rightOption}
                <div class="vote-count">${percent2}% (${dayData.votes2})</div>
            </div>
        `;
        
        container.appendChild(row);
    });
}

// Голосование
function vote(dayNumber, option) {
    const day = tournamentData.days.find(d => d.day === dayNumber);
    
    if (!day || day.status === 'finished') {
        alert('Этот день уже завершён!');
        return;
    }
    
    // Проверка, голосовал ли уже
    const votedKey = `voted_day_${dayNumber}`;
    if (sessionStorage.getItem(votedKey)) {
        alert('Ты уже проголосовал в этот день!');
        return;
    }
    
    if (option === 1) {
        day.votes1++;
    } else {
        day.votes2++;
    }
    
    sessionStorage.setItem(votedKey, 'true');
    localStorage.setItem('tournamentData', JSON.stringify(tournamentData));
    
    renderTournament();
    alert('✅ Голос учтён!');
}

// Инициализация
document.getElementById('current-date').textContent = new Date().toLocaleDateString('ru-RU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});

loadDataFromGitHub();

// Автообновление
setInterval(() => {
    loadDataFromGitHub();
}, 10000);
