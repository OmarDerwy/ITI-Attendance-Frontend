import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { axiosBackendInstance } from '@/api/config';
import { useQuery } from '@tanstack/react-query';
import PageTitle from '@/components/ui/page-title';
import { Clock2, Filter, Loader, LoaderCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import AttendanceStatusTable from '@/components/AttendanceStatus/AttendanceStatusTable';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function AttendanceStatus() {
  const [selectedTrack, setSelectedTrack] = useState('All');
  const [selectedTrackId, setSelectedTrackId] = useState(null);

  //-----------------------APIs-----------------------//
  //api for fetching attendance status for each given day
  // const fetchAttendanceStatus = async () => {
  //   // const response  = await axiosBackendInstance.get('/attendance/status');
  //   return response.data;
  // };

  //api for fetching tracks for the current supervisor
  const fetchTracks = async () => {
    const response = await axiosBackendInstance.get('attendance/tracks');
    return response.data;
  };

  //api for fetching schedules for the current supervisor
  const fetchSchedules = async () => {
    // Add track_id as query parameter when not 'All'
    const endpoint = 'attendance/schedules';
    const params = selectedTrack !== 'All' ? { track: selectedTrackId } : {};
    const response = await axiosBackendInstance.get(endpoint, { params });
    console.log('Selected Track:', selectedTrack, 'Selected Track ID:', selectedTrackId, 'Response:', response.data);
    return response.data;
  };
  //-------------------------------------------------//

  //------------------Queries-------------------------//
  // const { data: attendanceData, isLoading, isError, error, refetch } = useQuery({
  //   queryKey: ['attendanceStatus'],
  //   queryFn: fetchAttendanceStatus,
  //   refetchOnWindowFocus: false,
  // });

  const { data: tracksData } = useQuery({
    queryKey: ['tracks'],
    queryFn: fetchTracks,
    refetchOnWindowFocus: false,
  });

  const { data: schedulesData, isLoading } = useQuery({
    // Include selectedTrack and selectedTrackId in the query key to refetch when track changes
    queryKey: ['schedules', selectedTrack, selectedTrackId],
    queryFn: fetchSchedules,
    refetchOnWindowFocus: false,
  });
  //-------------------------------------------------//

  const handleRefresh = () => {
    refetch();
  };


  //------------------Track Selection------------------//
  // Handle track selection - update both name and ID
  const handleTrackChange = (value, id = null) => {
    setSelectedTrack(value);
    setSelectedTrackId(id);
  };

  // Process tracks data to include both name and ID
  const tracksWithIds = tracksData ? 
    [{ name: 'All', id: null }, ...tracksData.results.map(track => ({ name: track.name, id: track.id }))] : 
    [{ name: 'All', id: null }, { name: 'Full Stack Python', id: 1 }, { name: 'Full Stack JavaScript', id: 2 }, { name: 'Data Science', id: 3 }];
  //-------------------------------------------------//

  //------------------Loading Spinner------------------//
  // Check if schedulesData is loading



  //-------------------Schedules Data-------------------//
  // Check if schedulesData is empty or undefined
  const isSchedulesDataEmpty = !schedulesData || schedulesData.length === 0;


  return (
    <Layout>
      <PageTitle
        title="Attendance Status"
        subtitle="View attendance status for your students each day"
        icon={<Clock2 />}
      />
      <Card>
        <div className="container mx-auto py-4">
          {/* Track filter dropdown */}
          <div className="mb-4 flex items-center gap-2">
            <Filter size={18} className="text-muted-foreground" />
            <span className="text-sm font-medium">Track:</span>
            <div className="w-64">
              <Select
                value={selectedTrack}
                onValueChange={(value) => {
                  const track = tracksWithIds.find(t => t.name === value);
                  handleTrackChange(value, track?.id);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Track" />
                </SelectTrigger>
                <SelectContent>
                  {tracksWithIds.map((track) => (
                    <SelectItem key={track.name} value={track.name}>
                      {track.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Directly use schedulesData from the API - no local filtering needed */}
          { !isLoading ? <AttendanceStatusTable data={schedulesData} /> : <div className='flex items-center justify-center h-64'>
            <div className="animate-pulse flex h-20 w-20 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Clock2 size={48}/>
            </div>
          </div>}
        </div>
      </Card>
    </Layout>
  );
}

export default AttendanceStatus;