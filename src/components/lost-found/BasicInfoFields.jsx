import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const BasicInfoFields = ({ form }) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <div>
        <Label htmlFor="itemName">Item Name</Label>
        <Input
          id="itemName"
          name="itemName"
          value={form.values.itemName || ""}
          onChange={form.handleChange}
          placeholder="Enter item name"
          required
        />
      </div>
    </div>
  );
};

export default BasicInfoFields;
