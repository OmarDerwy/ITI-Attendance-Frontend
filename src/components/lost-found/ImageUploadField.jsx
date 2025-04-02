import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import axios from "axios";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Cloudinary configuration - These settings are good for your use case
const CLOUDINARY_CLOUD_NAME = "dha2yp5tj";
const CLOUDINARY_UPLOAD_PRESET = "my_upload_preset"; // Make sure this preset uses your selected settings

const ImageUploadField = ({ images, setImages, onImageUploaded }) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Upload image to Cloudinary
  const uploadToCloudinary = async (file) => {
    try {
      // Create form data for Cloudinary upload
      const formData = new FormData();

      // Make sure to use the correct parameter names as expected by Cloudinary
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("cloud_name", CLOUDINARY_CLOUD_NAME);

      // Log the request details for debugging
      console.log(
        "Uploading to Cloudinary with preset:",
        CLOUDINARY_UPLOAD_PRESET
      );
      console.log("File type:", file.type);
      console.log("File size:", file.size);

      // Upload to Cloudinary
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload progress: ${percentCompleted}%`);
          },
        }
      );

      console.log("Cloudinary upload response:", response.data);
      console.log("Cloudinary upload URL:", response.data.secure_url);
      // Return the secure URL of the uploaded image
      return response.data.secure_url;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      console.error("Response data:", error.response?.data);
      throw error;
    }
  };

  // Handle file selection
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      // Validate file size and type
      if (file.size > 10 * 1024 * 1024) {
        // 10MB
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 10MB.",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }

      // Read the file as a data URL for preview
      const reader = new FileReader();

      reader.onload = async (e) => {
        const dataUrl = e.target.result;

        // Update the local preview immediately
        setImages([dataUrl]);

        try {
          // Show upload toast
          toast({
            title: "Uploading Image",
            description: "Please wait while we upload your image...",
          });

          // Upload the original file to Cloudinary (not the data URL)
          const cloudinaryUrl = await uploadToCloudinary(file);
          console.log("Successfully uploaded to Cloudinary:", cloudinaryUrl);

          // If we have a callback for handling the uploaded URL, call it
          if (onImageUploaded) {
            onImageUploaded(cloudinaryUrl);
          }

          toast({
            title: "Image Uploaded",
            description: "Your image has been uploaded successfully.",
          });
        } catch (error) {
          console.error("Upload failed:", error);
          toast({
            title: "Upload Failed",
            description:
              "Failed to upload image to cloud storage. Please try again.",
            variant: "destructive",
          });
        } finally {
          setUploading(false);
        }
      };

      reader.onerror = () => {
        setUploading(false);
        toast({
          title: "Upload Failed",
          description: "Failed to read image. Please try again.",
          variant: "destructive",
        });
      };

      // Read the file as a data URL for preview only
      reader.readAsDataURL(file);
    } catch (error) {
      setUploading(false);
      toast({
        title: "Upload Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  // Trigger file input click
  const openFileSelector = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="space-y-2">
      <Label>Image</Label>
      <div className="mt-2 p-4 border rounded-md bg-muted/20">
        {images.length > 0 ? (
          <div className="relative aspect-video rounded-md overflow-hidden mb-4">
            <img
              src={images[0]}
              alt="Uploaded item"
              className="object-contain w-full h-full"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={() => {
                setImages([]);
                if (onImageUploaded) {
                  onImageUploaded(null);
                }
              }}
              type="button"
            >
              <span className="sr-only">Remove</span>
              <div className="h-4 w-4">×</div>
            </Button>
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-md border-gray-300 mb-4 cursor-pointer hover:bg-muted/50"
            onClick={openFileSelector}
          >
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {uploading ? "Uploading..." : "Click to upload an image"}
            </p>
          </div>
        )}

        {images.length === 0 && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={openFileSelector}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            <span>{uploading ? "Uploading..." : "Select Image"}</span>
          </Button>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <p className="text-xs text-muted-foreground mt-2">
          Add a clear image of the item to help with identification.
        </p>
      </div>
    </div>
  );
};

export default ImageUploadField;
