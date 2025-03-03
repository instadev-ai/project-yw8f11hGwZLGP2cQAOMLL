import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon, Divide, MinusCircle, PlusCircle } from "lucide-react";
import { Expense, Friend, Split } from "@/pages/Index";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  friends: Friend[];
  onAddExpense: (expense: Omit<Expense, "id" | "settled">) => void;
}

const AddExpenseDialog = ({
  open,
  onOpenChange,
  friends,
  onAddExpense,
}: AddExpenseDialogProps) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [paidById, setPaidById] = useState("1"); // Default to "You"
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  const [selectedFriends, setSelectedFriends] = useState<string[]>(["1"]); // Default to include "You"
  const [customSplits, setCustomSplits] = useState<{ [key: string]: string }>({});

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setDate(new Date());
    setPaidById("1");
    setSplitType("equal");
    setSelectedFriends(["1"]);
    setCustomSplits({});
  };

  const handleSubmit = () => {
    if (!title || !amount || isNaN(parseFloat(amount))) {
      return;
    }

    const totalAmount = parseFloat(amount);
    let splits: Split[] = [];

    if (splitType === "equal") {
      const splitAmount = totalAmount / selectedFriends.length;
      splits = selectedFriends.map((friendId) => ({
        friendId,
        amount: splitAmount,
        paid: friendId === paidById,
      }));
    } else {
      // Custom split
      splits = Object.entries(customSplits)
        .filter(([_, value]) => value && !isNaN(parseFloat(value)))
        .map(([friendId, value]) => ({
          friendId,
          amount: parseFloat(value),
          paid: friendId === paidById,
        }));
    }

    onAddExpense({
      title,
      amount: totalAmount,
      date,
      paidById,
      splits,
    });

    resetForm();
    onOpenChange(false);
  };

  const handleFriendToggle = (friendId: string, checked: boolean) => {
    if (checked) {
      setSelectedFriends([...selectedFriends, friendId]);
      
      // If we're doing custom splits, initialize this friend's amount
      if (splitType === "custom") {
        setCustomSplits({
          ...customSplits,
          [friendId]: "0",
        });
      }
    } else {
      // Don't allow deselecting the payer
      if (friendId === paidById) {
        return;
      }
      
      setSelectedFriends(selectedFriends.filter((id) => id !== friendId));
      
      // Remove from custom splits if needed
      if (splitType === "custom") {
        const newSplits = { ...customSplits };
        delete newSplits[friendId];
        setCustomSplits(newSplits);
      }
    }
  };

  const handleSplitTypeChange = (type: "equal" | "custom") => {
    setSplitType(type);
    
    if (type === "custom") {
      // Initialize custom splits with equal values
      const equalAmount = amount ? parseFloat(amount) / selectedFriends.length : 0;
      const splits = selectedFriends.reduce((acc, friendId) => {
        acc[friendId] = equalAmount.toFixed(2);
        return acc;
      }, {} as { [key: string]: string });
      
      setCustomSplits(splits);
    }
  };

  const handleCustomSplitChange = (friendId: string, value: string) => {
    setCustomSplits({
      ...customSplits,
      [friendId]: value,
    });
  };

  const calculateRemainingAmount = () => {
    if (!amount || isNaN(parseFloat(amount))) {
      return 0;
    }
    
    const totalAmount = parseFloat(amount);
    const allocatedAmount = Object.values(customSplits)
      .filter(value => value && !isNaN(parseFloat(value)))
      .reduce((sum, value) => sum + parseFloat(value), 0);
    
    return totalAmount - allocatedAmount;
  };

  const distributeRemaining = () => {
    const remaining = calculateRemainingAmount();
    if (remaining === 0 || selectedFriends.length === 0) return;
    
    const amountPerFriend = remaining / selectedFriends.length;
    
    const newSplits = { ...customSplits };
    selectedFriends.forEach(friendId => {
      const currentAmount = parseFloat(newSplits[friendId] || "0");
      newSplits[friendId] = (currentAmount + amountPerFriend).toFixed(2);
    });
    
    setCustomSplits(newSplits);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) resetForm();
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Enter the details of your shared expense
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Description</Label>
            <Input
              id="title"
              placeholder="What was this expense for?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="paidBy">Paid by</Label>
            <Select value={paidById} onValueChange={setPaidById}>
              <SelectTrigger>
                <SelectValue placeholder="Who paid?" />
              </SelectTrigger>
              <SelectContent>
                {friends.map((friend) => (
                  <SelectItem key={friend.id} value={friend.id}>
                    {friend.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Split with</Label>
            <div className="space-y-2 border rounded-md p-3">
              {friends.map((friend) => (
                <div key={friend.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`friend-${friend.id}`}
                    checked={selectedFriends.includes(friend.id)}
                    onCheckedChange={(checked) =>
                      handleFriendToggle(friend.id, checked === true)
                    }
                    disabled={friend.id === paidById} // Can't uncheck the payer
                  />
                  <Label
                    htmlFor={`friend-${friend.id}`}
                    className="text-sm font-normal"
                  >
                    {friend.name}
                    {friend.id === paidById && " (Payer)"}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Split type</Label>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="equal-split"
                  name="split-type"
                  checked={splitType === "equal"}
                  onChange={() => handleSplitTypeChange("equal")}
                  className="h-4 w-4"
                />
                <Label htmlFor="equal-split" className="text-sm font-normal">
                  Equal
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="custom-split"
                  name="split-type"
                  checked={splitType === "custom"}
                  onChange={() => handleSplitTypeChange("custom")}
                  className="h-4 w-4"
                />
                <Label htmlFor="custom-split" className="text-sm font-normal">
                  Custom
                </Label>
              </div>
            </div>
          </div>

          {splitType === "custom" && (
            <div className="space-y-4 border rounded-md p-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm">Custom Amounts</Label>
                <div className="text-sm text-muted-foreground">
                  Remaining: ${calculateRemainingAmount().toFixed(2)}
                </div>
              </div>
              
              {selectedFriends.map((friendId) => {
                const friend = friends.find((f) => f.id === friendId);
                if (!friend) return null;
                
                return (
                  <div key={friendId} className="flex items-center gap-2">
                    <Label className="w-24 text-sm font-normal truncate">
                      {friend.name}:
                    </Label>
                    <div className="relative flex-1">
                      <span className="absolute left-2 top-2.5 text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        value={customSplits[friendId] || "0"}
                        onChange={(e) =>
                          handleCustomSplitChange(friendId, e.target.value)
                        }
                        className="pl-6"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                );
              })}
              
              {calculateRemainingAmount() !== 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={distributeRemaining}
                >
                  <Divide className="mr-2 h-4 w-4" />
                  Distribute Remaining Amount
                </Button>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Expense</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseDialog;