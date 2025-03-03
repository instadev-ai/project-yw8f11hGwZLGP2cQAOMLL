import { useState } from "react";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Search, 
  ArrowUpDown, 
  Coffee, 
  Film, 
  ShoppingCart, 
  Home, 
  Car, 
  Plane, 
  Utensils, 
  CreditCard 
} from "lucide-react";
import { Expense, Friend } from "@/pages/Index";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ExpensesListProps {
  expenses: Expense[];
  friends: Friend[];
  onSettleExpense: (expenseId: string) => void;
}

const ExpensesList = ({ expenses, friends, onSettleExpense }: ExpensesListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Expense | "paidBy";
    direction: "asc" | "desc";
  }>({ key: "date", direction: "desc" });

  const getFriendName = (friendId: string): string => {
    const friend = friends.find((f) => f.id === friendId);
    return friend ? friend.name : "Unknown";
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getRandomColor = (name: string): string => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    
    // Simple hash function to get consistent color for the same name
    const hash = name.split("").reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    return colors[hash % colors.length];
  };

  const getExpenseIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes("dinner") || lowerTitle.includes("lunch") || lowerTitle.includes("restaurant")) {
      return <Utensils className="h-4 w-4 text-orange-500" />;
    } else if (lowerTitle.includes("coffee")) {
      return <Coffee className="h-4 w-4 text-brown-500" />;
    } else if (lowerTitle.includes("movie") || lowerTitle.includes("cinema")) {
      return <Film className="h-4 w-4 text-blue-500" />;
    } else if (lowerTitle.includes("groceries") || lowerTitle.includes("shopping")) {
      return <ShoppingCart className="h-4 w-4 text-green-500" />;
    } else if (lowerTitle.includes("rent") || lowerTitle.includes("house")) {
      return <Home className="h-4 w-4 text-slate-500" />;
    } else if (lowerTitle.includes("taxi") || lowerTitle.includes("uber") || lowerTitle.includes("car")) {
      return <Car className="h-4 w-4 text-yellow-500" />;
    } else if (lowerTitle.includes("flight") || lowerTitle.includes("travel")) {
      return <Plane className="h-4 w-4 text-sky-500" />;
    } else {
      return <CreditCard className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleSort = (key: keyof Expense | "paidBy") => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  const filteredExpenses = expenses.filter((expense) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      expense.title.toLowerCase().includes(searchLower) ||
      getFriendName(expense.paidById).toLowerCase().includes(searchLower)
    );
  });

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (sortConfig.key === "paidBy") {
      const aName = getFriendName(a.paidById);
      const bName = getFriendName(b.paidById);
      return sortConfig.direction === "asc"
        ? aName.localeCompare(bName)
        : bName.localeCompare(aName);
    }

    if (sortConfig.key === "date") {
      return sortConfig.direction === "asc"
        ? a.date.getTime() - b.date.getTime()
        : b.date.getTime() - a.date.getTime();
    }

    if (sortConfig.key === "amount") {
      return sortConfig.direction === "asc"
        ? a.amount - b.amount
        : b.amount - a.amount;
    }

    // Default sort by title
    return sortConfig.direction === "asc"
      ? a.title.localeCompare(b.title)
      : b.title.localeCompare(a.title);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-indigo-400" />
          <Input
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-indigo-100 focus-visible:ring-indigo-400"
          />
        </div>
      </div>

      <div className="rounded-lg overflow-hidden border border-indigo-100 shadow-sm">
        <Table>
          <TableHeader className="bg-indigo-50">
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:text-indigo-700 transition-colors"
                onClick={() => handleSort("title")}
              >
                <div className="flex items-center">
                  Description
                  {sortConfig.key === "title" && (
                    <ArrowUpDown className="ml-2 h-4 w-4 text-indigo-600" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:text-indigo-700 transition-colors"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center">
                  Amount
                  {sortConfig.key === "amount" && (
                    <ArrowUpDown className="ml-2 h-4 w-4 text-indigo-600" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:text-indigo-700 transition-colors"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">
                  Date
                  {sortConfig.key === "date" && (
                    <ArrowUpDown className="ml-2 h-4 w-4 text-indigo-600" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:text-indigo-700 transition-colors"
                onClick={() => handleSort("paidBy")}
              >
                <div className="flex items-center">
                  Paid By
                  {sortConfig.key === "paidBy" && (
                    <ArrowUpDown className="ml-2 h-4 w-4 text-indigo-600" />
                  )}
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center">
                    <ShoppingCart className="h-12 w-12 text-indigo-200 mb-2" />
                    <p>No expenses found. Add your first expense!</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedExpenses.map((expense) => (
                <TableRow key={expense.id} className="hover:bg-indigo-50/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 p-2 rounded-full">
                        {getExpenseIcon(expense.title)}
                      </div>
                      <span className="font-medium">{expense.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-indigo-700">
                    ${expense.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {format(expense.date, "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className={`h-8 w-8 ${getRandomColor(getFriendName(expense.paidById))}`}>
                        <AvatarFallback>{getInitials(getFriendName(expense.paidById))}</AvatarFallback>
                      </Avatar>
                      <span>{getFriendName(expense.paidById)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {expense.settled ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-none">
                        Settled
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none">
                        Unsettled
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {!expense.settled ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSettleExpense(expense.id)}
                        className="border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Settle
                      </Button>
                    ) : (
                      <span className="text-sm text-green-600 flex items-center justify-end">
                        <CheckCircle className="mr-1 h-4 w-4" /> Completed
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};