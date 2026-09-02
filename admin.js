// Конфигурация
const GITHUB_OWNER = 'egorlehanov600-ux';
const REPO_NAME = 'Roblox-Game';
const BRANCH_NAME = 'main';
const FILE_PATH = 'data.json';

// Загрузка при старте
window.onload = function() {
    if (localStorage.getItem('voteData')) {
        const data = JSON.parse(localStorage.getItem('voteData'));
        document.getElementById('vote-date').value = data.date;
        document.getElementById('left-option').value = data.leftOption;
        document.getElementById('right-option').value = data.rightOption;
    } else {
        document.getElementById('vote-date').value = new Date().toISOString().split('T')[0];
    }
    
    if (localStorage.getItem('githubToken')) {
        document.getElementById('github-token').value = localStorage.getItem('githubToken');
    }
};

// Показ статуса
function showStatus(message, isError = false) {
    const statusDiv = document.getElementById('status');
    statusDiv.innerHTML = message;
    statusDiv.style.display = 'block';
    statusDiv.style.padding = '15px';
    statusDiv.style.borderRadius = '8px';
    statusDiv.style.marginTop = '20px';
    statusDiv.style.textAlign = 'center';
    statusDiv.style.fontSize = '1.1em';
    
    if (isError) {
        statusDiv.style.background = '#f5576c';
        statusDiv.style.color = 'white';
    } else {
        statusDiv.style.background = '#28a745';
        statusDiv.style.color = 'white';
    }
    
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 8000);
}

// Получить SHA файла
async function getFileSha(token) {
    try {
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=${BRANCH_NAME}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (response.ok) {
            const data = await response.json();
            return data.sha;
        }
        return null;
    } catch (error) {
        console.error('Ошибка получения SHA:', error);
        return null;
    }
}

// Загрузить на GitHub
async function pushToGitHub(content, token) {
    showStatus('⏳ Загрузка на GitHub...');
    
    try {
        const sha = await getFileSha(token);
        
        const requestData = {
            message: ` Обновление голосования от ${new Date().toLocaleDateString('ru-RU')}`,
            content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))),
            branch: BRANCH_NAME
        };
        
        if (sha) {
            requestData.sha = sha;
        }
        
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            }
        );
        
        if (response.ok) {
            const result = await response.json();
            showStatus(`✅ Загружено на GitHub! <a href="${result.commit.html_url}" target="_blank" style="color: #fff; text-decoration: underline;">Посмотреть</a>`);
            
            localStorage.setItem('githubToken', token);
            
            setTimeout(() => {
                if (confirm('✅ Готово! Открыть сайт?')) {
                    window.open(`https://${GITHUB_OWNER}.github.io/${REPO_NAME}/`, '_blank');
                }
            }, 1500);
            
            return true;
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Ошибка');
        }
    } catch (error) {
        console.error('GitHub API error:', error);
        showStatus(`❌ Ошибка: ${error.message}`, true);
        return false;
    }
}

// Сохранить и загрузить
async function saveAndPushToGitHub() {
    const password = document.getElementById('admin-password').value;
    const token = document.getElementById('github-token').value.trim();
    
    if (password !== 'admin123') {
        alert('❌ Неверный пароль!');
        return;
    }
    
    if (!token) {
        alert('️ Введи GitHub token!');
        return;
    }
    
    if (!token.startsWith('ghp_')) {
        alert('⚠️ Токен должен начинаться с ghp_');
        return;
    }
    
    const newData = {
        date: document.getElementById('vote-date').value,
        leftOption: document.getElementById('left-option').value,
        rightOption: document.getElementById('right-option').value,
        votes1: 0,
        votes2: 0
    };
    
    localStorage.setItem('voteData', JSON.stringify(newData));
    
    const success = await pushToGitHub(newData, token);
    
    if (success) {
        setTimeout(() => {
            location.reload();
        }, 3000);
    }
}

// Сохранить локально
function saveSettings() {
    const password = document.getElementById('admin-password').value;
    
    if (password !== 'admin123') {
        alert('❌ Неверный пароль!');
        return;
    }
    
    const newData = {
        date: document.getElementById('vote-date').value,
        leftOption: document.getElementById('left-option').value,
        rightOption: document.getElementById('right-option').value,
        votes1: 0,
        votes2: 0
    };
    
    localStorage.setItem('voteData', JSON.stringify(newData));
    alert('✅ Сохранено локально!');
}

// Сброс голосов
function resetVotes() {
    if (confirm('⚠️ Сбросить все голоса?')) {
        if (localStorage.getItem('voteData')) {
            const data = JSON.parse(localStorage.getItem('voteData'));
            data.votes1 = 0;
            data.votes2 = 0;
            localStorage.setItem('voteData', JSON.stringify(data));
            alert('✅ Голоса сброшены!');
        }
    }
}

// Экспорт
function exportData() {
    const dataStr = localStorage.getItem('voteData');
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data.json';
    link.click();
    URL.revokeObjectURL(url);
}
