import React, { useState } from "react";
import { Unit } from "../../../types/index";
import ContentUploader from "../../EditContentModal";
import UnitDetail from "../../UnitDetails";
import UnitsList from "../../UnitList";
import { LoadingState } from "../shared";

interface UnitsTabProps {
  classroomId: string;
  units: Unit[];
  setUnits: (units: Unit[]) => void;
  loading: boolean;
  onUnitsRefresh?: () => void;
  userRole?: string;
}

const UnitsTab: React.FC<UnitsTabProps> = ({
  classroomId,
  units,
  setUnits,
  loading,
  onUnitsRefresh,
  userRole,
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
    // Also call external refresh if provided
    if (onUnitsRefresh) {
      onUnitsRefresh();
    }
  };

  const activeUnit = units.find((unit) => unit.id === activeUnitId);

  if (loading) {
    return <LoadingState cardCount={6} />;
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 p-6 rounded-lg max-w-md mx-auto">
        <h2 className="text-red-400 text-xl font-bold mb-2">Error</h2>
        <p className="text-white mb-4">{error}</p>
      </div>
    );
  }

  return (
    <>
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
          userRole={userRole}
        />
      )}
    </>
  );
};

export default UnitsTab;
