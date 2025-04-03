import * as z from "zod";

// Console log the schema at import to debug
console.log("Loading form schema...");

export const reportFormSchema = z.object({
  type: z.enum(["lost", "found"]),
  itemName: z.string().min(1, "Item name is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(1, "Description is required"),
  contactName: z.string().min(1, "Contact name is required"),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().min(1, "Contact phone is required"),
});

// Add a console log after creating the schema
console.log("Form schema created:", reportFormSchema);
