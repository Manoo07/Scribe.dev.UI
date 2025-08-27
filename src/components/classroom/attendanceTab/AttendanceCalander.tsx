import { addMonths, subMonths } from "date-fns";
import {
  CalendarCheck,
  CalendarX,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { cn } from "../../../lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tool-tip";

interface AttendanceCalendarProps {
  classroomId: string;
  onSelectDate: (date: string) => void;
  attendanceData: Record<string, { present: number; total: number }>;
  selectedMonth?: string;
}

const AttendanceCalendar = ({
  // classroomId,
  onSelectDate,
  attendanceData,
  selectedMonth,
}: AttendanceCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentViewDate, setCurrentViewDate] = useState<Date>(
    selectedMonth ? new Date(selectedMonth + "-01") : new Date()
  );

  // Update view when selectedMonth prop changes
  useEffect(() => {
    if (selectedMonth) {
      setCurrentViewDate(new Date(`${selectedMonth}-01`));
    }
  }, [selectedMonth]);

  // Get current month's days
  const currentMonth = currentViewDate.getMonth();
  const currentYear = currentViewDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handleDateClick = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
    onSelectDate(dateStr);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentViewDate((prevDate) => {
      return direction === "prev"
        ? subMonths(prevDate, 1)
        : addMonths(prevDate, 1);
    });
  };

  return (
    <div className="mb-6 bg-gray-800 p-4 sm:p-5 rounded-lg border border-gray-700 shadow-lg">
      {/* Header with buttons + month/year selects */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth("prev")}
          className="p-1.5 rounded-full hover:bg-gray-700 transition-colors"
          aria-label="Previous Month"
        >
          <ChevronLeft className="h-5 w-5 text-gray-400" />
        </button>

        <div className="flex items-center space-x-2 text-white">
          <div className="relative">
            <select
              value={currentViewDate.getMonth()}
              onChange={(e) => {
                const newDate = new Date(currentViewDate);
                newDate.setMonth(parseInt(e.target.value));
                setCurrentViewDate(newDate);
              }}
              className="appearance-none bg-gray-700 text-white text-sm rounded-md px-3 py-1.5 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((month, idx) => (
                <option key={idx} value={idx}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              value={currentViewDate.getFullYear()}
              onChange={(e) => {
                const newDate = new Date(currentViewDate);
                newDate.setFullYear(parseInt(e.target.value));
                setCurrentViewDate(newDate);
              }}
              className="appearance-none bg-gray-700 text-white text-sm rounded-md px-3 py-1.5 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 10 }).map((_, i) => {
                const year = new Date().getFullYear() - 5 + i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <button
          onClick={() => navigateMonth("next")}
          className="p-1.5 rounded-full hover:bg-gray-700 transition-colors"
          aria-label="Next Month"
        >
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
        {/* Day names */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-gray-400 text-xs p-1 font-medium">
            {day}
          </div>
        ))}

        {/* Empty cells for days before the 1st of the month */}
        {Array.from({
          length: new Date(currentYear, currentMonth, 1).getDay(),
        }).map((_, i) => (
          <div key={`empty-${i}`} className="p-1"></div>
        ))}

        {/* Actual days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
            2,
            "0"
          )}-${String(day).padStart(2, "0")}`;
          const isSelected = dateStr === selectedDate;
          const attendance = attendanceData[dateStr];

          let attendanceStatus: React.ReactNode = null;
          let borderClass = "border-gray-700";
          let tooltipText = "No attendance data";

          if (attendance) {
            const percentPresent = Math.round(
              (attendance.present / attendance.total) * 100
            );
            tooltipText = `${percentPresent}% Present`;

            if (percentPresent > 0) {
              attendanceStatus = (
                <CalendarCheck className="h-4 w-4 text-green-400" />
              );
              borderClass = "border-green-600";
            } else {
              attendanceStatus = <CalendarX className="h-4 w-4 text-red-400" />;
              borderClass = "border-red-600";
            }
          } else {
            attendanceStatus = <CircleHelp className="h-4 w-4 text-gray-500" />;
          }

          return (
            <TooltipProvider key={day}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    onClick={() => handleDateClick(day)}
                    className={cn(
                      "p-1.5 sm:p-2 rounded-lg border transition-all duration-200 text-gray-300 hover:bg-gray-700 cursor-pointer relative flex flex-col items-center justify-center",
                      borderClass,
                      isSelected && "ring-2 ring-blue-500 bg-gray-700"
                    )}
                  >
                    <span className="text-xs sm:text-sm">{day}</span>
                    {attendanceStatus && (
                      <div className="mt-0.5 sm:mt-1">{attendanceStatus}</div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="bg-gray-900 border-gray-700 text-white text-xs"
                >
                  {tooltipText}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
};

export default AttendanceCalendar;
