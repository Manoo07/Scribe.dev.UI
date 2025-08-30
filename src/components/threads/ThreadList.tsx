import {
  ChevronDown,
  Filter,
  Globe,
  MessageSquare,
  Search,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import EnhancedThreadCard from "./EnhancedThreadCard";
import { Thread } from "./threadTypes";

interface ThreadsListProps {
  threads: Thread[];
  isLoading?: boolean;
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
}

const ThreadsList: React.FC<ThreadsListProps> = ({
  threads,
  isLoading = false,
  onThreadClick,
  onCreateThread,
  showFilters = true,
  classroomContext,
  selectedUnit = "all",
  setSelectedUnit,
  error,
  success,
  onRefresh,
  isCreating = false,
  onChangesOccurred,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedThreadType, setSelectedThreadType] = useState<
    "all" | "classroom" | "generic"
  >("all");
  // selectedUnit and setSelectedUnit are now controlled from parent (ThreadManager)
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "replies" | "created">(
    "recent"
  );

  // Filter dropdown state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedSortOption, setSelectedSortOption] = useState("Most Recent");

  // Sort options for the dropdown
  const sortOptions = [
    { value: "recent", label: "Most Recent" },
    { value: "replies", label: "Most Replied" },
    { value: "created", label: "Newest" },
    { value: "likes", label: "Most Liked" },
    { value: "title", label: "Alphabetical" },
  ];

  // Click outside handler to close filter dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isFilterOpen) {
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

  // Filter and sort threads
  const filteredThreads = useMemo(() => {
    let filtered = threads;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (thread) =>
          thread.title.toLowerCase().includes(query) ||
          thread.content.toLowerCase().includes(query) ||
          (thread.user?.name || thread.authorName || "")
            .toLowerCase()
            .includes(query) ||
          (Array.isArray(thread.tags) &&
            thread.tags.some((tag) => tag.toLowerCase().includes(query)))
      );
    }

    // Thread type filter
    if (selectedThreadType !== "all") {
      filtered = filtered.filter(
        (thread) => thread.threadType === selectedThreadType
      );
    }

    // Unit filter (for classroom threads)
    if (selectedUnit !== "all") {
      filtered = filtered.filter(
        (thread) =>
          thread.threadType === "classroom" && thread.unitId === selectedUnit
      );
    }

    // Category filter (for generic threads)
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (thread) =>
          thread.threadType === "generic" &&
          thread.category === selectedCategory
      );
    }

    // Sort threads
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return (
            new Date(b.updatedAt || b.createdAt).getTime() -
            new Date(a.updatedAt || a.createdAt).getTime()
          );
        case "replies":
          return (b.repliesCount || 0) - (a.repliesCount || 0);
        case "created":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    threads,
    searchQuery,
    selectedThreadType,
    selectedUnit,
    selectedCategory,
    sortBy,
  ]);

  const threadStats = useMemo(() => {
    const total = threads.length;
    const resolved = threads.filter((t) => t.isResolved).length;
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
          <div className="text-xs text-gray-400">
            {classroomContext ? (
              <span>Classroom Context</span>
            ) : (
              <span>Global Context</span>
            )}
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors border border-gray-600"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm">{selectedSortOption}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Filter Dropdown Menu */}
            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedSortOption(option.label);
                        setIsFilterOpen(false);
                        // TODO: Implement sorting logic
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
          {filteredThreads.length === 0 ? (
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
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
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
            filteredThreads.map((thread) => (
              <EnhancedThreadCard
                key={thread.id}
                thread={thread}
                onClick={() => onThreadClick(thread)}
                showClassroomInfo={!classroomContext}
                onLikeToggle={(_threadId, _newLikeCount, _isLiked) => {
                  // The local state in EnhancedThreadCard handles the UI update
                  // You can add a callback prop to notify parent component if needed
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
