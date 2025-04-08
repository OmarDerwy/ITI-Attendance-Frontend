import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/layout/Layout';
import PageTitle from '@/components/ui/page-title';
import { HandHeart, LoaderCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { axiosBackendInstance } from '@/api/config';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useToast } from '@/hooks/use-toast';

function LeaveRequestCenter() {
    const [adjustedTimes, setAdjustedTimes] = useState({});
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [nextPageUrl, setNextPageUrl] = useState(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const {toast} = useToast();

    // API endpoint for fetching permission requests
    const fetchPermissionRequests = async () => {
        const response = await axiosBackendInstance.get('attendance/permission-requests');
        console.log('Permission Requests Response:', response.data);
        return response.data;
    };

    // Function to load more permission requests
    const loadMoreRequests = async () => {
        if (!nextPageUrl) return;
        
        setIsLoadingMore(true);
        try {
            const response = await axiosBackendInstance.get(nextPageUrl);
            setLeaveRequests(prev => [...prev, ...response.data.results]);
            setNextPageUrl(response.data.next);
        } catch (error) {
            console.error("Error loading more leave requests:", error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    // React Query hook for fetching permission requests
    const { data: permissionData, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['permissionRequests'],
        queryFn: fetchPermissionRequests,
        refetchOnWindowFocus: false,
    });

    // Parse time from ISO string to hour, minute, period components
    const parseTime = (isoString) => {
        if (!isoString) {
            return { hour: '8', minute: '00', period: 'AM' };
        }
        
        try {
            const time = dayjs(isoString);
            let hour = time.hour() % 12;
            if (hour === 0) hour = 12;
            
            return {
                hour: hour.toString(),
                minute: time.minute().toString().padStart(2, '0'),
                period: time.hour() >= 12 ? 'PM' : 'AM'
            };
        } catch (error) {
            console.error("Error parsing time:", error);
            return { hour: '8', minute: '00', period: 'AM' };
        }
    };
    
    // Format ISO datetime to readable format
    const formatDateTime = (isoString) => {
        if (!isoString) return 'N/A';
        return dayjs(isoString).format('h:mm A');
    };

    // Get date in readable format
    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        return dayjs(isoString).format('MMM D, YYYY');
    };

    // Map request type to readable format
    const getRequestTypeDisplay = (type) => {
        const typeMap = {
            'late_check_in': 'Late arrival',
            'early_check_out': 'Early departure',
            'absence': 'Full day absence'
        };
        return typeMap[type] || type;
    };

    // Initialize adjusted times with defaults based on expected times
    useEffect(() => {
        if (permissionData && permissionData.results) {
            setLeaveRequests(permissionData.results);
            setNextPageUrl(permissionData.next);
            
            const initialTimes = {};
            permissionData.results.forEach(request => {
                // Use the adjusted_time if available, otherwise use a default time
                initialTimes[request.id] = parseTime(request.adjusted_time);
            });
            setAdjustedTimes(initialTimes);
        }
    }, [permissionData]);

    const handleTimeChange = (requestId, timeComponent, value) => {
        setAdjustedTimes(prev => ({
            ...prev,
            [requestId]: {
                ...prev[requestId],
                [timeComponent]: value
            }
        }));
    };

    const handleAccept = async (requestId) => {
        const request = leaveRequests.find(req => req.id === requestId);
        if (!request) return;
        
        const timeSettings = adjustedTimes[requestId];
        
        // Create a dayjs object from the request date
        const requestDate = dayjs(request.created_at);
        
        // Parse hour to number and handle 12-hour format
        let hour = parseInt(timeSettings.hour, 10);
        if (timeSettings.period === 'PM' && hour !== 12) {
            hour += 12;
        } else if (timeSettings.period === 'AM' && hour === 12) {
            hour = 0;
        }
        
        // Create adjusted datetime by setting the hour and minute on the request date
        const adjustedDateTime = requestDate
            .hour(hour)
            .minute(parseInt(timeSettings.minute, 10))
            .second(0)
            .toISOString();
        
        console.log('Accept request', requestId, 'with adjusted time', adjustedDateTime);
        
        try {
            // API call to update the request status with adjusted time
            const response = await axiosBackendInstance.post(`attendance/permission-requests/${requestId}/approve/`, {
                adjusted_time: adjustedDateTime,
            });

            // show a toast to notify acceptance successful
            toast({
                title: 'Request Accepted Auccessfully',
                description: `Leave request for ${getStudentName(request)} has been accepted.`,
                variant: 'default',
                duration: 5000,
                action: <Button variant="link" onClick={() => setSelectedRequest(null)}>Close</Button>,
            });

            console.log('FOCUS HERE: ',response.data);
            // Refetch the data to update the UI
            refetch();
            setSelectedRequest(null);
        } catch (error) {
            console.error('Error accepting request:', error);
            toast({
                title: 'Error',
                description: 'Failed to accept the request. Please try again later.',
                variant: 'destructive',
                duration: 5000,
                action: <Button variant="link" onClick={() => setSelectedRequest(null)}>Close</Button>,
            });
        }
    };

    const handleReject = async (requestId) => {
        try {
            // Add your API call here to update the request status
            await axiosBackendInstance.post(`attendance/permission-requests/${requestId}/reject/`);
            toast({
                title: 'Request Rejected Successfully',
                description: `Leave request for ${getStudentName(request)} has been rejected.`,
                variant: 'default',
                duration: 5000,
                action: <Button variant="link" onClick={() => setSelectedRequest(null)}>Close</Button>,
            });
            // Refetch the data to update the UI
            refetch();
            setSelectedRequest(null);
        } catch (error) {
            console.error('Error rejecting request:', error);
            toast({
                title: 'Error',
                description: 'Failed to reject the request. Please try again later.',
                variant: 'destructive',
                duration: 5000,
                action: <Button variant="link" onClick={() => setSelectedRequest(null)}>Close</Button>,
            });
        }
    };

    // Helper function to get student name from a request
    const getStudentName = (request) => {
        return `${request.student.first_name} ${request.student.last_name}`; // Replace with actual student name when available in the API
    };

    // Helper function to get sessions from a request
    const getSessions = (request) => {
        if (request.schedule && request.schedule.sessions) {
            return request.schedule.sessions.join(', ') || 'No sessions';
        }
        return 'No sessions';
    };

    return (
        <Layout>
            <PageTitle
                title="Leave Request Center"
                subtitle="Manage leave requests from students"
                icon={<HandHeart />}
            />
            <Card>
                <div className="container mx-auto py-4">
                    {/* Table view */}
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-pulse flex h-20 w-20 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <HandHeart size={48}/>
                                </div>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Student</th>
                                        <th className="px-4 py-3 text-left">Date</th>
                                        <th className="px-4 py-3 text-left">Expected Time</th>
                                        <th className="px-4 py-3 text-left">Type</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {leaveRequests.length > 0 ? (
                                        leaveRequests.map((request) => (
                                            <React.Fragment key={request.id}>
                                                <tr className="hover:bg-muted/50">
                                                    <td className="px-4 py-3 font-medium">{getStudentName(request)}</td>
                                                    <td className="px-4 py-3">{formatDate(request.adjusted_time)}</td>
                                                    <td className="px-4 py-3">{formatDateTime(request.adjusted_time)}</td>
                                                    <td className="px-4 py-3">
                                                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                                                            {getRequestTypeDisplay(request.request_type)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => setSelectedRequest(selectedRequest === request.id ? null : request.id)}
                                                        >
                                                            {selectedRequest === request.id ? "Hide Details" : "Details"}
                                                        </Button>
                                                    </td>
                                                </tr>
                                                {selectedRequest === request.id && (
                                                    <tr>
                                                        <td colSpan={5} className="p-0 border-0">
                                                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 shadow-sm m-2">
                                                                <div className="gap-4 mb-4">
                                                                    <div className="text-right">
                                                                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                                                                            {getRequestTypeDisplay(request.request_type)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                                                    <div>
                                                                        <h3 className="font-semibold">Phone Number:</h3>
                                                                        <p className="text-sm text-gray-600">{request.student.phone_number}</p>
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="font-semibold">Track:</h3>
                                                                        <p className="text-sm text-gray-600">{request.schedule.track.name}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium">Date:</p>
                                                                        <p>{formatDate(request.adjusted_time)}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium">Sessions:</p>
                                                                        <p>{getSessions(request)}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium">Expected Time:</p>
                                                                        <p>{formatDateTime(request.adjusted_time)}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium">Reason:</p>
                                                                        <p>{request.reason}</p>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="flex flex-wrap items-center gap-3 mt-4">
                                                                    <div className="flex items-center space-x-2">
                                                                        <div className="w-20">
                                                                            <Select
                                                                                value={adjustedTimes[request.id]?.hour || ''}
                                                                                onValueChange={(value) => handleTimeChange(request.id, 'hour', value)}
                                                                            >
                                                                                <SelectTrigger>
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
                                                                        </div>
                                                                        <span>:</span>
                                                                        <div className="w-20">
                                                                            <Select
                                                                                value={adjustedTimes[request.id]?.minute || ''}
                                                                                onValueChange={(value) => handleTimeChange(request.id, 'minute', value)}
                                                                            >
                                                                                <SelectTrigger>
                                                                                    <SelectValue placeholder="Min" />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    {Array.from({length: 60}, (_, i) => i).map((minute) => (
                                                                                        <SelectItem key={minute} value={minute}>
                                                                                            {minute}
                                                                                        </SelectItem>
                                                                                    ))}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>
                                                                        <div className="w-20">
                                                                            <Select
                                                                                value={adjustedTimes[request.id]?.period || ''}
                                                                                onValueChange={(value) => handleTimeChange(request.id, 'period', value)}
                                                                            >
                                                                                <SelectTrigger>
                                                                                    <SelectValue placeholder="AM/PM" />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    <SelectItem value="AM">AM</SelectItem>
                                                                                    <SelectItem value="PM">PM</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        variant="default"
                                                                        size="sm"
                                                                        onClick={() => handleAccept(request.id)}
                                                                        disabled={request.status !== 'pending'}
                                                                    >
                                                                        Accept
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleReject(request.id)}
                                                                        disabled={request.status !== 'pending'}
                                                                    >
                                                                        Reject
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                                No leave requests pending
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                    
                    {/* Pagination */}
                    {nextPageUrl && (
                        <div className="mt-4 flex justify-center">
                            <Button 
                                variant="outline" 
                                onClick={loadMoreRequests}
                                disabled={isLoadingMore}
                                className="w-full max-w-xs"
                            >
                                {isLoadingMore ? (
                                    <span className="flex items-center gap-2">
                                        <LoaderCircle size={16} className="animate-spin" />
                                        Loading more...
                                    </span>
                                ) : "View More"}
                            </Button>
                        </div>
                    )}
                </div>
            </Card>
        </Layout>
    );
}

export default LeaveRequestCenter;
