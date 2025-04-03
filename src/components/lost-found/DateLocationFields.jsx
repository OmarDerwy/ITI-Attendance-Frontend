import { Map } from "lucide-react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

const DateLocationFields = ({ form }) => {
  const { toast } = useToast();

  return (
    <div className="space-y-2">
      <Label htmlFor="location">Location</Label>
      <Input
        id="location"
        name="location"
        value={form.values.location || ""}
        onChange={form.handleChange}
        placeholder="Where was the item lost/found?"
        required
      />
    </div>
  );
};

export default DateLocationFields;
