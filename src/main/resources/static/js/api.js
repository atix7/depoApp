// =========================================
// api.js – Központi fetch helper + token kezelés
// =========================================

const API_BASE = 'http://localhost:8080';

// ---- Token kezelés ----
const Auth = {
    getToken()  { return localStorage.getItem('jwt_token'); },
    getEmail()  { return localStorage.getItem('jwt_email'); },
    getRole()   { return localStorage.getItem('jwt_role'); },
    isAdmin()   { return Auth.getRole() === 'ROLE_ADMIN'; },
    isLoggedIn(){ return !!Auth.getToken(); },

    save(token, email, role) {
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('jwt_email', email);
        localStorage.setItem('jwt_role', role);
    },

    clear() {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('jwt_email');
        localStorage.removeItem('jwt_role');
    }
};

// ---- Alap fetch wrapper ----
async function apiFetch(path, options = {}) {
    const token = Auth.getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };

    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers
    });

    if (response.status === 401) {
        Auth.clear();
        showLogin();
        throw new Error('Unauthorized – bejelentkezés szükséges');
    }

    if (response.status === 403) {
        throw new Error('Hozzáférés megtagadva');
    }

    if (response.status === 204) return null;

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP ${response.status}`);
    }

    return response.json();
}

// ---- API végpontok ----
const api = {
    // Auth
    login: (email, password) =>
        apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        }),

    // Termékek
    getProducts:      ()     => apiFetch('/products'),
    getProduct:       (id)   => apiFetch(`/products/${id}`),
    getLowStock:      ()     => apiFetch('/products/low-stock'),
    createProduct:    (data) => apiFetch('/products', { method: 'POST', body: JSON.stringify(data) }),
    updateProduct:    (id, data) => apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteProduct:    (id)   => apiFetch(`/products/${id}`, { method: 'DELETE' }),

    // Kategóriák
    getCategories:    ()     => apiFetch('/categories'),
    createCategory:   (data) => apiFetch('/categories', { method: 'POST', body: JSON.stringify(data) }),
    updateCategory:   (id, data) => apiFetch(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteCategory:   (id)   => apiFetch(`/categories/${id}`, { method: 'DELETE' }),

    // Raktárak
    getWarehouses:    ()     => apiFetch('/warehouses'),
    createWarehouse:  (data) => apiFetch('/warehouses', { method: 'POST', body: JSON.stringify(data) }),
    updateWarehouse:  (id, data) => apiFetch(`/warehouses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteWarehouse:  (id)   => apiFetch(`/warehouses/${id}`, { method: 'DELETE' }),

    // Készlet
    getStockByWarehouse: (wId) => apiFetch(`/stock/warehouse/${wId}`),
    getStockByProduct:   (pId) => apiFetch(`/stock/product/${pId}`),
    stockIn:  (productId, warehouseId, userId, quantity, note) =>
        apiFetch(`/stock/in?productId=${productId}&warehouseId=${warehouseId}&userId=${userId}&quantity=${quantity}${note ? '&note=' + encodeURIComponent(note) : ''}`, { method: 'POST' }),
    stockOut: (productId, warehouseId, userId, quantity, note) =>
        apiFetch(`/stock/out?productId=${productId}&warehouseId=${warehouseId}&userId=${userId}&quantity=${quantity}${note ? '&note=' + encodeURIComponent(note) : ''}`, { method: 'POST' }),

    // Felhasználók (csak ADMIN)
    getUsers:     ()     => apiFetch('/users'),
    createUser:   (data) => apiFetch('/users', { method: 'POST', body: JSON.stringify(data) }),
    updateUser:   (id, data) => apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteUser:   (id)   => apiFetch(`/users/${id}`, { method: 'DELETE' }),
};

// ---- Toast értesítő ----
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast${type === 'error' ? ' error' : ''}`;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

// ---- Modal helpers ----
function openModal(title, bodyHTML, onConfirm) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHTML;
    document.getElementById('modal-overlay').classList.remove('hidden');

    const confirmBtn = document.getElementById('modal-confirm');
    confirmBtn.onclick = onConfirm;
}

function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('modal-body').innerHTML = '';
}

document.getElementById('modal-close')?.addEventListener('click', closeModal);
document.getElementById('modal-cancel')?.addEventListener('click', closeModal);
document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
});
