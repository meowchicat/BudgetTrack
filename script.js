let budget = JSON.parse(localStorage.getItem("budget")) || 0;
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let lastMonth = localStorage.getItem("lastMonth") || "";
let chart;

const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-02"

// Check for new month
if (lastMonth !== currentMonth) {
  expenses = [];
  localStorage.setItem("expenses", JSON.stringify(expenses));
  localStorage.setItem("lastMonth", currentMonth);
}

const monthLabel = document.getElementById("monthLabel");
const resetMonthBtn = document.getElementById("resetMonthBtn");


const budgetInput = document.getElementById("budgetInput");
const setBudgetBtn = document.getElementById("setBudgetBtn");
const expenseName = document.getElementById("expenseName");
const expenseAmount = document.getElementById("expenseAmount");
const expenseCategory = document.getElementById("expenseCategory");
const addExpenseBtn = document.getElementById("addExpenseBtn");

const totalBudgetEl = document.getElementById("totalBudget");
const totalExpensesEl = document.getElementById("totalExpenses");
const remainingEl = document.getElementById("remaining");
const expenseList = document.getElementById("expenseList");

const ctx = document.getElementById("expenseChart").getContext("2d");

function updateMonthLabel() {
  const now = new Date();
  const options = { month: "long", year: "numeric" };
  monthLabel.textContent = "📅 " + now.toLocaleDateString(undefined, options);
}

function resetMonth() {
  if (!confirm("Are you sure you want to reset the budget and all expenses for this month?")) return;

  expenses = [];
  budget = 0;

  localStorage.setItem("expenses", JSON.stringify(expenses));
  localStorage.setItem("budget", JSON.stringify(budget));
  localStorage.setItem("lastMonth", currentMonth);

  updateUI();
}

resetMonthBtn.addEventListener("click", resetMonth);


function updateChart() {
  const categoryTotals = {};

  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const data = {
    labels: Object.keys(categoryTotals),
    datasets: [{
      data: Object.values(categoryTotals),
    }]
  };

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "pie",
    data: data
  });
}

function updateUI() {
  totalBudgetEl.textContent = `$${budget.toFixed(2)}`;

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  totalExpensesEl.textContent = `$${totalExpenses.toFixed(2)}`;
  const remaining = budget - totalExpenses;
  remainingEl.textContent = `$${remaining.toFixed(2)}`;

  if (remaining < 0) {
    remainingEl.classList.add("negative");
  } else {
    remainingEl.classList.remove("negative");
  }

  expenseList.innerHTML = "";

  expenses.forEach((expense, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${expense.name} (${expense.category}) - $${expense.amount.toFixed(2)}</span>
      <button class="delete-btn">X</button>
    `;
    li.querySelector("button").addEventListener("click", () => {
      expenses.splice(index, 1);
      saveAndUpdate();
    });
    expenseList.appendChild(li);
  });

  updateChart();
}

function saveAndUpdate() {
  localStorage.setItem("budget", JSON.stringify(budget));
  localStorage.setItem("expenses", JSON.stringify(expenses));
  localStorage.setItem("lastMonth", currentMonth);
  updateUI();
}

setBudgetBtn.addEventListener("click", () => {
  budget = Number(budgetInput.value);
  budgetInput.value = "";
  saveAndUpdate();
});

addExpenseBtn.addEventListener("click", () => {
  const name = expenseName.value;
  const amount = Number(expenseAmount.value);
  const category = expenseCategory.value;

  if (name === "" || amount <= 0) return;

  expenses.push({ name, amount, category });

  expenseName.value = "";
  expenseAmount.value = "";
  saveAndUpdate();
});

// Initial render
updateMonthLabel();
updateUI();
