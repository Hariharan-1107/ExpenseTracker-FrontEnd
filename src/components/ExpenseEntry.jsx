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
import { Textarea } from "./ui/textarea";
import { Plus, IndianRupee } from "lucide-react";
import { toast } from "sonner@2.0.3";
import api from "../api";

export function ExpenseEntry({ categories, onAddExpense }) {
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "",
  });

  const paymentMethods = [
    "UPI",
    "Cash",
    "Credit Card",
    "Debit Card",
    "Bank Transfer",
    "Digital Wallet",
    "Check",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.amount ||
      !formData.category ||
      !formData.description ||
      !formData.paymentMethod
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      const res = await api.post("/api/expense", formData);
      const response = await api.put("/api/budget/spent", {
        amount: formData.amount,
        category: formData.category,
      });
      if (res.status == 200 && response.status == 200) {
        console.log("Saved to db successfully");
      }
    } catch (err) {
      console.error(err);
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    onAddExpense({
      amount,
      category: formData.category,
      description: formData.description,
      date: formData.date,
      paymentMethod: formData.paymentMethod,
    });

    // Reset form
    setFormData({
      amount: "",
      category: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      paymentMethod: "",
    });

    toast.success("Expense added successfully!");
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1>Add New Expense</h1>
        <p className="text-muted-foreground">
          Track your spending by adding a new expense entry
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Expense Details</span>
          </CardTitle>
          <CardDescription>
            Enter the details of your expense transaction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
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
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center space-x-2">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Enter expense description..."
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) =>
                  handleInputChange("paymentMethod", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Quick Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • Be specific in your descriptions to track spending patterns
            </li>
            <li>• Add expenses as soon as possible to avoid forgetting</li>
            <li>• Use consistent categories for better reporting</li>
            <li>• Take photos of receipts for important purchases</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
