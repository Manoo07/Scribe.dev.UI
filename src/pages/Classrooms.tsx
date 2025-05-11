import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios"; // To make HTTP requests

// Replace with your actual BASE_URL

const MyClassroomsPage = () => {
  const [classrooms, setClassrooms] = useState<any[]>([]); // Store classrooms data
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  // Fetch classrooms data when the component mounts
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:3000/api/v1/classroom",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setClassrooms(response.data.classrooms);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch classrooms");
        setLoading(false);
      }
    };

    fetchClassrooms();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">My Classrooms</h2>
        <button className="bg-indigo-600 px-3 py-1 rounded text-sm hover:bg-indigo-500">
          + Add Classroom
        </button>
      </div>

      {/* Show loading state */}
      {loading && <p className="text-white">Loading classrooms...</p>}

      {/* Show error if there is one */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Display classrooms if data is loaded */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {classrooms.map((classroom) => (
          <Link
            to={`/dashboard/classrooms/${classroom.id}`}
            key={classroom.id}
            className="bg-gray-800 p-4 rounded hover:bg-gray-700 transition"
          >
            <h3 className="text-lg font-bold text-white">{classroom.name}</h3>
            <p className="text-gray-400">Section: {classroom.section.name}</p>
            <p className="text-gray-400">
              Faculty: {classroom.faculty.specialization}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MyClassroomsPage;
