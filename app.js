/* =========================================================
   MAHFUZ TRADERS
   GitHub Pages / LocalStorage Business Management System
   ========================================================= */

const DB_KEY = "mahfuz_traders_database_v1";

const DEFAULT_DB = {
  products: [],
  sales: [],
  purchases: [],
  customers: [],
  suppliers: [],
  expenses: [],
  settings: {
    shopName: "মাহফুজ ট্রেডার্স"
  }
};

let db = loadDatabase();

let editingProductId = null;
let editingCustomerId = null;
let editingSupplierId = null;


/* =========================================================
   DATABASE
   ========================================================= */

function loadDatabase() {

  try {

    const saved = localStorage.getItem(DB_KEY);

    if (!saved) {
      return structuredClone(DEFAULT_DB);
    }

    const parsed = JSON.parse(saved);

    return {
      ...structuredClone(DEFAULT_DB),
      ...parsed
    };

  } catch (error) {

    console.error(error);

    return structuredClone(DEFAULT_DB);
  }
}


function saveDatabase() {

  localStorage.setItem(
    DB_KEY,
    JSON.stringify(db)
  );

}


/* =========================================================
   UTILITIES
   ========================================================= */

function money(value) {

  return "৳" + Number(value || 0).toLocaleString("en-BD", {
    maximumFractionDigits: 2
  });

}


function number(value) {

  return Number(value || 0);
}


function generateId(prefix) {

  return prefix + Date.now() + Math.floor(Math.random() * 1000);

}


function today() {

  const d = new Date();

  return d.toISOString().split("T")[0];

}


function currentMonth() {

  return today().slice(0, 7);

}


function formatDate(date) {

  if (!date) return "-";

  return new Date(date).toLocaleDateString(
    "bn-BD"
  );

}


function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =========================================================
   TOAST
   ========================================================= */

function toast(message) {

  const box = document.getElementById("toast");

  box.textContent = message;

  box.style.display = "block";

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {

    box.style.display = "none";

  }, 2500);

}


/* =========================================================
   LOGIN
   ========================================================= */

document
  .getElementById("loginForm")
  .addEventListener("submit", function(event) {

    event.preventDefault();

    const username =
      document.getElementById("username").value.trim();

    const password =
      document.getElementById("password").value;

    if (
      username === "admin" &&
      password === "1234"
    ) {

      sessionStorage.setItem(
        "mahfuz_logged_in",
        "true"
      );

      showApp();

      toast("Login সফল হয়েছে");

    } else {

      toast("Username অথবা Password ভুল");

    }

  });


function showApp() {

  document
    .getElementById("loginPage")
    .classList.add("hidden");

  document
    .getElementById("app")
    .classList.remove("hidden");

  updateDate();

  loadDashboard();

}


function showLogin() {

  document
    .getElementById("loginPage")
    .classList.remove("hidden");

  document
    .getElementById("app")
    .classList.add("hidden");

}


document
  .getElementById("logoutBtn")
  .addEventListener("click", function() {

    sessionStorage.removeItem(
      "mahfuz_logged_in"
    );

    location.reload();

  });


/* =========================================================
   INITIAL LOAD
   ========================================================= */

document.addEventListener("DOMContentLoaded", function() {

  if (
    sessionStorage.getItem(
      "mahfuz_logged_in"
    ) === "true"
  ) {

    showApp();

  } else {

    showLogin();

  }

});


function updateDate() {

  document.getElementById("currentDate")
    .textContent =
    new Date().toLocaleDateString(
      "bn-BD",
      {
        dateStyle: "full"
      }
    );

}


/* =========================================================
   NAVIGATION
   ========================================================= */

document
  .querySelectorAll(".nav-btn")
  .forEach(button => {

    button.addEventListener("click", function() {

      const page =
        this.dataset.page;

      showPage(page);

    });

  });


function showPage(page) {

  document
    .querySelectorAll(".page")
    .forEach(section => {

      section.classList.add("hidden");

    });


  const selected =
    document.getElementById(page);

  if (selected) {

    selected.classList.remove("hidden");

  }


  document
    .querySelectorAll(".nav-btn")
    .forEach(button => {

      button.classList.remove("active");

      if (
        button.dataset.page === page
      ) {

        button.classList.add("active");

      }

    });


  const titles = {

    dashboard: "Dashboard",
    products: "Products",
    sales: "Sales",
    purchases: "Purchase",
    customers: "Customers",
    suppliers: "Suppliers",
    expenses: "Expenses",
    reports: "Reports",
    backup: "Backup & Restore"

  };


  document.getElementById(
    "pageTitle"
  ).textContent =
    titles[page] || "Dashboard";


  document
    .getElementById("sidebar")
    .classList.remove("open");


  if (page === "dashboard")
    loadDashboard();

  if (page === "products")
    renderProducts();

  if (page === "sales")
    renderSales();

  if (page === "purchases")
    renderPurchases();

  if (page === "customers")
    renderCustomers();

  if (page === "suppliers")
    renderSuppliers();

  if (page === "expenses")
    renderExpenses();

  if (page === "reports")
    generateReport();

}


document
  .getElementById("menuBtn")
  .addEventListener("click", function() {

    document
      .getElementById("sidebar")
      .classList.toggle("open");

  });


/* =========================================================
   DASHBOARD
   ========================================================= */

function loadDashboard() {

  const todayDate = today();

  const month = currentMonth();


  const totalProducts =
    db.products.length;


  const totalStock =
    db.products.reduce(
      (sum, product) =>
        sum + number(product.stock),
      0
    );


  const todaySalesData =
    db.sales.filter(
      sale =>
        sale.date === todayDate
    );


  const monthSalesData =
    db.sales.filter(
      sale =>
        sale.date.startsWith(month)
    );


  const todaySales =
    todaySalesData.reduce(
      (sum, sale) =>
        sum + number(sale.total),
      0
    );


  const todayProfit =
    todaySalesData.reduce(
      (sum, sale) =>
        sum + number(sale.profit),
      0
    );


  const monthSales =
    monthSalesData.reduce(
      (sum, sale) =>
        sum + number(sale.total),
      0
    );


  const monthGrossProfit =
    monthSalesData.reduce(
      (sum, sale) =>
        sum + number(sale.profit),
      0
    );


  const monthExpenses =
    db.expenses
      .filter(
        expense =>
          expense.date.startsWith(month)
      )
      .reduce(
        (sum, expense) =>
          sum + number(expense.amount),
        0
      );


  const netProfit =
    monthGrossProfit -
    monthExpenses;


  document.getElementById(
    "totalProducts"
  ).textContent =
    totalProducts;


  document.getElementById(
    "totalStock"
  ).textContent =
    totalStock + " পিস";


  document.getElementById(
    "todaySales"
  ).textContent =
    money(todaySales);


  document.getElementById(
    "todayProfit"
  ).textContent =
    money(todayProfit);


  document.getElementById(
    "monthSales"
  ).textContent =
    money(monthSales);


  document.getElementById(
    "monthProfit"
  ).textContent =
    money(netProfit);


  renderRecentSales();

  renderLowStock();

}


/* =========================================================
   RECENT SALES
   ========================================================= */

function renderRecentSales() {

  const tbody =
    document.getElementById(
      "recentSales"
    );


  const sales =
    [...db.sales]
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .slice(0, 8);


  if (!sales.length) {

    tbody.innerHTML =
      `<tr>
        <td colspan="5" class="empty">
          এখনো কোনো বিক্রয় নেই
        </td>
      </tr>`;

    return;

  }


  tbody.innerHTML =
    sales.map(sale => {

      return `
        <tr>

          <td>
            ${formatDate(sale.date)}
          </td>

          <td>
            ${escapeHTML(
              sale.productName
            )}
          </td>

          <td>
            ${sale.quantity}
          </td>

          <td>
            ${money(sale.total)}
          </td>

          <td class="profit">
            ${money(sale.profit)}
          </td>

        </tr>
      `;

    }).join("");

}


/* =========================================================
   LOW STOCK
   ========================================================= */

function renderLowStock() {

  const container =
    document.getElementById(
      "lowStockList"
    );


  const low =
    db.products
      .filter(
        product =>
          number(product.stock) <= 5
      )
      .sort(
        (a, b) =>
          number(a.stock) -
          number(b.stock)
      );


  if (!low.length) {

    container.innerHTML =
      `<div class="empty">
        সব পণ্যের Stock ভালো আছে 👍
      </div>`;

    return;

  }


  container.innerHTML =
    low.map(product => {

      return `
        <div class="low-stock">

          <div>
            <strong>
              ${escapeHTML(
                product.name
              )}
            </strong>

            <br>

            <small>
              ${escapeHTML(
                product.category
              )}
            </small>
          </div>

          <strong>
            ${product.stock} পিস
          </strong>

        </div>
      `;

    }).join("");

}


/* =========================================================
   MODAL
   ========================================================= */

function openModal(title, html) {

  document.getElementById(
    "modalTitle"
  ).textContent = title;

  document.getElementById(
    "modalForm"
  ).innerHTML = html;

  document
    .getElementById("modal")
    .classList.remove("hidden");

}


function closeModal() {

  document
    .getElementById("modal")
    .classList.add("hidden");

}


document
  .getElementById("modal")
  .addEventListener("click", function(event) {

    if (
      event.target.id === "modal"
    ) {

      closeModal();

    }

  });


/* =========================================================
   PRODUCTS
   ========================================================= */

function openProductModal(id = null) {

  editingProductId = id;


  const product =
    db.products.find(
      item => item.id === id
    );


  const p = product || {

    name: "",
    category: "কীটনাশক",
    purchasePrice: "",
    sellingPrice: "",
    stock: 0

  };


  openModal(
    id
      ? "পণ্য Edit করুন"
      : "নতুন পণ্য",
    `

      <div class="form-grid">

        <div class="form-group">

          <label>পণ্যের নাম *</label>

          <input
            name="name"
            value="${escapeHTML(p.name)}"
            required
          >

        </div>


        <div class="form-group">

          <label>Category</label>

          <select name="category">

            <option
              ${p.category === "কীটনাশক" ? "selected" : ""}
            >
              কীটনাশক
            </option>

            <option
              ${p.category === "সার" ? "selected" : ""}
            >
              সার
            </option>

            <option
              ${p.category === "বীজ" ? "selected" : ""}
            >
              বীজ
            </option>

            <option
              ${p.category === "অন্যান্য" ? "selected" : ""}
            >
              অন্যান্য
            </option>

          </select>

        </div>


        <div class="form-group">

          <label>ক্রয় মূল্য *</label>

          <input
            type="number"
            step="0.01"
            name="purchasePrice"
            value="${p.purchasePrice}"
            required
          >

        </div>


        <div class="form-group">

          <label>বিক্রয় মূল্য *</label>

          <input
            type="number"
            step="0.01"
            name="sellingPrice"
            value="${p.sellingPrice}"
            required
          >

        </div>


        <div class="form-group">

          <label>Stock (পিস) *</label>

          <input
            type="number"
            name="stock"
            min="0"
            value="${p.stock}"
            required
          >

        </div>

      </div>


      <div class="form-actions">

        <button
          type="button"
          class="secondary-btn"
          onclick="closeModal()"
        >
          Cancel
        </button>

        <button
          type="submit"
          class="primary-btn"
        >
          Save
        </button>

      </div>

    `
  );


  document
    .getElementById("modalForm")
    .onsubmit = function(event) {

      event.preventDefault();

      const form =
        new FormData(event.target);


      const data = {

        name:
          form.get("name").trim(),

        category:
          form.get("category"),

        purchasePrice:
          number(
            form.get("purchasePrice")
          ),

        sellingPrice:
          number(
            form.get("sellingPrice")
          ),

        stock:
          number(
            form.get("stock")
          )

      };


      if (
        data.purchasePrice < 0 ||
        data.sellingPrice < 0 ||
        data.stock < 0
      ) {

        toast(
          "মূল্য বা Stock সঠিক দিন"
        );

        return;

      }


      if (id) {

        const index =
          db.products.findIndex(
            p => p.id === id
          );

        if (index !== -1) {

          db.products[index] = {

            ...db.products[index],
            ...data

          };

        }

        toast(
          "পণ্য Update হয়েছে"
        );

      } else {

        db.products.push({

          id:
            generateId("product_"),

          ...data,

          createdAt:
            new Date().toISOString()

        });

        toast(
          "নতুন পণ্য যোগ হয়েছে"
        );

      }


      saveDatabase();

      closeModal();

      renderProducts();

      loadDashboard();

    };

}


function renderProducts() {

  const tbody =
    document.getElementById(
      "productsTable"
    );


  const search =
    (
      document.getElementById(
        "productSearch"
      ).value || ""
    ).toLowerCase();


  const category =
    document.getElementById(
      "productCategoryFilter"
    ).value;


  const products =
    db.products.filter(product => {

      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(search);

      const matchesCategory =
        !category ||
        product.category === category;

      return (
        matchesSearch &&
        matchesCategory
      );

    });


  if (!products.length) {

    tbody.innerHTML =
      `<tr>
        <td colspan="8" class="empty">
          কোনো পণ্য পাওয়া যায়নি
        </td>
      </tr>`;

    return;

  }


  tbody.innerHTML =
    products.map(product => {

      const profit =
        number(product.sellingPrice) -
        number(product.purchasePrice);


      const stock =
        number(product.stock);


      let stockClass =
        "stock-good";


      if (stock === 0)
        stockClass = "stock-out";

      else if (stock <= 5)
        stockClass = "stock-low";


      return `

        <tr>

          <td>
            <strong>
              ${escapeHTML(
                product.name
              )}
            </strong>
          </td>

          <td>
            ${escapeHTML(
              product.category
            )}
          </td>

          <td>
            ${money(
              product.purchasePrice
            )}
          </td>

          <td>
            ${money(
              product.sellingPrice
            )}
          </td>

          <td class="profit">
            ${money(profit)}
          </td>

          <td>
            <span class="${stockClass}">
              ${stock}
            </span>
          </td>

          <td>
            ${money(
              stock *
              number(
                product.purchasePrice
              )
            )}
          </td>

          <td>

            <button
              class="action-btn edit-btn"
              onclick="openProductModal('${product.id}')"
            >
              Edit
            </button>

            <button
              class="action-btn delete-btn"
              onclick="deleteProduct('${product.id}')"
            >
              Delete
            </button>

          </td>

        </tr>

      `;

    }).join("");

}


document
  .getElementById("productSearch")
  .addEventListener(
    "input",
    renderProducts
  );


document
  .getElementById("productCategoryFilter")
  .addEventListener(
    "change",
    renderProducts
  );


function deleteProduct(id) {

  const hasSales =
    db.sales.some(
      sale =>
        sale.productId === id
    );


  if (hasSales) {

    toast(
      "এই পণ্যের Sales history আছে। Delete না করে Edit করুন।"
    );

    return;

  }


  if (
    !confirm(
      "এই পণ্য Delete করতে চান?"
    )
  ) return;


  db.products =
    db.products.filter(
      product =>
        product.id !== id
    );


  saveDatabase();

  renderProducts();

  loadDashboard();

  toast("পণ্য Delete হয়েছে");

}


/* =========================================================
   SALES
   ========================================================= */

function openSaleModal() {

  const availableProducts =
    db.products.filter(
      product =>
        number(product.stock) > 0
    );


  if (!availableProducts.length) {

    toast(
      "আগে Product এবং Stock যোগ করুন"
    );

    return;

  }


  openModal(
    "নতুন বিক্রয়",
    `

      <div class="form-group">

        <label>পণ্য *</label>

        <select
          name="productId"
          id="saleProduct"
          required
        >

          <option value="">
            পণ্য নির্বাচন করুন
          </option>

          ${availableProducts.map(
            product => `
              <option value="${product.id}">
                ${escapeHTML(product.name)}
                — Stock ${product.stock}
                — ${money(product.sellingPrice)}
              </option>
            `
          ).join("")}

        </select>

      </div>


      <div class="form-group">

        <label>Customer</label>

        <select name="customerId">

          <option value="">
            Cash Customer
          </option>

          ${db.customers.map(
            customer => `
              <option value="${customer.id}">
                ${escapeHTML(customer.name)}
                — Due ${money(customer.balance)}
              </option>
            `
          ).join("")}

        </select>

      </div>


      <div class="form-grid">

        <div class="form-group">

          <label>Quantity *</label>

          <input
            type="number"
            name="quantity"
            min="1"
            required
          >

        </div>


        <div class="form-group">

          <label>Paid</label>

          <input
            type="number"
            name="paid"
            min="0"
            value="0"
          >

        </div>

      </div>


      <div
        id="salePreview"
        class="panel"
        style="margin-top:10px"
      >
        পণ্য নির্বাচন করুন
      </div>


      <div class="form-actions">

        <button
          type="button"
          class="secondary-btn"
          onclick="closeModal()"
        >
          Cancel
        </button>

        <button
          type="submit"
          class="primary-btn"
        >
          বিক্রয় Save
        </button>

      </div>

    `
  );


  const form =
    document.getElementById(
      "modalForm"
    );


  const updatePreview =
    function() {

      const productId =
        form.productId.value;


      const quantity =
        number(
          form.quantity.value
        );


      const product =
        db.products.find(
          p =>
            p.id === productId
        );


      if (!product) {

        document.getElementById(
          "salePreview"
        ).innerHTML =
          "পণ্য নির্বাচন করুন";

        return;

      }


      const total =
        quantity *
        number(
          product.sellingPrice
        );


      const profit =
        quantity *
        (
          number(
            product.sellingPrice
          ) -
          number(
            product.purchasePrice
          )
        );


      document.getElementById(
        "salePreview"
      ).innerHTML = `

        <strong>
          মোট: ${money(total)}
        </strong>

        &nbsp;&nbsp;

        <span class="profit">
          সম্ভাব্য লাভ: ${money(profit)}
        </span>

        <br>

        <small>
          Stock: ${product.stock}
        </small>

      `;

    };


  form.productId.addEventListener(
    "change",
    updatePreview
  );


  form.quantity.addEventListener(
    "input",
    updatePreview
  );


  form.onsubmit =
    function(event) {

      event.preventDefault();


      const productId =
        form.productId.value;


      const customerId =
        form.customerId.value;


      const quantity =
        number(
          form.quantity.value
        );


      const paid =
        number(
          form.paid.value
        );


      const product =
        db.products.find(
          p =>
            p.id === productId
        );


      if (!product) {

        toast(
          "Product নির্বাচন করুন"
        );

        return;

      }


      if (
        quantity <= 0 ||
        quantity >
        number(product.stock)
      ) {

        toast(
          `Stock আছে ${product.stock} পিস`
        );

        return;

      }


      const total =
        quantity *
        number(
          product.sellingPrice
        );


      if (paid > total) {

        toast(
          "Paid মোট বিক্রয়ের চেয়ে বেশি হতে পারবে না"
        );

        return;

      }


      const profit =
        quantity *
        (
          number(
            product.sellingPrice
          ) -
          number(
            product.purchasePrice
          )
        );


      const due =
        total -
        paid;


      const customer =
        db.customers.find(
          c =>
            c.id === customerId
        );


      if (customer) {

        customer.balance += due;

      }


      product.stock -= quantity;


      const sale = {

        id:
          generateId("sale_"),

        invoice:
          "INV-" +
          Date.now(),

        productId:
          product.id,

        productName:
          product.name,

        customerId:
          customerId || null,

        customerName:
          customer
            ? customer.name
            : "Cash",

        quantity,

        unitPrice:
          number(
            product.sellingPrice
          ),

        costPrice:
          number(
            product.purchasePrice
          ),

        total,

        profit,

        paid,

        due,

        date:
          today(),

        createdAt:
          new Date().toISOString()

      };


      db.sales.push(sale);

      saveDatabase();

      closeModal();

      renderSales();

      loadDashboard();

      toast(
        "বিক্রয় সফলভাবে Save হয়েছে"
      );

    };

}


function renderSales() {

  const tbody =
    document.getElementById(
      "salesTable"
    );


  const sales =
    [...db.sales].sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );


  if (!sales.length) {

    tbody.innerHTML =
      `<tr>
        <td colspan="10" class="empty">
          এখনো কোনো বিক্রয় নেই
        </td>
      </tr>`;

    return;

  }


  tbody.innerHTML =
    sales.map(sale => {

      return `

        <tr>

          <td>
            ${formatDate(sale.date)}
          </td>

          <td>
            ${escapeHTML(
              sale.invoice
            )}
          </td>

          <td>
            ${escapeHTML(
              sale.productName
            )}
          </td>

          <td>
            ${escapeHTML(
              sale.customerName
            )}
          </td>

          <td>
            ${sale.quantity}
          </td>

          <td>
            ${money(sale.total)}
          </td>

          <td class="profit">
            ${money(sale.profit)}
          </td>

          <td>
            ${money(sale.paid)}
          </td>

          <td class="due">
            ${money(sale.due)}
          </td>

          <td>

            <button
              class="action-btn delete-btn"
              onclick="deleteSale('${sale.id}')"
            >
              Delete
            </button>

          </td>

        </tr>

      `;

    }).join("");

}


function deleteSale(id) {

  const sale =
    db.sales.find(
      s =>
        s.id === id
    );


  if (!sale) return;


  if (
    !confirm(
      "এই Sale Delete করলে Stock ফেরত যাবে। Continue?"
    )
  ) return;


  const product =
    db.products.find(
      p =>
        p.id === sale.productId
    );


  if (product) {

    product.stock +=
      number(
        sale.quantity
      );

  }


  const customer =
    db.customers.find(
      c =>
        c.id === sale.customerId
    );


  if (customer) {

    customer.balance =
      Math.max(
        0,
        customer.balance -
        number(sale.due)
      );

  }


  db.sales =
    db.sales.filter(
      s =>
        s.id !== id
    );


  saveDatabase();

  renderSales();

  loadDashboard();

  toast(
    "Sale Delete হয়েছে এবং Stock ফেরত গেছে"
  );

}


/* =========================================================
   PURCHASE
   ========================================================= */

function openPurchaseModal() {

  if (!db.products.length) {

    toast(
      "আগে Product তৈরি করুন"
    );

    return;

  }


  openModal(
    "নতুন Purchase",
    `

      <div class="form-group">

        <label>পণ্য *</label>

        <select
          name="productId"
          required
        >

          <option value="">
            পণ্য নির্বাচন করুন
          </option>

          ${db.products.map(
            product => `
              <option value="${product.id}">
                ${escapeHTML(
                  product.name
                )}
              </option>
            `
          ).join("")}

        </select>

      </div>


      <div class="form-group">

        <label>Supplier</label>

        <select name="supplierId">

          <option value="">
            Cash Supplier
          </option>

          ${db.suppliers.map(
            supplier => `
              <option value="${supplier.id}">
                ${escapeHTML(
                  supplier.name
                )}
              </option>
            `
          ).join("")}

        </select>

      </div>


      <div class="form-grid">

        <div class="form-group">

          <label>Quantity *</label>

          <input
            type="number"
            name="quantity"
            min="1"
            required
          >

        </div>


        <div class="form-group">

          <label>Unit Purchase Price *</label>

          <input
            type="number"
            name="unitPrice"
            min="0"
            step="0.01"
            required
          >

        </div>


        <div class="form-group">

          <label>Paid</label>

          <input
            type="number"
            name="paid"
            min="0"
            value="0"
          >

        </div>

      </div>


      <div class="form-actions">

        <button
          type="button"
          class="secondary-btn"
          onclick="closeModal()"
        >
          Cancel
        </button>

        <button
          class="primary-btn"
          type="submit"
        >
          Save Purchase
        </button>

      </div>

    `
  );


  document
    .getElementById("modalForm")
    .onsubmit =
    function(event) {

      event.preventDefault();


      const form =
        new FormData(event.target);


      const productId =
        form.get("productId");


      const supplierId =
        form.get("supplierId");


      const quantity =
        number(
          form.get("quantity")
        );


      const unitPrice =
        number(
          form.get("unitPrice")
        );


      const paid =
        number(
          form.get("paid")
        );


      const product =
        db.products.find(
          p =>
            p.id === productId
        );


      if (!product) {

        toast(
          "Product নির্বাচন করুন"
        );

        return;

      }


      const total =
        quantity *
        unitPrice;


      if (paid > total) {

        toast(
          "Paid মোটের চেয়ে বেশি হতে পারবে না"
        );

        return;

      }


      const due =
        total -
        paid;


      const supplier =
        db.suppliers.find(
          s =>
            s.id === supplierId
        );


      if (supplier) {

        supplier.balance +=
          due;

      }


      product.stock +=
        quantity;


      db.purchases.push({

        id:
          generateId("purchase_"),

        invoice:
          "PUR-" +
          Date.now(),

        productId,

        productName:
          product.name,

        supplierId:
          supplierId || null,

        supplierName:
          supplier
            ? supplier.name
            : "Cash",

        quantity,

        unitPrice,

        total,

        paid,

        due,

        date:
          today(),

        createdAt:
          new Date().toISOString()

      });


      /*
        নতুন purchase price-কে
        Product-এর current purchase price
        হিসেবে রাখা হচ্ছে।
      */

      product.purchasePrice =
        unitPrice;


      saveDatabase();

      closeModal();

      renderPurchases();

      renderProducts();

      loadDashboard();

      toast(
        "Purchase সফলভাবে Save হয়েছে"
      );

    };

}


function renderPurchases() {

  const tbody =
    document.getElementById(
      "purchasesTable"
    );


  const purchases =
    [...db.purchases].sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );


  if (!purchases.length) {

    tbody.innerHTML =
      `<tr>
        <td colspan="8" class="empty">
          কোনো Purchase নেই
        </td>
      </tr>`;

    return;

  }


  tbody.innerHTML =
    purchases.map(purchase => {

      return `

        <tr>

          <td>
            ${formatDate(
              purchase.date
            )}
          </td>

          <td>
            ${escapeHTML(
              purchase.invoice
            )}
          </td>

          <td>
            ${escapeHTML(
              purchase.productName
            )}
          </td>

          <td>
            ${escapeHTML(
              purchase.supplierName
            )}
          </td>

          <td>
            ${purchase.quantity}
          </td>

          <td>
            ${money(
              purchase.total
            )}
          </td>

          <td>
            ${money(
              purchase.paid
            )}
          </td>

          <td class="due">
            ${money(
              purchase.due
            )}
          </td>

        </tr>

      `;

    }).join("");

}


/* =========================================================
   CUSTOMERS
   ========================================================= */

function openCustomerModal(id = null) {

  editingCustomerId = id;


  const customer =
    db.customers.find(
      c =>
        c.id === id
    );


  const c =
    customer || {

      name: "",
      phone: "",
      address: ""

    };


  openModal(
    id
      ? "Customer Edit"
      : "নতুন Customer",
    `

      <div class="form-group">

        <label>নাম *</label>

        <input
          name="name"
          value="${escapeHTML(c.name)}"
          required
        >

      </div>


      <div class="form-group">

        <label>ফোন</label>

        <input
          name="phone"
          value="${escapeHTML(c.phone)}"
        >

      </div>


      <div class="form-group">

        <label>ঠিকানা</label>

        <input
          name="address"
          value="${escapeHTML(c.address)}"
        >

      </div>


      <div class="form-actions">

        <button
          type="button"
          class="secondary-btn"
          onclick="closeModal()"
        >
          Cancel
        </button>

        <button
          class="primary-btn"
        >
          Save
        </button>

      </div>

    `
  );


  document
    .getElementById("modalForm")
    .onsubmit =
    function(event) {

      event.preventDefault();


      const form =
        new FormData(event.target);


      const data = {

        name:
          form.get("name").trim(),

        phone:
          form.get("phone").trim(),

        address:
          form.get("address").trim()

      };


      if (id) {

        const index =
          db.customers.findIndex(
            c =>
              c.id === id
          );


        db.customers[index] = {

          ...db.customers[index],
          ...data

        };


        toast(
          "Customer Update হয়েছে"
        );

      } else {

        db.customers.push({

          id:
            generateId("customer_"),

          ...data,

          balance: 0,

          createdAt:
            new Date().toISOString()

        });


        toast(
          "Customer যোগ হয়েছে"
        );

      }


      saveDatabase();

      closeModal();

      renderCustomers();

    };

}


function renderCustomers() {

  const tbody =
    document.getElementById(
      "customersTable"
    );


  if (!db.customers.length) {

    tbody.innerHTML =
      `<tr>
        <td colspan="5" class="empty">
          কোনো Customer নেই
        </td>
      </tr>`;

    return;

  }


  tbody.innerHTML =
    db.customers.map(customer => {

      return `

        <tr>

          <td>
            <strong>
              ${escapeHTML(
                customer.name
              )}
            </strong>
          </td>

          <td>
            ${escapeHTML(
              customer.phone
            )}
          </td>

          <td>
            ${escapeHTML(
              customer.address
            )}
          </td>

          <td class="due">
            ${money(
              customer.balance
            )}
          </td>

          <td>

            <button
              class="action-btn pay-btn"
              onclick="customerPayment('${customer.id}')"
            >
              জমা
            </button>

            <button
              class="action-btn edit-btn"
              onclick="openCustomerModal('${customer.id}')"
            >
              Edit
            </button>

            <button
              class="action-btn delete-btn"
              onclick="deleteCustomer('${customer.id}')"
            >
              Delete
            </button>

          </td>

        </tr>

      `;

    }).join("");

}


function customerPayment(id) {

  const customer =
    db.customers.find(
      c =>
        c.id === id
    );


  if (!customer) return;


  if (customer.balance <= 0) {

    toast(
      "এই Customer-এর কোনো বাকি নেই"
    );

    return;

  }


  const amount =
    prompt(
      `বর্তমান বাকি ${money(customer.balance)}\nকত টাকা জমা হয়েছে?`
    );


  if (!amount) return;


  const payment =
    number(amount);


  if (
    payment <= 0 ||
    payment > customer.balance
  ) {

    toast(
      "সঠিক amount দিন"
    );

    return;

  }


  customer.balance -=
    payment;


  saveDatabase();

  renderCustomers();

  toast(
    `${money(payment)} জমা হয়েছে`
  );

}


function deleteCustomer(id) {

  if (
    db.sales.some(
      sale =>
        sale.customerId === id
    )
  ) {

    toast(
      "এই Customer-এর Sales history আছে"
    );

    return;

  }


  if (
    !confirm(
      "Customer Delete করতে চান?"
    )
  ) return;


  db.customers =
    db.customers.filter(
      customer =>
        customer.id !== id
    );


  saveDatabase();

  renderCustomers();

  toast(
    "Customer Delete হয়েছে"
  );

}


/* =========================================================
   SUPPLIERS
   ========================================================= */

function openSupplierModal(id = null) {

  editingSupplierId = id;


  const supplier =
    db.suppliers.find(
      s =>
        s.id === id
    );


  const s =
    supplier || {

      name: "",
      phone: "",
      address: ""

    };


  openModal(
    id
      ? "Supplier Edit"
      : "নতুন Supplier",
    `

      <div class="form-group">

        <label>নাম *</label>

        <input
          name="name"
          value="${escapeHTML(s.name)}"
          required
        >

      </div>


      <div class="form-group">

        <label>ফোন</label>

        <input
          name="phone"
          value="${escapeHTML(s.phone)}"
        >

      </div>


      <div class="form-group">

        <label>ঠিকানা</label>

        <input
          name="address"
          value="${escapeHTML(s.address)}"
        >

      </div>


      <div class="form-actions">

        <button
          type="button"
          class="secondary-btn"
          onclick="closeModal()"
        >
          Cancel
        </button>

        <button
          class="primary-btn"
        >
          Save
        </button>

      </div>

    `
  );


  document
    .getElementById("modalForm")
    .onsubmit =
    function(event) {

      event.preventDefault();


      const form =
        new FormData(event.target);


      const data = {

        name:
          form.get("name").trim(),

        phone:
          form.get("phone").trim(),

        address:
          form.get("address").trim()

      };


      if (id) {

        const index =
          db.suppliers.findIndex(
            s =>
              s.id === id
          );


        db.suppliers[index] = {

          ...db.suppliers[index],
          ...data

        };


        toast(
          "Supplier Update হয়েছে"
        );

      } else {

        db.suppliers.push({

          id:
            generateId("supplier_"),

          ...data,

          balance: 0,

          createdAt:
            new Date().toISOString()

        });


        toast(
          "Supplier যোগ হয়েছে"
        );

      }


      saveDatabase();

      closeModal();

      renderSuppliers();

    };

}


function renderSuppliers() {

  const tbody =
    document.getElementById(
      "suppliersTable"
    );


  if (!db.suppliers.length) {

    tbody.innerHTML =
      `<tr>
        <td colspan="5" class="empty">
          কোনো Supplier নেই
        </td>
      </tr>`;

    return;

  }


  tbody.innerHTML =
    db.suppliers.map(supplier => {

      return `

        <tr>

          <td>
            <strong>
              ${escapeHTML(
                supplier.name
              )}
            </strong>
          </td>

          <td>
            ${escapeHTML(
              supplier.phone
            )}
          </td>

          <td>
            ${escapeHTML(
              supplier.address
            )}
          </td>

          <td class="due">
            ${money(
              supplier.balance
            )}
          </td>

          <td>

            <button
              class="action-btn pay-btn"
              onclick="supplierPayment('${supplier.id}')"
            >
              Payment
            </button>

            <button
              class="action-btn edit-btn"
              onclick="openSupplierModal('${supplier.id}')"
            >
              Edit
            </button>

            <button
              class="action-btn delete-btn"
              onclick="deleteSupplier('${supplier.id}')"
            >
              Delete
            </button>

          </td>

        </tr>

      `;

    }).join("");

}


function supplierPayment(id) {

  const supplier =
    db.suppliers.find(
      s =>
        s.id === id
    );


  if (!supplier) return;


  if (supplier.balance <= 0) {

    toast(
      "এই Supplier-এর কোনো বাকি নেই"
    );

    return;

  }


  const amount =
    prompt(
      `Supplier-এর বাকি ${money(supplier.balance)}\nকত টাকা Payment?`
    );


  if (!amount) return;


  const payment =
    number(amount);


  if (
    payment <= 0 ||
    payment > supplier.balance
  ) {

    toast(
      "সঠিক amount দিন"
    );

    return;

  }


  supplier.balance -=
    payment;


  saveDatabase();

  renderSuppliers();

  toast(
    `${money(payment)} Payment হয়েছে`
  );

}


function deleteSupplier(id) {

  if (
    db.purchases.some(
      purchase =>
        purchase.supplierId === id
    )
  ) {

    toast(
      "এই Supplier-এর Purchase history আছে"
    );

    return;

  }


  if (
    !confirm(
      "Supplier Delete করতে চান?"
    )
  ) return;


  db.suppliers =
    db.suppliers.filter(
      supplier =>
        supplier.id !== id
    );


  saveDatabase();

  renderSuppliers();

  toast(
    "Supplier Delete হয়েছে"
  );

}


/* =========================================================
   EXPENSES
   ========================================================= */

function openExpenseModal() {

  openModal(
    "নতুন খরচ",
    `

      <div class="form-group">

        <label>খরচের নাম *</label>

        <input
          name="title"
          placeholder="যেমন: দোকান ভাড়া"
          required
        >

      </div>


      <div class="form-group">

        <label>Amount *</label>

        <input
          type="number"
          name="amount"
          min="0"
          step="0.01"
          required
        >

      </div>


      <div class="form-group">

        <label>Note</label>

        <input
          name="note"
          placeholder="অতিরিক্ত তথ্য"
        >

      </div>


      <div class="form-actions">

        <button
          type="button"
          class="secondary-btn"
          onclick="closeModal()"
        >
          Cancel
        </button>

        <button
          class="primary-btn"
        >
          Save
        </button>

      </div>

    `
  );


  document
    .getElementById("modalForm")
    .onsubmit =
    function(event) {

      event.preventDefault();


      const form =
        new FormData(event.target);


      db.expenses.push({

        id:
          generateId("expense_"),

        title:
          form.get("title").trim(),

        amount:
          number(
            form.get("amount")
          ),

        note:
          form.get("note").trim(),

        date:
          today(),

        createdAt:
          new Date().toISOString()

      });


      saveDatabase();

      closeModal();

      renderExpenses();

      loadDashboard();

      toast(
        "খরচ Save হয়েছে"
      );

    };

}


function renderExpenses() {

  const tbody =
    document.getElementById(
      "expensesTable"
    );


  const expenses =
    [...db.expenses].sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );


  if (!expenses.length) {

    tbody.innerHTML =
      `<tr>
        <td colspan="5" class="empty">
          কোনো Expense নেই
        </td>
      </tr>`;

    return;

  }


  tbody.innerHTML =
    expenses.map(expense => {

      return `

        <tr>

          <td>
            ${formatDate(
              expense.date
            )}
          </td>

          <td>
            ${escapeHTML(
              expense.title
            )}
          </td>

          <td>
            ${money(
              expense.amount
            )}
          </td>

          <td>
            ${escapeHTML(
              expense.note
            )}
          </td>

          <td>

            <button
              class="action-btn delete-btn"
              onclick="deleteExpense('${expense.id}')"
            >
              Delete
            </button>

          </td>

        </tr>

      `;

    }).join("");

}


function deleteExpense(id) {

  if (
    !confirm(
      "Expense Delete করতে চান?"
    )
  ) return;


  db.expenses =
    db.expenses.filter(
      expense =>
        expense.id !== id
    );


  saveDatabase();

  renderExpenses();

  loadDashboard();

  toast(
    "Expense Delete হয়েছে"
  );

}


/* =========================================================
   REPORT
   ========================================================= */

function generateReport() {

  const from =
    document.getElementById(
      "reportFrom"
    ).value ||
    today();


  const to =
    document.getElementById(
      "reportTo"
    ).value ||
    today();


  document.getElementById(
    "reportFrom"
  ).value =
    from;


  document.getElementById(
    "reportTo"
  ).value =
    to;


  const sales =
    db.sales.filter(
      sale =>
        sale.date >= from &&
        sale.date <= to
    );


  const expenses =
    db.expenses.filter(
      expense =>
        expense.date >= from &&
        expense.date <= to
    );


  const totalSales =
    sales.reduce(
      (sum, sale) =>
        sum + number(sale.total),
      0
    );


  const grossProfit =
    sales.reduce(
      (sum, sale) =>
        sum + number(sale.profit),
      0
    );


  const totalExpense =
    expenses.reduce(
      (sum, expense) =>
        sum + number(expense.amount),
      0
    );


  const netProfit =
    grossProfit -
    totalExpense;


  document.getElementById(
    "reportSales"
  ).textContent =
    money(totalSales);


  document.getElementById(
    "reportProfit"
  ).textContent =
    money(grossProfit);


  document.getElementById(
    "reportExpense"
  ).textContent =
    money(totalExpense);


  document.getElementById(
    "reportNetProfit"
  ).textContent =
    money(netProfit);


  const tbody =
    document.getElementById(
      "reportTable"
    );


  if (!sales.length) {

    tbody.innerHTML =
      `<tr>
        <td colspan="7" class="empty">
          এই সময়ে কোনো বিক্রয় নেই
        </td>
      </tr>`;

    return;

  }


  tbody.innerHTML =
    sales.map(sale => {

      return `

        <tr>

          <td>
            ${formatDate(
              sale.date
            )}
          </td>

          <td>
            ${escapeHTML(
              sale.invoice
            )}
          </td>

          <td>
            ${escapeHTML(
              sale.productName
            )}
          </td>

          <td>
            ${escapeHTML(
              sale.customerName
            )}
          </td>

          <td>
            ${sale.quantity}
          </td>

          <td>
            ${money(
              sale.total
            )}
          </td>

          <td class="profit">
            ${money(
              sale.profit
            )}
          </td>

        </tr>

      `;

    }).join("");

}


/* =========================================================
   BACKUP
   ========================================================= */

function backupData() {

  const data =
    JSON.stringify(
      db,
      null,
      2
    );


  const blob =
    new Blob(
      [data],
      {
        type:
          "application/json"
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const a =
    document.createElement(
      "a"
    );


  a.href = url;

  a.download =
    "mahfuz-traders-backup-" +
    today() +
    ".json";


  document.body.appendChild(a);

  a.click();

  a.remove();

  URL.revokeObjectURL(url);


  toast(
    "Backup Download হয়েছে"
  );

}


document
  .getElementById("restoreFile")
  .addEventListener(
    "change",
    function(event) {

      const file =
        event.target.files[0];

      if (!file) return;


      const reader =
        new FileReader();


      reader.onload =
        function(e) {

          try {

            const imported =
              JSON.parse(
                e.target.result
              );


            if (
              !imported.products ||
              !imported.sales ||
              !imported.customers
            ) {

              throw new Error();

            }


            if (
              !confirm(
                "Restore করলে বর্তমান Data replace হবে। Continue?"
              )
            ) {

              return;

            }


            db = {

              ...structuredClone(
                DEFAULT_DB
              ),

              ...imported

            };


            saveDatabase();

            location.reload();

          } catch (error) {

            toast(
              "Backup file সঠিক নয়"
            );

          }

        };


      reader.readAsText(file);

    }
  );


/* =========================================================
   DELETE ALL DATA
   ========================================================= */

function clearAllData() {

  const confirmText =
    prompt(
      "সব Data Delete করতে হলে DELETE লিখুন:"
    );


  if (
    confirmText !== "DELETE"
  ) {

    toast(
      "Data Delete করা হয়নি"
    );

    return;

  }


  db =
    structuredClone(
      DEFAULT_DB
    );


  saveDatabase();

  location.reload();

}


/* =========================================================
   GLOBAL INITIALIZATION
   ========================================================= */

window.openProductModal =
  openProductModal;

window.openSaleModal =
  openSaleModal;

window.openPurchaseModal =
  openPurchaseModal;

window.openCustomerModal =
  openCustomerModal;

window.openSupplierModal =
  openSupplierModal;

window.openExpenseModal =
  openExpenseModal;

window.deleteProduct =
  deleteProduct;

window.deleteSale =
  deleteSale;

window.deleteCustomer =
  deleteCustomer;

window.deleteSupplier =
  deleteSupplier;

window.deleteExpense =
  deleteExpense;

window.customerPayment =
  customerPayment;

window.supplierPayment =
  supplierPayment;

window.generateReport =
  generateReport;

window.backupData =
  backupData;

window.clearAllData =
  clearAllData;

window.closeModal =
  closeModal;

window.showPage =
  showPage;