/* =========================================================
   MAHFUZ TRADERS
   PESTICIDE SHOP MANAGEMENT SYSTEM
   ========================================================= */

const PRODUCT_KEY = "mahfuz_traders_products";
const SALES_KEY = "mahfuz_traders_sales";

let products = JSON.parse(localStorage.getItem(PRODUCT_KEY)) || [];
let sales = JSON.parse(localStorage.getItem(SALES_KEY)) || [];


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("todayDate").textContent =
        new Date().toLocaleDateString("en-BD", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

    document.getElementById("productForm")
        .addEventListener("submit", saveProduct);

    document.getElementById("saleForm")
        .addEventListener("submit", saveSale);

    document.getElementById("importFile")
        .addEventListener("change", importData);

    renderAll();

});


/* =========================================================
   SAVE DATA
   ========================================================= */

function saveProducts() {
    localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
}

function saveSales() {
    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function showSection(sectionId, button = null) {

    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active");
    });

    const section = document.getElementById(sectionId);

    if (section) {
        section.classList.add("active");
    }

    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    }

    renderAll();
}


/* =========================================================
   PRODUCT MODAL
   ========================================================= */

function openProductModal(id = null) {

    const modal = document.getElementById("productModal");

    document.getElementById("productForm").reset();

    document.getElementById("productId").value = "";

    document.getElementById("lowStock").value = 5;

    document.getElementById("productModalTitle").textContent =
        id ? "Edit Product" : "Add Product";

    if (id) {

        const product = products.find(p => p.id === id);

        if (!product) return;

        document.getElementById("productId").value = product.id;
        document.getElementById("productName").value = product.name;
        document.getElementById("productCategory").value = product.category;
        document.getElementById("productUnit").value = product.unit;
        document.getElementById("buyPrice").value = product.buyPrice;
        document.getElementById("sellPrice").value = product.sellPrice;
        document.getElementById("stock").value = product.stock;
        document.getElementById("lowStock").value = product.lowStock;

    }

    modal.classList.add("show");
}


function closeModal(id) {
    document.getElementById(id).classList.remove("show");
}


/* =========================================================
   SAVE PRODUCT
   ========================================================= */

function saveProduct(event) {

    event.preventDefault();

    const id = document.getElementById("productId").value;

    const name = document.getElementById("productName").value.trim();

    const category =
        document.getElementById("productCategory").value;

    const unit =
        document.getElementById("productUnit").value;

    const buyPrice =
        Number(document.getElementById("buyPrice").value);

    const sellPrice =
        Number(document.getElementById("sellPrice").value);

    const stock =
        Number(document.getElementById("stock").value);

    const lowStock =
        Number(document.getElementById("lowStock").value) || 5;


    if (!name) {
        showToast("Please enter product name");
        return;
    }

    if (buyPrice < 0 || sellPrice < 0 || stock < 0) {
        showToast("Invalid value");
        return;
    }


    if (id) {

        const product = products.find(p => p.id === id);

        if (product) {

            product.name = name;
            product.category = category;
            product.unit = unit;
            product.buyPrice = buyPrice;
            product.sellPrice = sellPrice;
            product.stock = stock;
            product.lowStock = lowStock;

        }

        showToast("Product updated successfully");

    } else {

        const product = {

            id: Date.now().toString(),

            name,
            category,
            unit,

            buyPrice,
            sellPrice,

            stock,
            lowStock,

            createdAt: new Date().toISOString()

        };

        products.push(product);

        showToast("Product added successfully");
    }


    saveProducts();

    closeModal("productModal");

    renderAll();
}


/* =========================================================
   DELETE PRODUCT
   ========================================================= */

function deleteProduct(id) {

    const product = products.find(p => p.id === id);

    if (!product) return;

    const confirmDelete =
        confirm(`Delete "${product.name}"?`);

    if (!confirmDelete) return;

    products = products.filter(p => p.id !== id);

    saveProducts();

    renderAll();

    showToast("Product deleted");
}


/* =========================================================
   RENDER PRODUCTS
   ========================================================= */

function renderProducts() {

    const tbody =
        document.getElementById("productTable");

    const search =
        document.getElementById("productSearch")?.value
        .toLowerCase() || "";

    const filter =
        document.getElementById("stockFilter")?.value || "all";


    let filtered = products.filter(product => {

        const matchesSearch =
            product.name.toLowerCase().includes(search) ||
            product.category.toLowerCase().includes(search);

        let matchesFilter = true;

        if (filter === "low") {
            matchesFilter =
                product.stock > 0 &&
                product.stock <= product.lowStock;
        }

        if (filter === "out") {
            matchesFilter = product.stock === 0;
        }

        return matchesSearch && matchesFilter;

    });


    if (filtered.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty">
                    No products found
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML = filtered.map(product => {

        const profit =
            product.sellPrice - product.buyPrice;

        const stockValue =
            product.buyPrice * product.stock;


        let stockClass = "stock-good";

        if (product.stock === 0) {
            stockClass = "stock-out";
        } else if (product.stock <= product.lowStock) {
            stockClass = "stock-low";
        }


        return `

        <tr>

            <td>
                <div class="product-name">
                    ${escapeHTML(product.name)}
                </div>
                <small>${product.unit}</small>
            </td>

            <td>
                <span class="category">
                    ${escapeHTML(product.category)}
                </span>
            </td>

            <td>
                ৳${formatMoney(product.buyPrice)}
            </td>

            <td>
                ৳${formatMoney(product.sellPrice)}
            </td>

            <td class="profit">
                ৳${formatMoney(profit)}
            </td>

            <td class="${stockClass}">
                ${product.stock}
            </td>

            <td>
                ৳${formatMoney(stockValue)}
            </td>

            <td>

                <button
                    class="action-btn edit-btn"
                    onclick="openProductModal('${product.id}')">
                    ✏️
                </button>

                <button
                    class="action-btn delete-btn"
                    onclick="deleteProduct('${product.id}')">
                    🗑️
                </button>

            </td>

        </tr>

        `;

    }).join("");

}


/* =========================================================
   SALE MODAL
   ========================================================= */

function openSaleModal() {

    if (products.length === 0) {

        showToast("Please add a product first");

        return;
    }

    const select =
        document.getElementById("saleProduct");

    select.innerHTML = `
        <option value="">Select Product</option>
    `;


    products.forEach(product => {

        if (product.stock > 0) {

            select.innerHTML += `
                <option value="${product.id}">
                    ${escapeHTML(product.name)}
                    — Stock: ${product.stock}
                </option>
            `;

        }

    });


    document.getElementById("saleQuantity").value = "";

    document.getElementById("salePriceInfo").textContent = "৳0";

    document.getElementById("availableStockInfo").textContent = "0";

    document.getElementById("profitUnitInfo").textContent = "৳0";

    document.getElementById("previewSale").textContent = "৳0";

    document.getElementById("previewProfit").textContent = "৳0";


    document.getElementById("saleModal")
        .classList.add("show");

}


function updateSaleInfo() {

    const id =
        document.getElementById("saleProduct").value;

    const product =
        products.find(p => p.id === id);


    if (!product) {

        document.getElementById("salePriceInfo").textContent = "৳0";

        document.getElementById("availableStockInfo").textContent = "0";

        document.getElementById("profitUnitInfo").textContent = "৳0";

        return;
    }


    document.getElementById("salePriceInfo").textContent =
        "৳" + formatMoney(product.sellPrice);

    document.getElementById("availableStockInfo").textContent =
        product.stock;

    document.getElementById("profitUnitInfo").textContent =
        "৳" + formatMoney(product.sellPrice - product.buyPrice);


    calculateSalePreview();
}


function calculateSalePreview() {

    const id =
        document.getElementById("saleProduct").value;

    const quantity =
        Number(document.getElementById("saleQuantity").value) || 0;

    const product =
        products.find(p => p.id === id);


    if (!product || quantity <= 0) {

        document.getElementById("previewSale").textContent = "৳0";

        document.getElementById("previewProfit").textContent = "৳0";

        return;
    }


    const totalSale =
        product.sellPrice * quantity;

    const totalProfit =
        (product.sellPrice - product.buyPrice) * quantity;


    document.getElementById("previewSale").textContent =
        "৳" + formatMoney(totalSale);

    document.getElementById("previewProfit").textContent =
        "৳" + formatMoney(totalProfit);

}


/* =========================================================
   SAVE SALE
   ========================================================= */

function saveSale(event) {

    event.preventDefault();


    const productId =
        document.getElementById("saleProduct").value;

    const quantity =
        Number(document.getElementById("saleQuantity").value);


    const product =
        products.find(p => p.id === productId);


    if (!product) {

        showToast("Please select a product");

        return;
    }


    if (!quantity || quantity <= 0) {

        showToast("Enter valid quantity");

        return;
    }


    if (quantity > product.stock) {

        showToast(
            `Only ${product.stock} ${product.unit} available`
        );

        return;
    }


    const saleAmount =
        product.sellPrice * quantity;

    const profit =
        (product.sellPrice - product.buyPrice) * quantity;


    const sale = {

        id: Date.now().toString(),

        productId: product.id,

        productName: product.name,

        quantity,

        salePrice: product.sellPrice,

        buyPrice: product.buyPrice,

        saleAmount,

        profit,

        date: new Date().toISOString()

    };


    sales.push(sale);


    product.stock -= quantity;


    saveProducts();

    saveSales();


    closeModal("saleModal");

    renderAll();

    showToast("Sale recorded successfully");

}


/* =========================================================
   DELETE SALE
   ========================================================= */

function deleteSale(id) {

    const sale =
        sales.find(s => s.id === id);

    if (!sale) return;


    const confirmDelete =
        confirm(
            "Delete this sale? Stock will be restored."
        );

    if (!confirmDelete) return;


    const product =
        products.find(p => p.id === sale.productId);


    if (product) {
        product.stock += sale.quantity;
    }


    sales =
        sales.filter(s => s.id !== id);


    saveProducts();

    saveSales();

    renderAll();

    showToast("Sale deleted and stock restored");

}


/* =========================================================
   RENDER SALES
   ========================================================= */

function renderSales() {

    const tbody =
        document.getElementById("salesTable");


    const sortedSales =
        [...sales].sort(
            (a, b) =>
                new Date(b.date) -
                new Date(a.date)
        );


    if (sortedSales.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty">
                    No sales recorded yet
                </td>
            </tr>
        `;

    } else {

        tbody.innerHTML =
            sortedSales.map(sale => `

            <tr>

                <td>
                    ${formatDate(sale.date)}
                </td>

                <td class="product-name">
                    ${escapeHTML(sale.productName)}
                </td>

                <td>
                    ${sale.quantity}
                </td>

                <td>
                    ৳${formatMoney(sale.saleAmount)}
                </td>

                <td class="profit">
                    ৳${formatMoney(sale.profit)}
                </td>

                <td>

                    <button
                        class="action-btn delete-btn"
                        onclick="deleteSale('${sale.id}')">
                        🗑️
                    </button>

                </td>

            </tr>

        `).join("");

    }


    const totalSales =
        sales.reduce(
            (sum, sale) => sum + sale.saleAmount,
            0
        );

    const totalProfit =
        sales.reduce(
            (sum, sale) => sum + sale.profit,
            0
        );


    document.getElementById("totalSalesAmount").textContent =
        "৳" + formatMoney(totalSales);

    document.getElementById("totalProfitAmount").textContent =
        "৳" + formatMoney(totalProfit);

    document.getElementById("totalTransactions").textContent =
        sales.length;

}


/* =========================================================
   DASHBOARD
   ========================================================= */

function renderDashboard() {

    const totalStock =
        products.reduce(
            (sum, product) =>
                sum + Number(product.stock),
            0
        );


    const today =
        getDateString(new Date());


    const todaySales =
        sales.filter(
            sale =>
                getDateString(sale.date) === today
        );


    const todayProfit =
        todaySales.reduce(
            (sum, sale) =>
                sum + sale.profit,
            0
        );


    const month =
        getMonthString(new Date());


    const monthProfit =
        sales
            .filter(
                sale =>
                    getMonthString(sale.date) === month
            )
            .reduce(
                (sum, sale) =>
                    sum + sale.profit,
                0
            );


    document.getElementById("totalProducts").textContent =
        products.length;

    document.getElementById("totalStock").textContent =
        totalStock;

    document.getElementById("todayProfit").textContent =
        "৳" + formatMoney(todayProfit);

    document.getElementById("monthProfit").textContent =
        "৳" + formatMoney(monthProfit);


    renderLowStock();

    renderRecentSales();

}


/* =========================================================
   LOW STOCK
   ========================================================= */

function renderLowStock() {

    const container =
        document.getElementById("lowStockList");


    const lowProducts =
        products.filter(
            p =>
                p.stock <= p.lowStock
        );


    if (lowProducts.length === 0) {

        container.innerHTML = `
            <div class="empty">
                ✅ All products have enough stock.
            </div>
        `;

        return;
    }


    container.innerHTML =
        lowProducts.slice(0, 8).map(product => `

        <div class="low-stock-item">

            <div>
                <strong>
                    ${escapeHTML(product.name)}
                </strong>

                <small>
                    ${product.category}
                </small>
            </div>

            <span class="${
                product.stock === 0
                ? "stock-out"
                : "stock-low"
            }">

                ${
                    product.stock === 0
                    ? "OUT OF STOCK"
                    : product.stock + " left"
                }

            </span>

        </div>

    `).join("");

}


/* =========================================================
   RECENT SALES
   ========================================================= */

function renderRecentSales() {

    const container =
        document.getElementById("recentSales");


    const recent =
        [...sales]
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            )
            .slice(0, 6);


    if (recent.length === 0) {

        container.innerHTML = `
            <div class="empty">
                No sales yet.
            </div>
        `;

        return;
    }


    container.innerHTML =
        recent.map(sale => `

        <div class="recent-sale-item">

            <div>

                <strong>
                    ${escapeHTML(sale.productName)}
                </strong>

                <small>
                    ${sale.quantity} × ৳${formatMoney(sale.salePrice)}
                </small>

            </div>

            <div>

                <strong class="profit">
                    +৳${formatMoney(sale.profit)}
                </strong>

                <small>
                    ${formatDate(sale.date)}
                </small>

            </div>

        </div>

    `).join("");

}


/* =========================================================
   REPORTS
   ========================================================= */

function renderReports() {

    const today =
        getDateString(new Date());

    const month =
        getMonthString(new Date());


    const todaySales =
        sales.filter(
            sale =>
                getDateString(sale.date) === today
        );


    const monthSales =
        sales.filter(
            sale =>
                getMonthString(sale.date) === month
        );


    const todaySalesAmount =
        todaySales.reduce(
            (sum, sale) =>
                sum + sale.saleAmount,
            0
        );


    const todayProfit =
        todaySales.reduce(
            (sum, sale) =>
                sum + sale.profit,
            0
        );


    const monthSalesAmount =
        monthSales.reduce(
            (sum, sale) =>
                sum + sale.saleAmount,
            0
        );


    const monthProfit =
        monthSales.reduce(
            (sum, sale) =>
                sum + sale.profit,
            0
        );


    const stockValue =
        products.reduce(
            (sum, product) =>
                sum +
                product.buyPrice *
                product.stock,
            0
        );


    const potentialProfit =
        products.reduce(
            (sum, product) =>
                sum +
                (product.sellPrice - product.buyPrice) *
                product.stock,
            0
        );


    document.getElementById("reportTodaySales").textContent =
        "৳" + formatMoney(todaySalesAmount);

    document.getElementById("reportTodayProfit").textContent =
        "৳" + formatMoney(todayProfit);

    document.getElementById("reportMonthSales").textContent =
        "৳" + formatMoney(monthSalesAmount);

    document.getElementById("reportMonthProfit").textContent =
        "৳" + formatMoney(monthProfit);

    document.getElementById("reportStockValue").textContent =
        "৳" + formatMoney(stockValue);

    document.getElementById("reportPotentialProfit").textContent =
        "৳" + formatMoney(potentialProfit);


    renderMonthlyReport();

}


/* =========================================================
   MONTHLY REPORT
   ========================================================= */

function renderMonthlyReport() {

    const tbody =
        document.getElementById("monthlyReport");


    const months = {};


    sales.forEach(sale => {

        const month =
            getMonthString(sale.date);

        if (!months[month]) {

            months[month] = {
                sales: 0,
                profit: 0
            };

        }


        months[month].sales += sale.saleAmount;

        months[month].profit += sale.profit;

    });


    const entries =
        Object.entries(months)
            .sort(
                (a, b) =>
                    b[0].localeCompare(a[0])
            );


    if (entries.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="empty">
                    No report data available.
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        entries.map(([month, data]) => `

        <tr>

            <td>
                ${formatMonth(month)}
            </td>

            <td>
                ৳${formatMoney(data.sales)}
            </td>

            <td class="profit">
                ৳${formatMoney(data.profit)}
            </td>

        </tr>

    `).join("");

}


/* =========================================================
   EXPORT DATA
   ========================================================= */

function exportData() {

    const data = {

        shop: "Mahfuz Traders",

        exportedAt:
            new Date().toISOString(),

        products,

        sales

    };


    const blob =
        new Blob(
            [JSON.stringify(data, null, 2)],
            { type: "application/json" }
        );


    const url =
        URL.createObjectURL(blob);


    const a =
        document.createElement("a");


    a.href = url;

    a.download =
        `mahfuz-traders-backup-${getDateString(new Date())}.json`;


    a.click();


    URL.revokeObjectURL(url);


    showToast("Backup downloaded");

}


/* =========================================================
   IMPORT DATA
   ========================================================= */

function importData(event) {

    const file =
        event.target.files[0];

    if (!file) return;


    const reader =
        new FileReader();


    reader.onload = function(e) {

        try {

            const data =
                JSON.parse(e.target.result);


            if (
                !Array.isArray(data.products) ||
                !Array.isArray(data.sales)
            ) {

                throw new Error("Invalid backup");

            }


            const confirmImport =
                confirm(
                    "Import backup? Current data will be replaced."
                );


            if (!confirmImport) return;


            products = data.products;

            sales = data.sales;


            saveProducts();

            saveSales();

            renderAll();

            showToast("Data imported successfully");


        } catch (error) {

            showToast("Invalid backup file");

        }

    };


    reader.readAsText(file);

    event.target.value = "";

}


/* =========================================================
   UTILITY
   ========================================================= */

function formatMoney(value) {

    return Number(value || 0)
        .toLocaleString("en-BD", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });

}


function getDateString(date) {

    const d =
        new Date(date);

    return d.toISOString()
        .split("T")[0];

}


function getMonthString(date) {

    const d =
        new Date(date);

    return d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0");

}


function formatDate(date) {

    return new Date(date)
        .toLocaleDateString("en-BD", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

}


function formatMonth(month) {

    const [year, m] =
        month.split("-");

    const date =
        new Date(
            Number(year),
            Number(m) - 1,
            1
        );

    return date.toLocaleDateString(
        "en-BD",
        {
            month: "long",
            year: "numeric"
        }
    );

}


function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function showToast(message) {

    const toast =
        document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}


/* =========================================================
   RENDER EVERYTHING
   ========================================================= */

function renderAll() {

    renderProducts();

    renderSales();

    renderDashboard();

    renderReports();

}
