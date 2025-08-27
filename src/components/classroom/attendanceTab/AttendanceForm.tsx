import { format, parseISO } from "date-fns";
import { AlertTriangle, Check, UserCheck, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  getAttendanceForDate,
  getStudentsForClassroom,
  updateAttendanceForDate,
} from "../../../services/attendanceService";
import { Student } from "../../../types/index";

interface AttendanceFormProps {
  classroomId: string;
  selectedDate: string | null;
  onAttendanceUpdated: () => void;
}

const AttendanceForm = ({
  classroomId,
  selectedDate,
  onAttendanceUpdated,
}: AttendanceFormProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [presentStudentIds, setPresentStudentIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!selectedDate) return;

    setIsLoading(true);
    const classroomStudents = getStudentsForClassroom();
    setStudents(classroomStudents);

    const attendanceRecord = getAttendanceForDate(classroomId, selectedDate);
    if (attendanceRecord) {
      setPresentStudentIds(attendanceRecord.presentStudents);
    } else {
      setPresentStudentIds(classroomStudents.map((s) => s.id));
    }
    setIsLoading(false);
  }, [classroomId, selectedDate]);

  const toggleStudentAttendance = (studentId: string) => {
    setPresentStudentIds((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    try {
      updateAttendanceForDate(classroomId, selectedDate, presentStudentIds);
      alert(
        `Attendance for ${format(
          parseISO(selectedDate),
          "MMMM d, yyyy"
        )} has been updated.`
      );
      onAttendanceUpdated();
    } catch (error) {
      alert("Error: An error occurred while saving attendance records.");
    }
  };

  if (!selectedDate) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-gray-300 flex flex-col items-center justify-center min-h-[300px] border border-gray-700 shadow-lg">
        <CalendarIcon className="h-12 w-12 text-gray-500 mb-4" />
        <p className="text-center text-lg">Select a date to mark attendance</p>
        <p className="text-center text-gray-500 mt-2">
          Choose a day from the calendar to begin
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700 shadow-lg">
        <p className="text-center text-gray-300">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h3 className="text-xl font-semibold text-white">
          Attendance for {format(parseISO(selectedDate), "MMMM d, yyyy")}
        </h3>
        <div className="flex space-x-3">
          <button
            onClick={() => setPresentStudentIds(students.map((s) => s.id))}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm transition-colors flex items-center space-x-2"
          >
            <Check className="h-4 w-4" /> <span>Mark All Present</span>
          </button>
          <button
            onClick={() => setPresentStudentIds([])}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm transition-colors flex items-center space-x-2"
          >
            <X className="h-4 w-4" /> <span>Mark All Absent</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {students.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-gray-400">
            <AlertTriangle className="h-12 w-12 mb-4 text-yellow-500" />
            <p className="text-center text-lg">
              No students found in this classroom
            </p>
          </div>
        ) : (
          <div className="space-y-2 mb-6 max-h-80 overflow-y-auto pr-2 scrollbar-none">
            {students.map((student) => {
              const isPresent = presentStudentIds.includes(student.id);
              return (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-200 cursor-pointer border border-gray-600"
                  onClick={() => toggleStudentAttendance(student.id)}
                >
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gray-600 rounded-full flex items-center justify-center mr-4">
                      {student.profileImage ? (
                        <img
                          src={student.profileImage}
                          alt={student.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <UserCheck className="h-5 w-5 text-gray-300" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-gray-200 font-medium">
                        {student.name}
                      </p>
                      <p className="text-gray-400 text-sm">{student.email}</p>
                    </div>
                  </div>
                  <div
                    className={`p-2 rounded-full cursor-pointer ${
                      isPresent
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {isPresent ? (
                      <Check className="h-5 w-5 text-white" />
                    ) : (
                      <X className="h-5 w-5 text-white" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium"
          >
            <Check className="mr-2 h-4 w-4 inline" />
            Save Attendance
          </button>
        </div>
      </form>
    </div>
  );
};

const CalendarIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
};

export default AttendanceForm;
