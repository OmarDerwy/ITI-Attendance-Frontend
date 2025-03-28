
import { z } from "zod";

// Form schema for validation
export const reportFormSchema = z.object({
  type: z.enum(["lost", "found"]),
  itemName: z.string().min(3, "Item name must be at least 3 characters"),
  category: z.string().min(1, "Please select a category"),
  date: z.string().min(1, "Please provide a date"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  description: z.string().min(10, "Please provide a detailed description (min 10 characters)"),
  contactInfo: z.string().optional(),
});

// Item categories
export const categories = [
  "Electronics",
  "Clothing",
  "Accessories",
  "Books",
  "Keys",
  "ID Cards",
  "Wallets",
  "Bags",
  "Other",
];

export const reportTypeOptions = [
  { value: "lost", label: "Lost Item" },
  { value: "found", label: "Found Item" },
];
