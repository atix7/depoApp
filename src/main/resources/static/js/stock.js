// =========================================
// stock.js – Készlet + Mozgások
// =========================================

let warehousesList = [];

async function loadStock() {
    try {
        const warehouses = await api.getWarehouses();
        warehousesList = warehouses;

        // Raktár szűrő feltöltése
        const filter = document.getElementById('stock-warehouse-filter');
        filter.innerHTML = '<option value="">– Összes –</option>' +
            warehouses.map(w => `<option value="${w.id}">${w.name}</option>`).join('');

        // Alapból az első raktár készlete
        if (warehouses.length > 0) {
            filter.value = warehouses[0].id;
            await loadStockByWarehouse(warehouses[0].id);
        }
    } catch (err) {
        showToast('Hiba a készlet betöltésekor', 'error');
    }
}

async function loadStockByWarehouse(warehouseId) {
    try {
        const items = await api.getStockByWarehouse(warehouseId);
        renderStockTable(items);
    } catch (err) {
        showToast('Hiba a készlet betöltésekor', 'error');
    }
}

function renderStockTable(items) {
    const tbody = document.getElementById('stock-tbody');
    tbody.innerHTML = items.length === 0
        ? '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">Nincs készlet adat</td></tr>'
        : items.map(i => `
            <tr>
                <td>${i.productName}</td>
                <td style="font-family:var(--font-mono);font-size:0.8rem">${i.productSku}</td>
                <td>${i.warehouseName}</td>
                <td style="font-family:var(--font-mono);font-weight:600">${i.quantity}</td>
            </tr>
        `).join('');
}

// Szűrés gomb
document.getElementById('stock-warehouse-filter').addEventListener('change', async (e) => {
    const warehouseId = e.target.value;
    if (!warehouseId) return;
    await loadStockByWarehouse(warehouseId);
});

// Bevételezés / Kivételezés közös form
// Bevételezés / Kivételezés közös form
async function stockMovementFormHTML(type) {
    const products = await api.getProducts();
    const productOptions = products.map(p =>
        `<option value="${p.id}">${p.name} (${p.sku})</option>`
    ).join('');
    const warehouseOptions = warehousesList.map(w =>
        `<option value="${w.id}">${w.name}</option>`
    ).join('');

    return `
        <div class="form-group">
            <label>Termék</label>
            <select id="f-s-productid">
                <option value="">– Válassz terméket –</option>
                ${productOptions}
            </select>
        </div>
        <div class="form-group">
            <label>Raktár</label>
            <select id="f-s-warehouseid">
                <option value="">– Válassz raktárt –</option>
                ${warehouseOptions}
            </select>
        </div>
        <div class="form-group">
            <label>Mennyiség</label>
            <input type="number" id="f-s-quantity" placeholder="0" min="1">
        </div>
        <div class="form-group">
            <label>Megjegyzés (opcionális)</label>
            <input type="text" id="f-s-note" placeholder="pl. Szállítólevél #123">
        </div>
        ${type === 'OUT' ? `
        <p style="color:var(--danger);font-size:0.8rem">
            ⚠ Kivételezésnél ellenőrizd, hogy van elég készlet.
        </p>` : ''}
    `;
}
function getStockFormData() {
    return {
        productId:   parseInt(document.getElementById('f-s-productid').value),
        warehouseId: parseInt(document.getElementById('f-s-warehouseid').value),
        quantity:    parseInt(document.getElementById('f-s-quantity').value),
        note:        document.getElementById('f-s-note').value.trim()
    };
}

// Bevételezés
document.getElementById('btn-stock-in').addEventListener('click', async () => {
    const formHTML = await stockMovementFormHTML('IN');
    openModal('Bevételezés', formHTML, async () => {
        const { productId, warehouseId, quantity, note } = getStockFormData();
        if (!productId || !warehouseId || !quantity) {
            showToast('Töltsd ki az összes mezőt!', 'error');
            return;
        }
        try {
            const userId = await getCurrentUserId();
            await api.stockIn(productId, warehouseId, userId, quantity, note);
            closeModal();
            showToast('Bevételezés sikeres!');
            await loadStock();
        } catch (err) {
            showToast('Hiba: ' + err.message, 'error');
        }
    });
});


// Kivételezés
document.getElementById('btn-stock-out').addEventListener('click', async () => {
    const formHTML = await stockMovementFormHTML('OUT');
    openModal('Kivételezés', formHTML, async () => {
        const { productId, warehouseId, quantity, note } = getStockFormData();
        if (!productId || !warehouseId || !quantity) {
            showToast('Töltsd ki az összes mezőt!', 'error');
            return;
        }
        try {
            const userId = await getCurrentUserId();
            await api.stockOut(productId, warehouseId, userId, quantity, note);
            closeModal();
            showToast('Kivételezés sikeres!');
            await loadStock();
        } catch (err) {
            const msg = err.message.includes('Insufficient stock')
                ? 'Nincs elég készlet a kivételezéshez!'
                : 'Hiba: ' + err.message;
            showToast(msg, 'error');
        }
    });
});

// Bejelentkezett user ID-jének lekérése email alapján
async function getCurrentUserId() {
    const me = await apiFetch('/auth/me');
    return me.id;
}