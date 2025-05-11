import { useEffect, useState } from "react";
import axios from "axios";

interface Student {
  id: string;
  userId: string;
  enrollmentNo: string;
  firstName: string;
  lastName: string;
  email: string;
}

const StudentsTab = ({ classroomId }: { classroomId: string }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [processingStudentId, setProcessingStudentId] = useState<string | null>(
    null
  );

  const fetchStudentsData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Enrolled students
      const enrolledRes = await axios.get(
        `http://localhost:3000/api/v1/classroom/enrolled-students/${classroomId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudents(enrolledRes.data || []);

      // Available students (not yet enrolled)
      const availableRes = await axios.get(
        `http://localhost:3000/api/v1/classroom/eligible-students/${classroomId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAvailableStudents(availableRes.data || []);
    } catch (error) {
      console.error("Error fetching student data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsData();
  }, [classroomId]);

  const handleAddStudent = async (userId: string) => {
    try {
      setProcessingStudentId(userId);
      const token = localStorage.getItem("token");

      await axios.post(
        `http://localhost:3000/api/v1/classroom/join`,
        { classroomId, userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchStudentsData();
    } catch (error) {
      console.error("Failed to add student:", error);
    } finally {
      setProcessingStudentId(null);
    }
  };

  const handleRemoveStudent = async (userId: string) => {
    try {
      setProcessingStudentId(userId);
      const token = localStorage.getItem("token");

      await axios.post(
        `http://localhost:3000/api/v1/classroom/leave`,
        { classroomId, userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchStudentsData();
    } catch (error) {
      console.error("Failed to remove student:", error);
    } finally {
      setProcessingStudentId(null);
    }
  };

  const filteredAvailableStudents = availableStudents.filter(
    (student) =>
      `${student.firstName} ${student.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4">Students</h2>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search students by name or email"
          className="w-full p-2 rounded bg-gray-700 text-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Enrolled Students */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">
          Enrolled Students
        </h3>
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : students.length === 0 ? (
          <p className="text-gray-400">No students enrolled.</p>
        ) : (
          <ul className="space-y-3">
            {students.map((student) => (
              <li
                key={student.id}
                className="flex justify-between items-center bg-gray-800 p-3 rounded"
              >
                <div className="text-gray-200">
                  <div className="font-medium">
                    {student.firstName} {student.lastName}
                  </div>
                  <div className="text-sm text-gray-400">{student.email}</div>
                  <div className="text-sm text-gray-500">
                    Enrollment No: {student.enrollmentNo}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveStudent(student.userId)}
                  className="bg-red-600 text-white px-4 py-1 rounded text-sm hover:bg-red-500"
                  disabled={processingStudentId === student.userId}
                >
                  {processingStudentId === student.userId
                    ? "Removing..."
                    : "Remove"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add New Students */}
      <div className="bg-gray-800 p-4 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold text-white mb-4">
          Add New Students
        </h3>
        {filteredAvailableStudents.length === 0 ? (
          <p className="text-gray-400">
            No students found matching your search.
          </p>
        ) : (
          <ul className="space-y-3">
            {filteredAvailableStudents.map((student) => (
              <li
                key={student.id}
                className="flex items-center justify-between bg-gray-700 p-3 rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-sm text-gray-300">{student.email}</p>
                  <p className="text-sm text-gray-400">
                    Enrollment No:{" "}
                    <span className="font-mono">{student.enrollmentNo}</span>
                  </p>
                </div>
                <button
                  onClick={() => handleAddStudent(student.userId)}
                  className={`px-4 py-2 text-sm font-medium rounded ${
                    processingStudentId === student.userId
                      ? "bg-green-800 text-white cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-500 text-white"
                  }`}
                  disabled={processingStudentId === student.userId}
                >
                  {processingStudentId === student.userId ? "Adding..." : "Add"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StudentsTab;
