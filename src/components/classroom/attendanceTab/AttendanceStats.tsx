
import React, { useState, useEffect } from "react";
import { getOverallAttendanceStats } from "../../../services/attendanceService";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  TooltipProps
} from "recharts";
import { ChevronUp, ChevronDown, CalendarCheck, Users } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../../ui/hover-card";

interface AttendanceStatsProps {
  classroomId: string;
}

// Custom tooltip component for better hover display
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-gray-900 border border-gray-700 rounded-lg shadow-lg p-3 backdrop-blur-sm">
        <p className="font-medium text-white mb-1">{`Date: ${label}`}</p>
        <p className="text-blue-400 font-semibold">{`Attendance: ${payload[0].value}%`}</p>
        <div className="mt-2 pt-2 border-t border-gray-700">
          <p className="text-xs text-gray-400">
            {getAttendanceLevel(payload[0].value as number)}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// Helper function to determine attendance level message
const getAttendanceLevel = (percentage: number) => {
  if (percentage >= 90) return "Excellent attendance rate";
  if (percentage >= 75) return "Good attendance rate";
  if (percentage >= 50) return "Average attendance rate";
  return "Poor attendance rate";
};

const AttendanceStats = ({ classroomId }: AttendanceStatsProps) => {
  const [chartData, setChartData] = useState<{ name: string; percentage: number }[]>([]);
  const [average, setAverage] = useState(0);
  const [trend, setTrend] = useState<"up" | "down" | "neutral">("neutral");

  useEffect(() => {
    const stats = getOverallAttendanceStats(classroomId);
    
    const formattedData = Object.entries(stats).map(([date, percentage]) => ({
      name: date,
      percentage
    }));
    
    setChartData(formattedData);
    
    // Calculate average
    if (formattedData.length > 0) {
      const total = formattedData.reduce((sum, item) => sum + item.percentage, 0);
      setAverage(Math.round(total / formattedData.length));

      // Calculate trend
      if (formattedData.length >= 2) {
        const lastDay = formattedData[0].percentage;
        const prevDay = formattedData[1].percentage;
        setTrend(lastDay > prevDay ? "up" : lastDay < prevDay ? "down" : "neutral");
      }
    }
  }, [classroomId]);

  const renderAttendanceLevel = (percentage: number) => {
    if (percentage >= 90) {
      return <span className="text-green-400">Excellent</span>;
    } else if (percentage >= 75) {
      return <span className="text-green-500">Good</span>;
    } else if (percentage >= 50) {
      return <span className="text-yellow-500">Average</span>;
    } else {
      return <span className="text-red-500">Poor</span>;
    }
  };

  const getBarColor = (percent: number) => {
    if (percent >= 90) return "#34D399";
    if (percent >= 75) return "#10B981";
    if (percent >= 50) return "#FBBF24";
    return "#F87171";
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-6">
        Attendance Overview
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-700 p-6 rounded-lg text-center border border-gray-600">
          <div className="flex items-center justify-center mb-3">
            <CalendarCheck className="h-6 w-6 text-blue-400" />
          </div>
          <div className="text-4xl font-bold text-white mb-2">
            {average}%
          </div>
          <div className="text-gray-400">Average Attendance</div>
          <div className="mt-2 flex items-center justify-center">
            {renderAttendanceLevel(average)}
            {trend === "up" && <ChevronUp className="ml-1 h-4 w-4 text-green-500" />}
            {trend === "down" && <ChevronDown className="ml-1 h-4 w-4 text-red-500" />}
          </div>
        </div>
        
        <div className="bg-gray-700 p-6 rounded-lg text-center border border-gray-600">
          <div className="flex items-center justify-center mb-3">
            <Users className="h-6 w-6 text-green-400" />
          </div>
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="cursor-pointer transition-transform hover:scale-105">
                <div className="text-4xl font-bold mb-2 text-green-400">
                  {chartData.length > 0 ? Math.max(...chartData.map(d => d.percentage)) : 0}%
                </div>
                <div className="text-gray-400">Highest Attendance</div>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 bg-gray-800 text-white border border-gray-700">
              <div className="flex justify-between">
                <p className="font-medium">Highest Day</p>
                <span className="text-green-400 font-bold">
                  {chartData.length > 0 ? 
                    chartData.find(d => d.percentage === Math.max(...chartData.map(item => item.percentage)))?.name : 
                    "N/A"}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-2">This was the day with the best attendance rate in this class.</p>
            </HoverCardContent>
          </HoverCard>
        </div>
        
        <div className="bg-gray-700 p-6 rounded-lg text-center border border-gray-600">
          <div className="flex items-center justify-center mb-3">
            <Users className="h-6 w-6 text-yellow-400" />
          </div>
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="cursor-pointer transition-transform hover:scale-105">
                <div className="text-4xl font-bold mb-2 text-yellow-400">
                  {chartData.length > 0 ? Math.min(...chartData.map(d => d.percentage)) : 0}%
                </div>
                <div className="text-gray-400">Lowest Attendance</div>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 bg-gray-800 text-white border border-gray-700">
              <div className="flex justify-between">
                <p className="font-medium">Lowest Day</p>
                <span className="text-yellow-400 font-bold">
                  {chartData.length > 0 ? 
                    chartData.find(d => d.percentage === Math.min(...chartData.map(item => item.percentage)))?.name : 
                    "N/A"}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-2">This was the day with the lowest attendance rate in this class.</p>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
      
      <div className="h-72 mt-8 rounded-lg bg-gray-900/50 p-4 border border-gray-700">
        <h4 className="text-white font-medium mb-4">Last 7 Days Attendance Trend</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
            barGap={8}
            barCategoryGap={16}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#9CA3AF' }} 
              axisLine={{ stroke: '#4B5563' }} 
            />
            <YAxis 
              domain={[0, 100]} 
              tick={{ fill: '#9CA3AF' }} 
              axisLine={{ stroke: '#4B5563' }}
              tickFormatter={(value) => `${value}%`} 
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
            />
            <Bar 
              dataKey="percentage" 
              name="Attendance"
              radius={[6, 6, 0, 0]}
              animationDuration={1000}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(entry.percentage)} 
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AttendanceStats;