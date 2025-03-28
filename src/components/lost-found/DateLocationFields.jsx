
import { Map } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

const DateLocationFields = ({ form }) => {
  const { toast } = useToast();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {form.watch("type") === "lost" ? "When did you lose it?" : "When did you find it?"}
            </FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {form.watch("type") === "lost" ? "Where did you lose it?" : "Where did you find it?"}
            </FormLabel>
            <div className="flex">
              <FormControl>
                <Input placeholder="Enter location" className="rounded-r-none" {...field} />
              </FormControl>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      type="button" 
                      variant="secondary" 
                      className="rounded-l-none"
                      onClick={() => toast({
                        title: "Map Feature",
                        description: "Map selection coming soon!",
                      })}
                    >
                      <Map className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select location on map</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default DateLocationFields;
