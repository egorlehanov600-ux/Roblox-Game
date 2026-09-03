const GITHUB_OWNER = 'egorlehanov600-ux';
const REPO_NAME = 'Roblox-Game';
const BRANCH_NAME = 'main';
const FILE_PATH = 'data.json';

let tournamentData = { days: [] };

window.onload = function() {
    if (localStorage.getItem('tournamentData')) {
        tournamentData = JSON.parse(localStorage.getItem('tournamentData'));
    }
    
    if (localStorage.getItem('githubToken')) {
        document.getElementById('github-token').value = localStorage.getItem('githubToken');
    }
    
    const maxDay = tournamentData.days.length > 0 
        ? Math.max(...tournamentData.days.map(d => d.day)) 
        : 0;
    document.getElementById('day-number').value = maxDay + 1;
    
    console.log('Админка загружена!');
};

function addDay() {
    const password = document.getElementById('admin-password').value;
    
    if (password !== 'admin123') {
        alert('❌ Неверный пароль!');
        return;
    }
    
    const dayNumber = parseInt(document.getElementById('day-number').value);
    const leftOption = document.getElementById('left-option').value.trim();
    const rightOption = document.getElementById('right-option').value.trim();
    
    if (!dayNumber || !leftOption || !rightOption) {
        alert('⚠️ Заполни все поля!');
        return;
    }
    
    const existingDay = tournamentData.days.find(d => d.day === dayNumber);
    
    if (existingDay) {
        existingDay.leftOption = leftOption;
        existingDay.rightOption = rightOption;
        existingDay.status = 'active';
        existingDay.winner = null;
        existingDay.votes1 = 0;
        existingDay.votes2 = 0;
    } else {
        tournamentData.days.push({
            day: dayNumber,
            leftOption: leftOption,
            rightOption: rightOption,
            votes1: 0,
            votes2: 0,
            status: 'active',
            winner: null
        });
    }
    
    localStorage.setItem('tournamentData', JSON.stringify(tournamentData));
    alert('✅ День ' + dayNumber + ' добавлен!');
    
    document.getElementById('left-option').value = '';
    document.getElementById('right-option').value = '';
    document.getElementById('day-number').value = dayNumber + 1;
}

function finishDay() {
    const password = document.getElementById('admin-password').value;
    
    if (password !== 'admin123') {
        alert('❌ Неверный пароль!');
        return;
    }
    
    const dayNumber = parseInt(document.getElementById('day-number').value);
    const day = tournamentData.days.find(d => d.day === dayNumber);
    
    if (!day) {
        alert('⚠️ День не найден!');
        return;
    }
    
    if (day.votes1 > day.votes2) {
        day.winner = 'left';
    } else if (day.votes2 > day.votes1) {
        day.winner = 'right';
    } else {
        day.winner = 'draw';
    }
    
    day.status = 'finished';
    
    localStorage.setItem('tournamentData', JSON.stringify(tournamentData));
    alert('🏁 День ' + dayNumber + ' завершён!');
}

async function uploadToGitHub() {
    const token = document.getElementById('github-token').value.trim();
    
    if (!token) {
        alert('⚠️ Введи GitHub token!');
        return;
    }
    
    const statusDiv = document.getElementById('status');
    statusDiv.innerHTML = '⏳ Загрузка...';
    statusDiv.style.display = 'block';
    statusDiv.style.background = '#28a745';
    statusDiv.style.color = 'white';
    statusDiv.style.padding = '15px';
    statusDiv.style.borderRadius = '8px';
    statusDiv.style.marginTop = '20px';
    statusDiv.style.textAlign = 'center';
    
    try {
        const getResponse = await fetch(
            'https://api.github.com/repos/' + GITHUB_OWNER + '/' + REPO_NAME + '/contents/' + FILE_PATH + '?ref=' + BRANCH_NAME + '&t=' + Date.now(),
            {
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Accept': 'application/vnd.github.v3+json',
                    'Cache-Control': 'no-cache'
                }
            }
        );
        
        let sha = null;
        if (getResponse.ok) {
            const fileData = await getResponse.json();
            sha = fileData.sha;
        }
        
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(tournamentData, null, 2))));
        
        const putData = {
            message: '📊 Обновление от ' + new Date().toLocaleString('ru-RU'),
            content: content,
            branch: BRANCH_NAME
        };
        
        if (sha) {
            putData.sha = sha;
        }
        
        const putResponse = await fetch(
            'https://api.github.com/repos/' + GITHUB_OWNER + '/' + REPO_NAME + '/contents/' + FILE_PATH + '?t=' + Date.now(),
            {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                body: JSON.stringify(putData)
            }
        );
        
        if (putResponse.ok) {
            const result = await putResponse.json();
            statusDiv.innerHTML = '✅ Загружено!';
            statusDiv.style.background = '#28a745';
            localStorage.setItem('githubToken', token);
        } else {
            const error = await putResponse.json();
            statusDiv.innerHTML = '❌ Ошибка: ' + error.message;
            statusDiv.style.background = '#f5576c';
        }
    } catch (error) {
        console.error('Ошибка:', error);
        statusDiv.innerHTML = '❌ Ошибка: ' + error.message;
        statusDiv.style.background = '#f5576c';
    }
    
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 5000);
}
