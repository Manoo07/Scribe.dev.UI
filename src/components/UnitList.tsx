import React, { useState } from "react";
import UnitCard from "./UnitCard";
import { deleteUnit } from "../services/api";
import { Unit, ContentType } from "../types";
import { useToast } from "../hooks/use-toast";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "./ui/alert-dialog";
import { formatDistanceToNow } from "../utils/dateUtils";
import { Plus, Filter } from "lucide-react";
import CreateUnitModal from "./CreateUnitModal";

interface UnitsListProps {
  units: Unit[];
  classroomId: string;
  onUnitSelect: (unitId: string) => void;
  onUnitEdit: (unitId: string) => void;
  onRefresh: () => void;
}

const UnitsList: React.FC<UnitsListProps> = ({
  units,
  classroomId,
  onUnitSelect,
  onUnitEdit,
  onRefresh,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deletingUnitId, setDeletingUnitId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [localUnits, setLocalUnits] = useState<Unit[]>(units);
  const { toast } = useToast();

  // Keep localUnits in sync with props.units if they change externally
  React.useEffect(() => {
    setLocalUnits(units);
  }, [units]);

  const handleDeleteUnit = (unitId: string) => {
    setPendingDeleteId(unitId);
    setIsDialogOpen(true);
  };

  const confirmDeleteUnit = async () => {
    if (!pendingDeleteId) return;
    setDeletingUnitId(pendingDeleteId);
    try {
      await deleteUnit(pendingDeleteId);
      setLocalUnits((prev) => prev.filter((u) => u.id !== pendingDeleteId));
      toast({
        title: "Success",
        description: "Unit deleted successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete unit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingUnitId(null);
      setPendingDeleteId(null);
      setIsDialogOpen(false);
    }
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<ContentType | "ALL">("ALL");

  const processedUnits = localUnits.map((unit) => {
    const contentsCount = {
      [ContentType.NOTE]: 0,
      [ContentType.LINK]: 0,
      [ContentType.VIDEO]: 0,
      [ContentType.DOCUMENT]: 0,
    };

    unit.educationalContents.forEach((content) => {
      if (content.type in contentsCount) {
        contentsCount[content.type as ContentType]++;
      }
    });

    // Always display the unit description (if present), otherwise fallback to NOTE content, otherwise fallback to default
    const sortedContents = [...unit.educationalContents].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    const noteContent = sortedContents.find(
      (content) => content.type === ContentType.NOTE
    );

    let displayDescription = "No description provided.";
    if (unit.description && unit.description.trim() !== "") {
      displayDescription = unit.description;
    } else if (noteContent?.content) {
      displayDescription = noteContent.content.split("\n")[0]?.slice(0, 100);
    }

    return {
      id: unit.id,
      name: unit.name,
      description: displayDescription,
      lastUpdated: unit.updatedAt
        ? formatDistanceToNow(new Date(unit.updatedAt))
        : "N/A",
      contentsCount,
    };
  });

  const filteredUnits = processedUnits.filter((unit) => {
    const matchesSearch =
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === "ALL") {
      return matchesSearch;
    }

    return matchesSearch && unit.contentsCount[filterType] > 0;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-white">Course Units</h2>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search units..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <select
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value as ContentType | "ALL")
              }
            >
              <option value="ALL">All Types</option>
              <option value={ContentType.NOTE}>Notes</option>
              <option value={ContentType.LINK}>Links</option>
              <option value={ContentType.VIDEO}>Videos</option>
              <option value={ContentType.DOCUMENT}>Documents</option>
            </select>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={18} />
              <span>New Unit</span>
            </button>
          </div>
        </div>
      </div>

      {filteredUnits.length === 0 ? (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-400 mb-4">
            No units found matching your criteria
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterType("ALL");
            }}
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUnits.map((unit) => (
            <UnitCard
              key={unit.id}
              id={unit.id}
              name={unit.name}
              description={unit.description}
              lastUpdated={unit.lastUpdated}
              contentsCount={unit.contentsCount}
              onEdit={() => onUnitEdit(unit.id)}
              onView={() => onUnitSelect(unit.id)}
              onDelete={() => handleDeleteUnit(unit.id)}
              isDeleting={deletingUnitId === unit.id}
            />
          ))}

          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Are you sure you want to delete the unit?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                  This action cannot be undone and will permanently remove all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  className="bg-gray-700 text-white hover:bg-gray-600"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setPendingDeleteId(null);
                  }}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={confirmDeleteUnit}
                  disabled={deletingUnitId !== null}
                >
                  {deletingUnitId ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {isCreateModalOpen && (
        <CreateUnitModal
          classroomId={classroomId}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            onRefresh();
          }}
        />
      )}
    </div>
  );
};

export default UnitsList;
