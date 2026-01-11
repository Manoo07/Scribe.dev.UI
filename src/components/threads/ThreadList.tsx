import { ChevronDown, MessageSquare, Plus } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ThreadCard from "./ThreadCard";
import { Thread } from "./threadTypes";
import { threadKeys } from "../../hooks/threads/useThreadQueries";

interface ThreadsListProps {
  threads: Thread[];
  isLoading: boolean;
  onThreadClick: (thread: Thread) => void;
  onCreateThread: () => void;
  classroomContext?: {
    id: string;
    name: string;
  };
}

const ThreadsList: React.FC<ThreadsListProps> = ({
  threads,
  isLoading,
  onThreadClick,
  onCreateThread,
  classroomContext,
}) => {
  const [sortBy, setSortBy] = useState<string>("new");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleThreadLikeToggle = () => {
    // Invalidate the threads list to refetch with updated like counts
    queryClient.invalidateQueries({ queryKey: threadKeys.lists() });
  };

  const sortOptions = [
    { value: "new", label: "New" },
    { value: "top", label: "Top" },
    { value: "hot", label: "Hot" },
  ];

  const sortedThreads = useMemo(() => {
    return [...threads].sort((a, b) => {
      switch (sortBy) {
        case "top":
          return (b.likesCount || 0) - (a.likesCount || 0);
        case "hot":
          const aScore = (a.likesCount || 0) + (a.repliesCount || 0) * 2;
          const bScore = (b.likesCount || 0) + (b.repliesCount || 0) * 2;
          return bScore - aScore;
        case "new":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });
  }, [threads, sortBy]);

  const threadStats = useMemo(() => {
    const total = threads.length;
    const resolved = threads.filter((t) => t.isResolved).length;
    const open = total - resolved;
    return { total, resolved, open };
  }, [threads]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gray-800 border border-gray-700/50 rounded-lg p-4 animate-pulse flex gap-3"
          >
            <div className="w-10 flex flex-col items-center gap-2">
              <div className="w-5 h-5 bg-gray-700 rounded"></div>
              <div className="w-8 h-4 bg-gray-700 rounded"></div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-700 rounded w-full"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-400">{threadStats.total} Total</span>
          <span className="text-green-400">• {threadStats.resolved} Resolved</span>
          <span className="text-red-400">• {threadStats.open} Open</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg border border-gray-700 transition-colors"
            >
              <span>
                {sortOptions.find((opt) => opt.value === sortBy)?.label}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* New Question Button */}
          <button
            onClick={onCreateThread}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Question</span>
          </button>
        </div>
      </div>

      {/* Threads */}
      <div className="space-y-3 px-4">
        {sortedThreads.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/50 border border-gray-700 rounded-lg">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 mb-2">No discussions yet</p>
            <p className="text-gray-500 text-sm">
              Be the first to start a conversation
            </p>
          </div>
        ) : (
          sortedThreads.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              onClick={() => onThreadClick(thread)}
              onLikeToggle={handleThreadLikeToggle}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ThreadsList;
