import React, { useEffect, useState, useMemo } from "react"; // Added useMemo
import Layout from "@/components/layout/Layout";
import { axiosBackendInstance } from "@/api/config";
import { useQuery } from "@tanstack/react-query";
import PageTitle from "@/components/ui/page-title";
import { Calendar, Clock2, Filter, Loader, LoaderCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import AttendanceStatusTable from "@/components/AttendanceStatus/AttendanceStatusTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from './../../components/AttendanceStatus/DatePickerWithRange';
import { format, parseISO, isValid } from "date-fns"; // Import parseISO and isValid
import { useNavigate, useSearchParams } from "react-router-dom"; // Import hooks

function AttendanceStatus() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // --- State Initialization from URL ---
  const initialTrackId = searchParams.get("track") || null;
  const initialFromDateStr = searchParams.get("from_date");
  const initialToDateStr = searchParams.get("to_date");

  const initialDateRange = useMemo(() => {
    const fromDate = initialFromDateStr ? parseISO(initialFromDateStr) : undefined;
    const toDate = initialToDateStr ? parseISO(initialToDateStr) : undefined;
    if (isValid(fromDate) || isValid(toDate)) {
      return { from: isValid(fromDate) ? fromDate : undefined, to: isValid(toDate) ? toDate : undefined };
    }
    return undefined;
  }, [initialFromDateStr, initialToDateStr]);

  const [selectedTrackId, setSelectedTrackId] = useState(initialTrackId ? Number(initialTrackId) : null);
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [selectedTrack, setSelectedTrack] = useState("All"); 

  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [scheduleEntries, setScheduleEntries] = useState([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  //-----------------------APIs-----------------------//
  const fetchTracks = async () => {
    const response = await axiosBackendInstance.get("attendance/tracks");
    return response.data;
  };

  const fetchSchedules = async () => {
    const endpoint = "attendance/schedules";
    const params = {
      ...(selectedTrackId && { track: selectedTrackId }), 
      ...(dateRange?.from && isValid(dateRange.from) && { from_date: format(dateRange.from, 'yyyy-MM-dd') }),
      ...(dateRange?.to && isValid(dateRange.to) && { to_date: format(dateRange.to, 'yyyy-MM-dd') }),
    };
    console.log("Fetching schedules with params:", params); 
    const response = await axiosBackendInstance.get(endpoint, { params });
    return response.data;
  };

  const loadMoreSchedules = async () => {
    if (!nextPageUrl) return;

    setIsLoadingMore(true);
    try {
      const response = await axiosBackendInstance.get(nextPageUrl);
      setScheduleEntries((prev) => [...prev, ...response.data.results]);
      setNextPageUrl(response.data.next);
    } catch (error) {
      console.error("Error loading more schedules:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };
  //-------------------------------------------------//

  //------------------Queries-------------------------//
  const { data: tracksData } = useQuery({
    queryKey: ["tracks"],
    queryFn: fetchTracks,
    refetchOnWindowFocus: false,
  });

  const {
    data: schedulesData,
    isLoading,
    isSuccess,
    refetch,
  } = useQuery({
    queryKey: ["schedules", selectedTrackId, dateRange], 
    queryFn: fetchSchedules,
    refetchOnWindowFocus: false,
    enabled: true, 
  });
  //-------------------------------------------------//

  useEffect(() => {
    if (tracksData && selectedTrackId) {
      const track = tracksData.find(t => t.id === selectedTrackId);
      if (track) {
        setSelectedTrack(track.name);
      } else {
        setSelectedTrack("All");
        setSelectedTrackId(null);
      }
    } else if (!selectedTrackId) {
      setSelectedTrack("All");
    }
  }, [tracksData, selectedTrackId]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedTrackId) {
      params.set("track", selectedTrackId.toString());
    }
    if (dateRange?.from && isValid(dateRange.from)) {
      params.set("from_date", format(dateRange.from, 'yyyy-MM-dd'));
    }
    if (dateRange?.to && isValid(dateRange.to)) {
      params.set("to_date", format(dateRange.to, 'yyyy-MM-dd'));
    }
    navigate(`?${params.toString()}`, { replace: true }); 
  }, [selectedTrackId, dateRange, navigate]);

  useEffect(() => {
    if (isSuccess && schedulesData) {
      setScheduleEntries(schedulesData.results);
      setNextPageUrl(schedulesData.next);
    }
  }, [isSuccess, schedulesData]);

  const handleRefresh = () => {
    refetch();
  };

  const handleTrackChange = (trackId) => {
    setSelectedTrackId(trackId);
  };

  const tracksForSelect = useMemo(() => (
    tracksData
      ? [
          { name: "All", id: null },
          ...tracksData.map((track) => ({ name: track.name, id: track.id })),
        ]
      : [{ name: "All", id: null }]
  ), [tracksData]);

  const isSchedulesDataEmpty = !scheduleEntries || scheduleEntries.length === 0;

  return (
    <Layout>
      <PageTitle
        title="Attendance Status"
        subtitle="View attendance status for your students each day"
        icon={<Clock2 />}
      />
      <Card>
        <div className="container mx-auto py-4">
          <div className="mb-4 flex items-center gap-2">
            <Filter size={18} className="text-muted-foreground" />
            <span className="text-sm font-medium">Track:</span>
            <div className="w-64">
              <Select
                value={selectedTrackId?.toString() ?? "All"} 
                onValueChange={(value) => {
                  handleTrackChange(value === "All" ? null : Number(value)); 
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Track">{selectedTrack}</SelectValue> 
                </SelectTrigger>
                <SelectContent>
                  {tracksForSelect.map((track) => (
                    <SelectItem key={track.id ?? "All"} value={track.id?.toString() ?? "All"}>
                      {track.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Calendar size={18} className="text-muted-foreground"/>
            <span className="text-sm font-medium">Date:</span>
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          </div>

          {!isLoading ? (
            <>
              <AttendanceStatusTable schedules={scheduleEntries} selectedTrackId={selectedTrackId} />

              {nextPageUrl && (
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={loadMoreSchedules}
                    disabled={isLoadingMore}
                    className="w-full max-w-xs"
                  >
                    {isLoadingMore ? (
                      <span className="flex items-center gap-2">
                        <LoaderCircle size={16} className="animate-spin" />
                        Loading more...
                      </span>
                    ) : (
                      "View More"
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="animate-pulse flex h-20 w-20 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Clock2 size={48} />
              </div>
            </div>
          )}
        </div>
      </Card>
    </Layout>
  );
}

export default AttendanceStatus;
