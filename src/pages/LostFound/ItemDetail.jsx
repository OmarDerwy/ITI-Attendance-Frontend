import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Calendar, MapPin, User, Phone, Trash } from "lucide-react";
import { format } from "date-fns";
import Layout from "@/components/layout/Layout";
import PageTitle from "@/components/ui/page-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

const ItemDetail = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [showContact, setShowContact] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const DEFAULT_IMAGE_URL =
    "https://res.cloudinary.com/dha2yp5tj/image/upload/v1743913360/annonymous_photo_ny7plk.png";

  useEffect(() => {
    const fetchItemDetails = async () => {
      setLoading(true);
      try {
        const endpoint =
          type === "lost"
            ? `${
                import.meta.env.VITE_API_BASE_URL ||
                "http://localhost:8000/api/v1/"
              }lost-and-found/lost-items/${id}/`
            : `${
                import.meta.env.VITE_API_BASE_URL ||
                "http://localhost:8000/api/v1/"
              }lost-and-found/found-items/${id}/`;

        const response = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });

        setItem(response.data);

        if (response.data.user_id) {
          fetchUserDetails(response.data.user_id);
        }
      } catch (err) {
        console.error(`Error fetching ${type} item:`, err);
        setError(`Failed to load item details. ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserDetails = async (userId) => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1/"
          }accounts/auth/users/${userId}/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }
        );
        console.log("User details:", response.data);
        setUser(response.data);
      } catch (err) {
        console.error("Error fetching user details:", err);
        toast({
          title: "Error",
          description: "Could not load reporter contact information.",
          variant: "destructive",
        });
      }
    };

    fetchItemDetails();
  }, [id, type]);

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    return format(new Date(dateString), "MMMM d, yyyy 'at' h:mm a");
  };

  const getStatusBadge = () => {
    let colorClass = "";
    console.log(item.status);
    if (item.status === "LOST") {
      colorClass = "bg-destructive/10 text-destructive border-destructive/20";
    } else if (item.status === "FOUND") {
      colorClass = "bg-blue-500/10 text-blue-500 border-blue-500/20";
    } else if (item.status === "MATCHED") {
      colorClass = "bg-amber-500/10 text-amber-500 border-amber-500/20";
    } else if (item.status === "CONFIRMED") {
      colorClass = "bg-green-500/10 text-green-500 border-green-500/20";
    }

    return <Badge className={`${colorClass} capitalize`}>{item.status}</Badge>;
  };

  const handleContactClick = () => {
    if (!user || !user.phone_number) {
      toast({
        title: "Contact Information Unavailable",
        description: "This user's contact information is not available.",
        variant: "destructive",
      });
      return;
    }

    setShowContact(true);

    navigator.clipboard.writeText(user.phone_number).then(() => {
      toast({
        title: "Phone Number Copied",
        description: "The phone number has been copied to your clipboard.",
      });
    });
  };

  const handleDeleteItem = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this item? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}lost-and-found/lost-items/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      toast({
        title: "Item Deleted",
        description: "The item has been successfully deleted.",
      });

      // Navigate back to the lost and found page
      navigate("/lost-found");
    } catch (err) {
      console.error("Error deleting item:", err);
      toast({
        title: "Error",
        description: `Failed to delete item: ${
          err.response?.data?.message || err.message
        }`,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout>
      <PageTitle
        title="Item Details"
        subtitle={
          loading ? "Loading item information..." : `Details for ${item?.name}`
        }
        icon={<ArrowLeft className="mr-2" onClick={() => navigate(-1)} />}
        action={
          <Button variant="outline" onClick={() => navigate("/lost-found")}>
            Back to Lost & Found
          </Button>
        }
      />

      {loading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-[300px] w-full rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={() => navigate("/lost-found")}>
              Return to Lost & Found
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="overflow-hidden">
            <div className="aspect-square w-full">
              <img
                src={item.image || DEFAULT_IMAGE_URL}
                alt={item.name}
                className="h-full w-full object-contain"
              />
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold">
                    {item.name}
                  </CardTitle>
                  <div className="mt-2">{getStatusBadge()}</div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-muted-foreground">
                  {item.description || "No description provided."}
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium">Location</h4>
                    <p className="text-muted-foreground">{item.place}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium">
                      Date {type === "lost" ? "Lost" : "Found"}
                    </h4>
                    <p className="text-muted-foreground">
                      {formatDate(
                        type === "lost" ? item.lost_at : item.found_at
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium">Reported by</h4>
                    <div className="flex items-center mt-1">
                      <Avatar className="h-8 w-8 mr-2">
                        <div className="bg-primary/10 text-primary h-full w-full flex items-center justify-center text-xs font-medium">
                          {item.user?.charAt(0) || "U"}
                        </div>
                      </Avatar>
                      <span>{item.user || "Anonymous"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.history.back()}
                >
                  Go Back
                </Button>

                {item.status === "LOST" || item.status === "FOUND" ? (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleDeleteItem}
                    disabled={deleting}
                  >
                    {deleting ? (
                      "Deleting..."
                    ) : (
                      <>
                        <Trash className="w-4 h-4 mr-2" />
                        Delete Item
                      </>
                    )}
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
};

export default ItemDetail;
