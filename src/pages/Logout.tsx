import React, { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Logout: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      const token = localStorage.getItem("token");
      try {
        if (token) {
          await axios.post(
            "http://localhost:3000/api/v1/auth/logout",
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
      } catch (error) {
        // Optionally handle error
      } finally {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
      }
    };
    logout();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-white text-lg">Logging out...</div>
    </div>
  );
};

export default Logout;
