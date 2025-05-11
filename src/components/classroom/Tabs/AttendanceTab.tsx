import React from "react";

const AttendanceTab = ({ classroomId }: { classroomId: string }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4">Attendance</h2>
      <div className="grid grid-cols-7 gap-2 text-center">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-800 p-2 rounded text-gray-300 hover:bg-gray-700 cursor-pointer"
          >
            Day {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceTab;
