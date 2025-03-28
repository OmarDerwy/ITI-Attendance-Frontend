
import { Search, Flag } from "lucide-react";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { reportTypeOptions } from "./FormSchema";

const ReportTypeField = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Report Type</FormLabel>
          <div className="grid grid-cols-2 gap-4">
            {reportTypeOptions.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={field.value === option.value ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => field.onChange(option.value)}
              >
                {option.value === "lost" ? (
                  <Search className="mr-2 h-4 w-4" />
                ) : (
                  <Flag className="mr-2 h-4 w-4" />
                )}
                {option.label}
              </Button>
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ReportTypeField;
