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
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { toast } = useToast();

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
      const nextPageUrlWithoutFirstPart = nextPageUrl.replace(/.*\/api\/v1\//, "");
      const response = await axiosBackendInstance.get(nextPageUrlWithoutFirstPart);
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
      'day_excuse': 'Full day excuse'
    };
    return typeMap[type] || type;
  };

  // Initialize leave requests and next page (no more adjustedTimes logic)
  useEffect(() => {
    if (permissionData && permissionData.results) {
      setLeaveRequests(permissionData.results);
      setNextPageUrl(permissionData.next);
    }
  }, [permissionData]);

  const handleAccept = async (requestId) => {
    const request = leaveRequests.find(req => req.id === requestId);
    if (!request) return;

    // No payload needed, just approve
    try {
      await axiosBackendInstance.post(
        `attendance/permission-requests/${requestId}/approve/`
      );
      toast({
        title: 'Request Accepted Successfully',
        description: `Leave request for ${getStudentName(request)} has been accepted.`,
        variant: 'default',
        duration: 5000,
        action: <Button variant="link" onClick={() => setSelectedRequest(null)}>Close</Button>,
      });
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
      const request = leaveRequests.find(req => req.id === requestId);
      if (!request) return;
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
      <div className='container'>
        <PageTitle
          title="Leave Request Center"
          subtitle="Manage leave requests from students"
          icon={<HandHeart />}
        />
        <Card className="px-6">
          <div className="py-6">
            {/* Table view */}
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-pulse flex h-20 w-20 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <HandHeart size={48} />
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
                            <td className="px-4 py-3">{formatDate(request.schedule.created_at)}</td>
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
                                <div
                                  className="rounded-md p-4 shadow-sm m-2"
                                  style={{
                                    backgroundColor: "hsl(var(--detail-card-bg))",
                                    border: "1px solid hsl(var(--detail-card-border))"
                                  }}
                                >
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
                                      <p className="text-sm text-gray-600">{request.student.phone_number ? request.student.phone_number : "N/A"}</p>
                                    </div>
                                    <div>
                                      <h3 className="font-semibold">Track:</h3>
                                      <p className="text-sm text-gray-600">{request.schedule.track.name}</p>
                                    </div>
                                    <div>
                                      <p className="font-medium">Date:</p>
                                      <p>{request.schedule.created_at}</p>
                                    </div>
                                    <div>
                                      <p className="font-medium">Sessions:</p>
                                      <p>{getSessions(request)}</p>
                                    </div>
                                    <div>
                                      <p className="font-medium">Expected Time:</p>
                                      <p>
                                        {request.request_type === 'day_excuse' ?
                                          'Not applicable for Day Excuse' :
                                          formatDateTime(request.adjusted_time)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="font-medium">Reason:</p>
                                      <p>{request.reason}</p>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-3 mt-4">
                                    {/* Removed time adjustment controls */}
                                    {request.request_type === 'day_excuse' && (
                                      <div className="text-muted-foreground italic mr-auto">
                                        Time adjustment not applicable for Day Excuse
                                      </div>
                                    )}
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
      </div>
    </Layout>
  );
}

export default LeaveRequestCenter;
