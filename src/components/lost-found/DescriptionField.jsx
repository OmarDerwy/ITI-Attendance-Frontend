import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";

const DescriptionField = ({ form }) => {
  const [charCount, setCharCount] = useState(
    form.values.description?.length || 0
  );
  const minChars = 30;

  const handleChange = (e) => {
    form.handleChange(e);
    setCharCount(e.target.value.length);
  };

  useEffect(() => {
    // Initialize character count when component mounts
    setCharCount(form.values.description?.length || 0);
  }, [form.values.description]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="description">Description</Label>
        <span
          className={`text-sm ${
            charCount < minChars ? "text-red-500" : "text-green-500"
          }`}
        >
          {charCount}/{minChars} characters
        </span>
      </div>
      <Textarea
        id="description"
        name="description"
        value={form.values.description || ""}
        onChange={handleChange}
        placeholder="(ex: Black Samsung Galaxy S22 Ultra 256 Gigabyte)"
        rows={4}
        required
        minLength={minChars}
        className={`${
          charCount < minChars
            ? "border-red-400 focus-visible:ring-red-400"
            : ""
        }`}
      />
      {charCount < minChars && (
        <p className="text-sm text-red-500">
          Please provide at least {minChars} characters for a detailed
          description.
        </p>
      )}
    </div>
  );
};

export default DescriptionField;
