import React from 'react'
import Layout from '@/components/layout/Layout';
import { axiosBackendInstance } from '@/api/config';
import { useQuery } from '@tanstack/react-query';
import PageTitle from '@/components/ui/page-title';
import { Clock2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import AttendanceStatusTable from '@/components/AttendanceStatus/AttendanceStatusTable';

function AttendanceStatus() {

  //api for fetching attendance status for each given day
  const fetchAttendanceStatus = async () => {
    // const response  = await axiosBackendInstance.get('/attendance/status');
    return reswponse.data
  };

  const { data: attendanceData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['attendanceStatus'],
    queryFn: fetchAttendanceStatus,
    refetchOnWindowFocus: false,
  });

  const handleRefresh = () => {
    refetch()
    //logic to refresh the data
  }


  return (
    <Layout>
      <PageTitle
        title="Attendance Status"
        subtitle="View attendance status for your students each day"
        icon={<Clock2/>}
      />
      <div className="space-y-6">
        <Card className="p-6">
          <AttendanceStatusTable/>
        </Card>
      </div>
    </Layout>
  )
}

export default AttendanceStatus