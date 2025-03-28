
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flag } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Layout from "@/components/layout/Layout";
import PageTitle from "@/components/ui/page-title";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

// Import form schema
import { reportFormSchema } from "@/components/lost-found/FormSchema";

// Import form components
import ReportTypeField from "@/components/lost-found/ReportTypeField";
import BasicInfoFields from "@/components/lost-found/BasicInfoFields";
import DateLocationFields from "@/components/lost-found/DateLocationFields";
import DescriptionField from "@/components/lost-found/DescriptionField";
import ContactInfoField from "@/components/lost-found/ContactInfoField";
import ImageUploadField from "@/components/lost-found/ImageUploadField";
import FormActions from "@/components/lost-found/FormActions";

const ReportLostFound = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [images, setImages] = useState([]);

  // Initialize form
  const form = useForm({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      type: "lost",
      itemName: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
      location: "",
      description: "",
      contactInfo: "",
    },
  });

  // Handle form submission
  const onSubmit = (data) => {
    console.log("Form data:", data);
    console.log("Images:", images);
    
    // In a real app, this would send the data to your backend
    
    toast({
      title: `Item ${data.type === "lost" ? "Lost" : "Found"} Report Submitted`,
      description: "Your report has been submitted successfully.",
    });
    
    // Redirect to the lost & found page
    navigate("/lost-found");
  };

  return (
    <Layout>
      <PageTitle
        title="Report Lost & Found"
        subtitle="Report a lost item or an item you found"
        icon={<Flag />}
      />

      <div className="max-w-3xl mx-auto">
        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <ReportTypeField form={form} />
              <BasicInfoFields form={form} />
              <DateLocationFields form={form} />
              <DescriptionField form={form} />
              <ContactInfoField form={form} />
              <ImageUploadField images={images} setImages={setImages} />
              <FormActions />
            </form>
          </Form>
        </Card>
      </div>
    </Layout>
  );
};

export default ReportLostFound;
