import { useEffect, useState } from "react";
import axios from "axios";
import { Search, UserPlus, UserMinus } from "lucide-react";
import Button from "../../ui/Button";
import { Input } from "../../ui/input";
import { Card, CardContent } from "../../ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import { useToast } from "../../../hooks/use-toast";

// Temporary skeleton component (can be moved to /ui/skeleton.tsx)
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-700 rounded-md ${className}`} />
);

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
  const [studentToRemove, setStudentToRemove] = useState<Student | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchStudentsData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const enrolledRes = await axios.get(
        `http://localhost:3000/api/v1/classroom/enrolled-students/${classroomId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudents(enrolledRes.data || []);

      const availableRes = await axios.get(
        `http://localhost:3000/api/v1/classroom/eligible-students/${classroomId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAvailableStudents(availableRes.data || []);
    } catch (error) {
      console.error("Error fetching student data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch students. Please try again.",
        variant: "destructive",
      });
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

      toast({
        title: "Success",
        description: "Student added to the classroom",
      });

      await fetchStudentsData();
    } catch (error) {
      console.error("Failed to add student:", error);
      toast({
        title: "Error",
        description: "Failed to add student to the classroom",
        variant: "destructive",
      });
    } finally {
      setProcessingStudentId(null);
    }
  };

  const confirmRemoveStudent = (student: Student) => {
    setStudentToRemove(student);
    setDialogOpen(true);
  };

  const handleRemoveStudent = async () => {
    if (!studentToRemove) return;

    try {
      setProcessingStudentId(studentToRemove.userId);
      setDialogOpen(false);

      const token = localStorage.getItem("token");

      await axios.post(
        `http://localhost:3000/api/v1/classroom/leave`,
        { classroomId, userId: studentToRemove.userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: "Success",
        description: "Student removed from the classroom",
      });

      await fetchStudentsData();
    } catch (error) {
      console.error("Failed to remove student:", error);
      toast({
        title: "Error",
        description: "Failed to remove student from the classroom",
        variant: "destructive",
      });
    } finally {
      setProcessingStudentId(null);
      setStudentToRemove(null);
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
    <div className="space-y-6 min-h-screen bg-[#121827] text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Students Management</h1>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          type="text"
          placeholder="Search students by name or email"
          className="pl-10 py-6 bg-[#0f1523] border-[#2d3748] text-white rounded-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Enrolled Students */}
      <div className="bg-[#0f1523] rounded-lg border border-[#2d3748] p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-6">Enrolled Students</h2>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, idx) => (
              <Card
                key={idx}
                className="bg-[#1a2235] border-[#2d3748] shadow-md"
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2 w-full">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="h-8 w-24 ml-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No students enrolled in this classroom.
          </div>
        ) : (
          <div className="space-y-4">
            {students.map((student) => (
              <Card
                key={student.id}
                className="bg-[#1a2235] border-[#2d3748] shadow-md overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="flex justify-between items-center p-4">
                    <div className="space-y-1">
                      <div className="font-medium text-white text-lg">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-gray-400">{student.email}</div>
                      <div className="text-xs text-gray-500">
                        Enrollment No:{" "}
                        <span className="font-mono">
                          {student.enrollmentNo}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => confirmRemoveStudent(student)}
                      disabled={processingStudentId === student.userId}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      {processingStudentId === student.userId
                        ? "Removing..."
                        : "Remove"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add New Students */}
      <div className="bg-[#0f1523] rounded-lg border border-[#2d3748] p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-6">Add New Students</h2>
        {loading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, idx) => (
              <Card
                key={idx}
                className="bg-[#1a2235] border-[#2d3748] shadow-md"
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2 w-full">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="h-8 w-28 ml-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAvailableStudents.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            {searchQuery
              ? "No students found matching your search."
              : "No eligible students available."}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAvailableStudents.map((student) => (
              <Card
                key={student.id}
                className="bg-[#1a2235] border-[#2d3748] shadow-md overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="flex justify-between items-center p-4">
                    <div className="space-y-1">
                      <div className="font-medium text-white text-lg">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-gray-400">{student.email}</div>
                      <div className="text-xs text-gray-500">
                        Enrollment No:{" "}
                        <span className="font-mono">
                          {student.enrollmentNo}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddStudent(student.userId)}
                      disabled={processingStudentId === student.userId}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      {processingStudentId === student.userId
                        ? "Adding..."
                        : "Add Student"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent className="bg-[#1a2235] border-[#2d3748] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Student</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to remove {studentToRemove?.firstName}{" "}
              {studentToRemove?.lastName} from this classroom? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#2d3748] text-white hover:bg-[#3a4a61]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleRemoveStudent}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StudentsTab;
