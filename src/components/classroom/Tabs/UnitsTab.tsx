import React, { useState, useEffect } from 'react';
import UnitsList from '../../UnitList';
import UnitDetail from '../../UnitDetails';
import ContentUploader from '../.././ContentUploader';
import { Unit } from '../../../types/index';
import { getUnits } from '../../../services/api';
import { ClipboardList } from 'lucide-react';

interface VirtualClassroomProps {
  classroomId: string;
}

const VirtualClassroom: React.FC<VirtualClassroomProps> = ({ classroomId }) => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
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
      console.error('Failed to fetch units:', err);
      setError('Failed to load units. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  const activeUnit = units.find(unit => unit.id === activeUnitId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Loading classroom content...</p>
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
          <h1 className="text-3xl font-bold text-white">Mathematics Virtual Classroom</h1>
        </div>
        <p className="text-gray-400">Manage your units and educational materials</p>
      </header>

      {activeUnit && !isUploaderOpen ? (
        <UnitDetail 
          unit={activeUnit} 
          onBack={handleBackToUnits} 
          onAddContent={() => setIsUploaderOpen(true)}
          onRefresh={fetchUnits}
        />
      ) : activeUnit && isUploaderOpen ? (
        <ContentUploader 
          unit={activeUnit} 
          onClose={handleCloseUploader} 
          onSuccess={() => {
            fetchUnits();
            setIsUploaderOpen(false);
          }} 
        />
      ) : (
        <UnitsList 
          units={units} 
          onUnitSelect={handleUnitSelect} 
          onUnitEdit={handleOpenUploader}
          onRefresh={fetchUnits}
        />
      )}
    </div>
  );
};

export default VirtualClassroom;