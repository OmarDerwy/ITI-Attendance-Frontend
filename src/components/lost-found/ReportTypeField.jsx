import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const ReportTypeField = ({ form }) => {
  return (
    <div className="space-y-2">
      <Label>Report Type</Label>
      <RadioGroup
        value={form.values.type}
        onValueChange={(value) => form.setValue("type", value)}
        className="flex space-x-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="lost" id="lost" />
          <Label htmlFor="lost">Lost Item</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="found" id="found" />
          <Label htmlFor="found">Found Item</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default ReportTypeField;
