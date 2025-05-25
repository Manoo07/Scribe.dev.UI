
import React from "react";
import { format, parseISO, differenceInDays, addDays, isSameMonth, getMonth, startOfYear } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tool-tip";

interface YearlyAttendanceStreakProps {
  attendanceHistory: Array<{ date: string; present: boolean }>;
}

const YearlyAttendanceStreak: React.FC<YearlyAttendanceStreakProps> = ({ attendanceHistory }) => {
  // Create a lookup for quick access to attendance data
  const attendanceLookup: Record<string, boolean> = {};
  attendanceHistory.forEach(record => {
    attendanceLookup[record.date] = record.present;
  });

  // Calculate the start date (1 year ago from today)
  const endDate = new Date();
  const startDate = startOfYear(endDate);
  
  // Generate dates for the entire year
  const dates: Array<{ date: Date; status: "present" | "absent" | "no-data" }> = [];
  let currentDate = startDate;
  
  while (differenceInDays(endDate, currentDate) >= 0) {
    const dateString = format(currentDate, "yyyy-MM-dd");
    const status = attendanceLookup[dateString] === undefined 
      ? "no-data" 
      : attendanceLookup[dateString] 
        ? "present" 
        : "absent";
        
    dates.push({
      date: currentDate,
      status
    });
    
    currentDate = addDays(currentDate, 1);
  }

  // Group dates by month for the display
  const months: Array<{ month: number; dates: typeof dates }> = [];
  let currentMonth: number | null = null;
  let currentMonthDates: typeof dates = [];
  
  dates.forEach(dateObj => {
    const month = getMonth(dateObj.date);
    
    if (currentMonth !== month) {
      if (currentMonth !== null) {
        months.push({ month: currentMonth, dates: currentMonthDates });
      }
      currentMonth = month;
      currentMonthDates = [];
    }
    
    currentMonthDates.push(dateObj);
  });
  
  // Push the last month
  if (currentMonthDates.length > 0 && currentMonth !== null) {
    months.push({ month: currentMonth, dates: currentMonthDates });
  }

  // Get color based on status
  const getColorClass = (status: "present" | "absent" | "no-data") => {
    switch (status) {
      case "present":
        return "bg-green-500";
      case "absent":
        return "bg-red-500";
      case "no-data":
      default:
        return "bg-gray-700";
    }
  };

  // Month names for display
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="bg-gray-800/60 p-5 rounded-xl border border-gray-700/50">
      <h4 className="text-white font-medium mb-4">Yearly Attendance</h4>
      
      <div className="flex mb-2 text-xs text-gray-400">
        {monthNames.map((name, index) => (
          <div key={index} style={{ width: `${100 / 12}%` }} className="text-center">
            {name}
          </div>
        ))}
      </div>
      
      <div className="overflow-x-auto">
        <div className="flex flex-col space-y-1 min-w-[800px]">
          {/* We'll create 7 rows for the week days */}
          {Array.from({ length: 7 }).map((_, weekDay) => (
            <div key={weekDay} className="flex">
              {months.map((month) => (
                <div key={month.month} className="flex" style={{ width: `${100 / 12}%` }}>
                  {month.dates
                    .filter((_, index) => index % 7 === weekDay)
                    .map((dateObj) => {
                      const formattedDate = format(dateObj.date, "yyyy-MM-dd");
                      return (
                        <TooltipProvider key={formattedDate}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={`w-3 h-3 m-[1px] rounded-sm ${getColorClass(dateObj.status)} hover:ring-1 hover:ring-white transition-all`}
                                data-date={formattedDate}
                              ></div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-gray-900 text-white border-gray-700">
                              <p>
                                {format(dateObj.date, "MMMM d, yyyy")}:&nbsp;
                                {dateObj.status === "present" ? (
                                  <span className="text-green-400">Present</span>
                                ) : dateObj.status === "absent" ? (
                                  <span className="text-red-400">Absent</span>
                                ) : (
                                  <span className="text-gray-400">No Class</span>
                                )}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-center text-xs text-gray-400">
        <div className="flex items-center space-x-2">
          <span>Attendance</span>
          <div className="bg-gray-700 w-3 h-3 rounded-sm"></div>
          <div className="bg-green-500 w-3 h-3 rounded-sm"></div>
          <div className="bg-red-500 opacity-60 w-3 h-3 rounded-sm"></div>
        </div>
      </div>
    </div>
  );
};

export default YearlyAttendanceStreak;