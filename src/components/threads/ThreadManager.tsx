import React, { useCallback, useEffect, useState } from "react";
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

  // Track if data needs refresh
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Fetch threads from API
  const fetchData = useCallback(async () => {
    console.log("🔄 fetchData called with:", {
      context,
      classroomId: classroomData?.id,
      selectedUnit,
      page,
      pageSize,
    });

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
          // Fetch all threads for the classroom
          console.log("🔄 Fetching classroom threads for:", classroomData.id);
          data = await fetchClassroomThreads(classroomData.id, page, pageSize);
        }
      } else {
        // Fetch global threads
        console.log("🔄 Fetching global threads");
        data = await fetchThreads(page, pageSize);
      }

      console.log("✅ Data fetched successfully:", {
        threadsCount: data.threads?.length || 0,
        hasNext: data.pagination?.hasNext || false,
        total: data.pagination?.total || 0,
      });

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
      console.log("🔄 fetchData completed, loading state set to false");
    }
  }, [context, classroomData?.id, page, selectedUnit, pageSize, toast]);

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
    console.log("🔄 Going back to threads list, hasChanges:", hasChanges);

    // Always refresh data when going back to ensure we have the latest information
    // This handles cases where changes might not have been properly tracked
    if (hasChanges) {
      console.log("📝 Changes detected, performing smart refresh");
      handleSmartRefresh();
    } else {
      console.log(
        "🔄 No changes detected, but refreshing anyway to ensure data consistency"
      );
      fetchData();
    }

    setSelectedThread(null);
  };

  const handleRefresh = () => {
    fetchData();
  };

  // Smart refresh that only fetches data when there are changes
  const handleSmartRefresh = useCallback(async () => {
    console.log("🔄 handleSmartRefresh called, hasChanges:", hasChanges);

    // If no changes detected, don't make API call
    if (!hasChanges) {
      console.log("🔄 No changes detected, skipping API call");
      return;
    }

    console.log("🔄 Changes detected, refreshing data...");
    setHasChanges(false);
    console.log("🔄 Fetching updated data...");
    await fetchData();
    console.log("🔄 Data refresh completed");
  }, [hasChanges, fetchData]);

  // Mark that changes have occurred (called by child components)
  const markChangesOccurred = useCallback(() => {
    console.log("📝 markChangesOccurred called - setting hasChanges to true");
    setHasChanges(true);
    console.log("📝 Changes marked - data needs refresh");
  }, []);

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
