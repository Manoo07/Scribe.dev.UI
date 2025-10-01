import { ClipboardList } from "lucide-react";
import React, { useState } from "react";
import { Unit } from "../../../types/index";
import ContentUploader from "../../EditContentModal";
import UnitDetail from "../../UnitDetails";
import UnitsList from "../../UnitList";

interface UnitsTabProps {
  classroomId: string;
  units: Unit[];
  setUnits: (units: Unit[]) => void;
  loading: boolean;
}

const UnitsTab: React.FC<UnitsTabProps> = ({
  classroomId,
  units,
  setUnits,
  loading,
}) => {
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleUnitSelect = (unitId: string) => {
    setActiveUnitId(unitId);
  };

  const handleBackToUnits = () => {
    setActiveUnitId(null);
  };

  const handleOpenUploader = (unitId: string) => {
    setActiveUnitId(unitId);
    setIsUploaderOpen(true);
  };

  const handleCloseUploader = () => {
    setIsUploaderOpen(false);
  };

  const handleRefresh = (newUnits: Unit[]) => {
    setUnits(newUnits);
    setError(null);
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
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ClipboardList size={28} className="text-blue-500" />
          <h1 className="text-3xl font-bold text-white">Units</h1>
        </div>
        <p className="text-gray-400">
          Manage your units and educational materials
        </p>
      </header>

      {activeUnit && !isUploaderOpen ? (
        <UnitDetail
          unit={activeUnit}
          onBack={handleBackToUnits}
          onAddContent={() => setIsUploaderOpen(true)}
          onRefresh={() => handleRefresh(units)}
        />
      ) : activeUnit && isUploaderOpen ? (
        <ContentUploader
          unit={activeUnit}
          onClose={handleCloseUploader}
          onSuccess={() => {
            setIsUploaderOpen(false);
          }}
        />
      ) : (
        <UnitsList
          units={units}
          classroomId={classroomId}
          onUnitSelect={handleUnitSelect}
          onUnitEdit={handleOpenUploader}
          onRefresh={() => handleRefresh(units)}
        />
      )}
    </div>
  );
};

export default UnitsTab;
