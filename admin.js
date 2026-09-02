// Загрузка текущих настроек
window.onload = function() {
    if (localStorage.getItem('voteData')) {
        const data = JSON.parse(localStorage.getItem('voteData'));
        document.getElementById('vote-date').value = data.date;
        document.getElementById('left-option').value = data.leftOption;
        document.getElementById('right-option').value = data.rightOption;
    } else {
        document.getElementById('vote-date').value = new Date().toISOString().split('T')[0];
    }
};

// Сохранение настроек
function saveSettings() {
    const password = document.getElementById('admin-password').value;
    
    // Простая проверка пароля (в реальном проекте используйте серверную проверку!)
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
    alert('✅ Настройки сохранены!');
}

// Сброс голосов
function resetVotes() {
    if (confirm('⚠️ Вы уверены, что хотите сбросить все голоса?')) {
        if (localStorage.getItem('voteData')) {
            const data = JSON.parse(localStorage.getItem('voteData'));
            data.votes1 = 0;
            data.votes2 = 0;
            localStorage.setItem('voteData', JSON.stringify(data));
            alert('✅ Голоса сброшены!');
        }
    }
}

// Экспорт данных
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