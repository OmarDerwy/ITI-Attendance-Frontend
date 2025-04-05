import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/layout/Layout';
import PageTitle from '@/components/ui/page-title';
import { HandHeart } from 'lucide-react';

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

    const handleAdjustedTimeChange = (requestId, value) => {
        setAdjustedTimes({
            ...adjustedTimes,
            [requestId]: value
        });
    };

    const handleAccept = (requestId) => {
        // Implement accept logic with adjusted time
        console.log('Accept request', requestId, 'with adjusted time', adjustedTimes[requestId]);
    };

    const handleReject = (requestId) => {
        // Implement reject logic
        console.log('Reject request', requestId);
    };

    return (
        <Layout>
            <PageTitle
                title="Leave Request Center"
                subtitle="Manage leave requests from students"
                icon={<HandHeart />}
            />
            <div className="container mx-auto py-4">
                <div className="space-y-6">
                    {leaveRequests.length > 0 ? (
                        leaveRequests.map((request) => (
                            <div key={request.id} className="bg-yellow-50 border border-yellow-200 rounded-md p-4 shadow-sm">
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
            
                                <div className="flex items-center gap-3 mt-4">
                                    <Input
                                        type="text"
                                        placeholder="Adjust allowed time"
                                        className="max-w-[200px]"
                                        value={adjustedTimes[request.id] || ''}
                                        onChange={(e) => handleAdjustedTimeChange(request.id, e.target.value)}
                                    />
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => handleAccept(request.id)}
                                    >
                                        Accept
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleReject(request.id)}
                                    >
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 bg-gray-50 rounded-md">
                            <p className="text-gray-500">No leave requests pending</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}

export default LeaveRequestCenter;
