
import { Info } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ContactInfoField = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="contactInfo"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            Contact Information
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>This is optional and will only be shared with authorized personnel</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </FormLabel>
          <FormControl>
            <Input placeholder="Phone number or alternate email (optional)" {...field} />
          </FormControl>
          <FormDescription>
            This is optional and will only be used to contact you about this item.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ContactInfoField;
