import React, { useState, useEffect } from "react";
import { Plus, Search, MessageCircle } from "lucide-react";
import ThreadCard from "./ThreadCard";
import ThreadDetailView from "./ThreadDetailView";
import NewThreadModal from "./NewThreadModal";
import { Thread, ThreadStatus } from "../../types/thread";

interface ThreadsTabProps {
  classroomId: string;
  units: Array<{ id: string; name: string }>;
}

const ThreadsTab: React.FC<ThreadsTabProps> = ({ classroomId, units }) => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isNewThreadModalOpen, setIsNewThreadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<ThreadStatus>(
    ThreadStatus.ALL
  );
  const [sortBy, setSortBy] = useState<"recent" | "replies" | "created">(
    "recent"
  );
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    const mockThreads: Thread[] = [
      {
        id: "1",
        title: "How to solve quadratic equations with complex roots?",
        content:
          "I'm struggling with understanding how to handle quadratic equations when the discriminant is negative. Can someone explain the process?",
        authorId: "student1",
        authorName: "Alice Johnson",
        unitId: "unit1",
        unitName: "Algebra Fundamentals",
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T14:20:00Z",
        isResolved: false,
        repliesCount: 3,

        tags: ["quadratic", "complex-numbers", "algebra"],
        lastReplyAt: "2024-01-15T14:20:00Z",
        lastReplyBy: "Dr. Smith",
      },
      {
        id: "2",
        title: "Understanding the Pythagorean theorem proof",
        content:
          "I need help understanding the geometric proof of the Pythagorean theorem. The visual representations are confusing me.",
        authorId: "student2",
        authorName: "Bob Chen",
        unitId: "unit2",
        unitName: "Geometry Basics",
        createdAt: "2024-01-14T09:15:00Z",
        updatedAt: "2024-01-14T16:45:00Z",
        isResolved: true,
        repliesCount: 5,

        tags: ["pythagorean", "geometry", "proof"],
        lastReplyAt: "2024-01-14T16:45:00Z",
        lastReplyBy: "Teaching Assistant",
      },
      {
        id: "3",
        title: "Confusion about derivative rules",
        content:
          "When should I use the product rule vs the chain rule? I keep mixing them up during exams.",
        authorId: "student3",
        authorName: "Carol Davis",
        unitId: "unit3",
        unitName: "Calculus Introduction",
        createdAt: "2024-01-13T11:20:00Z",
        updatedAt: "2024-01-13T11:20:00Z",
        isResolved: false,
        repliesCount: 0,

        tags: ["calculus", "derivatives", "rules"],
      },
    ];
    setThreads(mockThreads);
  }, []);

  const filteredThreads = threads.filter((thread) => {
    const matchesSearch =
      thread.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesUnit =
      selectedUnit === "ALL" || thread.unitId === selectedUnit;

    const matchesStatus =
      statusFilter === ThreadStatus.ALL ||
      (statusFilter === ThreadStatus.RESOLVED && thread.isResolved) ||
      (statusFilter === ThreadStatus.UNRESOLVED && !thread.isResolved);
    // (statusFilter === ThreadStatus.AI_SUGGESTED && thread.aiSuggestedAnswer);

    return matchesSearch && matchesUnit && matchesStatus;
  });

  const sortedThreads = [...filteredThreads].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      case "replies":
        return b.repliesCount - a.repliesCount;
      case "created":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      default:
        return 0;
    }
  });

  const handleNewThread = (
    threadData: Omit<
      Thread,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "repliesCount"
      | "isResolved"
      | "hasAiInsights"
    >
  ) => {
    const newThread: Thread = {
      ...threadData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      repliesCount: 0,
      isResolved: false,
      // hasAiInsights: Math.random() > 0.3, // 70% chance of AI insights
    };

    setThreads((prev) => [newThread, ...prev]);
    setIsNewThreadModalOpen(false);
  };

  const getStatusStats = () => {
    const total = threads.length;
    const resolved = threads.filter((t) => t.isResolved).length;
    const unresolved = threads.filter((t) => !t.isResolved).length;
    // const aiSuggested = threads.filter((t) => t.aiSuggestedAnswer).length;

    return { total, resolved, unresolved };
  };

  const stats = getStatusStats();

  // Show detailed thread view if a thread is selected
  if (selectedThreadId) {
    return (
      <ThreadDetailView
        threadId={selectedThreadId}
        onBack={() => setSelectedThreadId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-blue-400" />
            Discussion Threads
          </h2>
          <div className="flex gap-4 mt-2 text-sm text-gray-400">
            <span>{stats.total} Total</span>
            <span className="text-green-400">{stats.resolved} Resolved</span>
            <span className="text-red-400">{stats.unresolved} Open</span>
          </div>
        </div>

        <button
          onClick={() => setIsNewThreadModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          <span>New Thread</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search threads..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Unit Filter */}
          <select
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
          >
            <option value="ALL">All Units</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ThreadStatus)}
          >
            <option value={ThreadStatus.ALL}>All Status</option>
            <option value={ThreadStatus.RESOLVED}>Resolved</option>
            <option value={ThreadStatus.UNRESOLVED}>Open</option>
          </select>

          {/* Sort By */}
          <select
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "recent" | "replies" | "created")
            }
          >
            <option value="recent">Latest Activity</option>
            <option value="replies">Most Replies</option>
            <option value="created">Newest First</option>
          </select>
        </div>
      </div>

      {/* Threads List */}
      <div className="space-y-4">
        {sortedThreads.length === 0 ? (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center">
            <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">
              {searchTerm ||
              selectedUnit !== "ALL" ||
              statusFilter !== ThreadStatus.ALL
                ? "No threads found matching your criteria"
                : "No threads yet. Be the first to start a discussion!"}
            </p>
            {searchTerm ||
            selectedUnit !== "ALL" ||
            statusFilter !== ThreadStatus.ALL ? (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedUnit("ALL");
                  setStatusFilter(ThreadStatus.ALL);
                }}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Clear filters
              </button>
            ) : (
              <button
                onClick={() => setIsNewThreadModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Start a Discussion
              </button>
            )}
          </div>
        ) : (
          sortedThreads.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              onClick={() => setSelectedThreadId(thread.id)}
            />
          ))
        )}
      </div>

      {/* New Thread Modal */}
      {isNewThreadModalOpen && (
        <NewThreadModal
          classroomId={classroomId}
          units={units}
          onClose={() => setIsNewThreadModalOpen(false)}
          onSubmit={handleNewThread}
        />
      )}
    </div>
  );
};

export default ThreadsTab;
