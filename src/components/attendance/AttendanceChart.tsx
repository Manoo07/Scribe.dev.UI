import React from "react";
import { AttendanceByDate } from "../../types/attendance";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AttendanceChartProps {
  data: AttendanceByDate[];
}

const AttendanceChart: React.FC<AttendanceChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 sm:h-80 md:h-96 text-gray-400">
        No attendance data available
      </div>
    );
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getBarColor = (type: string) => {
    switch (type) {
      case "present":
        return "#34D399";
      case "absent":
        return "#F87171";
      case "late":
        return "#FBBF24";
      case "excused":
        return "#60A5FA";
      default:
        return "#9CA3AF";
    }
  };

  const chartData = data.map((d) => ({
    date: formatDate(d.date),
    present: (d.present / d.total) * 100,
    absent: (d.absent / d.total) * 100,
    late: (d.late / d.total) * 100,
    excused: (d.excused / d.total) * 100,
  }));

  return (
    <div className="w-full max-w-full p-4 sm:p-6 md:p-8">
      {/* Legend */}
      <div className="flex flex-wrap justify-end gap-4 mb-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
          <span>Present</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
          <span>Absent</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-amber-400 mr-2"></div>
          <span>Late</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-400 mr-2"></div>
          <span>Excused</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 sm:h-80 md:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#F3F4F6",
              }}
            />
            <Bar dataKey="present" stackId="a" fill={getBarColor("present")} />
            <Bar dataKey="absent" stackId="a" fill={getBarColor("absent")} />
            <Bar dataKey="late" stackId="a" fill={getBarColor("late")} />
            <Bar dataKey="excused" stackId="a" fill={getBarColor("excused")} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AttendanceChart;
