import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const MyClassroomsPage = () => {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">My Classrooms</h2>
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm shadow transition">
          + Add Classroom
        </button>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(4)
            .fill(0)
            .map((_, idx) => (
              <div
                key={idx}
                className="bg-gray-800 animate-pulse p-4 rounded-lg h-28"
              >
                <div className="bg-gray-700 h-4 w-3/4 mb-3 rounded" />
                <div className="bg-gray-700 h-3 w-1/2 mb-2 rounded" />
                <div className="bg-gray-700 h-3 w-1/3 rounded" />
              </div>
            ))}
        </div>
      )}

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classrooms.map((classroom) => (
            <Link
              to={`/dashboard/classrooms/${classroom.id}`}
              key={classroom.id}
              className="bg-gray-800 hover:bg-gray-700 transition p-5 rounded-xl shadow-md"
            >
              <h3 className="text-xl font-semibold text-white mb-1">
                {classroom.name}
              </h3>
              <p className="text-gray-400 text-sm">
                Section: {classroom.section.name}
              </p>
              <p className="text-gray-400 text-sm">
                Faculty: {classroom.faculty.specialization}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyClassroomsPage;
