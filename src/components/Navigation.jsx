import React from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Home, Plus, TrendingUp, Grid3x3, Target, User } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

export function Navigation({ currentPage, onPageChange, user }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "expenses", label: "Add Expense", icon: Plus },
    { id: "income", label: "Income", icon: TrendingUp },
    { id: "categories", label: "Categories", icon: Grid3x3 },
    { id: "budgets", label: "Budgets", icon: Target },
  ];

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground">💰</span>
            </div>
            <h1 className="text-xl font-bold">ExpenseTracker</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? "default" : "ghost"}
                    onClick={() => onPageChange(item.id)}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </div>

            {/* Account Avatar */}
            {user && (
              <Button
                variant={currentPage === "account" ? "default" : "ghost"}
                onClick={() => onPageChange("account")}
                className="flex items-center space-x-2 px-2"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.picture} alt={user.name} />
                  <AvatarFallback className="text-xs">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">
                  {user.name.split(" ")[0]}
                </span>
              </Button>
            )}

            {/* Mobile menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2"
                  >
                    <Grid3x3 className="w-4 h-4" />
                    <span>Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <div className="flex flex-col gap-2 mt-8">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Button
                          key={item.id}
                          variant={
                            currentPage === item.id ? "default" : "ghost"
                          }
                          onClick={() => onPageChange(item.id)}
                          className="justify-start"
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {item.label}
                        </Button>
                      );
                    })}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
