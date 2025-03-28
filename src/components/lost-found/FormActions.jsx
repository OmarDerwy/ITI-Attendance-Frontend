
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const FormActions = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-end gap-4 pt-4">
      <Button 
        type="button" 
        variant="outline"
        onClick={() => navigate("/lost-found")}
      >
        Cancel
      </Button>
      <Button type="submit">Submit Report</Button>
    </div>
  );
};

export default FormActions;
