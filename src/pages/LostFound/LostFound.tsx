import { useState, useEffect } from "react";
import axios from "axios";
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
import { format } from "date-fns";

// Define interfaces based on the backend models
interface User {
  id: number;
  name: string;
  role: string;
}

interface LostItemType {
  item_id: number;
  name: string;
  description: string;
  status: "lost" | "found" | "claimed" | "matched";
  place: string;
  lost_at?: string;
  found_at?: string;
  image?: string;
  user: User;
}

const LostFound = () => {
  const { userRole, token } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [lostItems, setLostItems] = useState<LostItemType[]>([]);
  const [foundItems, setFoundItems] = useState<LostItemType[]>([]);
  const [allItems, setAllItems] = useState<LostItemType[]>([]);
  const [myItems, setMyItems] = useState<LostItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch lost items
        const lostItemsResponse = await axios.get(
          "http://127.0.0.1:8000/api/v1/lost-and-found/lost-items/",
          {
            headers: {
              Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQ0MjI4MjI5LCJpYXQiOjE3NDM2MjM0MjksImp0aSI6IjZiZDk5MzEzYjRmYjQ1NGJhZWVmODJjOWE4NTc5OWI5IiwidXNlcl9pZCI6MX0.oyCIwqIqADfzjWE0pDp4CsO8RloyIhz4AIiD-jacvYE`, // Include authorization token if required
            },
          }
        );

        // Fetch found items
        const foundItemsResponse = await axios.get(
          "http://127.0.0.1:8000/api/v1/lost-and-found/found-items/",
          {
            headers: {
              Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQ0MjI4MjI5LCJpYXQiOjE3NDM2MjM0MjksImp0aSI6IjZiZDk5MzEzYjRmYjQ1NGJhZWVmODJjOWE4NTc5OWI5IiwidXNlcl9pZCI6MX0.oyCIwqIqADfzjWE0pDp4CsO8RloyIhz4AIiD-jacvYE`, // Include authorization token if required
            },
          }
        );

        const lostItemsData = lostItemsResponse.data;
        const foundItemsData = foundItemsResponse.data;
        console.log("Lost Items:", lostItemsData.results);
        console.log("Found Items:", foundItemsData.results);

        // Format and standardize data
        const formattedLostItems = lostItemsData.results.map((item: any) => ({
          ...item,
          status: "lost", // Ensure status is set correctly
        }));

        const formattedFoundItems = foundItemsData.results.map((item: any) => ({
          ...item,
          status: "found", // Ensure status is set correctly
        }));

        setLostItems(formattedLostItems);
        setFoundItems(formattedFoundItems);

        // Combine all items for the "all" tab
        const combinedItems = [...formattedLostItems, ...formattedFoundItems];
        setAllItems(combinedItems);

        // Filter items for the current user (for "my-items" tab)
        // Assuming we have a user ID to filter by
        const userItems = combinedItems.filter((item) => item.user.id === 34); // replace with actual user ID
        setMyItems(userItems);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load items. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Filter items based on search query
  const getFilteredItems = () => {
    const itemsToFilter =
      activeTab === "lost"
        ? lostItems
        : activeTab === "found"
        ? foundItems
        : activeTab === "my-items"
        ? myItems
        : allItems;

    return itemsToFilter.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.place.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredItems = getFilteredItems();

  const getStatusColor = (status: LostItemType["status"]) => {
    switch (status) {
      case "lost":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "found":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "claimed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "matched":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "";
    }
  };

  const getStatusIcon = (status: LostItemType["status"]) => {
    switch (status) {
      case "lost":
        return <X className="h-3 w-3" />;
      case "found":
        return <Box className="h-3 w-3" />;
      case "claimed":
        return <Check className="h-3 w-3" />;
      case "matched":
        return <Tag className="h-3 w-3" />;
      default:
        return null;
    }
  };

  // Format date function
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";
    return format(new Date(dateString), "MMM d, yyyy");
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

      <Tabs
        defaultValue="all"
        className="space-y-4"
        onValueChange={(value) => setActiveTab(value)}
      >
        <TabsList>
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="lost">Lost</TabsTrigger>
          <TabsTrigger value="found">Found</TabsTrigger>
          <TabsTrigger value="my-items">My Items</TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="text-center py-12">
            <p>Loading items...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">
            <p>{error}</p>
          </div>
        ) : (
          <>
            <TabsContent value="all" className="space-y-4">
              {filteredItems.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredItems.map((item) => (
                    <Card key={item.item_id} className="overflow-hidden">
                      <div className="relative">
                        {item.image && (
                          <div className="aspect-video w-full overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <div className="absolute right-2 top-2">
                          <Badge
                            className={`${getStatusColor(
                              item.status
                            )} flex items-center gap-1 capitalize`}
                          >
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
                          <span>{item.place}</span>
                        </div>
                        <Separator className="my-3" />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <div className="bg-primary/10 text-primary h-full w-full flex items-center justify-center text-xs font-medium">
                                {item.user?.name?.charAt(0) || "U"}
                              </div>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              Reported{" "}
                              {formatDate(item.lost_at || item.found_at)}
                            </span>
                          </div>
                          <Button size="sm" variant="outline">
                            Details
                          </Button>
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

            {/* Lost items tab */}
            <TabsContent value="lost">
              {/* Similar display logic as "all" but with lostItems */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item) => (
                  <Card key={item.item_id} className="overflow-hidden">
                    {/* Same card content as above */}
                    <div className="relative">
                      {item.image && (
                        <div className="aspect-video w-full overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="absolute right-2 top-2">
                        <Badge
                          className={`${getStatusColor(
                            item.status
                          )} flex items-center gap-1 capitalize`}
                        >
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
                        <span>{item.place}</span>
                      </div>
                      <Separator className="my-3" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <div className="bg-primary/10 text-primary h-full w-full flex items-center justify-center text-xs font-medium">
                              {item.user?.name?.charAt(0) || "U"}
                            </div>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            Reported {formatDate(item.lost_at)}
                          </span>
                        </div>
                        <Button size="sm" variant="outline">
                          Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Found items tab */}
            <TabsContent value="found">
              {/* Similar display logic as "all" but with foundItems */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item) => (
                  <Card key={item.item_id} className="overflow-hidden">
                    {/* Similar card content as above */}
                    <div className="relative">
                      {item.image && (
                        <div className="aspect-video w-full overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="absolute right-2 top-2">
                        <Badge
                          className={`${getStatusColor(
                            item.status
                          )} flex items-center gap-1 capitalize`}
                        >
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
                        <span>{item.place}</span>
                      </div>
                      <Separator className="my-3" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Reported {formatDate(item.found_at)}
                        </span>
                        <Button size="sm" variant="outline">
                          Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* My items tab */}
            <TabsContent value="my-items">
              {filteredItems.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredItems.map((item) => (
                    <Card key={item.item_id} className="overflow-hidden">
                      {/* Same card content structure */}
                      <div className="relative">
                        {item.image && (
                          <div className="aspect-video w-full overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <div className="absolute right-2 top-2">
                          <Badge
                            className={`${getStatusColor(
                              item.status
                            )} flex items-center gap-1 capitalize`}
                          >
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
                          <span>{item.place}</span>
                        </div>
                        <Separator className="my-3" />
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Reported {formatDate(item.lost_at || item.found_at)}
                          </span>
                          <Button size="sm" variant="outline">
                            Details
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Box className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">
                    No items reported by you
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    When you report lost or found items, they will appear here
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
          </>
        )}
      </Tabs>
    </Layout>
  );
};

export default LostFound;
