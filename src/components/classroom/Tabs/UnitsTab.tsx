import React, { useState, useEffect } from "react";
import UnitsList from "../../UnitList";
import UnitDetail from "../../UnitDetails";
import AddContentOnlyModal from "../../AddContentModal";
import ContentUploader from "../../EditContentModal";
import { Unit } from "../../../types/index";
import { getUnits } from "../../../services/api";
import { ClipboardList } from "lucide-react";

interface VirtualClassroomProps {
  classroomId: string;
  classroomName?: string;
}

const VirtualClassroom: React.FC<VirtualClassroomProps> = ({ classroomId, classroomName }) => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUnits();
  }, [classroomId]);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const data = await getUnits(classroomId);
      setUnits(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch units:", err);
      setError("Failed to load units. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const handleUnitSelect = (unitId: string) => {
    setActiveUnitId(unitId);
    setIsEditMode(false);
  };

  const handleBackToUnits = () => {
    setActiveUnitId(null);
  };

  const handleOpenUploader = (unitId: string) => {
    setActiveUnitId(unitId);
    setIsEditMode(true);
    setIsUploaderOpen(true);
  };

  const handleCloseUploader = () => {
    setIsUploaderOpen(false);
    setIsEditMode(false);
  };

  const activeUnit = units.find((unit) => unit.id === activeUnitId);

  if (loading) {
    return (
      <div className="container mx-auto p-6 animate-pulse">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gray-700 rounded-full h-8 w-8" />
            <div className="h-6 bg-gray-700 rounded w-1/3" />
          </div>
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-6" />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4 space-y-3">
                <div className="h-4 bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-700 rounded w-2/4" />
                <div className="h-3 bg-gray-700 rounded w-1/4" />
              </div>
            ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500 p-6 rounded-lg max-w-md">
          <h2 className="text-red-400 text-xl font-bold mb-2">Error</h2>
          <p className="text-white mb-4">{error}</p>
          <button
            onClick={fetchUnits}
            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ClipboardList size={28} className="text-blue-500" />
          <h1 className="text-3xl font-bold text-white">
            {classroomName || "Virtual Classroom"}
          </h1>
        </div>
        <p className="text-gray-400">
          Manage your units and educational materials
        </p>
      </header>

      {activeUnit && !isUploaderOpen ? (
        <UnitDetail
          unit={activeUnit}
          onBack={handleBackToUnits}
          onAddContent={() => {
            setIsEditMode(false);
            setIsUploaderOpen(true);
          }}
          onRefresh={fetchUnits}
        />
      ) : activeUnit && isUploaderOpen ? (
        isEditMode ? (
          <ContentUploader
            unit={activeUnit}
            onClose={handleCloseUploader}
            onSuccess={() => {
              fetchUnits();
              setIsUploaderOpen(false);
              setIsEditMode(false);
            }}
          />
        ) : (
          <AddContentOnlyModal
            unit={activeUnit}
            onClose={handleCloseUploader}
            onSuccess={() => {
              fetchUnits();
              setIsUploaderOpen(false);
            }}
          />
        )
      ) : (
        <UnitsList
          units={units}
          classroomId={classroomId}
          onUnitSelect={handleUnitSelect}
          onUnitEdit={handleOpenUploader}
          onRefresh={fetchUnits}
        />
      )}
    </div>
  );
};

export default VirtualClassroom;
