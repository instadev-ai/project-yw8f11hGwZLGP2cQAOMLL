import { useMemo } from "react";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight, TrendingUp, TrendingDown, CheckCircle, DollarSign, ArrowRightLeft } from "lucide-react";
import { Expense, Friend } from "@/pages/Index";

interface BalanceOverviewProps {
  expenses: Expense[];
  friends: Friend[];
}

interface Balance {
  friendId: string;
  amount: number; // positive means they owe you, negative means you owe them
}

interface Settlement {
  fromId: string;
  toId: string;
  amount: number;
}

const BalanceOverview = ({ expenses, friends }: BalanceOverviewProps) => {
  // Calculate balances
  const balances = useMemo(() => {
    const balanceMap = new Map<string, number>();
    
    // Initialize balances for all friends
    friends.forEach(friend => {
      balanceMap.set(friend.id, 0);
    });
    
    // Calculate balances from expenses
    expenses.forEach(expense => {
      const paidById = expense.paidById;
      
      // Skip settled expenses
      if (expense.settled) return;
      
      expense.splits.forEach(split => {
        if (split.friendId === paidById) return; // Skip the person who paid
        
        // The person who paid gets a positive balance (others owe them)
        balanceMap.set(
          paidById, 
          (balanceMap.get(paidById) || 0) + split.amount
        );
        
        // The person who owes gets a negative balance (they owe others)
        balanceMap.set(
          split.friendId, 
          (balanceMap.get(split.friendId) || 0) - split.amount
        );
      });
    });
    
    // Convert map to array
    return Array.from(balanceMap.entries())
      .map(([friendId, amount]) => ({ friendId, amount }))
      .filter(balance => balance.amount !== 0)
      .sort((a, b) => b.amount - a.amount); // Sort by amount (highest first)
  }, [expenses, friends]);
  
  // Calculate total balance
  const totalBalance = useMemo(() => {
    return balances.reduce((total, balance) => {
      if (balance.friendId === "1") { // Assuming "1" is the current user
        return total + balance.amount;
      }
      return total;
    }, 0);
  }, [balances]);
  
  // Calculate optimal settlements
  const settlements = useMemo(() => {
    const result: Settlement[] = [];
    
    // Create a copy of balances that we can modify
    const balanceCopy = [...balances];
    
    // Keep settling until all balances are close to zero
    while (balanceCopy.length > 1) {
      // Sort by amount (ascending)
      balanceCopy.sort((a, b) => a.amount - b.amount);
      
      const debtor = balanceCopy[0]; // Person who owes the most (negative balance)
      const creditor = balanceCopy[balanceCopy.length - 1]; // Person who is owed the most (positive balance)
      
      if (Math.abs(debtor.amount) < 0.01 || creditor.amount < 0.01) {
        // If amounts are very close to zero, we're done
        break;
      }
      
      // Calculate the settlement amount
      const settlementAmount = Math.min(Math.abs(debtor.amount), creditor.amount);
      
      // Add the settlement
      result.push({
        fromId: debtor.friendId,
        toId: creditor.friendId,
        amount: settlementAmount,
      });
      
      // Update balances
      debtor.amount += settlementAmount;
      creditor.amount -= settlementAmount;
      
      // Remove zero balances
      const newBalances = balanceCopy.filter(b => Math.abs(b.amount) > 0.01);
      balanceCopy.length = 0;
      balanceCopy.push(...newBalances);
    }
    
    return result;
  }, [balances]);
  
  const getFriendName = (friendId: string): string => {
    const friend = friends.find(f => f.id === friendId);
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

  return (
    <div className="space-y-10">
      {/* Summary Card */}
      <Card className="border-none shadow-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-xl font-semibold mb-1 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Total Balance
              </h3>
              <p className="text-indigo-100 text-sm">Your overall balance across all friends</p>
            </div>
            <div className="text-center">
              <p className={`text-3xl font-bold ${totalBalance >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {totalBalance >= 0 ? `+$${totalBalance.toFixed(2)}` : `-$${Math.abs(totalBalance).toFixed(2)}`}
              </p>
              <div className="flex items-center justify-center mt-1">
                {totalBalance >= 0 ? (
                  <div className="flex items-center text-green-300 text-sm">
                    <TrendingUp className="h-4 w-4 mr-1" /> You are owed money
                  </div>
                ) : (
                  <div className="flex items-center text-red-300 text-sm">
                    <TrendingDown className="h-4 w-4 mr-1" /> You owe money
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center mb-4">
          <div className="bg-indigo-100 p-2 rounded-full mr-3">
            <ArrowRightLeft className="h-5 w-5 text-indigo-700" />
          </div>
          <h3 className="text-xl font-semibold text-indigo-800">Current Balances</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {balances.length === 0 ? (
            <Card className="col-span-2 border-none shadow-md">
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-800 mb-1">All Settled Up!</h3>
                <p className="text-muted-foreground">
                  All expenses are settled! No balances to show.
                </p>
              </CardContent>
            </Card>
          ) : (
            balances.map(balance => {
              const friendName = getFriendName(balance.friendId);
              const isYou = balance.friendId === "1"; // Assuming "1" is the current user
              const isPositive = balance.amount > 0;
              
              return (
                <Card 
                  key={balance.friendId} 
                  className={`overflow-hidden border-none shadow-md ${
                    isPositive 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50' 
                      : 'bg-gradient-to-r from-red-50 to-orange-50'
                  }`}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <Avatar className={`h-14 w-14 ${getRandomColor(friendName)} ring-2 ring-white`}>
                      <AvatarFallback>{getInitials(friendName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-lg text-gray-800">{friendName}</p>
                      {isYou ? (
                        <p className={`text-lg font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
                          {isPositive 
                            ? `You are owed $${balance.amount.toFixed(2)}` 
                            : `You owe $${Math.abs(balance.amount).toFixed(2)}`}
                        </p>
                      ) : (
                        <p className={`text-lg font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
                          {isPositive 
                            ? `Owes you $${balance.amount.toFixed(2)}` 
                            : `You owe $${Math.abs(balance.amount).toFixed(2)}`}
                        </p>
                      )}
                    </div>
                    <div className={`p-3 rounded-full ${
                      (isYou && isPositive) || (!isYou && !isPositive)
                        ? 'bg-green-100' 
                        : 'bg-red-100'
                    }`}>
                      {(isYou && isPositive) || (!isYou && !isPositive) ? (
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      ) : (
                        <TrendingDown className="h-6 w-6 text-red-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center mb-4">
          <div className="bg-indigo-100 p-2 rounded-full mr-3">
            <ArrowRight className="h-5 w-5 text-indigo-700" />
          </div>
          <h3 className="text-xl font-semibold text-indigo-800">Suggested Settlements</h3>
        </div>
        {settlements.length === 0 ? (
          <Card className="border-none shadow-md">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-800 mb-1">No Settlements Needed</h3>
              <p className="text-muted-foreground">
                All balances are settled! No payments needed.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-lg overflow-hidden border-none shadow-md">
            <Table>
              <TableHeader className="bg-indigo-50">
                <TableRow>
                  <TableHead className="font-medium text-indigo-800">From</TableHead>
                  <TableHead></TableHead>
                  <TableHead className="font-medium text-indigo-800">To</TableHead>
                  <TableHead className="text-right font-medium text-indigo-800">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settlements.map((settlement, index) => (
                  <TableRow key={index} className="hover:bg-indigo-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className={`h-10 w-10 ${getRandomColor(getFriendName(settlement.fromId))} ring-2 ring-white`}>
                          <AvatarFallback>{getInitials(getFriendName(settlement.fromId))}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{getFriendName(settlement.fromId)}</p>
                          <p className="text-xs text-slate-500">Pays</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <div className="bg-indigo-100 p-2 rounded-full">
                          <ArrowRight className="h-5 w-5 text-indigo-600" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className={`h-10 w-10 ${getRandomColor(getFriendName(settlement.toId))} ring-2 ring-white`}>
                          <AvatarFallback>{getInitials(getFriendName(settlement.toId))}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{getFriendName(settlement.toId)}</p>
                          <p className="text-xs text-slate-500">Receives</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="bg-green-50 px-3 py-2 rounded-lg inline-block">
                        <span className="text-lg font-semibold text-green-700">
                          ${settlement.amount.toFixed(2)}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};