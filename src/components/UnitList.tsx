import { Plus } from "lucide-react";
import React, { useState } from "react";
import { useToast } from "../hooks/use-toast";
import { deleteUnit } from "../services/api";
import { ContentType, Unit } from "../types";
import { formatDistanceToNow } from "../utils/dateUtils";
import CreateUnitModal from "./CreateUnitModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import UnitCard from "./UnitCard";

interface UnitsListProps {
  units: Unit[];
  classroomId: string;
  onUnitSelect: (unitId: string) => void;
  onUnitEdit: (unitId: string) => void;
  onRefresh: () => void;
  userRole?: string;
}

const UnitsList: React.FC<UnitsListProps> = ({
  units,
  classroomId,
  onUnitSelect,
  onUnitEdit,
  onRefresh,
  userRole,
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

    // Show loading toast
    const loadingToast = toast({
      title: "Deleting Unit",
      description: "Please wait while we remove the unit...",
    });

    try {
      await deleteUnit(pendingDeleteId);

      // Dismiss loading toast and show success
      loadingToast.dismiss();
      toast({
        title: "Unit Deleted Successfully! 🗑️",
        description:
          "The unit has been permanently removed from your classroom.",
      });

      setLocalUnits((prev) => prev.filter((u) => u.id !== pendingDeleteId));
    } catch (err) {
      // Dismiss loading toast and show error
      loadingToast.dismiss();

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to delete unit. Please try again.";

      toast({
        title: "Failed to Delete Unit",
        description: errorMessage,
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
      <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center mb-4 gap-2">
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <div className="relative flex-grow sm:min-w-[280px]">
            <input
              type="text"
              placeholder="Search units..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 sm:flex-shrink-0">
            <select
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-w-[130px]"
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
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Plus size={16} />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              userRole={userRole}
            />
          ))}

          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">
                  Are you sure you want to delete the unit?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                  This action cannot be undone and will permanently remove all
                  associated data.
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
          onSuccess={(newUnit) => {
            setIsCreateModalOpen(false);
            // Add the new unit to local state immediately
            if (newUnit) {
              setLocalUnits((prev) => [...prev, newUnit]);
            }
            // Also call the parent refresh to ensure consistency
            onRefresh();
          }}
        />
      )}
    </div>
  );
};

export default UnitsList;
