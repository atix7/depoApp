// =========================================
// categories.js – Kategóriák CRUD
// =========================================

async function loadCategories() {
    try {
        const categories = await api.getCategories();
        renderCategoriesTable(categories);
    } catch (err) {
        showToast('Hiba a kategóriák betöltésekor', 'error');
    }
}

function renderCategoriesTable(categories) {
    const tbody = document.getElementById('categories-tbody');
    tbody.innerHTML = categories.length === 0
        ? '<tr><td colspan="3" style="text-align:center;color:var(--text-muted)">Nincs kategória</td></tr>'
        : categories.map(c => `
            <tr>
                <td style="font-family:var(--font-mono);font-size:0.8rem">${c.id}</td>
                <td>${c.name}</td>
                <td>
                    <div class="actions">
                        <button class="btn-secondary btn-sm" onclick="editCategory(${c.id}, '${c.name}')">Szerk.</button>
                        <button class="btn-danger btn-sm" onclick="deleteCategory(${c.id}, '${c.name}')">Töröl</button>
                    </div>
                </td>
            </tr>
        `).join('');
}

function categoryFormHTML(c = {}) {
    return `
        <div class="form-group">
            <label>Kategória neve</label>
            <input type="text" id="f-cname" value="${c.name ?? ''}" placeholder="pl. Elektronika">
        </div>
    `;
}

// Új kategória
document.getElementById('btn-add-category').addEventListener('click', () => {
    openModal('Új kategória', categoryFormHTML(), async () => {
        try {
            await api.createCategory({
                name: document.getElementById('f-cname').value.trim()
            });
            closeModal();
            showToast('Kategória létrehozva!');
            loadCategories();
        } catch (err) {
            showToast('Hiba: ' + err.message, 'error');
        }
    });
});

// Szerkesztés
function editCategory(id, name) {
    openModal('Kategória szerkesztése', categoryFormHTML({ name }), async () => {
        try {
            await api.updateCategory(id, {
                name: document.getElementById('f-cname').value.trim()
            });
            closeModal();
            showToast('Kategória frissítve!');
            loadCategories();
        } catch (err) {
            showToast('Hiba: ' + err.message, 'error');
        }
    });
}

// Törlés
function deleteCategory(id, name) {
    openModal(
        'Törlés megerősítése',
        `<p>Biztosan törlöd: <strong>${name}</strong>?</p>
         <p style="color:var(--text-muted);font-size:0.8rem;margin-top:0.5rem">
             ⚠ Ha vannak termékek ebben a kategóriában, a törlés sikertelen lesz.
         </p>`,
        async () => {
            try {
                await api.deleteCategory(id);
                closeModal();
                showToast('Kategória törölve!');
                loadCategories();
            } catch (err) {
                showToast('Nem törölhető – valószínűleg van hozzá rendelt termék', 'error');
                closeModal();
            }
        }
    );
}