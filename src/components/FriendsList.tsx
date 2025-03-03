import { useState } from "react";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PlusCircle, UserPlus, Mail } from "lucide-react";
import { Friend } from "@/pages/Index";

interface FriendsListProps {
  friends: Friend[];
  onAddFriend: (friend: Omit<Friend, "id">) => void;
}

const FriendsList = ({ friends, onAddFriend }: FriendsListProps) => {
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [newFriend, setNewFriend] = useState<Omit<Friend, "id">>({
    name: "",
    email: "",
  });

  const handleAddFriend = () => {
    if (newFriend.name.trim()) {
      onAddFriend(newFriend);
      setNewFriend({ name: "", email: "" });
      setIsAddFriendOpen(false);
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Your Friends</h3>
        <Dialog open={isAddFriendOpen} onOpenChange={setIsAddFriendOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Friend
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a New Friend</DialogTitle>
              <DialogDescription>
                Add someone to split expenses with
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter friend's name"
                  value={newFriend.name}
                  onChange={(e) =>
                    setNewFriend({ ...newFriend, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter friend's email"
                  value={newFriend.email || ""}
                  onChange={(e) =>
                    setNewFriend({ ...newFriend, email: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddFriend}>Add Friend</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {friends.map((friend) => (
          <Card key={friend.id} className="overflow-hidden">
            <CardContent className="p-4 flex items-center gap-4">
              <Avatar className={`h-12 w-12 ${getRandomColor(friend.name)}`}>
                <AvatarFallback>{getInitials(friend.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{friend.name}</p>
                {friend.email && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                    <Mail className="h-3 w-3" />
                    {friend.email}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="overflow-hidden border-dashed">
          <CardContent className="p-4 flex items-center justify-center">
            <Button 
              variant="ghost" 
              className="h-full w-full flex flex-col gap-2 py-6"
              onClick={() => setIsAddFriendOpen(true)}
            >
              <PlusCircle className="h-8 w-8 text-muted-foreground" />
              <span className="text-muted-foreground">Add Friend</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FriendsList;