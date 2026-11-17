# 💰 Kakeibo: Personal Expense Tracker

Kakeibo is a simple, beginner-friendly expense tracker built with **HTML, CSS and JavaScript**. It lets you record income and expenses, see where your money goes, set a monthly budget, and view reports and charts. No backend or API is needed. Everything is saved in your browser using **LocalStorage**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 **Dashboard** | Total income, total expenses and current balance at a glance |
| ➕ **Add transactions** | Record income or expenses with amount, date, category and description (with form validation) |
| 📝 **Transaction history** | Search, filter, edit and delete transactions |
| 🏷️ **Category management** | Default categories (Food, Transport, Shopping, Bills, Education...) plus your own custom ones |
| 📅 **Monthly reports** | Compare income, expenses and savings for each month |
| 📈 **Charts** | Doughnut chart of spending by category and bar chart of monthly income vs expenses |
| 🎯 **Budget tracking** | Set a monthly budget and see how much remains (the bar turns orange at 80% and red at 100%) |
| 📱 **Responsive design** | Works on mobile, tablet and desktop |
| 💾 **Data persistence** | Data stays after refreshing the page or closing the browser |

---

## 🛠️ Technologies Used

- **HTML5**: page structure
- **CSS3**: styling, Flexbox, Grid, media queries, CSS variables
- **JavaScript (ES6)**: logic, DOM manipulation, events, array methods
- **LocalStorage**: saving data in the browser
- **[Chart.js](https://www.chartjs.org/)**: charts (loaded from a CDN)

---

## 📁 Project Structure

```
Kakeibo/
├── index.html        # Page structure (4 pages: Dashboard, Transactions, Categories, Reports)
├── css/
│   └── style.css     # All styling + responsive design
├── js/
│   └── app.js        # All the logic
└── README.md         # You are here
```

---

## 🚀 How to Run

### Option 1: Live Server in VS Code (recommended)
1. Open the `Kakeibo` folder in **VS Code**.
2. Install the **Live Server** extension.
3. Right-click `index.html` and choose **Open with Live Server**.

### Option 2: Open directly
Double-click `index.html` to open it in your browser.

> ⚠️ **Internet is needed** the first time, because Chart.js loads from a CDN. Without internet, everything works except the charts.

---

## 📖 How to Use

1. **Add a transaction:** go to **Transactions**, choose Income or Expense, fill in the amount, date, category and description, then click **Add Transaction**.
2. **Edit or delete:** in the **History** list, click ✏️ to edit or 🗑️ to delete.
3. **Search:** type in the search box, or use the dropdown to show only income or only expenses.
4. **Set a budget:** on the **Dashboard**, enter your monthly budget and click **Save**.
5. **Add categories:** go to **Categories**, type a name and click **Add**. A category can only be deleted when no transaction uses it.
6. **View reports:** open **Reports** to compare each month.

---

## 💾 How Data Is Stored

All data is saved in the browser's LocalStorage under these keys:

| Key | What it stores |
|---|---|
| `transactions` | List of all transactions |
| `categories` | List of category names |
| `budget` | Monthly budget amount |

A transaction looks like this:

```js
{
  id: 1730000000000,
  type: "expense",        // or "income"
  amount: 250,
  date: "2026-10-21",
  category: "Food",
  description: "Lunch with friends"
}
```

**To reset the app:** press `F12` → **Application** tab → **Local Storage** → right-click your site → **Clear**.

> Data is stored only in your own browser. It is not shared between browsers or devices.

---

## 🎓 What You Will Learn

- JavaScript functions, arrays, objects and loops
- Array methods: `map`, `filter`, `find`, `reduce`, `sort`
- DOM manipulation and event handling (including event delegation)
- Form validation
- CRUD operations (Create, Read, Update, Delete)
- LocalStorage with `JSON.stringify` and `JSON.parse`
- Chart integration without any backend or API
- Responsive UI design with CSS Grid and media queries

---

## 🔧 Customisation

- **Change the currency:** edit `const CURRENCY = "₹";` at the top of `js/app.js`.
- **Change the colours:** edit the variables inside `:root { ... }` at the top of `css/style.css`.
- **Change default categories:** edit the `defaultCategories` array in `js/app.js`. This only affects a fresh start, so clear LocalStorage to see the change.

---

## 💡 Ideas for Improvement

- [ ] Add a "Load sample data" button
- [ ] Filter the history by month
- [ ] Dark mode
- [ ] Export transactions to CSV
- [ ] Separate budgets for each category
- [ ] Recurring transactions (rent, subscriptions)

---

## 🐞 Troubleshooting

| Problem | Fix |
|---|---|
| Charts are not showing | Check your internet connection (Chart.js loads from a CDN) |
| Data disappeared | You may be in a private/incognito window or have cleared the browser data |
| Page looks unstyled | Check that the folder structure matches the one above (`css/style.css`) |
| Nothing happens when clicking buttons | Press `F12` → **Console** and read the red error message |

---

## 📄 License

This project is open source and free to use for learning. You can use the MIT License if you plan to publish it.

---

Built as a learning project. Happy coding!
