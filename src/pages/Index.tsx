import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, History, Calculator, DollarSign, Wallet } from "lucide-react";
import ExpensesList from "@/components/ExpensesList";
import FriendsList from "@/components/FriendsList";
import BalanceOverview from "@/components/BalanceOverview";
import AddExpenseDialog from "@/components/AddExpenseDialog";
import { useToast } from "@/hooks/use-toast";

// Types for our app
export type Friend = {
  id: string;
  name: string;
  email?: string;
};

export type Split = {
  friendId: string;
  amount: number;
  paid: boolean;
};

export type Expense = {
  id: string;
  title: string;
  amount: number;
  date: Date;
  paidById: string;
  splits: Split[];
  settled: boolean;
};

const Index = () => {
  const { toast } = useToast();
  const [friends, setFriends] = useState<Friend[]>([
    { id: "1", name: "You", email: "you@example.com" },
    { id: "2", name: "Alex", email: "alex@example.com" },
    { id: "3", name: "Sam", email: "sam@example.com" },
    { id: "4", name: "Jordan", email: "jordan@example.com" },
  ]);

  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: "1",
      title: "Dinner at Italian Restaurant",
      amount: 120,
      date: new Date(2023, 5, 15),
      paidById: "1",
      splits: [
        { friendId: "1", amount: 30, paid: true },
        { friendId: "2", amount: 30, paid: false },
        { friendId: "3", amount: 30, paid: false },
        { friendId: "4", amount: 30, paid: false },
      ],
      settled: false,
    },
    {
      id: "2",
      title: "Movie Tickets",
      amount: 60,
      date: new Date(2023, 5, 20),
      paidById: "2",
      splits: [
        { friendId: "1", amount: 20, paid: false },
        { friendId: "2", amount: 20, paid: true },
        { friendId: "3", amount: 20, paid: false },
      ],
      settled: false,
    },
    {
      id: "3",
      title: "Groceries",
      amount: 85.50,
      date: new Date(2023, 6, 1),
      paidById: "1",
      splits: [
        { friendId: "1", amount: 42.75, paid: true },
        { friendId: "4", amount: 42.75, paid: false },
      ],
      settled: false,
    },
  ]);

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // Calculate total balance
  const totalOwed = expenses
    .filter(expense => !expense.settled)
    .reduce((total, expense) => {
      if (expense.paidById === "1") {
        // You paid, others owe you
        const yourShare = expense.splits.find(split => split.friendId === "1")?.amount || 0;
        return total + (expense.amount - yourShare);
      } else {
        // Someone else paid, you might owe them
        const yourShare = expense.splits.find(split => split.friendId === "1")?.amount || 0;
        return total - yourShare;
      }
    }, 0);

  const addExpense = (expense: Omit<Expense, "id" | "settled">) => {
    const newExpense: Expense = {
      ...expense,
      id: (expenses.length + 1).toString(),
      settled: false,
    };
    
    setExpenses([...expenses, newExpense]);
    toast({
      title: "Expense Added",
      description: `${expense.title} ($${expense.amount}) has been added.`,
    });
  };

  const settleExpense = (expenseId: string) => {
    setExpenses(
      expenses.map((expense) =>
        expense.id === expenseId ? { ...expense, settled: true } : expense
      )
    );
    toast({
      title: "Expense Settled",
      description: "The expense has been marked as settled.",
    });
  };

  const addFriend = (friend: Omit<Friend, "id">) => {
    const newFriend: Friend = {
      ...friend,
      id: (friends.length + 1).toString(),
    };
    setFriends([...friends, newFriend]);
    toast({
      title: "Friend Added",
      description: `${friend.name} has been added to your friends list.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header with more subtle design */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto py-6 px-4 sm:px-6 max-w-5xl">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center">
              <Wallet className="h-8 w-8 mr-3 text-indigo-600" />
              <h1 className="text-3xl font-bold text-slate-800">SplitWise</h1>
            </div>
            
            {/* Balance summary */}
            <div className="flex items-center bg-slate-50 rounded-lg px-4 py-2 border border-slate-200">
              <DollarSign className="h-5 w-5 mr-2 text-slate-500" />
              <div>
                <p className="text-sm font-medium text-slate-600">Your Balance</p>
                <p className={`text-xl font-bold ${totalOwed >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalOwed >= 0 ? `+$${totalOwed.toFixed(2)}` : `-$${Math.abs(totalOwed).toFixed(2)}`}
                </p>
              </div>
            </div>
            
            <Button 
              onClick={() => setIsAddExpenseOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4 sm:px-6 max-w-5xl">
        <Tabs defaultValue="expenses" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-slate-100 p-1">
            <TabsTrigger 
              value="expenses" 
              className="flex items-center data-[state=active]:bg-white data-[state=active]:text-indigo-700"
            >
              <History className="mr-2 h-4 w-4" /> Expenses
            </TabsTrigger>
            <TabsTrigger 
              value="friends" 
              className="flex items-center data-[state=active]:bg-white data-[state=active]:text-indigo-700"
            >
              <Users className="mr-2 h-4 w-4" /> Friends
            </TabsTrigger>
            <TabsTrigger 
              value="balances" 
              className="flex items-center data-[state=active]:bg-white data-[state=active]:text-indigo-700"
            >
              <Calculator className="mr-2 h-4 w-4" /> Balances
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expenses">
            <Card className="border-none shadow-md">
              <CardHeader className="bg-slate-50 rounded-t-lg border-b border-slate-100">
                <CardTitle className="text-slate-800">Expense History</CardTitle>
                <CardDescription>
                  View and manage all your shared expenses
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ExpensesList 
                  expenses={expenses} 
                  friends={friends} 
                  onSettleExpense={settleExpense} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="friends">
            <Card className="border-none shadow-md">
              <CardHeader className="bg-slate-50 rounded-t-lg border-b border-slate-100">
                <CardTitle className="text-slate-800">Friends</CardTitle>
                <CardDescription>
                  Manage your friends and see who you owe
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <FriendsList 
                  friends={friends} 
                  onAddFriend={addFriend} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="balances">
            <Card className="border-none shadow-md">
              <CardHeader className="bg-slate-50 rounded-t-lg border-b border-slate-100">
                <CardTitle className="text-slate-800">Balance Overview</CardTitle>
                <CardDescription>
                  See who owes you and who you owe
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <BalanceOverview 
                  expenses={expenses} 
                  friends={friends} 
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AddExpenseDialog
        open={isAddExpenseOpen}
        onOpenChange={setIsAddExpenseOpen}
        friends={friends}
        onAddExpense={addExpense}
      />
    </div>
  );
};

export default Index;