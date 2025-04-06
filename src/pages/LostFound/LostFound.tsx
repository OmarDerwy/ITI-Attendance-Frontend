import { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Box,
  MapPin,
  Tag,
  Plus,
  Check,
  X,
  Link,
  Percent,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/layout.jsx";
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

interface LostItemType {
  item_id: number;
  name: string;
  description: string;
  status: "LOST" | "FOUND" | "CONFIRMED" | "MATCHED";
  place: string;
  lost_at?: string;
  found_at?: string;
  image?: string;
  user: string;
}

// Add interface for matched items
interface MatchedItemType {
  match_id: number;
  lost_item_details: LostItemType;
  found_item_details: LostItemType;
  lost_item_user: number;
  found_item_user: number;
  similarity_score: number;
  created_at: string;
  confirmed_at?: string;
  status: "SUCCEEDED" | "FAILED";
}

const LostFound = () => {
  const userId = Number(localStorage.getItem("userId"));
  const { userRole, token } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [lostItems, setLostItems] = useState<LostItemType[]>([]);
  const [foundItems, setFoundItems] = useState<LostItemType[]>([]);
  const [allItems, setAllItems] = useState<LostItemType[]>([]);
  // Replace myItems with matchedItems
  const [matchedItems, setMatchedItems] = useState<MatchedItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Add default image URL constant near the top of the component
  const DEFAULT_IMAGE_URL =
    "https://media.discordapp.net/attachments/1347736304397582456/1358295324820770836/ChatGPT_Image_Apr_6_2025_06_18_28_AM.png?ex=67f35299&is=67f20119&hm=1b43ebbc3ccf0a978e90e97c8b3eb275ec2614aeffeb6364a3fc3763692788d4&=&format=webp&quality=lossless&width=960&height=960";

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
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }
        );

        // Fetch found items
        const foundItemsResponse = await axios.get(
          "http://127.0.0.1:8000/api/v1/lost-and-found/found-items/",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }
        );

        // Add fetch for matched items
        const matchedItemsResponse = await axios.get(
          "http://127.0.0.1:8000/api/v1/lost-and-found/matched-items/",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }
        );

        const lostItemsData = lostItemsResponse.data;
        const foundItemsData = foundItemsResponse.data;
        const matchedItemsData = matchedItemsResponse.data;
        console.log("Lost Items:", lostItemsData.results);
        console.log("Found Items:", foundItemsData.results);
        console.log("Matched Items:", matchedItemsData.results);

        // Format and standardize data
        const formattedLostItems = lostItemsData.results.map((item: any) => ({
          ...item,
        }));

        const formattedFoundItems = foundItemsData.results.map((item: any) => ({
          ...item,
        }));

        // Filter matched items for current user where status is SUCCEEDED
        console.log(matchedItemsData?.results[0]?.lost_item_user);
        console.log(userId);
        const formattedMatchedItems = matchedItemsData.results.filter(
          (matchedItem: any) =>
            matchedItem.lost_item_user === userId ||
            (matchedItem.status === "SUCCEEDED" &&
              matchedItem.found_item_user === userId)
        );
        console.log("Filtered Matched Items:", formattedMatchedItems);

        setLostItems(formattedLostItems);
        setFoundItems(formattedFoundItems);
        setMatchedItems(formattedMatchedItems);

        // Combine all items for the "all" tab
        const combinedItems = [...formattedLostItems, ...formattedFoundItems];
        setAllItems(combinedItems);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load items. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, userId]);

  // Filter items based on search query
  const getFilteredItems = () => {
    // Handle matched items tab differently
    if (activeTab === "matched") {
      console.log("Matched Items:", matchedItems);
      return matchedItems;
    }

    const itemsToFilter =
      activeTab === "lost"
        ? lostItems
        : activeTab === "found"
        ? foundItems
        : allItems;

    // Filter items based on search query
    const filtered = itemsToFilter.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.place.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Ensure all items have valid IDs and filter out any duplicates
    const uniqueItemIds = new Set();
    return filtered.filter((item) => {
      // Skip items with undefined IDs
      if (item.item_id === undefined) {
        console.warn("Found item with undefined ID:", item);
        return false;
      }

      // Ensure uniqueness
      if (uniqueItemIds.has(item.item_id)) {
        return false;
      }

      uniqueItemIds.add(item.item_id);
      return true;
    });
  };

  const filteredItems = getFilteredItems();

  const getStatusColor = (status: LostItemType["status"]) => {
    switch (status) {
      case "LOST":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "FOUND":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "CONFIRMED":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "MATCHED":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "";
    }
  };

  const getStatusIcon = (status: LostItemType["status"]) => {
    console.log(status);
    switch (status) {
      case "LOST":
        return <X className="h-3 w-3" />;
      case "FOUND":
        return <Box className="h-3 w-3" />;
      case "CONFIRMED":
        return <Check className="h-3 w-3" />;
      case "MATCHED":
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
          {/* Replace my-items with matched */}
          <TabsTrigger value="matched">Matched</TabsTrigger>
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
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {filteredItems.map((item, index) => (
                    <Card
                      // Use index as fallback if item_id is undefined
                      key={`all-${item.item_id || `index-${index}`}`}
                      className="overflow-hidden"
                    >
                      <div className="relative">
                        {/* Modified image section to always show an image */}
                        <div className="aspect-square w-full overflow-hidden">
                          <img
                            src={item.image || DEFAULT_IMAGE_URL}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
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
                      <div className="p-3">
                        <h3 className="font-medium text-sm truncate">
                          {item.name}
                        </h3>
                        <div className="mt-2 flex items-start gap-1 text-xs">
                          <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <span className="truncate text-muted-foreground">
                            {item.place}
                          </span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Avatar className="h-5 w-5">
                              <div className="bg-primary/10 text-primary h-full w-full flex items-center justify-center text-xs font-medium">
                                {item.user?.charAt(0) || "U"}
                              </div>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(item.lost_at || item.found_at)}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs px-2"
                            onClick={() =>
                              navigate(
                                `/item-details/${item.status}/${item.item_id}`
                              )
                            }
                          >
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
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                {filteredItems.map((item, index) => (
                  <Card
                    key={`lost-${item.item_id || `index-${index}`}`}
                    className="overflow-hidden"
                  >
                    {/* Same card content as above */}
                    <div className="relative">
                      <div className="aspect-square w-full overflow-hidden">
                        <img
                          src={item.image || DEFAULT_IMAGE_URL}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
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
                    <div className="p-3">
                      <h3 className="font-medium text-sm truncate">
                        {item.name}
                      </h3>
                      <div className="mt-2 flex items-start gap-1 text-xs">
                        <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <span className="truncate text-muted-foreground">
                          {item.place}
                        </span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(item.lost_at)}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs px-2"
                          onClick={() =>
                            navigate(
                              `/item-details/${item.status}/${item.item_id}`
                            )
                          }
                        >
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
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                {filteredItems.map((item, index) => (
                  <Card
                    key={`found-${item.item_id || `index-${index}`}`}
                    className="overflow-hidden"
                  >
                    {/* Similar card content as above */}
                    <div className="relative">
                      <div className="aspect-square w-full overflow-hidden">
                        <img
                          src={item.image || DEFAULT_IMAGE_URL}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
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
                    <div className="p-3">
                      <h3 className="font-medium text-sm truncate">
                        {item.name}
                      </h3>
                      <div className="mt-2 flex items-start gap-1 text-xs">
                        <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <span className="truncate text-muted-foreground">
                          {item.place}
                        </span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(item.found_at)}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs px-2"
                          onClick={() =>
                            navigate(
                              `/item-details/${item.status}/${item.item_id}`
                            )
                          }
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Replace My Items Tab with Matched Items Tab */}
            <TabsContent value="matched">
              {matchedItems.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {matchedItems.map((item, index) => (
                    <Card
                      key={`matched-${item.match_id || `index-${index}`}`}
                      className="overflow-hidden"
                    >
                      <div className="p-3">
                        {/* Card Header with Match Badge */}
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium">Matched Items</h3>
                          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs px-2 py-0.5">
                            {item.similarity_score.toFixed(0)}
                            <Percent className="h-3 w-3" /> Match
                          </Badge>
                        </div>

                        <Separator className="my-2" />

                        {/* Compact Two-Column Layout */}
                        <div className="flex gap-2">
                          {/* Lost Item Column */}
                          <div className="flex-1 border max-h-[350px] rounded-md p-2 bg-destructive/5">
                            <div className="flex items-center gap-1 mb-1">
                              <Badge
                                variant="outline"
                                className="bg-destructive/10 text-destructive text-xs px-1.5 py-0"
                              >
                                Lost
                              </Badge>
                              <h4 className="text-xs font-medium truncate">
                                {item.lost_item_details.name}
                              </h4>
                            </div>

                            <div className="w-full h-25 overflow-hidden rounded mb-1">
                              <img
                                src={
                                  item.lost_item_details.image ||
                                  DEFAULT_IMAGE_URL
                                }
                                alt=""
                                className="h-full w-full object-cover max-h-[200px]"
                              />
                            </div>

                            <div className="flex items-center text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span className="truncate">
                                {item.lost_item_details.place}
                              </span>
                            </div>
                          </div>

                          {/* Found Item Column */}
                          <div className="flex-1 border rounded-md p-2 bg-blue-500/5 max-h-[350px]">
                            <div className="flex items-center gap-1 mb-1">
                              <Badge
                                variant="outline"
                                className="bg-blue-500/10 text-blue-500 text-xs px-1.5 py-0"
                              >
                                Found
                              </Badge>
                              <h4 className="text-xs font-medium truncate">
                                {item.found_item_details.name}
                              </h4>
                            </div>

                            <div className="w-full h-25 overflow-hidden rounded mb-1">
                              <img
                                src={
                                  item.found_item_details.image ||
                                  DEFAULT_IMAGE_URL
                                }
                                alt=""
                                className="h-full w-full object-cover max-h-[200px]"
                              />
                            </div>

                            <div className="flex items-center text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span className="truncate">
                                {item.found_item_details.place}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(item.created_at)}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs px-2"
                            onClick={() =>
                              navigate(`/matched-item-details/${item.match_id}`)
                            }
                          >
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
                    No matched items found
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    When your lost or found items are matched with others, they
                    will appear here
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
