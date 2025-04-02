import { useRef, useState } from "react";
import { readString } from 'react-papaparse';
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { CsvStudentData } from "@/types/student";
import { axiosBackendInstance } from "@/api/config";

interface CsvUploadProps {
  onSuccess: () => void;
}

const CsvUpload = ({ onSuccess }: CsvUploadProps) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleCsvUpload = async () => {
    if (!csvFile) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsParsing(true);
    
    readString(await csvFile.text(), {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const { data, errors } = results;
          
          if (errors.length > 0) {
            console.error("CSV parsing errors:", errors);
            toast({
              title: "Error parsing CSV",
              description: "There were errors in the CSV file. Please check the format.",
              variant: "destructive",
            });
            setIsParsing(false);
            return;
          }
          
          const studentsData = data as CsvStudentData[];
          
          if (studentsData.length === 0) {
            toast({
              title: "Empty file",
              description: "The CSV file doesn't contain any data.",
              variant: "destructive",
            });
            setIsParsing(false);
            return;
          }
          
          const missingFields = studentsData.some(student => 
            !student.email || !student.first_name || !student.last_name
          );
          
          if (missingFields) {
            toast({
              title: "Missing fields",
              description: "Some rows are missing required fields (email, first_name, last_name).",
              variant: "destructive",
            });
            setIsParsing(false);
            return;
          }
          
          let response = await axiosBackendInstance.post('/accounts/bulkcreate/', {
            users: studentsData.map(student => ({
              email: student.email,
              first_name: student.first_name,
              last_name: student.last_name,
              phone_number: student.phone_number || "",
            })),
          });
          
          toast({
            title: "Success",
            description: `${studentsData.length} students have been uploaded successfully.`,
          });
          
          resetForm();
          onSuccess();
          
        } catch (error) {
          console.error("Error processing CSV:", error);
          toast({
            title: "Error",
            description: "Failed to process CSV file. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsParsing(false);
        }
      },
      error: (error) => {
        console.error("CSV parsing error:", error);
        toast({
          title: "Error",
          description: "Failed to parse CSV file. Please check the format.",
          variant: "destructive",
        });
        setIsParsing(false);
      }
    });
  };

  const resetForm = () => {
    setCsvFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadTemplate = () => {
    const csvContent = "email,first_name,last_name,phone_number\nexample@example.com,John,Doe,+1234567890";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'student_template.csv');
    a.click();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input 
          type="file" 
          ref={fileInputRef}
          accept=".csv"
          onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
        />
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleCsvUpload} 
          disabled={!csvFile || isParsing}
          className="whitespace-nowrap"
        >
          {isParsing ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
              Processing
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload CSV
            </>
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        CSV should include: email, first_name, last_name, and optionally phone_number.
        <Button 
          variant="link" 
          className="h-auto p-0 text-xs"
          onClick={downloadTemplate}
        >
          Download template
        </Button>
      </p>
    </div>
  );
};

export default CsvUpload;
