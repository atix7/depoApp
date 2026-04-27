// =========================================
// users.js – Felhasználók CRUD (csak ADMIN)
// =========================================

async function loadUsers() {
    if (!Auth.isAdmin()) {
        showToast('Csak adminok férnek hozzá!', 'error');
        return;
    }
    try {
        const users = await api.getUsers();
        renderUsersTable(users);
    } catch (err) {
        showToast('Hiba a felhasználók betöltésekor', 'error');
    }
}

function renderUsersTable(users) {
    const tbody = document.getElementById('users-tbody');
    tbody.innerHTML = users.length === 0
        ? '<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Nincs felhasználó</td></tr>'
        : users.map(u => `
            <tr>
                <td style="font-family:var(--font-mono);font-size:0.8rem">${u.id}</td>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td>
                    <span class="badge badge-${u.role === 'ADMIN' ? 'admin' : 'worker'}">
                        ${u.role}
                    </span>
                </td>
                <td>
                    <div class="actions">
                        <button class="btn-secondary btn-sm" onclick="editUser(${u.id})">Szerk.</button>
                        <button class="btn-danger btn-sm" onclick="deleteUser(${u.id}, '${u.name}')">Töröl</button>
                    </div>
                </td>
            </tr>
        `).join('');
}

function userFormHTML(u = {}, isEdit = false) {
    return `
        <div class="form-group">
            <label>Név</label>
            <input type="text" id="f-uname" value="${u.name ?? ''}" placeholder="Teljes név">
        </div>
        <div class="form-group">
            <label>Email</label>
            <input type="email" id="f-uemail" value="${u.email ?? ''}" placeholder="email@example.com">
        </div>
        <div class="form-group">
            <label>${isEdit ? 'Új jelszó (hagyd üresen, ha nem változtatod)' : 'Jelszó'}</label>
            <input type="password" id="f-upassword" placeholder="••••••••">
        </div>
        <div class="form-group">
            <label>Szerepkör</label>
            <select id="f-urole">
                <option value="ADMIN"  ${u.role === 'ADMIN'  ? 'selected' : ''}>Admin</option>
                <option value="WORKER" ${u.role === 'WORKER' ? 'selected' : ''}>Worker</option>
            </select>
        </div>
    `;
}

function getUserFormData() {
    return {
        name:     document.getElementById('f-uname').value.trim(),
        email:    document.getElementById('f-uemail').value.trim(),
        password: document.getElementById('f-upassword').value,
        role:     document.getElementById('f-urole').value
    };
}

// Új felhasználó
document.getElementById('btn-add-user').addEventListener('click', () => {
    openModal('Új felhasználó', userFormHTML(), async () => {
        try {
            await api.createUser(getUserFormData());
            closeModal();
            showToast('Felhasználó létrehozva!');
            loadUsers();
        } catch (err) {
            showToast('Hiba: ' + err.message, 'error');
        }
    });
});

// Szerkesztés
async function editUser(id) {
    try {
        const users = await api.getUsers();
        const u = users.find(u => u.id === id);
        openModal('Felhasználó szerkesztése', userFormHTML(u, true), async () => {
            try {
                await api.updateUser(id, getUserFormData());
                closeModal();
                showToast('Felhasználó frissítve!');
                loadUsers();
            } catch (err) {
                showToast('Hiba: ' + err.message, 'error');
            }
        });
    } catch (err) {
        showToast('Nem sikerült betölteni a felhasználót', 'error');
    }
}

// Törlés
function deleteUser(id, name) {
    openModal(
        'Törlés megerősítése',
        `<p>Biztosan törlöd: <strong>${name}</strong>?</p>`,
        async () => {
            try {
                await api.deleteUser(id);
                closeModal();
                showToast('Felhasználó törölve!');
                loadUsers();
            } catch (err) {
                showToast('Hiba: ' + err.message, 'error');
            }
        }
    );
}