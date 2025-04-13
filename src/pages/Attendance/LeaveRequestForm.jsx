import React, { useState, useEffect } from 'react';
import Layout from "@/components/layout/Layout.jsx";
import PageTitle from '@/components/ui/page-title';
import { HandHeart, Calendar, LoaderCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { axiosBackendInstance } from '@/api/config';
import dayjs from 'dayjs';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

// Create a schema for form validation
const formSchema = z.object({
  schedule: z.string({
    required_error: "Please select a schedule",
  }),
  request_type: z.string({
    required_error: "Please select a request type",
  }),
  reason: z.string().min(10, {
    message: "Reason must be at least 10 characters.",
  }),
  hour: z.string(),
  minute: z.string(),
  period: z.string(),
});

function LeaveRequestForm() {
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      schedule: '',
      request_type: '',
      reason: '',
      hour: '8',
      minute: '00',
      period: 'AM'
    }
  });

  // Replace useState and useEffect with useQuery
  const fetchSchedules = async () => {
    const response = await axiosBackendInstance.get('attendance/upcoming-records');
    // Extract schedules from the new response structure
    const records = response.data.data || [];
    // Map to get the schedule objects from each record
    return records.map(record => record.schedule);
  };

  const { 
    data: schedules = [], 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['schedules'],
    queryFn: fetchSchedules,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    if (isError) {
      console.error('Error fetching schedules:', error);
      toast({
        title: 'Error',
        description: 'Failed to load schedules. Please try again later.',
        variant: 'destructive',
      });
    }
  }, [isError, error, toast]);

  const onSubmit = async (data) => {
    try {
      // Get the selected schedule
      const schedule = schedules.find(s => s.id.toString() === data.schedule);
      
      if (!schedule) {
        throw new Error('Please select a valid schedule');
      }
      
      // Map request types to backend values
      const requestTypeMap = {
        'early_leave': 'early_leave',
        'late_check_in': 'late_check_in',
        'day_excuse': 'day_excuse'
      };
      
      const payload = {
        schedule: data.schedule,
        request_type: requestTypeMap[data.request_type],
        reason: data.reason,
      };
      
      // Only include adjusted_time if the request is not a day excuse
      if (data.request_type !== 'day_excuse') {
        // Parse hour to number and handle 12-hour format
        let hour = parseInt(data.hour, 10);
        if (data.period === 'PM' && hour !== 12) {
          hour += 12;
        } else if (data.period === 'AM' && hour === 12) {
          hour = 0;
        }
        
        // Create schedule date with the selected time
        const scheduleDate = dayjs(schedule.created_at);
        const adjustedTime = scheduleDate
          .hour(hour)
          .minute(parseInt(data.minute, 10))
          .second(0)
          .toISOString();
          
        payload.adjusted_time = adjustedTime;
      }
      
      console.log('Submitting leave request:', payload);
      
      const response = await axiosBackendInstance.post('attendance/permission-requests/', payload);
      
      toast({
        title: 'Success',
        description: 'Your leave request has been submitted successfully.',
        variant: 'default',
      });
      
      // Reset form
      form.reset();
      refetch();
      // Redirect to a confirmation page or back to schedule
      navigate('/student-schedule');
      
    } catch (error) {
      console.error('Error submitting leave request:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit leave request. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleScheduleChange = (scheduleId) => {
    const selected = schedules.find(s => s.id.toString() === scheduleId);
    setSelectedSchedule(selected);
  };

  return (
    <Layout>
      <PageTitle
        title="Leave Request Form"
        subtitle="Fill out the form to request a leave."
        icon={<HandHeart />}
      />
      <div className="space-y-6 p-6 min-h-screen">
      <Card className="p-6">
        {schedules.length === 0 && !isLoading && (
            <div className="rounded-md bg-muted p-4 text-center border-red-700 border-x-2 border-y-2 mb-4">
              <p className="text-muted-foreground">
                No upcoming schedules available for leave requests.
              </p>
            </div>
          )}
          {isLoading && !form.formState.isSubmitting ? (
            <div className="flex items-center justify-center py-8">
              <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="schedule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select a Schedule</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleScheduleChange(value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a schedule" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {schedules.length > 0 ? (
                            schedules.map((schedule) => (
                              <SelectItem key={schedule.id} value={schedule.id.toString()}>
                                {schedule.name} ({schedule.sessions ? schedule.sessions.join(', ') : 'No sessions'})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>No upcoming schedules</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="request_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Request Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select request type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="late_check_in">Late Check-In</SelectItem>
                          <SelectItem value="early_leave">Early Leave</SelectItem>
                          <SelectItem value="day_excuse">Day Excuse</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Leave</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Please explain the reason for your leave request"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-2">
                  <FormLabel>Adjusted Time {form.watch('request_type') === 'day_excuse' && <span className="text-muted-foreground text-sm">(Not applicable for Day Excuse)</span>}</FormLabel>
                  <div className="flex items-center space-x-2">
                    <FormField
                      control={form.control}
                      name="hour"
                      render={({ field }) => (
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={form.watch('request_type') === 'day_excuse'}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue placeholder="Hour" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                              <SelectItem key={hour} value={hour.toString()}>
                                {hour}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <span>:</span>
                    <FormField
                      control={form.control}
                      name="minute"
                      render={({ field }) => (
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={form.watch('request_type') === 'day_excuse'}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue placeholder="Min" />
                          </SelectTrigger>
                          <SelectContent>
                            {["00", "15", "30", "45"].map((minute) => (
                              <SelectItem key={minute} value={minute}>
                                {minute}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="period"
                      render={({ field }) => (
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={form.watch('request_type') === 'day_excuse'}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AM">AM</SelectItem>
                            <SelectItem value="PM">PM</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit" 
                    disabled={isLoading || schedules.length === 0}
                  >
                    {form.formState.isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Submitting...
                      </span>
                    ) : "Submit Request"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
      </Card>
      </div>
    </Layout>
  );
}

export default LeaveRequestForm;