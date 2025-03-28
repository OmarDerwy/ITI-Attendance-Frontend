
import { useState } from "react";
import { Search, Box, MapPin, Tag, Plus, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PageTitle from "@/components/ui/page-title";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import { useUser } from "@/context/UserContext";

interface LostItemType {
  id: number;
  name: string;
  category: string;
  location: string;
  status: "lost" | "found" | "claimed" | "matched";
  description: string;
  date: string;
  reporter: {
    name: string;
    role: string;
  };
  imageUrl?: string;
}

const LostFound = () => {
  const { userRole } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  // Simulated data
  const lostItems: LostItemType[] = [
    {
      id: 1,
      name: "Black Laptop Bag",
      category: "Bags",
      location: "Library, 2nd Floor",
      status: "lost",
      description: "Black laptop bag with a red logo, contains charger and notebook",
      date: "2023-06-15",
      reporter: {
        name: "John Smith",
        role: "student"
      },
      imageUrl: "/placeholder.svg"
    },
    {
      id: 2,
      name: "Water Bottle",
      category: "Personal Items",
      location: "Cafeteria",
      status: "found",
      description: "Blue metal water bottle with stickers",
      date: "2023-06-14",
      reporter: {
        name: "Sarah Johnson",
        role: "student"
      },
      imageUrl: "/placeholder.svg"
    },
    {
      id: 3,
      name: "Student ID Card",
      category: "Documents",
      location: "Main Hall",
      status: "matched",
      description: "Student ID card for Ahmed Hassan",
      date: "2023-06-13",
      reporter: {
        name: "Maria Garcia",
        role: "supervisor"
      }
    },
    {
      id: 4,
      name: "Textbook - Data Structures",
      category: "Books",
      location: "Room 203",
      status: "claimed",
      description: "Computer Science textbook, Data Structures 3rd Edition",
      date: "2023-06-12",
      reporter: {
        name: "David Lee",
        role: "student"
      }
    }
  ];

  const filteredItems = lostItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: LostItemType["status"]) => {
    switch(status) {
      case "lost": return "bg-destructive/10 text-destructive border-destructive/20";
      case "found": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "claimed": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "matched": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default: return "";
    }
  };

  const getStatusIcon = (status: LostItemType["status"]) => {
    switch(status) {
      case "lost": return <X className="h-3 w-3" />;
      case "found": return <Box className="h-3 w-3" />;
      case "claimed": return <Check className="h-3 w-3" />;
      case "matched": return <Tag className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <Layout>
      <PageTitle
        title="Lost & Found"
        subtitle="Report and search for lost or found items"
        icon={<Search />}
        action={
          <Button onClick={() => navigate("/report-lost-found")}>
            <Plus className="mr-2 h-4 w-4" />
            Report Item
          </Button>
        }
      />

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search items by name, description or location..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="lost">Lost</TabsTrigger>
          <TabsTrigger value="found">Found</TabsTrigger>
          <TabsTrigger value="my-items">My Items</TabsTrigger>
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
                    <div className="mt-3 flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span>{item.location}</span>
                    </div>
                    <div className="mt-2 flex items-start gap-2 text-sm">
                      <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span>{item.category}</span>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <div className="bg-primary/10 text-primary h-full w-full flex items-center justify-center text-xs font-medium">
                            {item.reporter.name.charAt(0)}
                          </div>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          Reported {new Date(item.date).toLocaleDateString()}
                        </span>
                      </div>
                      <Button size="sm" variant="outline">Details</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Box className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No items found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="lost">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.filter(item => item.status === 'lost').map((item) => (
              <Card key={item.id} className="overflow-hidden">
                {/* Same card content as above */}
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
                  <div className="mt-3 flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <span>{item.location}</span>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <div className="bg-primary/10 text-primary h-full w-full flex items-center justify-center text-xs font-medium">
                          {item.reporter.name.charAt(0)}
                        </div>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        Reported {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                    <Button size="sm" variant="outline">Details</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="found">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.filter(item => item.status === 'found').map((item) => (
              <Card key={item.id} className="overflow-hidden">
                {/* Similar card content as above */}
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
                  <div className="mt-3 flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <span>{item.location}</span>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Reported {new Date(item.date).toLocaleDateString()}
                    </span>
                    <Button size="sm" variant="outline">Details</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="my-items">
          <div className="text-center py-12">
            <Box className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No items reported by you</h3>
            <p className="text-sm text-muted-foreground mt-1">
              When you report lost or found items, they will appear here
            </p>
            <Button className="mt-4">Report an Item</Button>
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default LostFound;
