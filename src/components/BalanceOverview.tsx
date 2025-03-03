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
import { ArrowRight } from "lucide-react";
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
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Current Balances</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {balances.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                All expenses are settled! No balances to show.
              </CardContent>
            </Card>
          ) : (
            balances.map(balance => {
              const friendName = getFriendName(balance.friendId);
              const isYou = balance.friendId === "1"; // Assuming "1" is the current user
              const isPositive = balance.amount > 0;
              
              return (
                <Card key={balance.friendId} className="overflow-hidden">
                  <CardContent className="p-4 flex items-center gap-4">
                    <Avatar className={`h-12 w-12 ${getRandomColor(friendName)}`}>
                      <AvatarFallback>{getInitials(friendName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{friendName}</p>
                      {isYou ? (
                        <p className={`text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>
                          {isPositive 
                            ? `You are owed $${balance.amount.toFixed(2)}` 
                            : `You owe $${Math.abs(balance.amount).toFixed(2)}`}
                        </p>
                      ) : (
                        <p className={`text-sm ${isPositive ? "text-red-600" : "text-green-600"}`}>
                          {isPositive 
                            ? `Owes you $${balance.amount.toFixed(2)}` 
                            : `You owe $${Math.abs(balance.amount).toFixed(2)}`}
                        </p>
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
        <h3 className="text-lg font-medium mb-4">Suggested Settlements</h3>
        {settlements.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No settlements needed! All balances are settled.
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead></TableHead>
                  <TableHead>To</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settlements.map((settlement, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className={`h-8 w-8 ${getRandomColor(getFriendName(settlement.fromId))}`}>
                          <AvatarFallback>{getInitials(getFriendName(settlement.fromId))}</AvatarFallback>
                        </Avatar>
                        <span>{getFriendName(settlement.fromId)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ArrowRight className="h-4 w-4 mx-auto text-muted-foreground" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className={`h-8 w-8 ${getRandomColor(getFriendName(settlement.toId))}`}>
                          <AvatarFallback>{getInitials(getFriendName(settlement.toId))}</AvatarFallback>
                        </Avatar>
                        <span>{getFriendName(settlement.toId)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${settlement.amount.toFixed(2)}
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

export default BalanceOverview;