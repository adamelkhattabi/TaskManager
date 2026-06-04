// Vérifier si déjà connecté
async function checkAuth() {
    const response = await fetch('/api/auth/me');
    const data = await response.json();
    
    if (data.authenticated) {
        window.location.href = '/';
    }
}

// Gestion de l'inscription
if (document.getElementById('registerForm')) {
    const form = document.getElementById('registerForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const messageDiv = document.getElementById('message');
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                messageDiv.className = 'message success';
                messageDiv.textContent = 'Inscription réussie ! Redirection...';
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                messageDiv.className = 'message error';
                messageDiv.textContent = data.error;
            }
        } catch (error) {
            messageDiv.className = 'message error';
            messageDiv.textContent = 'Erreur de connexion';
        }
    });
    
    checkAuth();
}

// Gestion de la connexion
if (document.getElementById('loginForm')) {
    const form = document.getElementById('loginForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const messageDiv = document.getElementById('message');
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                messageDiv.className = 'message success';
                messageDiv.textContent = 'Connexion réussie ! Redirection...';
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                messageDiv.className = 'message error';
                messageDiv.textContent = data.error;
            }
        } catch (error) {
            messageDiv.className = 'message error';
            messageDiv.textContent = 'Erreur de connexion';
        }
    });
    
    checkAuth();
}