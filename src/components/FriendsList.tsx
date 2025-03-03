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
import { PlusCircle, UserPlus, Mail, Phone, MapPin, Share2 } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-indigo-800">Your Friends</h3>
          <p className="text-sm text-slate-500 mt-1">People you split expenses with</p>
        </div>
        <Dialog open={isAddFriendOpen} onOpenChange={setIsAddFriendOpen}>
          <DialogTrigger asChild>
            <Button 
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Friend
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-indigo-800">Add a New Friend</DialogTitle>
              <DialogDescription>
                Add someone to split expenses with
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-indigo-700">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter friend's name"
                  value={newFriend.name}
                  onChange={(e) =>
                    setNewFriend({ ...newFriend, name: e.target.value })
                  }
                  className="border-indigo-100 focus-visible:ring-indigo-400"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-indigo-700">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter friend's email"
                  value={newFriend.email || ""}
                  onChange={(e) =>
                    setNewFriend({ ...newFriend, email: e.target.value })
                  }
                  className="border-indigo-100 focus-visible:ring-indigo-400"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleAddFriend}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Add Friend
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {friends.map((friend) => (
          <Card 
            key={friend.id} 
            className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow"
          >
            <CardContent className="p-6 flex items-center gap-4">
              <Avatar className={`h-16 w-16 ${getRandomColor(friend.name)} ring-2 ring-white ring-offset-2`}>
                <AvatarFallback className="text-lg">{getInitials(friend.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-lg truncate text-indigo-800">{friend.name}</p>
                {friend.email && (
                  <p className="text-sm text-slate-500 flex items-center gap-1 truncate mt-1">
                    <Mail className="h-3.5 w-3.5" />
                    {friend.email}
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs border-indigo-100 text-indigo-600 hover:bg-indigo-50"
                  >
                    <Phone className="h-3 w-3 mr-1" /> Contact
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs border-indigo-100 text-indigo-600 hover:bg-indigo-50"
                  >
                    <Share2 className="h-3 w-3 mr-1" /> Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="overflow-hidden border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 transition-colors">
          <CardContent className="p-6 flex items-center justify-center">
            <Button 
              variant="ghost" 
              className="h-full w-full flex flex-col gap-3 py-8 text-indigo-500 hover:text-indigo-700 hover:bg-transparent"
              onClick={() => setIsAddFriendOpen(true)}
            >
              <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                <PlusCircle className="h-8 w-8" />
              </div>
              <span className="font-medium">Add New Friend</span>
              <p className="text-xs text-slate-500">Split expenses with more people</p>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FriendsList;