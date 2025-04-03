import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const DescriptionField = ({ form }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="description">Description</Label>
      <Textarea
        id="description"
        name="description"
        value={form.values.description || ""}
        onChange={form.handleChange}
        placeholder="Describe the item"
        rows={4}
        required
      />
    </div>
  );
};

export default DescriptionField;
