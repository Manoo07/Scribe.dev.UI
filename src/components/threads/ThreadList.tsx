import { ChevronDown, Filter, Globe, MessageSquare } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import EnhancedThreadCard from "./EnhancedThreadCard";
import { Thread } from "./threadTypes";

interface ThreadsListProps {
  threads: Thread[];
  isLoading: boolean;
  onThreadClick: (thread: Thread) => void;
  onCreateThread: (threadType: "classroom" | "generic") => void;
  showFilters?: boolean;
  classroomContext?: {
    id: string;
    name: string;
    units: Array<{ id: string; name: string }>;
  };
  selectedUnit?: string;
  setSelectedUnit?: (unitId: string) => void;
  error?: string | null;
  success?: string | null;
  onRefresh?: () => void;
  isCreating?: boolean;
  onChangesOccurred?: () => void;
  onFiltersChange?: (filters: { sortBy: string }) => void;
  onThreadLikeToggle?: (
    threadId: string,
    newLikeCount: number,
    isLiked: boolean
  ) => void;
}

const ThreadsList: React.FC<ThreadsListProps> = ({
  threads,
  isLoading,
  onThreadClick,
  onCreateThread,
  showFilters = true,
  classroomContext,
  selectedUnit,
  setSelectedUnit,
  error,
  success,
  onRefresh,
  isCreating = false,
  onChangesOccurred,
  onFiltersChange,
  onThreadLikeToggle,
}) => {
  // Sorting state
  const [sortBy, setSortBy] = useState<string>("mostRecent");

  // Filter dropdown state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedSortOption, setSelectedSortOption] = useState("Most Recent");

  // Sort options for the dropdown
  const sortOptions = [
    {
      value: "mostRecent",
      label: "Most Recent",
      order: "desc",
    },
    {
      value: "mostReplied",
      label: "Most Replied",
      order: "desc",
    },
    {
      value: "newest",
      label: "Newest",
      order: "desc",
    },
    {
      value: "mostLiked",
      label: "Most Liked",
      order: "desc",
    },
    {
      value: "alphabetical",
      label: "Alphabetical",
      order: "asc",
    },
  ];

  // Click outside handler to close filter dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Check if click is outside the dropdown and button
      if (isFilterOpen && !target.closest(".filter-dropdown-container")) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen]);

  // Handle thread deletion
  const handleThreadDelete = (deletedThreadId: string) => {
    // If we have a refresh function, use it to get fresh data
    if (onRefresh) {
      onRefresh();
    }
  };

  // Get unique categories from generic threads
  const availableCategories = useMemo(() => {
    const categories = threads
      .filter((thread) => thread.threadType === "generic")
      .map((thread) => thread.category);
    return [...new Set(categories)];
  }, [threads]);

  // Sort threads
  const sortedThreads = useMemo(() => {
    // Sort threads
    const sorted = [...threads].sort((a, b) => {
      switch (sortBy) {
        case "mostRecent":
          return (
            new Date(b.updatedAt || b.createdAt).getTime() -
            new Date(a.updatedAt || a.createdAt).getTime()
          );
        case "mostReplied":
          return (b.repliesCount || 0) - (a.repliesCount || 0);
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "mostLiked":
          return (b.likesCount || 0) - (a.likesCount || 0);
        case "alphabetical":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return sorted;
  }, [threads, sortBy]);

  const threadStats = useMemo(() => {
    const total = threads.length;
    const resolved = threads.filter(
      (t) => t.threadStatus === "RESOLVED"
    ).length;
    const open = total - resolved;
    const classroom = threads.filter(
      (t) => t.threadType === "classroom"
    ).length;
    const generic = threads.filter((t) => t.threadType === "generic").length;

    return { total, resolved, open, classroom, generic };
  }, [threads]);

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {isLoading || isCreating ? (
              <span className="flex items-center gap-2">
                Discussion Threads
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </span>
            ) : (
              "Discussion Threads"
            )}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            {isLoading ? (
              <>
                <span>• Loading...</span>
                <span>• Loading...</span>
                <span>• Loading...</span>
                {!classroomContext && (
                  <>
                    <span>• Loading...</span>
                    <span>• Loading...</span>
                  </>
                )}
              </>
            ) : (
              <>
                <span>• {threadStats.total} Total</span>
                <span className="text-green-400">
                  • {threadStats.resolved} Resolved
                </span>
                <span className="text-red-400">• {threadStats.open} Open</span>
                {!classroomContext && (
                  <>
                    <span className="text-green-400">
                      • {threadStats.classroom} Classroom
                    </span>
                    <span className="text-blue-400">
                      • {threadStats.generic} Global
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Create Thread Buttons and Filter */}
        <div className="flex items-center gap-3">
          {/* Context Indicator */}
          {/* <div className="text-xs text-gray-400">
            {classroomContext ? (
              <span>Classroom Context</span>
            ) : (
              <span>Global Context</span>
            )}
          </div> */}

          {/* Filter Dropdown */}
          <div className="relative filter-dropdown-container">
            {/* Filter Button */}
            <button
              onClick={() => {
                console.log(
                  "🔄 Filter button clicked, current state:",
                  isFilterOpen
                );
                setIsFilterOpen(!isFilterOpen);
                console.log("🔄 Setting filter dropdown to:", !isFilterOpen);
              }}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>{selectedSortOption}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isFilterOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Filter Dropdown Menu */}
            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setSelectedSortOption(option.label);
                        setIsFilterOpen(false);

                        // Notify parent of filter changes
                        if (onFiltersChange) {
                          console.log("🔄 Sort option clicked:", option);
                          console.log("🔄 Calling onFiltersChange with:", {
                            sortBy: option.value,
                          });
                          onFiltersChange({
                            sortBy: option.value, // Use UI value directly
                          });
                        }
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Show "New Question" button ONLY for classroom context */}
          {classroomContext ? (
            <button
              onClick={() => onCreateThread("classroom")}
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || isCreating}
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  New Question
                </>
              )}
            </button>
          ) : (
            /* Show "New Discussion" button ONLY for global context */
            <button
              onClick={() => onCreateThread("generic")}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || isCreating}
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  New Discussion
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-red-400 font-medium">
                Error loading threads
              </span>
            </div>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="text-red-400 hover:text-red-300 text-sm underline"
              >
                Try again
              </button>
            )}
          </div>
          <p className="text-red-300 text-sm mt-2">{error}</p>
        </div>
      )}

      {/* Success Display */}
      {success && (
        <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-green-400 font-medium">{success}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="bg-gray-800 border border-gray-600 rounded-lg p-6 animate-pulse"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Threads List */}
      {!isLoading && (
        <div className="space-y-4">
          {sortedThreads.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                {threads.length === 0 ? (
                  <>
                    <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No discussions yet</p>
                    <p className="text-sm">
                      Start the conversation by creating the first thread!
                    </p>
                  </>
                ) : (
                  <>
                    <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">
                      No threads match your filters
                    </p>
                    <p className="text-sm">
                      Try adjusting your search or filter criteria
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : (
            sortedThreads.map((thread) => (
              <EnhancedThreadCard
                key={thread.id}
                thread={thread}
                onClick={() => onThreadClick(thread)}
                showClassroomInfo={!classroomContext}
                onLikeToggle={(threadId, newLikeCount, isLiked) => {
                  // Notify parent component about the like change
                  if (onThreadLikeToggle) {
                    onThreadLikeToggle(threadId, newLikeCount, isLiked);
                  }
                }}
                onDelete={handleThreadDelete}
                onChangesOccurred={onChangesOccurred}
              />
            ))
          )}
        </div>
      )}

      {/* Load More or Pagination could go here */}
    </div>
  );
};

export default ThreadsList;
