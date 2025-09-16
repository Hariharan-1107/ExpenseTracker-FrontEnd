import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Reports } from "./Reports";
import { LogOut, Mail, User } from "lucide-react";

export function Account({ user, expenses, income, categories, onLogout }) {
  return (
    <div className="space-y-6">
      {/* Account Details Section */}
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={`${user.picture}`} alt={user.name} />
              <AvatarFallback className="text-lg">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{user.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{user.email}</span>
                </div>
              </div>
              <div className="flex space-x-3">
                <div className="text-center">
                  <div className="font-semibold">{expenses.length}</div>
                  <div className="text-sm text-muted-foreground">Expenses</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{income.length}</div>
                  <div className="text-sm text-muted-foreground">
                    Income Records
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{categories.length}</div>
                  <div className="text-sm text-muted-foreground">
                    Categories
                  </div>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={onLogout} className="ml-auto">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Reports Section */}
      <div>
        <h2 className="mb-4">Financial Reports</h2>
        <Reports expenses={expenses} income={income} categories={categories} />
      </div>
    </div>
  );
}
