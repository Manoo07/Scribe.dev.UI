import React, { useEffect, useState } from "react";
import {
  createThread,
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
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const pageSize = 10;

  // Fetch threads from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let data;
        if (context === "classroom" && classroomData?.id) {
          if (selectedUnit && selectedUnit !== "all") {
            data = await fetchUnitThreads(selectedUnit, page, pageSize);
          } else {
            data = await fetchThreads(page, pageSize);
          }
        } else {
          data = await fetchThreads(page, pageSize);
        }
        setThreads(data.threads || []);
        setHasNext(data.pagination?.hasNext || false);
        setTotal(data.pagination?.total || 0);
      } catch (err) {
        setThreads([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [context, classroomData?.id, page, selectedUnit]);

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
    try {
      await createThread(threadData);
      setPage(1); // Reset to first page after creating
    } catch (e) {
      // Optionally show error toast
    }
    setShowCreateModal(false);
  };

  const handleThreadClick = (thread: Thread) => {
    setSelectedThread(thread);
  };

  const handleBackToList = () => {
    setSelectedThread(null);
  };

  if (selectedThread) {
    return (
      <ThreadDetailView
        threadId={selectedThread.id}
        onBack={handleBackToList}
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
      />

      {/* Pagination Controls */}
      <div className="flex justify-center mt-6">
        <button
          className="px-4 py-2 bg-gray-700 text-white rounded mr-2 disabled:opacity-50"
          disabled={page === 1 || isLoading}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </button>
        <span className="px-4 py-2 text-gray-400">Page {page}</span>
        <button
          className="px-4 py-2 bg-gray-700 text-white rounded ml-2 disabled:opacity-50"
          disabled={!hasNext || isLoading}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      {showCreateModal && (
        <EnhancedNewThreadModal
          threadType={createModalType}
          units={context === "classroom" ? classroomData?.units : undefined}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleSubmitThread}
        />
      )}
    </div>
  );
};

export default ThreadsManager;
