import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Flag } from "lucide-react";
import Layout from "@/components/layout/Layout";
import PageTitle from "@/components/ui/page-title";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Import components
import ReportTypeField from "@/components/lost-found/ReportTypeField";
import BasicInfoFields from "@/components/lost-found/BasicInfoFields";
import DateLocationFields from "@/components/lost-found/DateLocationFields";
import DescriptionField from "@/components/lost-found/DescriptionField";
import ImageUploadField from "@/components/lost-found/ImageUploadField";
import FormActions from "@/components/lost-found/FormActions";

const ReportLostFound = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [cloudinaryImageUrl, setCloudinaryImageUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    type: "lost",
    itemName: "",
    location: "",
    description: "",
  });

  // Form state for passing to components
  const form = {
    values: formData,
    setValue: (name, value) => {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    handleChange: (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    getValues: () => formData,
  };

  // Handle image upload completion
  const handleImageUploaded = (imageUrl) => {
    setCloudinaryImageUrl(imageUrl);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);
    setIsSubmitting(true);

    try {
      // Validate form data
      if (!formData.itemName.trim()) {
        toast({
          title: "Error",
          description: "Item name is required",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (!formData.location.trim()) {
        toast({
          title: "Error",
          description: "Location is required",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (!formData.description.trim()) {
        toast({
          title: "Error",
          description: "Description is required",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Determine endpoint based on the report type
      const endpoint =
        formData.type === "lost"
          ? "http://127.0.0.1:8000/api/v1/lost-and-found/lost-items/"
          : "http://127.0.0.1:8000/api/v1/lost-and-found/found-items/";

      // Create payload with the exact required format
      const payload = {
        name: formData.itemName,
        description: formData.description,
        place: formData.location,
      };

      // Add image URL to payload if we have one
      if (cloudinaryImageUrl) {
        payload.image = cloudinaryImageUrl;
      }

      console.log("Submitting payload in required format:", payload);

      // Send request to the API with the exact payload format
      const response = await axios.post(endpoint, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });

      console.log("API response:", response.data);

      toast({
        title: `Item ${
          formData.type === "lost" ? "Lost" : "Found"
        } Report Submitted`,
        description: "Your report has been submitted successfully.",
      });

      // Reset form and images
      setFormData({
        type: "lost",
        itemName: "",
        location: "",
        description: "",
      });
      setImages([]);
      setCloudinaryImageUrl(null);

      // Redirect to the lost & found page
      navigate("/lost-found");
    } catch (error) {
      console.error("Error submitting form:", error);

      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <PageTitle
        title="Report Lost & Found"
        subtitle="Report a lost item or an item you found"
        icon={<Flag />}
      />

      <div className="max-w-3xl mx-auto">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <ReportTypeField form={form} />
            <BasicInfoFields form={form} />
            <DateLocationFields form={form} />
            <DescriptionField form={form} />
            <ImageUploadField
              images={images}
              setImages={setImages}
              onImageUploaded={handleImageUploaded}
            />
            <FormActions isSubmitting={isSubmitting} />
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default ReportLostFound;
