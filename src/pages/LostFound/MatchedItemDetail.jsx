import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Percent,
  Link as LinkIcon,
  Info,
} from "lucide-react";
import { format } from "date-fns";
import Layout from "@/components/layout/Layout";
import PageTitle from "@/components/ui/page-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast"; // Change this import

const MatchedItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [matchedItem, setMatchedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  const [confirming, setConfirming] = useState(false);
  const [declining, setDeclining] = useState(false);
  const { toast } = useToast(); // Add this line to get the toast function
  // get current user from local storage or context
  const currentUser = JSON.parse(localStorage.getItem("userId"));
  // Add default image URL constant near the top of the component
  const DEFAULT_IMAGE_URL =
    "https://res.cloudinary.com/dha2yp5tj/image/upload/v1743913360/annonymous_photo_ny7plk.png";

  useEffect(() => {
    const fetchMatchedItemDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1/"
          }lost-and-found/matched-items/${id}/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }
        );
        console.log("current user:", currentUser);
        setMatchedItem(response.data);
        console.log("Matched item data:", response.data);
      } catch (err) {
        console.error(`Error fetching matched item:`, err);
        setError(`Failed to load matched item details. ${err.message}`);
      } finally {
        setLoading(false);      }
    };

    fetchMatchedItemDetails();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    return format(new Date(dateString), "MMMM d, yyyy 'at' h:mm a");
  };

  const getStatusBadge = (status) => {
    let colorClass = "";

    if (status === "LOST") {
      colorClass = "bg-destructive/10 text-destructive border-destructive/20";
    } else if (status === "FOUND") {
      colorClass = "bg-blue-500/10 text-blue-500 border-blue-500/20";
    } else if (status === "MATCHED") {
      colorClass = "bg-amber-500/10 text-amber-500 border-amber-500/20";
    } else if (status === "CONFIRMED") {
      colorClass = "bg-green-500/10 text-green-500 border-green-500/20";
    }

    return <Badge className={`${colorClass} capitalize`}>{status}</Badge>;
  };

  const handleConfirmMatch = async () => {
    try {
      setConfirming(true);
      const response = await axios.post(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1/"
        }lost-and-found/matched-items/${id}/update-status/`,
        {}, // Empty body, as we're just updating status
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      console.log("Match confirmation response:", response.data);

      // Fix the toast notification format
      toast({
        title: "Match Confirmed",
        description: "The match has been confirmed successfully.",
      });

      // Navigate back to the lost and found page
      navigate("/lost-found");
    } catch (err) {
      console.error("Error confirming match:", err);
      // Fix the error toast
      toast({
        title: "Error",
        description: "Failed to confirm match. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConfirming(false);
    }
  };

  const handleDeclineMatch = async () => {
    try {
      setDeclining(true);
      const response = await axios.post(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1/"
        }lost-and-found/matched-items/${id}/decline-match/`,
        {}, // Empty body
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      console.log("Match decline response:", response.data);

      toast({
        title: "Match Declined",
        description: "The match has been declined successfully.",
      });

      // Navigate back to the lost and found page
      navigate("/lost-found");
    } catch (err) {
      console.error("Error declining match:", err);
      toast({
        title: "Error",
        description: "Failed to decline match. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeclining(false);
    }
  };

  return (
    <Layout>
      <PageTitle
        title="Matched Item Details"
        subtitle={
          loading
            ? "Loading matched item information..."
            : "Details for matched item pair"
        }
        icon={<ArrowLeft className="mr-2" onClick={() => navigate(-1)} />}
        action={
          <Button variant="outline" onClick={() => navigate("/lost-found")}>
            Back to Lost & Found
          </Button>
        }
      />

      {loading ? (
        <Card className="mx-auto max-w-6xl">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-[200px] w-full rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="mx-auto max-w-6xl">
          <CardContent className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={() => navigate("/lost-found")}>
              Return to Lost & Found
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mx-auto max-w-6xl">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <LinkIcon className="h-6 w-6 text-amber-500" />
                    Matched Items
                  </CardTitle>
                  <p className="text-muted-foreground mt-1">
                    These items have been matched based on their similarity.
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-sm px-3 py-1">
                    {matchedItem.similarity_score.toFixed(0)}
                    <Percent className="h-3.5 w-3.5 mr-1" />
                    Match
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Matched on {formatDate(matchedItem.created_at)}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="side-by-side" className="space-y-4">
                <TabsList className="w-full md:w-auto bg-card border">
                  <TabsTrigger 
                    value="side-by-side"
                    className="transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-muted/80"
                  >
                    Side by Side
                  </TabsTrigger>
                  <TabsTrigger 
                    value="details"
                    className="transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-muted/80"
                  >
                    Detailed View
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="side-by-side" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Lost Item Card */}
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="flex items-center gap-2">
                            {getStatusBadge("LOST")}
                            <span>{matchedItem.lost_item_details.name}</span>
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Image */}
                        <div className="aspect-video w-full overflow-hidden rounded-md">
                          <img
                            src={
                              matchedItem.lost_item_details.image ||
                              DEFAULT_IMAGE_URL
                            }
                            alt={matchedItem.lost_item_details.name}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        {/* Quick Info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {matchedItem.lost_item_details.place}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {formatDate(
                                matchedItem.lost_item_details.lost_at
                              )}
                            </span>
                          </div>                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {matchedItem.lost_item_details.user}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {matchedItem.lost_item_details.description}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Found Item Card */}
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="flex items-center gap-2">
                            {getStatusBadge("FOUND")}
                            <span>{matchedItem.found_item_details.name}</span>
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Image */}
                        <div className="aspect-video w-full overflow-hidden rounded-md">
                          <img
                            src={
                              matchedItem.found_item_details.image ||
                              DEFAULT_IMAGE_URL
                            }
                            alt={matchedItem.found_item_details.name}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        {/* Quick Info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {matchedItem.found_item_details.place}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {formatDate(
                                matchedItem.found_item_details.found_at
                              )}
                            </span>
                          </div>                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {matchedItem.found_item_details.user}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {matchedItem.found_item_details.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="details">
                  <div className="space-y-6">
                    {/* Match Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Match Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <Percent className="h-5 w-5 text-amber-500" />
                            <div>
                              <h4 className="font-medium">Similarity Score</h4>
                              <p className="text-muted-foreground">
                                {matchedItem.similarity_score.toFixed(2)}%
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <h4 className="font-medium">Match Date</h4>
                              <p className="text-muted-foreground">
                                {formatDate(matchedItem.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Lost Item Details */}
                    <Card>
                      <CardHeader className="bg-destructive/5">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {getStatusBadge("LOST")}
                          <span>
                            Lost Item: {matchedItem.lost_item_details.name}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <div className="aspect-square w-full overflow-hidden rounded-md">
                              <img
                                src={
                                  matchedItem.lost_item_details.image ||
                                  DEFAULT_IMAGE_URL
                                }
                                alt={matchedItem.lost_item_details.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-lg font-medium mb-2 flex items-center">
                                <Info className="h-5 w-5 mr-2 text-muted-foreground" />
                                Description
                              </h3>
                              <p className="text-muted-foreground">
                                {matchedItem.lost_item_details.description ||
                                  "No description provided."}
                              </p>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                              <div className="flex items-start gap-2">
                                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                  <h4 className="font-medium">Location Lost</h4>
                                  <p className="text-muted-foreground">
                                    {matchedItem.lost_item_details.place}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-2">
                                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                  <h4 className="font-medium">Date Lost</h4>
                                  <p className="text-muted-foreground">
                                    {formatDate(
                                      matchedItem.lost_item_details.lost_at
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-2">
                                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                  <h4 className="font-medium">Reported by</h4>
                                  <div className="flex items-center mt-1">
                                    <Avatar className="h-6 w-6 mr-2">
                                      <div className="bg-primary/10 text-primary h-full w-full flex items-center justify-center text-xs font-medium">
                                        {matchedItem.lost_item_details.user?.charAt(
                                          0
                                        ) || "U"}
                                      </div>
                                    </Avatar>
                                    <span>
                                      {matchedItem.lost_item_details.user ||
                                        "Anonymous"}
                                    </span>
                                  </div>
                                </div>                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Found Item Details */}
                    <Card>
                      <CardHeader className="bg-blue-500/5">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {getStatusBadge("FOUND")}
                          <span>
                            Found Item: {matchedItem.found_item_details.name}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <div className="aspect-square w-full overflow-hidden rounded-md">
                              <img
                                src={
                                  matchedItem.found_item_details.image ||
                                  DEFAULT_IMAGE_URL
                                }
                                alt={matchedItem.found_item_details.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-lg font-medium mb-2 flex items-center">
                                <Info className="h-5 w-5 mr-2 text-muted-foreground" />
                                Description
                              </h3>
                              <p className="text-muted-foreground">
                                {matchedItem.found_item_details.description ||
                                  "No description provided."}
                              </p>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                              <div className="flex items-start gap-2">
                                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                  <h4 className="font-medium">
                                    Location Found
                                  </h4>
                                  <p className="text-muted-foreground">
                                    {matchedItem.found_item_details.place}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-2">
                                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                  <h4 className="font-medium">Date Found</h4>
                                  <p className="text-muted-foreground">
                                    {formatDate(
                                      matchedItem.found_item_details.found_at
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-2">
                                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                  <h4 className="font-medium">Reported by</h4>
                                  <div className="flex items-center mt-1">
                                    <Avatar className="h-6 w-6 mr-2">
                                      <div className="bg-primary/10 text-primary h-full w-full flex items-center justify-center text-xs font-medium">
                                        {matchedItem.found_item_details.user?.charAt(
                                          0
                                        ) || "U"}
                                      </div>
                                    </Avatar>
                                    <span>
                                      {matchedItem.found_item_details.user ||
                                        "Anonymous"}
                                    </span>
                                  </div>
                                </div>                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0 mt-6">
                {currentUser === matchedItem.lost_item_user && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleDeclineMatch}
                    disabled={declining || confirming}
                  >
                    {declining ? "Declining..." : "Decline Match"}
                  </Button>
                )}

                {matchedItem.status === "FAILED" ? (
                  <Button
                    className="w-full bg-green-500 hover:bg-green-600"
                    onClick={handleConfirmMatch}
                    disabled={confirming || declining}
                  >
                    {confirming ? "Confirming..." : "Confirm Match"}
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-green-500 hover:bg-green-600"
                    disabled={true}
                  >
                    Match Already Confirmed
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
};

export default MatchedItemDetail;
