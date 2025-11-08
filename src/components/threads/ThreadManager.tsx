import React, { useState, useMemo } from "react";
import { useToast } from "../../hooks/use-toast";
import { useThreadsQuery } from "../../hooks/threads/useThreadQueries";
import { 
  useCreateThreadMutation, 
  useToggleThreadLikeMutation 
} from "../../hooks/threads/useThreadMutations";
import EnhancedNewThreadModal from "./EnhancedNewThreadModal";
import ThreadDetailView from "./ThreadDetailView";
import ThreadsList from "./ThreadList";
import { Thread } from "./threadTypes";
import { Thread as ApiThread } from "../../api/endpoints/threads.api";

// Helper function to convert API threads to component threads
const convertApiThreadToComponentThread = (apiThread: ApiThread, context: "global" | "classroom", classroomData?: any): Thread => {
  const baseThread = {
    id: apiThread.id,
    title: apiThread.title,
    content: apiThread.content,
    user: {
      id: apiThread.authorId || "",
      name: apiThread.authorName || "",
    },
    threadStatus: "UNANSWERED" as const,
    createdAt: apiThread.createdAt,
    updatedAt: apiThread.updatedAt,
    acceptedAnswerId: apiThread.acceptedReplyId,
    likesCount: apiThread.likesCount,
    isLikedByMe: apiThread.isLiked,
    // Legacy fields
    authorId: apiThread.authorId,
    authorName: apiThread.authorName,
    repliesCount: apiThread.repliesCount,
  };

  if (context === "classroom" && classroomData) {
    return {
      ...baseThread,
      threadType: "classroom",
      classroomId: apiThread.classroomId || classroomData.id,
      classroomName: classroomData.name,
      unitId: apiThread.unitId || "",
      unitName: apiThread.unitId ? classroomData.units?.find((u: any) => u.id === apiThread.unitId)?.name || "" : "",
    };
  } else {
    return {
      ...baseThread,
      threadType: "generic",
      category: "general",
      visibility: "public",
    };
  }
};

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
  
  // UI State
  const [page, setPage] = useState<number>(1);
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalType, setCreateModalType] = useState<"classroom" | "generic">("generic");
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  
  // Filter state
  const [currentFilters, setCurrentFilters] = useState({
    sortBy: "recent" as "recent" | "popular" | "unanswered",
    limit: 20,
  });

  // Memoize query parameters to prevent unnecessary re-renders
  const queryParams = useMemo(() => {
    const params: any = {
      page,
      limit: currentFilters.limit,
      sortBy: currentFilters.sortBy,
    };

    if (context === "classroom" && classroomData?.id) {
      if (selectedUnit && selectedUnit !== "all") {
        params.unitId = selectedUnit;
      } else {
        params.classroomId = classroomData.id;
      }
    }

    return params;
  }, [context, classroomData?.id, selectedUnit, page, currentFilters]);

  // TanStack Query for fetching threads with optimized settings
  const {
    data: threadsResponse,
    isLoading,
    isFetching,
    error,
    refetch,
    isPlaceholderData,
  } = useThreadsQuery(queryParams);

  // TanStack Query mutations
  const createThreadMutation = useCreateThreadMutation();
  const toggleThreadLikeMutation = useToggleThreadLikeMutation();

  // Extract data from query response and convert to component format
  const threads: Thread[] = useMemo(() => {
    if (!threadsResponse?.threads) return [];
    return threadsResponse.threads.map(apiThread => 
      convertApiThreadToComponentThread(apiThread, context, classroomData)
    );
  }, [threadsResponse?.threads, context, classroomData]);

  const hasNext = threadsResponse?.pagination?.hasMore || false;
  const total = threadsResponse?.pagination?.totalThreads || 0;
  const pageSize = queryParams.limit;

  // Handle filter changes
  const handleFiltersChange = (filters: { sortBy: string }) => {
    setCurrentFilters(prev => ({
      ...prev,
      sortBy: filters.sortBy as "recent" | "popular" | "unanswered",
    }));
    setPage(1); // Reset to first page when filters change
  };

  // Handle thread creation
  const handleCreateThread = (threadType: "classroom" | "generic") => {
    setCreateModalType(threadType);
    setShowCreateModal(true);
  };

  // Handle thread submission with better error handling and success feedback
  const handleSubmitThread = async (threadData: {
    title: string;
    content: string;
    unitId?: string;
  }) => {
    try {
      const threadPayload = {
        ...threadData,
        classroomId:
          context === "classroom" && classroomData?.id
            ? classroomData.id
            : undefined,
      };

      const newThread = await createThreadMutation.mutateAsync(threadPayload);

      toast({
        title: "Success!",
        description: `Thread "${newThread.title}" created successfully`,
        variant: "default",
      });

      setPage(1); // Reset to first page to see new thread
      setShowCreateModal(false);
      
      // Scroll to top to see the new thread
      window.scrollTo({ top: 0, behavior: "smooth" });
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
    }
  };

  // Handle thread click
  const handleThreadClick = (thread: Thread) => {
    setSelectedThread(thread);
  };

  // Handle back to list
  const handleBackToList = () => {
    setSelectedThread(null);
    refetch(); // Refresh data when returning to list
  };

  // Handle refresh
  const handleRefresh = () => {
    refetch();
  };

  // Handle thread like toggle with optimistic updates
  const handleThreadLikeToggle = async (
    threadId: string,
    _newLikeCount: number,
    _isLiked: boolean
  ) => {
    try {
      await toggleThreadLikeMutation.mutateAsync(threadId);
      // The mutation hook will automatically update the cache
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle thread like",
        variant: "destructive",
      });
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Show thread detail view
  if (selectedThread) {
    return (
      <ThreadDetailView
        threadId={selectedThread.id}
        onBack={handleBackToList}
        onChangesOccurred={() => refetch()}
      />
    );
  }

  // Show error from TanStack Query with better error messaging
  const errorMessage = useMemo(() => {
    if (!error) return null;
    
    // Handle different types of errors
    if ((error as any)?.response?.data?.message) {
      return (error as any).response.data.message;
    }
    
    if (error.message) {
      return error.message;
    }
    
    // Handle network errors
    if ((error as any)?.code === 'NETWORK_ERROR') {
      return "Unable to connect to the server. Please check your internet connection.";
    }
    
    // Handle specific status codes
    const status = (error as any)?.response?.status;
    switch (status) {
      case 401:
        return "You are not authorized to view this content.";
      case 403:
        return "You don't have permission to access this resource.";
      case 404:
        return "The requested content was not found.";
      case 500:
        return "A server error occurred. Please try again later.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  }, [error]);

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
        error={errorMessage}
        success={null} // Remove manual success state as TanStack Query handles this
        onRefresh={handleRefresh}
        isCreating={createThreadMutation.isPending}
        onChangesOccurred={() => refetch()}
        onFiltersChange={handleFiltersChange}
        onThreadLikeToggle={handleThreadLikeToggle}
      />

      {/* Pagination Controls with improved loading states */}
      <div className="flex justify-center items-center mt-6 gap-4">
        <button
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={page === 1 || isLoading || isFetching}
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
          {/* Show loading indicator for pagination */}
          {isFetching && !isLoading && (
            <span className="text-blue-500 text-sm ml-2">Updating...</span>
          )}
        </div>

        <button
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={!hasNext || isLoading || isFetching || isPlaceholderData}
          onClick={() => handlePageChange(page + 1)}
        >
          Next
        </button>

        {/* Enhanced Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={isLoading || isFetching}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ml-4"
        >
          {isFetching ? "Refreshing..." : "Refresh"}
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
          isCreating={createThreadMutation.isPending}
        />
      )}
    </div>
  );
};

export default ThreadsManager;
