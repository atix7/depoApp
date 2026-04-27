// =========================================
// warehouses.js – Raktárak CRUD
// =========================================

async function loadWarehouses() {
    try {
        const warehouses = await api.getWarehouses();
        renderWarehousesTable(warehouses);
    } catch (err) {
        showToast('Hiba a raktárak betöltésekor', 'error');
    }
}

function renderWarehousesTable(warehouses) {
    const tbody = document.getElementById('warehouses-tbody');
    tbody.innerHTML = warehouses.length === 0
        ? '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">Nincs raktár</td></tr>'
        : warehouses.map(w => `
            <tr>
                <td style="font-family:var(--font-mono);font-size:0.8rem">${w.id}</td>
                <td>${w.name}</td>
                <td>${w.location}</td>
                <td>
                    <div class="actions">
                        <button class="btn-secondary btn-sm" onclick="editWarehouse(${w.id}, '${w.name}', '${w.location}')">Szerk.</button>
                        <button class="btn-danger btn-sm" onclick="deleteWarehouse(${w.id}, '${w.name}')">Töröl</button>
                    </div>
                </td>
            </tr>
        `).join('');
}

function warehouseFormHTML(w = {}) {
    return `
        <div class="form-group">
            <label>Név</label>
            <input type="text" id="f-wname" value="${w.name ?? ''}" placeholder="pl. Főraktár">
        </div>
        <div class="form-group">
            <label>Helyszín</label>
            <input type="text" id="f-wlocation" value="${w.location ?? ''}" placeholder="pl. Budapest">
        </div>
    `;
}

function getWarehouseFormData() {
    return {
        name:     document.getElementById('f-wname').value.trim(),
        location: document.getElementById('f-wlocation').value.trim()
    };
}

// Új raktár
document.getElementById('btn-add-warehouse').addEventListener('click', () => {
    openModal('Új raktár', warehouseFormHTML(), async () => {
        try {
            await api.createWarehouse(getWarehouseFormData());
            closeModal();
            showToast('Raktár létrehozva!');
            loadWarehouses();
        } catch (err) {
            showToast('Hiba: ' + err.message, 'error');
        }
    });
});

// Szerkesztés
function editWarehouse(id, name, location) {
    openModal('Raktár szerkesztése', warehouseFormHTML({ name, location }), async () => {
        try {
            await api.updateWarehouse(id, getWarehouseFormData());
            closeModal();
            showToast('Raktár frissítve!');
            loadWarehouses();
        } catch (err) {
            showToast('Hiba: ' + err.message, 'error');
        }
    });
}

// Törlés
function deleteWarehouse(id, name) {
    openModal(
        'Törlés megerősítése',
        `<p>Biztosan törlöd: <strong>${name}</strong>?</p>`,
        async () => {
            try {
                await api.deleteWarehouse(id);
                closeModal();
                showToast('Raktár törölve!');
                loadWarehouses();
            } catch (err) {
                showToast('Hiba: ' + err.message, 'error');
            }
        }
    );
}