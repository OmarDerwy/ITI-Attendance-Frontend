import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/layout/Layout';
import PageTitle from '@/components/ui/page-title';
import { HandHeart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for leave requests
const leaveRequests = [
    {
        id: 1,
        studentName: 'Emma Davis',
        date: '2023-10-01',
        sessions: 'Flask, Flask lab',
        type: 'Late arrival',
        expectedTime: '10:30 AM',
        phoneNumber: '+1234567890',
        reason: 'Doctor appointment'
    },
    {
        id: 2,
        studentName: 'Mike Brown',
        date: '2023-10-02',
        sessions: 'Django, Django lab',
        type: 'Full day absence',
        expectedTime: 'all day',
        phoneNumber: '+1987654321',
        reason: 'Family emergency'
    }
];

function LeaveRequestCenter() {
    const [adjustedTimes, setAdjustedTimes] = useState({});
    const [selectedRequest, setSelectedRequest] = useState(null);

    // Function to parse time from string format "10:30 AM" to components
    const parseTime = (timeString) => {
        if (!timeString || timeString === 'all day') {
            return { hour: '8', minute: '00', period: 'AM' };
        }
        
        try {
            const timeParts = timeString.match(/(\d+):(\d+)\s?(AM|PM)?/i);
            if (timeParts) {
                let hour = timeParts[1];
                const minute = timeParts[2];
                let period = timeParts[3]?.toUpperCase() || 'AM';
                
                // Convert hour to 12-hour format if needed
                if (hour > 12) {
                    hour = (hour % 12).toString();
                    period = 'PM';
                }
                
                return { hour, minute, period };
            }
        } catch (error) {
            console.error("Error parsing time:", error);
        }
        
        return { hour: '8', minute: '00', period: 'AM' };
    };
    
    // Initialize adjusted times with defaults based on expected times
    useEffect(() => {
        const initialTimes = {};
        leaveRequests.forEach(request => {
            const parsed = parseTime(request.expectedTime);
            initialTimes[request.id] = parsed;
        });
        setAdjustedTimes(initialTimes);
    }, []);

    const handleTimeChange = (requestId, timeComponent, value) => {
        setAdjustedTimes(prev => ({
            ...prev,
            [requestId]: {
                ...prev[requestId],
                [timeComponent]: value
            }
        }));
    };

    const handleAccept = (requestId) => {
        // Implement accept logic with adjusted time
        const timeSettings = adjustedTimes[requestId];
        const formattedTime = `${timeSettings.hour}:${timeSettings.minute} ${timeSettings.period}`;
        console.log('Accept request', requestId, 'with adjusted time', formattedTime);
        setSelectedRequest(null);
    };

    const handleReject = (requestId) => {
        // Implement reject logic
        console.log('Reject request', requestId);
        setSelectedRequest(null);
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
                                                <td className="px-4 py-3 font-medium">{request.studentName}</td>
                                                <td className="px-4 py-3">{request.date}</td>
                                                <td className="px-4 py-3">{request.expectedTime}</td>
                                                <td className="px-4 py-3">
                                                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                                                        {request.type}
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
                                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                                <div>
                                                                    <h3 className="font-semibold">{request.studentName}</h3>
                                                                    <p className="text-sm text-gray-600">{request.phoneNumber}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                                                                        {request.type}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                                                <div>
                                                                    <p className="font-medium">Date:</p>
                                                                    <p>{request.date}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">Sessions:</p>
                                                                    <p>{request.sessions}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">Expected Time:</p>
                                                                    <p>{request.expectedTime}</p>
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
                                                                                {['00', '15', '30', '45'].map((minute) => (
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
                                                                >
                                                                    Accept
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleReject(request.id)}
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
                    </div>
                </div>
            </Card>
        </Layout>
    );
}

export default LeaveRequestCenter;
