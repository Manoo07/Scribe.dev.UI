import React, { useState } from "react";
import UnitCard from "./UnitCard";
import { Unit, ContentType } from "../types";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<ContentType | "ALL">("ALL");

  const processedUnits = units.map((unit) => {
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

    // Get the most recent content for description
    const sortedContents = [...unit.educationalContents].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    const noteContent = sortedContents.find(
      (content) => content.type === ContentType.NOTE
    );

    return {
      id: unit.id,
      name: unit.name,
      description:
        noteContent?.content.split("\n")[0]?.slice(0, 100) ||
        "No description provided.",
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
            />
          ))}
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
