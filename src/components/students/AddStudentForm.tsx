import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { axiosBackendInstance } from "@/api/config";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StudentFormValues } from "@/types/student";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddStudentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface Track {
  id: number;
  track_id: number;
  name: string;
  start_date: string;
  program_type_display: string;
}

const fetchTracks = async (): Promise<Track[]> => {
  const response = await axiosBackendInstance.get('/attendance/tracks/');
  return response.data.results;
};

const addStudentFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  first_name: z.string().min(1, { message: "First name is required." }),
  last_name: z.string().min(1, { message: "Last name is required." }),
  phone_number: z.string().optional(),
  track_id: z.string().min(1, { message: "Track selection is required." }),
});

const AddStudentForm = ({ onSuccess, onCancel }: AddStudentFormProps) => {
  const { toast } = useToast();
  
  const { data: tracks, isLoading: isLoadingTracks } = useQuery({
    queryKey: ['tracks'],
    queryFn: fetchTracks,
  });
  
  const form = useForm<StudentFormValues & { track_id: string }>({
    resolver: zodResolver(addStudentFormSchema),
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
      phone_number: "",
      track_id: "",
    },
  });

  const handleAddStudent = async (values: StudentFormValues & { track_id: string }) => {
    try {
      await axiosBackendInstance.post('/accounts/students/', {
        ...values,
        track_id: parseInt(values.track_id),
        groups: ["student"],
      });

      toast({
        title: "Student Added",
        description: `${values.first_name} ${values.last_name} has been added successfully.`,
      });

      form.reset();
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add student. Please try again.",
        variant: "destructive",
      });
      console.error("Error adding student:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleAddStudent)} className="space-y-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-7">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="student@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-5">
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="+01234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Tarek" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Reafat" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="track_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Track</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a track" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingTracks ? (
                    <SelectItem value="loading" disabled>
                      Loading tracks...
                    </SelectItem>
                  ) : (
                    tracks?.map((track) => (
                      <SelectItem key={track.id} value={track.id.toString()}>
                        {`${track.name} - ${track.start_date} - ${track.program_type_display}`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Add Student</Button>
        </div>
      </form>
    </Form>
  );
};

export default AddStudentForm;
