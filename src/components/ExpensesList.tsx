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
import { CheckCircle, Search, ArrowUpDown } from "lucide-react";
import { Expense, Friend } from "@/pages/Index";

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
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("title")}
              >
                Description
                {sortConfig.key === "title" && (
                  <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("amount")}
              >
                Amount
                {sortConfig.key === "amount" && (
                  <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("date")}
              >
                Date
                {sortConfig.key === "date" && (
                  <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("paidBy")}
              >
                Paid By
                {sortConfig.key === "paidBy" && (
                  <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                )}
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No expenses found. Add your first expense!
                </TableCell>
              </TableRow>
            ) : (
              sortedExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.title}</TableCell>
                  <TableCell>${expense.amount.toFixed(2)}</TableCell>
                  <TableCell>{format(expense.date, "MMM d, yyyy")}</TableCell>
                  <TableCell>{getFriendName(expense.paidById)}</TableCell>
                  <TableCell>
                    {expense.settled ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Settled
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Unsettled
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {!expense.settled && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSettleExpense(expense.id)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Settle
                      </Button>
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

export default ExpensesList;