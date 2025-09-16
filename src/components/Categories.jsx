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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Plus, Grid3x3, Edit, Palette, Trash2 } from "lucide-react";
import { toast } from "sonner";
import api from "../api";

export function Categories({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    color: "#6366F1",
    icon: "📝",
  });

  const predefinedColors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#F39C12",
    "#E74C3C",
    "#9B59B6",
    "#3498DB",
    "#2ECC71",
    "#F1C40F",
  ];

  const predefinedIcons = [
    "🍽️",
    "🚗",
    "🎬",
    "⚡",
    "🛍️",
    "🏥",
    "🎓",
    "🏠",
    "✈️",
    "📱",
    "💼",
    "🎮",
    "🎵",
    "📚",
    "💰",
    "🧾",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    // Check if category already exists
    const existingCategory = categories.find(
      (cat) => cat.name.toLowerCase() === formData.name.toLowerCase().trim()
    );

    if (!editingCategory && existingCategory) {
      toast.error("A category with this name already exists");
      return;
    }

    console.log("FormData:", formData);
    if (editingCategory) {
      try {
        const payload = {
          id: editingCategory.id,
          name: formData.name.trim(),
          color: formData.color,
          icon: formData.icon,
        };
        const res = await api.put("/api/category", payload);
        if (res.status === 200) {
          onUpdateCategory(editingCategory.id, payload);
          toast.success("Category updated successfully!");
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        const res = await api.post("/api/category", formData);
        if (res.status == 200) {
          console.log("Saved to db successfully");
        }
      } catch (err) {
        console.error(err);
      }

      onAddCategory({
        name: formData.name.trim(),
        color: formData.color,
        icon: formData.icon,
      });
      toast.success("Category added successfully!");
    }

    // Reset form
    setFormData({
      name: "",
      color: "#6366F1",
      icon: "📝",
    });
    setEditingCategory(null);
    setIsDialogOpen(false);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const openAddDialog = () => {
    setEditingCategory(null);
    setFormData({ name: "", color: "#6366F1", icon: "📝" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteCategory = async (category) => {
    try {
      const res = await api.delete(
        `api/category/${category.name.toLowerCase()}`
      );
      if (res.status === 200) {
        console.log("Deleted Successfully");
        if (typeof onDeleteCategory === "function") {
          onDeleteCategory(category.id);
        }
        setIsDialogOpen(false);
        setEditingCategory(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Categories</h1>
          <p className="text-muted-foreground">
            Manage your expense categories for better organization
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Category" : "Add New Category"}
              </DialogTitle>
              <DialogDescription>
                Create a custom category for organizing your expenses
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Category Name *</Label>
                <Input
                  id="categoryName"
                  placeholder="e.g., Groceries, Gas, Subscriptions"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="grid grid-cols-8 gap-2">
                  {predefinedIcons.map((icon) => (
                    <Button
                      key={icon}
                      type="button"
                      variant={formData.icon === icon ? "default" : "outline"}
                      size="sm"
                      className="h-10 w-10 p-0"
                      onClick={() => handleInputChange("icon", icon)}
                    >
                      {icon}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="grid grid-cols-6 gap-2">
                  {predefinedColors.map((color) => (
                    <Button
                      key={color}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-10 w-10 p-0 border-2"
                      style={{
                        backgroundColor: color,
                        borderColor:
                          formData.color === color ? "#000" : "transparent",
                      }}
                      onClick={() => handleInputChange("color", color)}
                    />
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="customColor" className="text-sm">
                    Custom:
                  </Label>
                  <input
                    id="customColor"
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange("color", e.target.value)}
                    className="w-8 h-8 border rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg bg-muted/50">
                <span className="text-lg">{formData.icon}</span>
                <span className="font-medium">
                  {formData.name || "Category Name"}
                </span>
                <div
                  className="w-3 h-3 rounded-full ml-auto"
                  style={{ backgroundColor: formData.color }}
                />
              </div>

              <div className="flex space-x-2">
                {editingCategory && (
                  <Button
                    type="button"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleDeleteCategory(editingCategory)}
                    title="Delete category"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Category
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
                  {editingCategory ? "Update Category" : "Add Category"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="relative group hover:shadow-md transition-shadow"
          >
            <CardContent className="relative p-6 pb-14">
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{
                    backgroundColor: `${category.color}20`,
                    color: category.color,
                  }}
                >
                  {category.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{category.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {category.color}
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit button - shows on hover */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => openEditDialog(category)}
              >
                <Edit className="w-3 h-3" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Grid3x3 className="w-5 h-5" />
            <span>Category Overview</span>
          </CardTitle>
          <CardDescription>
            Your expense categories and their usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{categories.length}</div>
              <p className="text-sm text-muted-foreground">Total Categories</p>
            </div>
            <div>
              <div className="text-2xl font-bold">6</div>
              <p className="text-sm text-muted-foreground">
                Default Categories
              </p>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {Math.max(0, categories.length - 6)}
              </div>
              <p className="text-sm text-muted-foreground">Custom Categories</p>
            </div>
            <div>
              <div className="text-2xl font-bold">3</div>
              <p className="text-sm text-muted-foreground">Most Used</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="w-5 h-5" />
            <span>Category Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • Use specific categories like "Groceries" instead of general
              "Food"
            </li>
            <li>
              • Choose distinct colors to easily identify categories in reports
            </li>
            <li>• Keep the number of categories manageable (8-12 is ideal)</li>
            <li>• Review and consolidate similar categories periodically</li>
            <li>• Use emojis that clearly represent the category purpose</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
