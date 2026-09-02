const GITHUB_OWNER = 'egorlehanov600-ux';
const REPO_NAME = 'Roblox-Game';
const BRANCH_NAME = 'main';
const FILE_PATH = 'data.json';

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

async function getLatestSha(token) {
    const response = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=${BRANCH_NAME}&t=${Date.now()}`,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Cache-Control': 'no-cache'
            }
        }
    );
    
    if (response.ok) {
        const data = await response.json();
        return data.sha;
    }
    return null;
}

async function tryUpload(token, sha, content) {
    const putData = {
        message: `📊 Обновление от ${new Date().toLocaleString('ru-RU')}`,
        content: content,
        branch: BRANCH_NAME
    };
    
    if (sha) {
        putData.sha = sha;
    }
    
    const response = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?t=${Date.now()}`,
        {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify(putData)
        }
    );
    
    return response;
}

async function saveAndPushToGitHub() {
    const password = document.getElementById('admin-password').value;
    const token = document.getElementById('github-token').value.trim();
    
    if (password !== 'admin123') {
        alert('❌ Неверный пароль!');
        return;
    }
    
    if (!token) {
        alert('⚠️ Введи GitHub token!');
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
    localStorage.setItem('githubToken', token);
    
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(newData, null, 2))));
    
    // Попытка 1: получаем SHA и сразу отправляем
    showStatus(' Загрузка на GitHub (попытка 1)...');
    
    try {
        let sha = await getLatestSha(token);
        let response = await tryUpload(token, sha, content);
        
        // Если SHA не совпал — пробуем ещё раз с новым SHA
        if (!response.ok) {
            const error = await response.json();
            
            if (error.message && error.message.includes('does not match')) {
                showStatus('⏳ SHA устарел, пробую ещё раз (попытка 2)...');
                
                // Ждём 1 секунду и получаем свежий SHA
                await new Promise(r => setTimeout(r, 1000));
                sha = await getLatestSha(token);
                response = await tryUpload(token, sha, content);
            }
        }
        
        if (response.ok) {
            const result = await response.json();
            showStatus(`✅ Загружено! <a href="${result.commit.html_url}" target="_blank" style="color: #fff; text-decoration: underline;">Посмотреть</a>`);
            
            setTimeout(() => {
                if (confirm('✅ Готово! Открыть сайт?')) {
                    window.open(`https://${GITHUB_OWNER}.github.io/${REPO_NAME}/`, '_blank');
                }
            }, 1500);
        } else {
            const error = await response.json();
            showStatus(`❌ Ошибка: ${error.message}`, true);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showStatus(`❌ Ошибка: ${error.message}`, true);
    }
}

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
