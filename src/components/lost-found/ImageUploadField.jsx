
import { useState } from "react";
import { Upload } from "lucide-react";
import { FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const ImageUploadField = ({ images, setImages }) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
// TODO: solving the image upload issue
  // Handle image upload
  const handleImageUpload = () => {
    setUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      // In a real app, this would handle actual file uploads
      const mockImageUrl = `https://source.unsplash.com/random/300x200?sig=${Date.now()}`;
      setImages([...images, mockImageUrl]);
      setUploading(false);
      
      toast({
        title: "Image Uploaded",
        description: "Your image has been uploaded successfully.",
      });
    }, 1500);
  };

  return (
    <div>
      <FormLabel>Images</FormLabel>
      <div className="mt-2 p-4 border rounded-md bg-muted/20">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
          {images.map((image, index) => (
            <div 
              key={index} 
              className="relative aspect-square rounded-md overflow-hidden"
            >
              <img 
                src={image} 
                alt={`Uploaded item ${index + 1}`} 
                className="object-cover w-full h-full"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6"
                onClick={() => setImages(images.filter((_, i) => i !== index))}
              >
                <span className="sr-only">Remove</span>
                <div className="h-3 w-3">×</div>
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="flex flex-col gap-1 h-auto aspect-square"
            onClick={handleImageUpload}
            disabled={uploading}
          >
            <Upload className="h-5 w-5" />
            <span className="text-xs">
              {uploading ? "Uploading..." : "Add Image"}
            </span>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Add clear images of the item to help with identification.
          Maximum 5 images allowed.
        </p>
      </div>
    </div>
  );
};

export default ImageUploadField;
