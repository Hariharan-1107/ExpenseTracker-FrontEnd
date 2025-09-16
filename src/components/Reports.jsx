import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Calendar, Download } from 'lucide-react';
import { Button } from './ui/button';

export function Reports({ expenses, income, categories }) {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const getCategoryName = (categoryId) => {
    return categories.find(cat => cat.id === categoryId)?.name || categoryId;
  };

  const getCategoryColor = (categoryId) => {
    return categories.find(cat => cat.id === categoryId)?.color || '#666';
  };

  // Filter data based on selected period
  const getFilteredData = () => {
    const year = parseInt(selectedYear);
    const currentMonth = new Date().getMonth();
    
    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      if (selectedPeriod === 'yearly') {
        return expenseDate.getFullYear() === year;
      } else {
        return expenseDate.getFullYear() === year && expenseDate.getMonth() === currentMonth;
      }
    });

    const filteredIncome = income.filter(incomeItem => {
      const incomeDate = new Date(incomeItem.date);
      if (selectedPeriod === 'yearly') {
        return incomeDate.getFullYear() === year;
      } else {
        return incomeDate.getFullYear() === year && incomeDate.getMonth() === currentMonth;
      }
    });

    return { filteredExpenses, filteredIncome };
  };

  const { filteredExpenses, filteredIncome } = getFilteredData();

  // Expense by Category Data
  const expenseByCategory = categories.map(category => {
    const categoryExpenses = filteredExpenses.filter(expense => expense.category === category.id);
    const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    return {
      name: category.name,
      value: total,
      color: category.color,
      count: categoryExpenses.length
    };
  }).filter(item => item.value > 0);

  // Monthly Trend Data (for yearly view)
  const monthlyTrendData = Array.from({ length: 12 }, (_, index) => {
    const monthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === parseInt(selectedYear) && expenseDate.getMonth() === index;
    });
    
    const monthIncome = income.filter(incomeItem => {
      const incomeDate = new Date(incomeItem.date);
      return incomeDate.getFullYear() === parseInt(selectedYear) && incomeDate.getMonth() === index;
    });

    const totalExpenses = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalIncome = monthIncome.reduce((sum, incomeItem) => sum + incomeItem.amount, 0);

    return {
      month: new Date(2024, index, 1).toLocaleDateString('en-US', { month: 'short' }),
      expenses: totalExpenses,
      income: totalIncome,
      net: totalIncome - totalExpenses
    };
  });

  // Payment Method Breakdown
  const paymentMethodData = filteredExpenses.reduce((acc, expense) => {
    const existing = acc.find(item => item.method === expense.paymentMethod);
    if (existing) {
      existing.amount += expense.amount;
      existing.count += 1;
    } else {
      acc.push({
        method: expense.paymentMethod,
        amount: expense.amount,
        count: 1
      });
    }
    return acc;
  }, []);

  // Summary Statistics
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalIncome = filteredIncome.reduce((sum, incomeItem) => sum + incomeItem.amount, 0);
  const netBalance = totalIncome - totalExpenses;
  const avgExpensePerDay = totalExpenses / (selectedPeriod === 'yearly' ? 365 : 30);

  const topCategory = expenseByCategory.length > 0 
    ? expenseByCategory.reduce((max, category) => category.value > max.value ? category : max)
    : null;

  const availableYears = Array.from(new Set([
    ...expenses.map(e => new Date(e.date).getFullYear()),
    ...income.map(i => new Date(i.date).getFullYear()),
    new Date().getFullYear()
  ])).sort((a, b) => b - a);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Financial Reports</h1>
          <p className="text-muted-foreground">
            Analyze your spending patterns and financial trends
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₹{totalExpenses.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredExpenses.length} transactions
            </p>
          </CardContent>
        </Card>

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
              {filteredIncome.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{netBalance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {netBalance >= 0 ? 'Surplus' : 'Deficit'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{avgExpensePerDay.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Expense per day
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense by Category Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChartIcon className="w-5 h-5" />
                  <span>Expenses by Category</span>
                </CardTitle>
                <CardDescription>
                  Breakdown of your spending across categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                {expenseByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expenseByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) => 
                          `${name}: ₹${value.toFixed(0)} (${(percent * 100).toFixed(0)}%)`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`₹${value.toFixed(2)}`, 'Amount']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No expense data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Spending Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Top Spending Categories</CardTitle>
                <CardDescription>
                  Your highest expense categories this {selectedPeriod.slice(0, -2)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {expenseByCategory
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 5)
                  .map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            #{index + 1}
                          </span>
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                        </div>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {category.count} transactions
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{category.value.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {((category.value / totalExpenses) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                
                {expenseByCategory.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No expense data available for the selected period
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>
                Detailed analysis of spending by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              {expenseByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={expenseByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value.toFixed(2)}`, 'Amount']} />
                    <Bar dataKey="value" fill="#8884d8">
                      {expenseByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-96 flex items-center justify-center text-muted-foreground">
                  No expense data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {selectedPeriod === 'yearly' && (
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
                <CardDescription>
                  Income vs Expenses throughout the year
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value.toFixed(2)}`, '']} />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="Income"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#EF4444" 
                      strokeWidth={2}
                      name="Expenses"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="net" 
                      stroke="#6366F1" 
                      strokeWidth={2}
                      name="Net Balance"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topCategory && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm">Highest spending category</span>
                    <Badge style={{ backgroundColor: topCategory.color, color: 'white' }}>
                      {topCategory.name}
                    </Badge>
                  </div>
                )}
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">Savings rate</span>
                  <Badge variant="secondary">
                    {totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : 0}%
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">Transaction count</span>
                  <Badge variant="outline">
                    {filteredExpenses.length + filteredIncome.length} total
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Income vs Expenses</span>
                    <span className={netBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {netBalance >= 0 ? 'Healthy' : 'Over budget'}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Expenses</span>
                      <span>₹{totalExpenses.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-red-900/20 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Income</span>
                      <span>₹{totalIncome.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method Analysis</CardTitle>
              <CardDescription>
                How you prefer to pay for expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethodData.map((method, index) => {
                  const percentage = (method.amount / totalExpenses) * 100;
                  return (
                    <div key={method.method} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{method.method}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            {method.count} transactions
                          </span>
                          <span className="font-medium">
                            ₹{method.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-600/20 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground">
                          {percentage.toFixed(1)}% of total expenses
                        </span>
                      </div>
                    </div>
                  );
                })}

                {paymentMethodData.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No payment method data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}