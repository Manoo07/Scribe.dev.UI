import axios from "axios";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface Student {
  id: string;
  userId: string;
  enrollmentNo: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface StudentsData {
  enrolledStudents: Student[];
  availableStudents: Student[];
  loading: boolean;
  updating: boolean;
  lastFetched: number | null;
  fetchedClassroomId: string | null;
}

interface ClassroomContextType {
  studentsData: StudentsData;
  fetchStudentsData: (classroomId: string, force?: boolean) => Promise<void>;
  refreshStudentsData: (classroomId: string) => Promise<void>; // Force refresh
  setUpdating: (updating: boolean) => void;
  updateStudentsAfterAdd: (addedStudent: Student) => void;
  updateStudentsAfterRemove: (removedStudentUserId: string) => void;
  updateStudentsAfterBulkAdd: (addedStudents: Student[]) => void;
  updateStudentsAfterBulkRemove: (removedStudentUserIds: string[]) => void;
  clearStudentsData: () => void;
}

const ClassroomContext = createContext<ClassroomContextType | undefined>(
  undefined
);

export const useClassroomContext = () => {
  const context = useContext(ClassroomContext);
  if (!context) {
    throw new Error(
      "useClassroomContext must be used within a ClassroomProvider"
    );
  }
  return context;
};

interface ClassroomProviderProps {
  children: React.ReactNode;
  classroomId: string;
}

export const ClassroomProvider: React.FC<ClassroomProviderProps> = ({
  children,
  classroomId,
}) => {
  const [studentsData, setStudentsData] = useState<StudentsData>({
    enrolledStudents: [],
    availableStudents: [],
    loading: false,
    updating: false,
    lastFetched: null,
    fetchedClassroomId: null,
  });

  // Clear data when classroomId changes
  useEffect(() => {
    setStudentsData({
      enrolledStudents: [],
      availableStudents: [],
      loading: false,
      updating: false,
      lastFetched: null,
      fetchedClassroomId: null,
    });
  }, [classroomId]);

  const fetchStudentsData = useCallback(
    async (currentClassroomId: string, force = false) => {
      // If data exists for the same classroom and force is not true, don't refetch
      if (
        !force &&
        studentsData.lastFetched &&
        studentsData.fetchedClassroomId === currentClassroomId &&
        studentsData.enrolledStudents.length >= 0
      ) {
        return;
      }
      setStudentsData((prev) => ({ ...prev, loading: true }));
      try {
        const token = localStorage.getItem("token");
        const [enrolledRes, availableRes] = await Promise.all([
          axios.get(
            `http://localhost:3000/api/v1/classroom/enrolled-students/${currentClassroomId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get(
            `http://localhost:3000/api/v1/classroom/eligible-students/${currentClassroomId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);
        setStudentsData({
          enrolledStudents: enrolledRes.data || [],
          availableStudents: availableRes.data || [],
          loading: false,
          updating: false,
          lastFetched: Date.now(),
          fetchedClassroomId: currentClassroomId,
        });
      } catch (error) {
        console.error("Error fetching student data:", error);
        setStudentsData((prev) => ({ ...prev, loading: false }));
        throw error;
      }
    },
    [
      studentsData.lastFetched,
      studentsData.fetchedClassroomId,
      studentsData.enrolledStudents.length,
    ]
  );

  const setUpdating = (updating: boolean) => {
    setStudentsData((prev) => ({ ...prev, updating }));
  };

  const refreshStudentsData = useCallback(
    async (classroomId: string) => {
      return fetchStudentsData(classroomId, true); // Force fetch
    },
    [fetchStudentsData]
  );

  const updateStudentsAfterAdd = useCallback((addedStudent: Student) => {
    setStudentsData((prev) => ({
      ...prev,
      enrolledStudents: [...prev.enrolledStudents, addedStudent],
      availableStudents: prev.availableStudents.filter(
        (student) => student.userId !== addedStudent.userId
      ),
      updating: false,
    }));
  }, []);

  const updateStudentsAfterRemove = useCallback(
    (removedStudentUserId: string) => {
      setStudentsData((prev) => {
        const removedStudent = prev.enrolledStudents.find(
          (student) => student.userId === removedStudentUserId
        );
        if (!removedStudent) return prev;
        return {
          ...prev,
          enrolledStudents: prev.enrolledStudents.filter(
            (student) => student.userId !== removedStudentUserId
          ),
          availableStudents: [...prev.availableStudents, removedStudent],
          updating: false,
        };
      });
    },
    []
  );

  const updateStudentsAfterBulkAdd = useCallback((addedStudents: Student[]) => {
    const addedUserIds = addedStudents.map((student) => student.userId);
    setStudentsData((prev) => ({
      ...prev,
      enrolledStudents: [...prev.enrolledStudents, ...addedStudents],
      availableStudents: prev.availableStudents.filter(
        (student) => !addedUserIds.includes(student.userId)
      ),
      updating: false,
    }));
  }, []);

  const updateStudentsAfterBulkRemove = useCallback(
    (removedStudentUserIds: string[]) => {
      setStudentsData((prev) => {
        const removedStudents = prev.enrolledStudents.filter((student) =>
          removedStudentUserIds.includes(student.userId)
        );
        return {
          ...prev,
          enrolledStudents: prev.enrolledStudents.filter(
            (student) => !removedStudentUserIds.includes(student.userId)
          ),
          availableStudents: [...prev.availableStudents, ...removedStudents],
          updating: false,
        };
      });
    },
    []
  );

  const clearStudentsData = useCallback(() => {
    setStudentsData({
      enrolledStudents: [],
      availableStudents: [],
      loading: false,
      updating: false,
      lastFetched: null,
      fetchedClassroomId: null,
    });
  }, []);

  const value: ClassroomContextType = {
    studentsData,
    fetchStudentsData,
    refreshStudentsData,
    setUpdating,
    updateStudentsAfterAdd,
    updateStudentsAfterRemove,
    updateStudentsAfterBulkAdd,
    updateStudentsAfterBulkRemove,
    clearStudentsData,
  };

  return (
    <ClassroomContext.Provider value={value}>
      {children}
    </ClassroomContext.Provider>
  );
};
