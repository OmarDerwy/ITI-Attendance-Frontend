import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import CsvUpload from "./CsvUpload";
import AddStudentForm from "./AddStudentForm";

interface AddStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddStudentModal = ({ open, onOpenChange }: AddStudentModalProps) => {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Add a single student or upload multiple students via CSV.
          </DialogDescription>
        </DialogHeader>
        
        <div className="border-b pb-4 mb-4">
          <h4 className="text-sm font-medium mb-2">Bulk Upload</h4>
          <CsvUpload onSuccess={handleSuccess} />
        </div>
        
        <h4 className="text-sm font-medium mb-2">Add Single Student</h4>
        <AddStudentForm 
          onSuccess={handleSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentModal;
