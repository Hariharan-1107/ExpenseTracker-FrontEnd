import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, IndianRupee, AlertTriangle } from 'lucide-react';

export function Dashboard({ expenses, income, categories, budgets }) {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });

  const currentMonthIncome = income.filter(incomeItem => {
    const incomeDate = new Date(incomeItem.date);
    return incomeDate.getMonth() === currentMonth && incomeDate.getFullYear() === currentYear;
  });

  const totalExpenses = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalIncome = currentMonthIncome.reduce((sum, incomeItem) => sum + incomeItem.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  const recentTransactions = [
    ...expenses.slice(0, 3).map(expense => ({ ...expense, transactionType: 'expense' })),
    ...income.slice(0, 2).map(incomeItem => ({ ...incomeItem, transactionType: 'income' }))
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const getCategoryName = (categoryId) => {
    return categories.find(cat => cat.id === categoryId)?.name || categoryId;
  };

  const getCategoryColor = (categoryId) => {
    return categories.find(cat => cat.id === categoryId)?.color || '#666';
  };

  const budgetAlerts = budgets.filter(budget => {
    const percentage = (budget.spent / budget.amount) * 100;
    return percentage >= 80;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>Dashboard</h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{totalIncome.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentMonthIncome.length} transactions this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₹{totalExpenses.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentMonthExpenses.length} transactions this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{netBalance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {netBalance >= 0 ? 'Surplus' : 'Deficit'} this month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
            <CardDescription>Your spending vs budget limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgets.map(budget => {
              const percentage = Math.min((budget.spent / budget.amount) * 100, 100);
              const isOverBudget = budget.spent > budget.amount;
              
              return (
                <div key={budget.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {getCategoryName(budget.categoryId)}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        ₹{budget.spent.toFixed(0)} / ₹{budget.amount}
                      </span>
                      {percentage >= 80 && (
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                  </div>
                  <Progress 
                    value={percentage} 
                    className={`h-2 ${isOverBudget ? 'bg-red-100' : ''}`}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest income and expenses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTransactions.map((transaction) => {
              const isIncome = transaction.transactionType === 'income';
              return (
                <div key={`${transaction.transactionType}-${transaction.id}`} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ 
                        backgroundColor: isIncome 
                          ? '#10B981' 
                          : getCategoryColor(transaction.category || 'other')
                      }}
                    />
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {isIncome 
                          ? transaction.source 
                          : getCategoryName(transaction.category || 'other')
                        }
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                      {isIncome ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <span>Budget Alerts</span>
            </CardTitle>
            <CardDescription>Categories approaching or exceeding budget limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {budgetAlerts.map(budget => {
                const percentage = (budget.spent / budget.amount) * 100;
                const isOverBudget = budget.spent > budget.amount;
                
                return (
                  <div key={budget.id} className="flex items-center justify-between p-3 bg-orange-900/20 rounded-lg">
                    <span className="font-medium">{getCategoryName(budget.categoryId)}</span>
                    <Badge variant={isOverBudget ? "destructive" : "secondary"}>
                      {percentage.toFixed(0)}% of budget used
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}