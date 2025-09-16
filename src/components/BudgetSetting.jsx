import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Progress } from "./ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import {
  Plus,
  Target,
  AlertTriangle,
  Edit,
  IndianRupee,
  Calendar,
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import api from "../api";

export function BudgetSetting({
  categories,
  budgets,
  onAddBudget,
  onUpdateBudget,
  onDeleteBudget,
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    categoryId: "",
    amount: "",
    period: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.categoryId || !formData.amount || !formData.period) {
      toast.error("Please fill in all required fields");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Check if budget already exists for this category
    const existingBudget = budgets.find(
      (budget) => budget.categoryId === formData.categoryId
    );

    if (existingBudget && !editingBudget) {
      toast.error("Budget already exists for this category");
      return;
    }

    if (editingBudget) {
      try {
        const res = await api.put("/api/budget", formData);
        if (res.status == 200) {
          console.log("Updated to db sucessfullty");
        }
      } catch (err) {
        console.error(err);
      }
      onUpdateBudget(editingBudget.id, {
        amount,
        period: formData.period,
      });
      toast.success("Budget updated successfully!");
    } else {
      try {
        const res = await api.post("/api/budget", formData);
        if (res.status == 200) {
          console.log("Saved to DB successfully");
        }
      } catch (err) {
        console.error(err);
      }
      onAddBudget({
        categoryId: formData.categoryId,
        amount,
        period: formData.period,
      });
      toast.success("Budget created successfully!");
    }

    // Reset form
    setFormData({
      categoryId: "",
      amount: "",
      period: "",
    });
    setEditingBudget(null);
    setIsDialogOpen(false);
  };

  const handleDeleteBudget = async (budget) => {
    try {
      const res = await api.delete(`/api/budget/${budget.categoryId}`);
      if (res.status === 200) {
        if (typeof onDeleteBudget === "function") {
          onDeleteBudget(budget.id);
        }
        setIsDialogOpen(false);
        setEditingBudget(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getCategoryName = (categoryId) => {
    return categories.find((cat) => cat.id === categoryId)?.name || categoryId;
  };

  const getCategoryIcon = (categoryId) => {
    return categories.find((cat) => cat.id === categoryId)?.icon || "📝";
  };

  const getCategoryColor = (categoryId) => {
    return categories.find((cat) => cat.id === categoryId)?.color || "#666";
  };

  const getAvailableCategories = () => {
    const budgetCategoryIds = budgets.map((budget) => budget.categoryId);
    return categories.filter(
      (category) => !budgetCategoryIds.includes(category.id)
    );
  };

  const openEditDialog = (budget) => {
    setEditingBudget(budget);
    setFormData({
      categoryId: budget.categoryId,
      amount: budget.amount.toString(),
      period: budget.period,
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingBudget(null);
    setFormData({
      categoryId: "",
      amount: "",
      period: "",
    });
    setIsDialogOpen(true);
  };

  const getBudgetStatus = (budget) => {
    const percentage = (budget.spent / budget.amount) * 100;
    if (percentage >= 100) return { status: "over", color: "destructive" };
    if (percentage >= 80) return { status: "warning", color: "secondary" };
    return { status: "good", color: "default" };
  };

  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Budget Management</h1>
          <p className="text-muted-foreground">
            Set spending limits for your categories and track your progress
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingBudget ? "Edit Budget" : "Create New Budget"}
              </DialogTitle>
              <DialogDescription>
                Set a spending limit for a category
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    handleInputChange("categoryId", value)
                  }
                  disabled={!!editingBudget}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {editingBudget ? (
                      <SelectItem value={editingBudget.categoryId}>
                        <div className="flex items-center space-x-2">
                          <span>
                            {getCategoryIcon(editingBudget.categoryId)}
                          </span>
                          <span>
                            {getCategoryName(editingBudget.categoryId)}
                          </span>
                        </div>
                      </SelectItem>
                    ) : (
                      getAvailableCategories().map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center space-x-2">
                            <span>{category.icon}</span>
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Budget Amount *</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) =>
                      handleInputChange("amount", e.target.value)
                    }
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="period">Budget Period *</Label>
                <Select
                  value={formData.period}
                  onValueChange={(value) => handleInputChange("period", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Weekly</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="monthly">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Monthly</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2">
                {editingBudget && (
                  <Button
                    type="button"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleDeleteBudget(editingBudget)}
                    title="Delete budget"
                  >
                    Delete Budget
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingBudget ? "Update" : "Create"} Budget
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Budgeted
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ₹{totalBudgeted.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {budgets.length} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₹{totalSpent.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {((totalSpent / totalBudgeted) * 100).toFixed(1)}% of total budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                totalBudgeted - totalSpent >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              ₹{(totalBudgeted - totalSpent).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Available to spend</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {budgets.map((budget) => {
          const percentage = Math.min(
            (budget.spent / budget.amount) * 100,
            100
          );
          const remaining = budget.amount - budget.spent;
          const { status, color } = getBudgetStatus(budget);

          return (
            <Card key={budget.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                      style={{
                        backgroundColor: `${getCategoryColor(
                          budget.categoryId
                        )}20`,
                        color: getCategoryColor(budget.categoryId),
                      }}
                    >
                      {getCategoryIcon(budget.categoryId)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {getCategoryName(budget.categoryId)}
                      </CardTitle>
                      <CardDescription className="capitalize">
                        {budget.period} budget
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant={color}>{percentage.toFixed(0)}% used</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(budget)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Spent: ₹{budget.spent.toFixed(2)}</span>
                    <span>Budget: ₹{budget.amount.toFixed(2)}</span>
                  </div>
                  <Progress
                    value={percentage}
                    className={`h-2 ${status === "over" ? "bg-red-100" : ""}`}
                  />
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Remaining:</span>
                  <span
                    className={`font-medium ${
                      remaining >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ₹{remaining.toFixed(2)}
                  </span>
                </div>

                {status === "warning" && (
                  <div className="flex items-center space-x-2 text-orange-600 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Approaching budget limit</span>
                  </div>
                )}

                {status === "over" && (
                  <div className="flex items-center space-x-2 text-red-600 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>
                      Budget exceeded by ₹
                      {(budget.spent - budget.amount).toFixed(2)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {budgets.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No budgets set yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first budget to start tracking your spending limits
            </p>
            <Button onClick={openAddDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Budget
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Budget Tips */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Budget Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Set realistic budgets based on your spending history</li>
            <li>• Review and adjust budgets monthly</li>
            <li>• Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings</li>
            <li>• Set alerts when reaching 80% of your budget</li>
            <li>
              • Track both weekly and monthly budgets for different categories
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
