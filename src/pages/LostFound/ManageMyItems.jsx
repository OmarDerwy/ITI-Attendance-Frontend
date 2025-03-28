import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { Package, Edit, Trash, MessageSquare, Eye, Plus, Search, Box } from "lucide-react";
import Layout from "@/components/layout/Layout";
import PageTitle from "@/components/ui/page-title";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ManageMyItems = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [editItem, setEditItem] = useState(null);
  
  // Mock data from the user context
  const mockUserItems = [
    {
      id: 1,
      name: "Black Laptop Bag",
      category: "Bags",
      location: "Library, 2nd Floor",
      status: "lost",
      description: "Black laptop bag with a red logo, contains charger and notebook",
      date: "2023-06-15",
      imageUrl: "/placeholder.svg",
      comments: [
        { id: 1, user: "Maria Garcia", role: "supervisor", text: "I think I saw one in the cafeteria", date: "2023-06-16" }
      ]
    },
    {
      id: 2,
      name: "Blue Water Bottle",
      category: "Personal Items",
      location: "Cafeteria",
      status: "found",
      description: "Blue metal water bottle with stickers",
      date: "2023-06-20",
      imageUrl: "/placeholder.svg",
      comments: []
    },
  ];
  
  const [userItems, setUserItems] = useState(mockUserItems);
  
  const filteredItems = userItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch(status) {
      case "lost": return "bg-destructive/10 text-destructive border-destructive/20";
      case "found": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "claimed": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "matched": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default: return "";
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "lost": return <div className="h-3 w-3">×</div>;
      case "found": return <Box className="h-3 w-3" />;
      case "claimed": return <div className="h-3 w-3">✓</div>;
      case "matched": return <div className="h-3 w-3">⟳</div>;
      default: return null;
    }
  };

  const handleUpdateItem = (updatedItem) => {
    setUserItems(userItems.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
    
    setEditItem(null);
    
    toast({
      title: "Item Updated",
      description: "Your item has been updated successfully.",
    });
  };

  const handleDeleteItem = (id) => {
    setUserItems(userItems.filter(item => item.id !== id));
    
    toast({
      title: "Item Deleted",
      description: "Your item has been deleted successfully.",
    });
  };

  const handleAddComment = (itemId, comment) => {
    const updatedItems = userItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          comments: [
            ...item.comments,
            {
              id: new Date().getTime(),
              user: "John Doe",
              role: "student",
              text: comment,
              date: new Date().toISOString().split('T')[0]
            }
          ]
        };
      }
      return item;
    });
    
    setUserItems(updatedItems);
    
    toast({
      title: "Comment Added",
      description: "Your comment has been added successfully.",
    });
  };

  return (
    <Layout>
      <PageTitle
        title="My Items"
        subtitle="Manage your lost and found item reports"
        icon={<Package />}
        action={
          <Button onClick={() => navigate("/report-lost-found")}>
            <Plus className="mr-2 h-4 w-4" />
            Report New Item
          </Button>
        }
      />

      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search your items..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="lost">Lost</TabsTrigger>
            <TabsTrigger value="found">Found</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {filteredItems.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="relative">
                      {item.imageUrl && (
                        <div className="aspect-video w-full overflow-hidden">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="absolute right-2 top-2">
                        <Badge className={`${getStatusColor(item.status)} flex items-center gap-1 capitalize`}>
                          {getStatusIcon(item.status)}
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {item.description}
                      </p>
                      <div className="mt-3 text-sm">
                        <span className="text-muted-foreground">Location: </span>
                        {item.location}
                      </div>
                      <div className="mt-1 text-sm">
                        <span className="text-muted-foreground">Reported: </span>
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                      
                      <Separator className="my-3" />
                      
                      <div className="flex items-center justify-between gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <MessageSquare className="h-4 w-4" />
                              {item.comments.length > 0 && (
                                <span className="text-xs">{item.comments.length}</span>
                              )}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Comments</DialogTitle>
                              <DialogDescription>
                                View and add comments about this item.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="max-h-[300px] overflow-y-auto space-y-3 my-4">
                              {item.comments.length > 0 ? (
                                item.comments.map((comment) => (
                                  <div key={comment.id} className="border rounded-md p-3">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium">{comment.user}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(comment.date).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="mt-1 text-sm">{comment.text}</p>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center text-muted-foreground py-4">
                                  No comments yet
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                id="comment"
                                placeholder="Add a comment..."
                                className="flex-1"
                              />
                              <Button onClick={() => {
                                const comment = document.getElementById("comment").value;
                                if (comment.trim()) {
                                  handleAddComment(item.id, comment);
                                  document.getElementById("comment").value = "";
                                }
                              }}>
                                Add
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <div className="flex items-center ml-auto gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Item</DialogTitle>
                                <DialogDescription>
                                  Update information about your lost or found item.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <label htmlFor="edit-name" className="text-sm font-medium">
                                    Item Name
                                  </label>
                                  <Input
                                    id="edit-name"
                                    defaultValue={item.name}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label htmlFor="edit-description" className="text-sm font-medium">
                                    Description
                                  </label>
                                  <Input
                                    id="edit-description"
                                    defaultValue={item.description}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label htmlFor="edit-location" className="text-sm font-medium">
                                    Location
                                  </label>
                                  <Input
                                    id="edit-location"
                                    defaultValue={item.location}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button onClick={() => {
                                  const updatedItem = {
                                    ...item,
                                    name: document.getElementById("edit-name").value,
                                    description: document.getElementById("edit-description").value,
                                    location: document.getElementById("edit-location").value,
                                  };
                                  handleUpdateItem(updatedItem);
                                }}>
                                  Save Changes
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete
                                  your item report from our servers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteItem(item.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No items found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You haven't reported any items yet
                </p>
                <Button 
                  className="mt-4" 
                  onClick={() => navigate("/report-lost-found")}
                >
                  Report an Item
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="lost" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredItems
                .filter(item => item.status === 'lost')
                .map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="relative">
                      {item.imageUrl && (
                        <div className="aspect-video w-full overflow-hidden">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="absolute right-2 top-2">
                        <Badge className={`${getStatusColor(item.status)} flex items-center gap-1 capitalize`}>
                          {getStatusIcon(item.status)}
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {item.description}
                      </p>
                      <div className="mt-3 text-sm">
                        <span className="text-muted-foreground">Location: </span>
                        {item.location}
                      </div>
                      <div className="mt-1 text-sm">
                        <span className="text-muted-foreground">Reported: </span>
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                      <Separator className="my-3" />
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </TabsContent>
          
          <TabsContent value="found" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredItems
                .filter(item => item.status === 'found')
                .map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="relative">
                      {item.imageUrl && (
                        <div className="aspect-video w-full overflow-hidden">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="absolute right-2 top-2">
                        <Badge className={`${getStatusColor(item.status)} flex items-center gap-1 capitalize`}>
                          {getStatusIcon(item.status)}
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {item.description}
                      </p>
                      <div className="mt-3 text-sm">
                        <span className="text-muted-foreground">Location: </span>
                        {item.location}
                      </div>
                      <div className="mt-1 text-sm">
                        <span className="text-muted-foreground">Reported: </span>
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                      <Separator className="my-3" />
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ManageMyItems;
