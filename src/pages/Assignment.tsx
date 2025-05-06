const assignments = [
  {
    id: 1,
    title: "Essay: The French Revolution",
    subject: "History",
    dueDate: "2025-05-10",
    status: "Pending",
  },
  {
    id: 2,
    title: "Algebra Worksheet 3",
    subject: "Mathematics",
    dueDate: "2025-05-08",
    status: "Submitted",
  },
  {
    id: 3,
    title: "Physics Lab Report",
    subject: "Physics",
    dueDate: "2025-05-12",
    status: "Pending",
  },
];

const AssignmentsPage = () => {
  return (
    <div className="text-white">
      <h2 className="text-2xl font-semibold mb-6">Assignments</h2>
      <div className="grid gap-4">
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{assignment.title}</h3>
                <p className="text-sm text-gray-400">
                  Subject: {assignment.subject}
                </p>
                <p className="text-sm text-gray-400">
                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  assignment.status === "Submitted"
                    ? "bg-green-600 text-white"
                    : "bg-yellow-600 text-white"
                }`}
              >
                {assignment.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignmentsPage;
