import React, { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "../../hooks/use-toast";
import {
  createThread,
  fetchClassroomThreads,
  fetchThreads,
  fetchUnitThreads,
} from "../../services/api";
import EnhancedNewThreadModal from "./EnhancedNewThreadModal";
import ThreadDetailView from "./ThreadDetailView";
import ThreadsList from "./ThreadList";
import { Thread } from "./threadTypes";

interface ThreadsManagerProps {
  context: "global" | "classroom";
  classroomData?: {
    id: string;
    name: string;
    units: Array<{ id: string; name: string }>;
  };
}

const ThreadsManager: React.FC<ThreadsManagerProps> = ({
  context,
  classroomData,
}) => {
  const { toast } = useToast();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const pageSize = 10;

  // Filter state with proper API mapping
  const [currentFilters, setCurrentFilters] = useState({
    sortBy: "mostRecent", // Default to mostRecent
    limit: 20, // Default limit
  });

  // Use ref to store current filters to avoid dependency issues
  const currentFiltersRef = useRef({
    sortBy: "mostRecent",
    limit: 20,
  });

  // Use ref to store classroom data to avoid dependency issues
  const classroomDataRef = useRef(classroomData);

  // Track if data needs refresh
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Fetch threads from API
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let data;

      // Map current filters to API format inline to avoid dependency issues
      const apiFilters = (() => {
        const filters = { ...currentFiltersRef.current };
        switch (filters.sortBy) {
          case "mostRecent":
            filters.sortBy = "mostRecent";
            filters.limit = 20;
            break;
          case "mostReplied":
            filters.sortBy = "mostReplied";
            filters.limit = 15;
            break;
          case "mostLiked":
            filters.sortBy = "mostLiked";
            filters.limit = 10;
            break;
          case "alphabetical":
            filters.sortBy = "alphabetical";
            filters.limit = 25;
            break;
          default:
            filters.sortBy = "mostRecent";
            filters.limit = 20;
            break;
        }
        return filters;
      })();

      if (context === "classroom" && classroomDataRef.current?.id) {
        if (selectedUnit && selectedUnit !== "all") {
          // Fetch threads for specific unit within classroom
          data = await fetchUnitThreads(selectedUnit, page, pageSize);
        } else {
          // Fetch all threads for the classroom with current filters
          data = await fetchClassroomThreads(
            classroomDataRef.current.id,
            page,
            pageSize,
            apiFilters
          );
        }
      } else {
        // Fetch global threads with current filters
        data = await fetchThreads(page, pageSize, apiFilters);
      }

      setThreads(data.threads || []);
      setHasNext(data.pagination?.hasNext || false);
      setTotal(data.pagination?.total || 0);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch threads";
      setError(errorMessage);
      setThreads([]);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [context, page, selectedUnit, pageSize]);

  // Fetch data with filters
  const fetchDataWithFilters = useCallback(
    async (filters: any) => {
      console.log("🔄 fetchDataWithFilters called with:", filters);
      setIsLoading(true);
      setError(null);
      try {
        let data;

        if (context === "classroom" && classroomData?.id) {
          if (selectedUnit && selectedUnit !== "all") {
            // Fetch threads for specific unit within classroom
            console.log("🔄 Fetching unit threads for:", selectedUnit);
            data = await fetchUnitThreads(selectedUnit, page, pageSize);
          } else {
            // Fetch all threads for the classroom with filters
            console.log("🔄 Fetching classroom threads with filters:", {
              classroomId: classroomData.id,
              filters,
              page,
              pageSize,
            });
            data = await fetchClassroomThreads(
              classroomData.id,
              page,
              pageSize,
              filters
            );
          }
        } else {
          // Fetch global threads with filters
          console.log("🔄 Fetching global threads with filters:", {
            filters,
            page,
            pageSize,
          });
          data = await fetchThreads(page, pageSize, filters);
        }

        setThreads(data.threads || []);
        setHasNext(data.pagination?.hasNext || false);
        setTotal(data.pagination?.total || 0);
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch threads";
        setError(errorMessage);
        setThreads([]);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [context, classroomData?.id, page, selectedUnit, pageSize, toast]
  );

  // Handle filter changes from ThreadList
  const handleFiltersChange = useCallback(
    (filters: { sortBy: string }) => {
      console.log("🔄 Filter change received:", filters);

      // Create the complete filter object
      const newFilters = {
        ...currentFilters,
        ...filters,
      };

      console.log("🔄 Complete filters object:", newFilters);

      // Update the current filters state and ref
      setCurrentFilters(newFilters);
      currentFiltersRef.current = newFilters;

      // Reset to first page when filters change
      setPage(1);

      // Map UI filters to API filters inline and trigger data refresh
      const apiFilters = (() => {
        const mappedFilters = { ...newFilters };
        switch (mappedFilters.sortBy) {
          case "mostRecent":
            mappedFilters.sortBy = "mostRecent";
            mappedFilters.limit = 20;
            break;
          case "mostReplied":
            mappedFilters.sortBy = "mostReplied";
            mappedFilters.limit = 15;
            break;
          case "mostLiked":
            mappedFilters.sortBy = "mostLiked";
            mappedFilters.limit = 10;
            break;
          case "alphabetical":
            mappedFilters.sortBy = "alphabetical";
            mappedFilters.limit = 25;
            break;
          default:
            mappedFilters.sortBy = "mostRecent";
            mappedFilters.limit = 20;
            break;
        }
        return mappedFilters;
      })();

      fetchDataWithFilters(apiFilters);
    },
    [fetchDataWithFilters]
  );

  // Sync ref with state
  useEffect(() => {
    currentFiltersRef.current = currentFilters;
  }, [currentFilters]);

  // Sync classroomData ref
  useEffect(() => {
    classroomDataRef.current = classroomData;
  }, [classroomData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalType, setCreateModalType] = useState<
    "classroom" | "generic"
  >("generic");
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);

  const handleCreateThread = (threadType: "classroom" | "generic") => {
    setCreateModalType(threadType);
    setShowCreateModal(true);
  };

  // threadData: { title, content, unitId? }
  const handleSubmitThread = async (threadData: {
    title: string;
    content: string;
    unitId?: string;
  }) => {
    setIsCreating(true);
    try {
      // Add classroomId if we're in classroom context
      const threadPayload = {
        ...threadData,
        classroomId:
          context === "classroom" && classroomData?.id
            ? classroomData.id
            : undefined,
      };

      await createThread(threadPayload);

      // Show success message
      setSuccess("Thread created successfully!");
      toast({
        title: "Success!",
        description: "Thread created successfully",
        variant: "default",
      });

      // Reset to first page and refresh data
      setPage(1);
      await fetchData();

      // Close modal
      setShowCreateModal(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create thread";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleThreadClick = (thread: Thread) => {
    setSelectedThread(thread);
  };

  const handleBackToList = () => {
    // Always refresh data when going back to ensure we have the latest information
    // This handles cases where changes might not have been properly tracked
    if (hasChanges) {
      handleSmartRefresh();
    } else {
      fetchData();
    }

    setSelectedThread(null);
  };

  const handleRefresh = () => {
    fetchData();
  };

  // Smart refresh that only fetches data when there are changes
  const handleSmartRefresh = useCallback(async () => {
    // If no changes detected, don't make API call
    if (!hasChanges) {
      return;
    }

    setHasChanges(false);

    await fetchData();
  }, [hasChanges, fetchData]);

  // Mark that changes have occurred (called by child components)
  const markChangesOccurred = useCallback(() => {
    setHasChanges(true);
  }, []);

  // Handle thread like toggle updates
  const handleThreadLikeToggle = useCallback(
    (threadId: string, newLikeCount: number, isLiked: boolean) => {
      // Update the thread in the local threads array
      setThreads((prevThreads) =>
        prevThreads.map((thread) =>
          thread.id === threadId
            ? { ...thread, likesCount: newLikeCount, isLikedByMe: isLiked }
            : thread
        )
      );

      // Mark that changes occurred
      markChangesOccurred();
    },
    [markChangesOccurred]
  );

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (selectedThread) {
    return (
      <ThreadDetailView
        threadId={selectedThread.id}
        onBack={handleBackToList}
        onChangesOccurred={markChangesOccurred}
      />
    );
  }

  return (
    <div>
      <ThreadsList
        threads={threads}
        isLoading={isLoading}
        onThreadClick={handleThreadClick}
        onCreateThread={handleCreateThread}
        showFilters={true}
        classroomContext={context === "classroom" ? classroomData : undefined}
        selectedUnit={selectedUnit}
        setSelectedUnit={setSelectedUnit}
        error={error}
        success={success}
        onRefresh={handleRefresh}
        isCreating={isCreating}
        onChangesOccurred={markChangesOccurred}
        onFiltersChange={handleFiltersChange} // Pass the new handler
        onThreadLikeToggle={handleThreadLikeToggle}
      />

      {/* Pagination Controls */}
      <div className="flex justify-center items-center mt-6 gap-4">
        <button
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={page === 1 || isLoading}
          onClick={() => handlePageChange(Math.max(1, page - 1))}
        >
          Previous
        </button>

        <div className="flex items-center gap-2">
          <span className="text-gray-400">Page {page}</span>
          {total > 0 && (
            <span className="text-gray-500 text-sm">
              of {Math.ceil(total / pageSize)}
            </span>
          )}
        </div>

        <button
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={!hasNext || isLoading}
          onClick={() => handlePageChange(page + 1)}
        >
          Next
        </button>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ml-4"
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {showCreateModal && (
        <EnhancedNewThreadModal
          threadType={createModalType}
          units={context === "classroom" ? classroomData?.units : undefined}
          classroomName={
            context === "classroom" ? classroomData?.name : undefined
          }
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleSubmitThread}
          isCreating={isCreating}
        />
      )}
    </div>
  );
};

export default ThreadsManager;
