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
import {
  Plus,
  TrendingUp,
  IndianRupee,
  Briefcase,
  User,
  Gift,
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import api from "../api";

export function IncomeTracking({ income, onAddIncome }) {
  const [formData, setFormData] = useState({
    amount: "",
    source: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    type: "",
  });

  const incomeTypes = [
    { value: "salary", label: "Salary", icon: Briefcase },
    { value: "other", label: "Other", icon: Gift },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.amount ||
      !formData.source ||
      !formData.description ||
      !formData.type
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const res = await api.post("/api/income", formData);
      if (res.status == 200) {
        console.log("Saved to db successfully");
      }
    } catch (err) {
      console.error(err);
    }

    onAddIncome({
      amount,
      source: formData.source,
      description: formData.description,
      date: formData.date,
      type: formData.type,
    });

    // Reset form
    setFormData({
      amount: "",
      source: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      type: "",
    });

    toast.success("Income added successfully!");
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const currentMonthIncome = income.filter((incomeItem) => {
    const incomeDate = new Date(incomeItem.date);
    const currentDate = new Date();
    return (
      incomeDate.getMonth() === currentDate.getMonth() &&
      incomeDate.getFullYear() === currentDate.getFullYear()
    );
  });

  const totalMonthlyIncome = currentMonthIncome.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const getIncomeTypeIcon = (type) => {
    const incomeType = incomeTypes.find((t) => t.value === type);
    return incomeType ? incomeType.icon : Gift;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1>Income Tracking</h1>
        <p className="text-muted-foreground">
          Record your income from various sources
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Income Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Add New Income</span>
              </CardTitle>
              <CardDescription>
                Record income from salary, freelance work, or other sources
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
                      onChange={(e) =>
                        handleInputChange("date", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Income Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select income type" />
                    </SelectTrigger>
                    <SelectContent>
                      {incomeTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center space-x-2">
                              <Icon className="w-4 h-4" />
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source">Source *</Label>
                  <Input
                    id="source"
                    placeholder="e.g., Company Name, Client Name, etc."
                    value={formData.source}
                    onChange={(e) =>
                      handleInputChange("source", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter income description..."
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Income
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Income Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span>This Month</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    ₹{totalMonthlyIncome.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Income</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {currentMonthIncome.length}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Income Entries
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Income Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {incomeTypes.map((type) => {
                  const typeIncome = currentMonthIncome.filter(
                    (item) => item.type === type.value
                  );
                  const typeTotal = typeIncome.reduce(
                    (sum, item) => sum + item.amount,
                    0
                  );
                  const Icon = type.icon;

                  if (typeTotal === 0) return null;

                  return (
                    <div
                      key={type.value}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{type.label}</span>
                      </div>
                      <span className="font-medium text-green-600">
                        ₹{typeTotal.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Income */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Income</CardTitle>
          <CardDescription>Your latest income entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {income.slice(0, 5).map((incomeItem) => {
              const Icon = getIncomeTypeIcon(incomeItem.type);
              return (
                <div
                  key={incomeItem.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-900/20 rounded-full">
                      <Icon className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{incomeItem.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {incomeItem.source} • {incomeItem.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      +₹{incomeItem.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(incomeItem.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}

            {income.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No income entries yet. Add your first income above!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
