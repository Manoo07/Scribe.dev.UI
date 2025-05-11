import React from "react";

const AssignmentsTab = ({ classroomId }: { classroomId: string }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Assignments</h2>
        <button className="bg-indigo-600 px-3 py-1 rounded text-sm hover:bg-indigo-500">
          + Create Assignment
        </button>
      </div>
      <table className="w-full text-left text-gray-300">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-2">Title</th>
            <th className="p-2">Deadline</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-700">
            <td className="p-2">Assignment 1</td>
            <td className="p-2">2025-05-15</td>
            <td className="p-2">Open</td>
            <td className="p-2">
              <button className="text-indigo-400 hover:underline">View</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default AssignmentsTab;