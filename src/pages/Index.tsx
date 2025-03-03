import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, History, Calculator } from "lucide-react";
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
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">SplitWise</h1>
        <Button onClick={() => setIsAddExpenseOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
        </Button>
      </div>

      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="expenses" className="flex items-center">
            <History className="mr-2 h-4 w-4" /> Expenses
          </TabsTrigger>
          <TabsTrigger value="friends" className="flex items-center">
            <Users className="mr-2 h-4 w-4" /> Friends
          </TabsTrigger>
          <TabsTrigger value="balances" className="flex items-center">
            <Calculator className="mr-2 h-4 w-4" /> Balances
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Expense History</CardTitle>
              <CardDescription>
                View and manage all your shared expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExpensesList 
                expenses={expenses} 
                friends={friends} 
                onSettleExpense={settleExpense} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="friends">
          <Card>
            <CardHeader>
              <CardTitle>Friends</CardTitle>
              <CardDescription>
                Manage your friends and see who you owe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FriendsList 
                friends={friends} 
                onAddFriend={addFriend} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balances">
          <Card>
            <CardHeader>
              <CardTitle>Balance Overview</CardTitle>
              <CardDescription>
                See who owes you and who you owe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BalanceOverview 
                expenses={expenses} 
                friends={friends} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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