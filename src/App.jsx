import React, { useEffect, useState } from "react";
import { Navigation } from "./components/Navigation";
import { Dashboard } from "./components/Dashboard";
import { ExpenseEntry } from "./components/ExpenseEntry";
import { IncomeTracking } from "./components/IncomeTracking";
import { Categories } from "./components/Categories";
import { BudgetSetting } from "./components/BudgetSetting";
import { Account } from "./components/Account";
import { Login } from "./components/Login";
import api from "./api";
export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        if (token) {
          // First time login with token from URL
          localStorage.setItem("authToken", token);
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );

          try {
            const { data } = await api.get("/api/user");
            setUser(data);
            setLoggedIn(true);
          } catch (err) {
            console.error("Failed to load user with new token:", err);
            localStorage.removeItem("authToken");
            setLoggedIn(false);
          }
          loadExpense();
          loadIncome();
          loadCategory();
          loadBudget();
        } else {
          // Check existing token
          const existingToken = localStorage.getItem("authToken");
          if (existingToken) {
            try {
              const { data } = await api.get("/api/user");
              setUser(data);
              setLoggedIn(true);
            } catch (err) {
              console.error("Failed to load user with existing token:", err);
              // Token is invalid, remove it
              localStorage.removeItem("authToken");
              setUser(null);
              setLoggedIn(false);
            }
            loadExpense();
            loadIncome();
            loadCategory();
            loadBudget();
          } else {
            // No token at all
            setLoggedIn(false);
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setLoggedIn(false);
        setUser(null);
      } finally {
        setIsAuthChecked(true);
      }
    })();
  }, []);

  const loadBudget = async () => {
    try {
      const response = await api.get("/api/budgets");
      if (response.status === 200) {
        const mappedBudgets = response.data.map((e, index) => ({
          id: index + 1,
          categoryId: e.categoryId,
          amount: e.amount,
          period: e.period,
          spent: e.spent,
        }));
        setBudgets(mappedBudgets);
      }
    } catch (err) {
      console.error("Error loading Budgets:", err);
    }
  };

  const loadIncome = async () => {
    try {
      const response = await api.get("/api/incomes");
      if (response.status === 200) {
        const mappedIncomes = response.data.map((e) => ({
          id: e.id,
          amount: e.amount,
          date: e.date,
          description: e.description,
          souce: e.source,
          type: e.type,
        }));
        setIncome(mappedIncomes);
      }
    } catch (err) {
      console.error("Error loading Incomes:", err);
    }
  };

  const loadCategory = async () => {
    try {
      const response = await api.get("/api/categories");
      if (response.status === 200) {
        const mappedCategories = response.data.map((e) => ({
          id: e.id,
          name: e.name,
          color: e.color,
          icon: e.icon,
        }));
        setCategories(mappedCategories);
      }
    } catch (err) {
      console.error("Error loading Categories:", err);
    }
  };

  console.log(categories);
  const loadExpense = async () => {
    try {
      const response = await api.get("/api/expenses");
      if (response.status === 200) {
        // Method 1: Map and set all expenses at once (Recommended)
        const mappedExpenses = response.data.map((e) => ({
          id: e.id,
          amount: e.amount,
          category: e.category,
          date: e.date,
          description: e.description,
          paymentMethod: e.paymentMethod,
        }));
        setExpenses(mappedExpenses);

        // Method 2: If you need to append to existing expenses
        // setExpenses((prev) => [...prev, ...mappedExpenses]);
      }
    } catch (err) {
      console.error("Error loading expenses:", err);
    }
  };

  console.log(user);

  const handleLogout = () => {
    setUser(null);
    setLoggedIn(false);
    setCurrentPage("dashboard");
    localStorage.removeItem("authToken");
  };

  const addExpense = (expense) => {
    const newExpense = { ...expense, id: Date.now().toString() };
    setExpenses((prev) => [newExpense, ...prev]);

    // Update budget spent amount
    setBudgets((prev) =>
      prev.map((budget) =>
        budget.categoryId === expense.category
          ? { ...budget, spent: budget.spent + expense.amount }
          : budget
      )
    );
  };

  const addIncome = (incomeItem) => {
    const newIncome = { ...incomeItem, id: Date.now().toString() };
    setIncome((prev) => [newIncome, ...prev]);
  };

  const addCategory = (category) => {
    const newCategory = {
      ...category,
      id: category.name.toLowerCase().replace(/\s+/g, "-"),
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const updateCategory = (categoryId, updates) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId ? { ...category, ...updates } : category
      )
    );
  };

  const deleteCategory = (categoryId) => {
    setCategories((prev) =>
      prev.filter((category) => category.id !== categoryId)
    );
  };

  const addBudget = (budget) => {
    const newBudget = { ...budget, id: Date.now().toString(), spent: 0 };
    setBudgets((prev) => [...prev, newBudget]);
  };

  const updateBudget = (budgetId, updates) => {
    setBudgets((prev) =>
      prev.map((budget) =>
        budget.id === budgetId ? { ...budget, ...updates } : budget
      )
    );
  };

  const deleteBudget = (budgetId) => {
    setBudgets((prev) => prev.filter((budget) => budget.id !== budgetId));
  };

  // Show login page only after we checked auth
  if (!loggedIn && isAuthChecked) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard
            expenses={expenses}
            income={income}
            categories={categories}
            budgets={budgets}
          />
        );
      case "expenses":
        return (
          <ExpenseEntry categories={categories} onAddExpense={addExpense} />
        );
      case "income":
        return <IncomeTracking income={income} onAddIncome={addIncome} />;
      case "categories":
        return (
          <Categories
            categories={categories}
            onAddCategory={addCategory}
            onUpdateCategory={updateCategory}
            onDeleteCategory={deleteCategory}
          />
        );
      case "budgets":
        return (
          <BudgetSetting
            categories={categories}
            budgets={budgets}
            onAddBudget={addBudget}
            onUpdateBudget={updateBudget}
            onDeleteBudget={deleteBudget}
          />
        );
      case "account":
        return (
          <Account
            user={user}
            expenses={expenses}
            income={income}
            categories={categories}
            onLogout={handleLogout}
          />
        );
      default:
        return (
          <Dashboard
            expenses={expenses}
            income={income}
            categories={categories}
            budgets={budgets}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background dark">
      <Navigation
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        user={user}
      />
      <main className="container mx-auto px-4 py-6">{renderPage()}</main>
    </div>
  );
}
