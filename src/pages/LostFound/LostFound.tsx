import { useState } from "react";
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
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
  const token = localStorage.getItem("access");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("lost");

  // Add default image URL constant
  const DEFAULT_IMAGE_URL =
    "https://media.discordapp.net/attachments/1347736304397582456/1358295324820770836/ChatGPT_Image_Apr_6_2025_06_18_28_AM.png?ex=67f35299&is=67f20119&hm=1b43ebbc3ccf0a978e90e97c8b3eb275ec2614aeffeb6364a3fc3763692788d4&=&format=webp&quality=lossless&width=960&height=960";

  // Pagination states
  const [lostItemsPage, setLostItemsPage] = useState(1);
  const [foundItemsPage, setFoundItemsPage] = useState(1);
  const [matchedItemsPage, setMatchedItemsPage] = useState(1);

  // API fetching functions
  const fetchLostItems = async (page = 1) => {
    console.log("Fetching lost items for page:");
    const response = await axios.get(
      `http://127.0.0.1:8000/api/v1/lost-and-found/lost-items/?page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      }
    );
    return response.data;
  };

  const fetchFoundItems = async (page = 1) => {
    const response = await axios.get(
      `http://127.0.0.1:8000/api/v1/lost-and-found/found-items/?page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      }
    );
    return response.data;
  };

  const fetchMatchedItems = async (page = 1) => {
    const response = await axios.get(
      `http://127.0.0.1:8000/api/v1/lost-and-found/matched-items/?page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      }
    );
    return response.data;
  };

  // Use React Query for data fetching with caching
  const {
    data: lostItemsData,
    isLoading: isLoadingLost,
    error: errorLost,
  } = useQuery({
    queryKey: ["lostItems", lostItemsPage],
    queryFn: () => fetchLostItems(lostItemsPage),
    enabled: !!token && (activeTab === "lost" || lostItemsPage === 1),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  const {
    data: foundItemsData,
    isLoading: isLoadingFound,
    error: errorFound,
  } = useQuery({
    queryKey: ["foundItems", foundItemsPage],
    queryFn: () => fetchFoundItems(foundItemsPage),
    enabled: !!token && (activeTab === "found" || foundItemsPage === 1),
    staleTime: 15 * 60 * 1000, // 5 minutes
  });

  const {
    data: matchedItemsData,
    isLoading: isLoadingMatched,
    error: errorMatched,
  } = useQuery({
    queryKey: ["matchedItems", matchedItemsPage],
    queryFn: () => fetchMatchedItems(matchedItemsPage),
    enabled: !!token && (activeTab === "matched" || matchedItemsPage === 1),
    staleTime: 15 * 60 * 1000, // 5 minutes
  });

  // Combined loading and error states
  const isLoading =
    (activeTab === "lost" && isLoadingLost) ||
    (activeTab === "found" && isLoadingFound) ||
    (activeTab === "matched" && isLoadingMatched);

  const error =
    (activeTab === "lost" && errorLost) ||
    (activeTab === "found" && errorFound) ||
    (activeTab === "matched" && errorMatched)
      ? "Failed to load items. Please try again later."
      : null;

  // Extract data and pagination info
  const lostItems = lostItemsData?.results || [];
  const foundItems = foundItemsData?.results || [];
  const matchedItems = matchedItemsData?.results || [];

  const lostItemsNextUrl = lostItemsData?.next || null;
  const lostItemsPrevUrl = lostItemsData?.previous || null;
  const foundItemsNextUrl = foundItemsData?.next || null;
  const foundItemsPrevUrl = foundItemsData?.previous || null;
  const matchedItemsNextUrl = matchedItemsData?.next || null;
  const matchedItemsPrevUrl = matchedItemsData?.previous || null;

  // Calculate total pages
  const lostItemsTotalPages = lostItemsData
    ? Math.ceil(lostItemsData.count / (lostItemsData.results.length || 1))
    : 1;

  const foundItemsTotalPages = foundItemsData
    ? Math.ceil(foundItemsData.count / (foundItemsData.results.length || 1))
    : 1;

  const matchedItemsTotalPages = matchedItemsData
    ? Math.ceil(matchedItemsData.count / (matchedItemsData.results.length || 1))
    : 1;

  // Filter items based on search query
  const getFilteredItems = () => {
    // Handle matched items tab differently
    if (activeTab === "matched") {
      return matchedItems;
    }

    const itemsToFilter = activeTab === "lost" ? lostItems : foundItems;

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

  // Helper function to get current pagination values based on active tab
  const getPaginationInfo = () => {
    switch (activeTab) {
      case "lost":
        return {
          currentPage: lostItemsPage,
          totalPages: lostItemsTotalPages,
          hasNext: !!lostItemsNextUrl,
          hasPrev: !!lostItemsPrevUrl,
        };
      case "found":
        return {
          currentPage: foundItemsPage,
          totalPages: foundItemsTotalPages,
          hasNext: !!foundItemsNextUrl,
          hasPrev: !!foundItemsPrevUrl,
        };
      case "matched":
        return {
          currentPage: matchedItemsPage,
          totalPages: matchedItemsTotalPages,
          hasNext: !!matchedItemsNextUrl,
          hasPrev: !!matchedItemsPrevUrl,
        };
      default:
        return {
          currentPage: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        };
    }
  };

  // Handle navigation to next page
  const handleNextPage = () => {
    if (activeTab === "lost" && lostItemsNextUrl) {
      setLostItemsPage((prev) => prev + 1);
    } else if (activeTab === "found" && foundItemsNextUrl) {
      setFoundItemsPage((prev) => prev + 1);
    } else if (activeTab === "matched" && matchedItemsNextUrl) {
      setMatchedItemsPage((prev) => prev + 1);
    }
  };

  // Handle navigation to previous page
  const handlePrevPage = () => {
    if (activeTab === "lost" && lostItemsPrevUrl) {
      setLostItemsPage((prev) => prev - 1);
    } else if (activeTab === "found" && foundItemsPrevUrl) {
      setFoundItemsPage((prev) => prev - 1);
    } else if (activeTab === "matched" && matchedItemsPrevUrl) {
      setMatchedItemsPage((prev) => prev - 1);
    }
  };

  // Add a handler for tab changes to reset pagination when switching tabs
  const handleTabChange = (value) => {
    setActiveTab(value);
    // Reset page counters if needed
    if (value === "lost" && lostItemsPage !== 1) {
      setLostItemsPage(1);
    } else if (value === "found" && foundItemsPage !== 1) {
      setFoundItemsPage(1);
    } else if (value === "matched" && matchedItemsPage !== 1) {
      setMatchedItemsPage(1);
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

      <Tabs
        defaultValue="lost"
        className="space-y-4"
        onValueChange={handleTabChange} // Use the new handler
      >
        <TabsList>
          <TabsTrigger value="lost">Lost</TabsTrigger>
          <TabsTrigger value="found">Found</TabsTrigger>
          <TabsTrigger value="matched">Matched</TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading items...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Lost items tab */}
            <TabsContent value="lost">
              {filteredItems.length > 0 ? (
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
                              navigate(`/item-details/lost/${item.item_id}`)
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
                  <h3 className="mt-4 text-lg font-medium">No lost items</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    No lost items are currently available
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => navigate("/report-lost-found")}
                  >
                    Report a Lost Item
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Found items tab */}
            <TabsContent value="found">
              {filteredItems.length > 0 ? (
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
                              navigate(`/item-details/found/${item.item_id}`)
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
                  <h3 className="mt-4 text-lg font-medium">No found items</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    No found items are currently available
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => navigate("/report-lost-found")}
                  >
                    Report a Found Item
                  </Button>
                </div>
              )}
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
        {/* Add pagination controls after tab content */}
        {!isLoading && !error && filteredItems.length > 0 && (
          <div className="flex items-center justify-center mt-6 space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={!getPaginationInfo().hasPrev}
              aria-label="Previous Page"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {getPaginationInfo().currentPage} of{" "}
              {getPaginationInfo().totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!getPaginationInfo().hasNext}
              aria-label="Next Page"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </Tabs>
    </Layout>
  );
};

export default LostFound;
