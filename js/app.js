/* =====================================================
   SPENDWISE - app.js
   Sections:
   1. Data (variables + LocalStorage)
   2. Helper functions
   3. Navigation
   4. Add / Edit transaction (form)
   5. Transaction history (list, search, delete)
   6. Categories
   7. Budget
   8. Dashboard + chart
   9. Monthly reports + chart
   10. Start the app
   ===================================================== */


/* ---------- 1. DATA ---------- */

const CURRENCY = "₹"; // change to "$" if you like

const defaultCategories = [
  "Food", "Transport", "Shopping", "Bills", "Education", "Health", "Salary", "Other"
];

// localStorage only saves TEXT. So we save with JSON.stringify
// and read back with JSON.parse. "|| default" is used the first time.
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let categories   = JSON.parse(localStorage.getItem("categories")) || defaultCategories;
let budget       = Number(localStorage.getItem("budget")) || 0;

let editingId = null;      // null = adding, a number = editing that transaction
let categoryChart = null;  // we keep charts here so we can destroy & redraw
let monthlyChart = null;

function saveData() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  localStorage.setItem("categories", JSON.stringify(categories));
  localStorage.setItem("budget", budget);
}


/* ---------- 2. HELPER FUNCTIONS ---------- */

// 1234.5 -> "₹1,234.50"
function formatMoney(n) {
  return CURRENCY + n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Today's date as "YYYY-MM-DD" (the format <input type="date"> needs)
function todayString() {
  const d = new Date();
  return d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0");
}

// Current month as "YYYY-MM"
function currentMonthKey() {
  return todayString().slice(0, 7);
}

// "2026-10" -> "Oct 2026"
function monthLabel(key) {
  const [year, month] = key.split("-");
  return new Date(year, month - 1).toLocaleString("en-US", { month: "short", year: "numeric" });
}

// Stops users from typing HTML/JS into the description box
function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Adds up the amounts of transactions of one type ("income" or "expense")
function sumByType(list, type) {
  return list
    .filter(t => t.type === type)
    .reduce((total, t) => total + t.amount, 0);
}


/* ---------- 3. NAVIGATION ---------- */

const navButtons = document.querySelectorAll(".nav-btn");
const pages = document.querySelectorAll(".page");

function showPage(pageId) {
  pages.forEach(p => p.classList.toggle("active", p.id === pageId));
  navButtons.forEach(b => b.classList.toggle("active", b.dataset.page === pageId));
  renderAll(); // redraw so charts get the right size
}

navButtons.forEach(btn => {
  btn.addEventListener("click", () => showPage(btn.dataset.page));
});


/* ---------- 4. ADD / EDIT TRANSACTION ---------- */

const txForm       = document.getElementById("txForm");
const amountInput  = document.getElementById("amount");
const dateInput    = document.getElementById("date");
const categorySel  = document.getElementById("category");
const descInput    = document.getElementById("description");
const formError    = document.getElementById("formError");
const submitBtn    = document.getElementById("submitBtn");
const cancelBtn    = document.getElementById("cancelBtn");
const formTitle    = document.getElementById("formTitle");

txForm.addEventListener("submit", function (event) {
  event.preventDefault(); // stop the page from refreshing

  // 1) Read values
  const type = document.querySelector('input[name="type"]:checked').value;
  const amount = parseFloat(amountInput.value);
  const date = dateInput.value;
  const category = categorySel.value;
  const description = descInput.value.trim();

  // 2) Validate
  if (isNaN(amount) || amount <= 0) {
    formError.textContent = "Please enter an amount greater than 0.";
    return;
  }
  if (!date) {
    formError.textContent = "Please choose a date.";
    return;
  }
  if (!category) {
    formError.textContent = "Please choose a category.";
    return;
  }
  formError.textContent = "";

  // 3) Create or update
  if (editingId === null) {
    transactions.push({
      id: Date.now(), // unique number based on the current time
      type: type,
      amount: amount,
      date: date,
      category: category,
      description: description
    });
  } else {
    const t = transactions.find(item => item.id === editingId);
    t.type = type;
    t.amount = amount;
    t.date = date;
    t.category = category;
    t.description = description;
  }

  // 4) Save, reset form, redraw
  saveData();
  resetForm();
  renderAll();
});

function resetForm() {
  txForm.reset();
  dateInput.value = todayString();
  editingId = null;
  formTitle.textContent = "Add Transaction";
  submitBtn.textContent = "Add Transaction";
  cancelBtn.classList.add("hidden");
  formError.textContent = "";
}

cancelBtn.addEventListener("click", resetForm);

// Fill the form with an existing transaction so the user can change it
function startEdit(id) {
  const t = transactions.find(item => item.id === id);
  if (!t) return;

  editingId = id;
  document.querySelector(`input[name="type"][value="${t.type}"]`).checked = true;
  amountInput.value = t.amount;
  dateInput.value = t.date;
  categorySel.value = t.category;
  descInput.value = t.description;

  formTitle.textContent = "Edit Transaction";
  submitBtn.textContent = "Update Transaction";
  cancelBtn.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}


/* ---------- 5. TRANSACTION HISTORY ---------- */

const txList      = document.getElementById("txList");
const recentList  = document.getElementById("recentList");
const searchInput = document.getElementById("searchInput");
const filterType  = document.getElementById("filterType");

// Builds the HTML for ONE transaction row
function txRowHTML(t, showButtons) {
  const sign = t.type === "income" ? "+" : "-";
  const buttons = showButtons
    ? `<button class="icon-btn" data-action="edit" data-id="${t.id}">✏️</button>
       <button class="icon-btn" data-action="delete" data-id="${t.id}">🗑️</button>`
    : "";

  return `
    <div class="tx-item">
      <div class="tx-info">
        <strong>${escapeHTML(t.description || t.category)}</strong>
        <small>${escapeHTML(t.category)} • ${t.date}</small>
      </div>
      <div class="tx-right">
        <span class="amount-${t.type}">${sign}${formatMoney(t.amount)}</span>
        ${buttons}
      </div>
    </div>`;
}

function renderTransactions() {
  const search = searchInput.value.toLowerCase();
  const typeFilter = filterType.value;

  const result = transactions
    .filter(t => typeFilter === "all" || t.type === typeFilter)
    .filter(t =>
      t.description.toLowerCase().includes(search) ||
      t.category.toLowerCase().includes(search))
    .sort((a, b) => b.date.localeCompare(a.date)); // newest first

  if (result.length === 0) {
    txList.innerHTML = `<p class="empty">No transactions found.</p>`;
    return;
  }
  txList.innerHTML = result.map(t => txRowHTML(t, true)).join("");
}

// ONE click listener for the whole list (event delegation).
// It works even for rows that are created later.
txList.addEventListener("click", function (event) {
  const btn = event.target.closest("button");
  if (!btn) return;

  const id = Number(btn.dataset.id);
  if (btn.dataset.action === "edit") {
    startEdit(id);
  } else if (btn.dataset.action === "delete") {
    if (confirm("Delete this transaction?")) {
      transactions = transactions.filter(t => t.id !== id);
      saveData();
      renderAll();
    }
  }
});

searchInput.addEventListener("input", renderTransactions);
filterType.addEventListener("change", renderTransactions);


/* ---------- 6. CATEGORIES ---------- */

const catForm  = document.getElementById("catForm");
const catInput = document.getElementById("catInput");
const catList  = document.getElementById("catList");
const catError = document.getElementById("catError");

function renderCategories() {
  // The list on the Categories page
  catList.innerHTML = categories
    .map(c => `<li>${escapeHTML(c)} <button data-cat="${escapeHTML(c)}" title="Delete">✕</button></li>`)
    .join("");

  // The dropdown in the transaction form (keep the current choice)
  const current = categorySel.value;
  categorySel.innerHTML = categories
    .map(c => `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`)
    .join("");
  if (categories.includes(current)) categorySel.value = current;
}

catForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const name = catInput.value.trim();

  if (name === "") {
    catError.textContent = "Please type a category name.";
    return;
  }
  const exists = categories.some(c => c.toLowerCase() === name.toLowerCase());
  if (exists) {
    catError.textContent = "That category already exists.";
    return;
  }

  categories.push(name);
  catError.textContent = "";
  catInput.value = "";
  saveData();
  renderCategories();
});

catList.addEventListener("click", function (event) {
  const btn = event.target.closest("button");
  if (!btn) return;
  const name = btn.dataset.cat;

  // Don't allow deleting a category that is being used
  if (transactions.some(t => t.category === name)) {
    catError.textContent = `"${name}" is used by some transactions. Edit or delete them first.`;
    return;
  }
  categories = categories.filter(c => c !== name);
  catError.textContent = "";
  saveData();
  renderCategories();
});


/* ---------- 7. BUDGET ---------- */

const budgetInput   = document.getElementById("budgetInput");
const saveBudgetBtn = document.getElementById("saveBudgetBtn");
const budgetBar     = document.getElementById("budgetBar");
const budgetText    = document.getElementById("budgetText");

saveBudgetBtn.addEventListener("click", function () {
  const value = parseFloat(budgetInput.value);
  if (isNaN(value) || value < 0) {
    alert("Please enter a valid budget.");
    return;
  }
  budget = value;
  saveData();
  renderDashboard();
});

function renderBudget() {
  // Only count THIS month's expenses
  const thisMonth = transactions.filter(t => t.date.startsWith(currentMonthKey()));
  const spent = sumByType(thisMonth, "expense");

  budgetInput.value = budget || "";
  budgetBar.className = "progress-bar";

  if (budget === 0) {
    budgetBar.style.width = "0%";
    budgetText.textContent = "No budget set yet.";
    return;
  }

  const percent = Math.min((spent / budget) * 100, 100);
  budgetBar.style.width = percent + "%";
  if (percent >= 100) budgetBar.classList.add("danger");
  else if (percent >= 80) budgetBar.classList.add("warning");

  const remaining = budget - spent;
  budgetText.textContent = remaining >= 0
    ? `Spent ${formatMoney(spent)} of ${formatMoney(budget)}. ${formatMoney(remaining)} remaining.`
    : `Over budget by ${formatMoney(-remaining)}! (Spent ${formatMoney(spent)} of ${formatMoney(budget)})`;
}


/* ---------- 8. DASHBOARD + CATEGORY CHART ---------- */

function renderDashboard() {
  const income = sumByType(transactions, "income");
  const expenses = sumByType(transactions, "expense");

  document.getElementById("totalIncome").textContent = formatMoney(income);
  document.getElementById("totalExpenses").textContent = formatMoney(expenses);
  document.getElementById("balance").textContent = formatMoney(income - expenses);

  renderBudget();

  // 5 most recent transactions
  const recent = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);
  recentList.innerHTML = recent.length
    ? recent.map(t => txRowHTML(t, false)).join("")
    : `<p class="empty">No transactions yet. Add your first one!</p>`;

  renderCategoryChart();
}

function renderCategoryChart() {
  // Total spending per category -> { Food: 500, Transport: 200 }
  const totals = {};
  transactions
    .filter(t => t.type === "expense")
    .forEach(t => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
    });

  const labels = Object.keys(totals);
  const values = Object.values(totals);
  const emptyMsg = document.getElementById("categoryEmpty");

  if (categoryChart) categoryChart.destroy(); // remove the old chart first

  if (labels.length === 0) {
    emptyMsg.classList.remove("hidden");
    return;
  }
  emptyMsg.classList.add("hidden");

  categoryChart = new Chart(document.getElementById("categoryChart"), {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: ["#4f46e5", "#16a34a", "#f59e0b", "#dc2626", "#0ea5e9",
                          "#a855f7", "#14b8a6", "#f97316", "#64748b", "#ec4899"]
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}


/* ---------- 9. MONTHLY REPORTS ---------- */

function renderReports() {
  // Group by month -> { "2026-09": {income: 0, expense: 0}, ... }
  const months = {};
  transactions.forEach(t => {
    const key = t.date.slice(0, 7);
    if (!months[key]) months[key] = { income: 0, expense: 0 };
    months[key][t.type] += t.amount;
  });

  const keys = Object.keys(months).sort(); // oldest -> newest
  const emptyMsg = document.getElementById("monthlyEmpty");

  // Table (newest month first)
  const body = document.getElementById("reportBody");
  body.innerHTML = [...keys].reverse().map(k => {
    const m = months[k];
    const saved = m.income - m.expense;
    return `<tr>
      <td>${monthLabel(k)}</td>
      <td class="amount-income">${formatMoney(m.income)}</td>
      <td class="amount-expense">${formatMoney(m.expense)}</td>
      <td>${formatMoney(saved)}</td>
    </tr>`;
  }).join("");

  // Chart
  if (monthlyChart) monthlyChart.destroy();
  if (keys.length === 0) {
    emptyMsg.classList.remove("hidden");
    return;
  }
  emptyMsg.classList.add("hidden");

  monthlyChart = new Chart(document.getElementById("monthlyChart"), {
    type: "bar",
    data: {
      labels: keys.map(monthLabel),
      datasets: [
        { label: "Income",   data: keys.map(k => months[k].income),  backgroundColor: "#16a34a" },
        { label: "Expenses", data: keys.map(k => months[k].expense), backgroundColor: "#dc2626" }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}


/* ---------- 10. START THE APP ---------- */

function renderAll() {
  renderCategories();
  renderDashboard();
  renderTransactions();
  renderReports();
}

dateInput.value = todayString(); // default date = today
renderAll();
