// =========================================
// auth.js – Bejelentkezés / Kilépés
// =========================================

function showLogin() {
    document.getElementById('login-page').classList.add('active');
    document.getElementById('login-page').classList.remove('hidden');
    document.getElementById('dashboard-page').classList.add('hidden');
    document.getElementById('dashboard-page').classList.remove('active');
}

function showDashboard() {
    document.getElementById('login-page').classList.remove('active');
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('dashboard-page').classList.remove('hidden');
    document.getElementById('dashboard-page').classList.add('active');

    // Felhasználói adatok megjelenítése
    document.getElementById('sidebar-email').textContent = Auth.getEmail();
    const role = Auth.getRole();
    document.getElementById('sidebar-role').textContent =
        role === 'ROLE_ADMIN' ? 'Admin' : 'Worker';

    // Admin-only menüpontok
    document.querySelectorAll('.admin-only').forEach(el => {
        if (Auth.isAdmin()) el.classList.remove('hidden');
        else el.classList.add('hidden');
    });

    // Áttekintő oldal betöltése
    navigateTo('overview');
}

// Login form submit
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorEl  = document.getElementById('login-error');
    const btnText  = document.getElementById('login-btn').querySelector('.btn-text');
    const btnLoader= document.getElementById('login-btn').querySelector('.btn-loader');

    errorEl.classList.add('hidden');
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');

    try {
        const data = await api.login(email, password);
        Auth.save(data.token, data.email, data.role);
        showDashboard();
    } catch (err) {
        errorEl.classList.remove('hidden');
    } finally {
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
    }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    Auth.clear();
    showLogin();
});

// Oldal betöltéskor ellenőrzés
if (Auth.isLoggedIn()) {
    // Token érvényességének ellenőrzése
    apiFetch('/auth/me')
        .then(() => showDashboard())
        .catch(() => {
            Auth.clear();
            showLogin();
        });
} else {
    showLogin();
}