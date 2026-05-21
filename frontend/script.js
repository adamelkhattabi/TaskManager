let currentFilter = 'all';
let allTasks = [];

// Charger les tâches
async function loadTasks() {
    try {
        const response = await fetch('/api/tasks');
        if (response.status === 401) {
            window.location.href = '/login.html';
            return;
        }
        allTasks = await response.json();
        displayTasks();
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Afficher les tâches selon le filtre
function displayTasks() {
    let filteredTasks = allTasks;
    
    if (currentFilter !== 'all') {
        filteredTasks = allTasks.filter(task => task.status === currentFilter);
    }
    
    const taskList = document.getElementById('taskList');
    
    if (filteredTasks.length === 0) {
        taskList.innerHTML = '<div class="task-item">Aucune tâche à afficher</div>';
        return;
    }
    
    taskList.innerHTML = filteredTasks.map(task => `
        <div class="task-item ${task.status === 'completed' ? 'completed' : ''}" data-id="${task.id}">
            <div class="task-content">
                <div class="task-title">${escapeHtml(task.title)}</div>
                ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
                <small>Créée le ${new Date(task.created_at).toLocaleDateString('fr-FR')}</small>
            </div>
            <div class="task-actions">
                ${task.status !== 'completed' ? 
                    `<button class="btn-complete" onclick="completeTask(${task.id})">✓ Terminer</button>` : 
                    `<button class="btn-complete" onclick="uncompleteTask(${task.id})">↺ Rouvrir</button>`
                }
                <button class="btn-edit" onclick="editTask(${task.id})">✎ Modifier</button>
                <button class="btn-delete" onclick="deleteTask(${task.id})">🗑 Supprimer</button>
            </div>
        </div>
    `).join('');
}

// Protection XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Ajouter une tâche
async function addTask() {
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDesc').value.trim();
    
    if (!title) {
        alert('Le titre est requis');
        return;
    }
    
    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description })
        });
        
        if (response.ok) {
            document.getElementById('taskTitle').value = '';
            document.getElementById('taskDesc').value = '';
            await loadTasks();
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Marquer comme terminée
async function completeTask(id) {
    await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
    });
    await loadTasks();
}

// Rouvrir une tâche
async function uncompleteTask(id) {
    await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending' })
    });
    await loadTasks();
}

// Modifier une tâche
async function editTask(id) {
    const task = allTasks.find(t => t.id === id);
    const newTitle = prompt('Nouveau titre :', task.title);
    const newDescription = prompt('Nouvelle description :', task.description);
    
    if (newTitle !== null) {
        await fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                title: newTitle, 
                description: newDescription || '' 
            })
        });
        await loadTasks();
    }
}

// Supprimer une tâche
async function deleteTask(id) {
    if (confirm('Supprimer cette tâche ?')) {
        await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
        await loadTasks();
    }
}

// Déconnexion
async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login.html';
}

// Afficher le nom d'utilisateur
async function loadUserInfo() {
    const response = await fetch('/api/auth/me');
    const data = await response.json();
    if (data.authenticated) {
        document.getElementById('username').textContent = data.user.username;
    }
}

// Initialisation au chargement de la page
if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    document.addEventListener('DOMContentLoaded', () => {
        loadTasks();
        loadUserInfo();
        
        document.getElementById('addTaskBtn').addEventListener('click', addTask);
        document.getElementById('logoutBtn').addEventListener('click', logout);
        document.getElementById('taskTitle').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTask();
        });
        
        // Filtres
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                currentFilter = e.target.dataset.filter;
                displayTasks();
            });
        });
    });
}