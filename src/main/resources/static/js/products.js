// =========================================
// products.js – Termékek CRUD
// =========================================

let categoriesList = [];

async function loadProducts() {
    try {
        const [products, categories] = await Promise.all([
            api.getProducts(),
            api.getCategories()
        ]);
        categoriesList = categories;
        renderProductsTable(products);
    } catch (err) {
        showToast('Hiba a termékek betöltésekor', 'error');
    }
}

function renderProductsTable(products) {
    const tbody = document.getElementById('products-tbody');
    tbody.innerHTML = products.length === 0
        ? '<tr><td colspan="7" style="text-align:center;color:var(--text-muted)">Nincs termék</td></tr>'
        : products.map(p => `
            <tr>
                <td style="font-family:var(--font-mono);font-size:0.8rem">${p.id}</td>
                <td>${p.name}</td>
                <td style="font-family:var(--font-mono);font-size:0.8rem">${p.sku}</td>
                <td>${p.price?.toLocaleString('hu-HU')} Ft</td>
                <td>${p.minStock}</td>
                <td>${p.category?.name ?? '–'}</td>
                <td>
                    <div class="actions">
                        <button class="btn-secondary btn-sm" onclick="editProduct(${p.id})">Szerk.</button>
                        <button class="btn-danger btn-sm" onclick="deleteProduct(${p.id}, '${p.name}')">Töröl</button>
                    </div>
                </td>
            </tr>
        `).join('');
}

function productFormHTML(p = {}) {
    const catOptions = categoriesList.map(c =>
        `<option value="${c.id}" ${p.category?.id === c.id ? 'selected' : ''}>${c.name}</option>`
    ).join('');

    return `
        <div class="form-group">
            <label>Név</label>
            <input type="text" id="f-name" value="${p.name ?? ''}" placeholder="Termék neve">
        </div>
        <div class="form-group">
            <label>SKU</label>
            <input type="text" id="f-sku" value="${p.sku ?? ''}" placeholder="pl. PROD-001">
        </div>
        <div class="form-group">
            <label>Leírás</label>
            <textarea id="f-description">${p.description ?? ''}</textarea>
        </div>
        <div class="form-group">
            <label>Ár (Ft)</label>
            <input type="number" id="f-price" value="${p.price ?? ''}" placeholder="0">
        </div>
        <div class="form-group">
            <label>Min. készlet</label>
            <input type="number" id="f-minstock" value="${p.minStock ?? ''}" placeholder="0">
        </div>
        <div class="form-group">
            <label>Kategória</label>
            <select id="f-category">${catOptions}</select>
        </div>
    `;
}

function getFormData() {
    return {
        name:        document.getElementById('f-name').value.trim(),
        sku:         document.getElementById('f-sku').value.trim(),
        description: document.getElementById('f-description').value.trim(),
        price:       parseFloat(document.getElementById('f-price').value),
        minStock:    parseInt(document.getElementById('f-minstock').value),
        category: {
            id: parseInt(document.getElementById('f-category').value)
        }
    };
}

// Új termék
document.getElementById('btn-add-product').addEventListener('click', () => {
    openModal('Új termék', productFormHTML(), async () => {
        try {
            await api.createProduct(getFormData());
            closeModal();
            showToast('Termék létrehozva!');
            loadProducts();
        } catch (err) {
            showToast('Hiba: ' + err.message, 'error');
        }
    });
});

// Szerkesztés
async function editProduct(id) {
    try {
        const p = await api.getProduct(id);
        openModal('Termék szerkesztése', productFormHTML(p), async () => {
            try {
                await api.updateProduct(id, getFormData());
                closeModal();
                showToast('Termék frissítve!');
                loadProducts();
            } catch (err) {
                showToast('Hiba: ' + err.message, 'error');
            }
        });
    } catch (err) {
        showToast('Nem sikerült betölteni a terméket', 'error');
    }
}

// Törlés
function deleteProduct(id, name) {
    openModal(
        'Törlés megerősítése',
        `<p>Biztosan törlöd: <strong>${name}</strong>?</p>`,
        async () => {
            try {
                await api.deleteProduct(id);
                closeModal();
                showToast('Termék törölve!');
                loadProducts();
            } catch (err) {
                showToast('Hiba: ' + err.message, 'error');
            }
        }
    );
}