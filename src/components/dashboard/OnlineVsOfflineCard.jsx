import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { ChartPie, Filter, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const OnlineVsOfflineCard = ({ trackData }) => {
  // Filter out UI/UX track
  const filteredTrackData = trackData.filter(track => track.name !== "UI/UX");
  
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [sliderPosition, setSliderPosition] = useState(0);
  const containerRef = useRef(null);
  const cardRefs = useRef([]);

  // Color constants
  const onlineColor = "#D946EF"; // Pinkish red
  const offlineColor = "#8E9196"; // Gray

  // Find the track with the highest online percentage as default selected
  useEffect(() => {
    if (filteredTrackData.length && !selectedTrack) {
      const bestTrack = filteredTrackData.reduce((prev, current) => 
        (prev.onlinePercentage > current.onlinePercentage) ? prev : current
      );
      setSelectedTrack(bestTrack);
    }
  }, [filteredTrackData, selectedTrack]);

  // Update slider position when selected track changes
  useEffect(() => {
    if (selectedTrack && containerRef.current) {
      const selectedIndex = filteredTrackData.findIndex(track => track.id === selectedTrack.id);
      if (selectedIndex !== -1 && cardRefs.current[selectedIndex]) {
        const container = containerRef.current;
        const card = cardRefs.current[selectedIndex];
        if (card) {
          const cardLeft = card.offsetLeft;
          const containerWidth = container.clientWidth;
          const cardWidth = card.clientWidth;
          
          // Calculate center position for the card
          const desiredPosition = cardLeft - (containerWidth / 2) + (cardWidth / 2);
          
          // Clamp the scroll position
          const maxScroll = container.scrollWidth - containerWidth;
          const scrollPos = Math.max(0, Math.min(desiredPosition, maxScroll));
          
          // Smooth scroll to position
          container.scrollTo({
            left: scrollPos,
            behavior: 'smooth'
          });
          
          // Update slider position (0-100 range)
          setSliderPosition((scrollPos / maxScroll) * 100 || 0);
        }
      }
    }
  }, [selectedTrack, filteredTrackData]);

  // Handle filter by track selection
  const handleTrackSelect = (trackId) => {
    const track = filteredTrackData.find(track => track.id.toString() === trackId);
    if (track) {
      setSelectedTrack(track);
    }
  };

  // Handle navigation
  const handleNavigate = (direction) => {
    if (!selectedTrack) return;
    
    const currentIndex = filteredTrackData.findIndex(track => track.id === selectedTrack.id);
    if (currentIndex === -1) return;
    
    let newIndex;
    if (direction === 'left') {
      newIndex = (currentIndex - 1 + filteredTrackData.length) % filteredTrackData.length;
    } else {
      newIndex = (currentIndex + 1) % filteredTrackData.length;
    }
    
    setSelectedTrack(filteredTrackData[newIndex]);
  };

  // Handle slider change
  const handleSliderChange = (value) => {
    if (containerRef.current) {
      const container = containerRef.current;
      const maxScroll = container.scrollWidth - container.clientWidth;
      const scrollPos = (maxScroll * value[0]) / 100;
      
      container.scrollTo({
        left: scrollPos,
        behavior: 'smooth'
      });
      
      setSliderPosition(value[0]);
    }
  };

  // Prepare data for pie chart
  const getPieData = (track) => [
    { name: 'Online Days', value: track.onlineDays, color: onlineColor },
    { name: 'Offline Days', value: track.offlineDays, color: offlineColor }
  ];

  // Animation variants for cards
  const cardVariants = {
    normal: { scale: 0.95, opacity: 0.7 },
    selected: { scale: 1, opacity: 1 }
  };

  // Custom tooltip for pie charts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-sm text-sm">
          <p className="font-medium">{`${payload[0].name}: ${payload[0].value} days`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <ChartPie className="h-5 w-5 text-primary" />
              Track Attendance Statistics
            </CardTitle>
            <CardDescription>
              Online vs offline attendance days per track
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Filter by Track:</span>
            </div>
            
            <Select 
              value={selectedTrack?.id.toString()} 
              onValueChange={handleTrackSelect}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select track" />
              </SelectTrigger>
              <SelectContent>
                {filteredTrackData.map((track) => (
                  <SelectItem key={track.id} value={track.id.toString()}>
                    {track.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 md:p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full"
              onClick={() => handleNavigate('left')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div 
              ref={containerRef}
              className="relative overflow-hidden max-w-[calc(100%-80px)]"
              style={{ touchAction: 'pan-x' }}
            >
              <div 
                className="flex gap-4 py-2 overflow-x-auto scrollbar-hide snap-x scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {filteredTrackData.map((track, index) => (
                  <motion.div
                    key={track.id}
                    ref={el => cardRefs.current[index] = el}
                    className={cn(
                      "flex-shrink-0 w-[280px] md:w-[320px] snap-center cursor-pointer",
                      "border rounded-lg overflow-hidden shadow-sm transition-all",
                      selectedTrack?.id === track.id ? "border-primary/40 shadow-md" : "border-border"
                    )}
                    variants={cardVariants}
                    initial="normal"
                    animate={selectedTrack?.id === track.id ? "selected" : "normal"}
                    whileHover={{ scale: 0.98 }}
                    onClick={() => setSelectedTrack(track)}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold">{track.name}</h3>
                        <div 
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: track.color }}
                        />
                      </div>
                      
                      <div className="h-[150px] mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getPieData(track)}
                              cx="50%"
                              cy="50%"
                              innerRadius={30}
                              outerRadius={60}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {getPieData(track).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend 
                              layout="vertical" 
                              verticalAlign="middle" 
                              align="right"
                              formatter={(value) => (
                                <span className="text-xs">{value}</span>
                              )}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 text-sm">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: onlineColor }}></div>
                          <span>Online</span>
                        </div>
                        <div className="flex items-center">
                          <TrendingUp className="mr-1 h-4 w-4" style={{ color: onlineColor }} />
                          <span className="font-medium">{track.onlinePercentage}%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 text-sm">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: offlineColor }}></div>
                          <span>Offline</span>
                        </div>
                        <div className="flex items-center">
                          <TrendingDown className="mr-1 h-4 w-4" style={{ color: offlineColor }} />
                          <span className="font-medium">{track.offlinePercentage}%</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full"
              onClick={() => handleNavigate('right')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Slider for horizontal scrolling */}
          <div className="px-4">
            <Slider
              value={[sliderPosition]}
              onValueChange={handleSliderChange}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
          
          {/* Selected Track Detail Chart */}
          {selectedTrack && (
            <motion.div 
              className="mt-6 bg-card border rounded-lg p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              key={selectedTrack.id}
            >
              <h3 className="text-lg font-semibold mb-4">{selectedTrack.name} Detailed View</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getPieData(selectedTrack)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {getPieData(selectedTrack).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col justify-center space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: onlineColor }}></div>
                        <span className="font-medium">Online Days</span>
                      </div>
                      <span className="font-bold">{selectedTrack.onlineDays} days ({selectedTrack.onlinePercentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full">
                      <div 
                        className="h-full rounded-full" 
                        style={{ width: `${selectedTrack.onlinePercentage}%`, backgroundColor: onlineColor }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: offlineColor }}></div>
                        <span className="font-medium">Offline Days</span>
                      </div>
                      <span className="font-bold">{selectedTrack.offlineDays} days ({selectedTrack.offlinePercentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full">
                      <div 
                        className="h-full rounded-full" 
                        style={{ width: `${selectedTrack.offlinePercentage}%`, backgroundColor: offlineColor }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-md bg-gray-50 mt-2">
                    <p className="text-sm">
                      {selectedTrack.onlinePercentage > 80 
                        ? `${selectedTrack.name} track has excellent online attendance.` 
                        : `${selectedTrack.name} track may need attention to improve online attendance.`
                      }
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OnlineVsOfflineCard;