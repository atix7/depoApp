// =========================================
// app.js – Navigáció + Áttekintés oldal
// =========================================

// ---- Navigáció ----
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const target = item.dataset.page;
        navigateTo(target);
    });
});

function navigateTo(page) {
    // Nav aktív állapot
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');

    // Szekció váltás
    document.querySelectorAll('.content-section').forEach(s => {
        s.classList.remove('active');
        s.classList.add('hidden');
    });
    const section = document.getElementById(`section-${page}`);
    if (section) {
        section.classList.remove('hidden');
        section.classList.add('active');
    }

    // Adatok betöltése
    switch (page) {
        case 'overview':    loadOverview();    break;
        case 'products':    loadProducts();    break;
        case 'stock':       loadStock();       break;
        case 'warehouses':  loadWarehouses();  break;
        case 'categories':  loadCategories();  break;
        case 'users':       loadUsers();       break;
    }
}

// ---- Áttekintés ----
async function loadOverview() {
    try {
        const [products, warehouses, categories, lowStock] = await Promise.all([
            api.getProducts(),
            api.getWarehouses(),
            api.getCategories(),
            api.getLowStock()
        ]);

        document.getElementById('stat-products').textContent   = products.length;
        document.getElementById('stat-warehouses').textContent = warehouses.length;
        document.getElementById('stat-categories').textContent = categories.length;
        document.getElementById('stat-lowstock').textContent   = lowStock.length;

        const tbody = document.getElementById('lowstock-tbody');
        tbody.innerHTML = lowStock.length === 0
            ? '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">Nincs alacsony készletű termék ✓</td></tr>'
            : lowStock.map(p => `
    <tr>
        <td>${p.name}</td>
        <td style="font-family:var(--font-mono);font-size:0.8rem">${p.sku}</td>
        <td style="color:var(--danger);font-weight:600">${p.quantity}</td>
        <td>${p.minStock}</td>
        <td>
            <button class="btn-primary btn-sm" onclick="quickStockIn(${p.id})">+ Bevételezés</button>
        </td>
    </tr>
`).join('');
    } catch (err) {
        console.error('Áttekintés betöltési hiba:', err);
    }
}
async function quickStockIn(productId) {
    const warehouses = await api.getWarehouses();
    const warehouseOptions = warehouses.map(w =>
        `<option value="${w.id}">${w.name}</option>`
    ).join('');

    openModal('Bevételezés', `
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
    `, async () => {
        const warehouseId = parseInt(document.getElementById('f-s-warehouseid').value);
        const quantity = parseInt(document.getElementById('f-s-quantity').value);
        const note = document.getElementById('f-s-note').value.trim();

        if (!warehouseId || !quantity) {
            showToast('Töltsd ki az összes mezőt!', 'error');
            return;
        }
        try {
            const me = await apiFetch('/auth/me');
            await api.stockIn(productId, warehouseId, me.id, quantity, note);
            closeModal();
            showToast('Bevételezés sikeres!');
            loadOverview();
        } catch (err) {
            showToast('Hiba: ' + err.message, 'error');
        }
    });
}
