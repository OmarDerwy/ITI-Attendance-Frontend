import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const FormActions = ({ isSubmitting }) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-end gap-4 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={() => navigate("/lost-found")}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Report"}
      </Button>
    </div>
  );
};

export default FormActions;
