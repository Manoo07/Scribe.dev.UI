import React, { useState } from "react";
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
  const [threads, setThreads] = useState<Thread[]>([
    // Example classroom thread
    {
      id: "1",
      threadType: "classroom",
      title: "How to solve quadratic equations with complex roots?",
      content:
        "I'm struggling with understanding how to handle quadratic equations when the discriminant is negative. Can someone explain the process step by step? I've been working on this problem: x² + 2x + 5 = 0, and I keep getting confused when I reach the square root of a negative number.",
      authorId: "student1",
      authorName: "Alice Johnson",
      classroomId: "classroom1",
      classroomName: "Advanced Algebra",
      unitId: "unit1",
      unitName: "Quadratic Equations",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T14:20:00Z",
      isResolved: false,
      repliesCount: 3,
      tags: ["quadratic", "complex-numbers", "algebra"],
      lastReplyAt: "2024-01-15T14:20:00Z",
      lastReplyBy: "Dr. Smith",
      hasAiInsights: true,
    },
    // Example generic thread
    {
      id: "2",
      threadType: "generic",
      title: "Best practices for collaborative learning in STEM",
      content:
        "I've been experimenting with different collaborative learning techniques in my STEM classes and wanted to share some insights and hear about others' experiences. \n\n**What's worked well:**\n- Small group problem-solving sessions\n- Peer teaching exercises\n- Cross-classroom project collaborations\n\nWhat strategies have you found most effective?",
      authorId: "teacher1",
      authorName: "Dr. Sarah Wilson",
      category: "general",
      visibility: "public",
      createdAt: "2024-01-14T09:15:00Z",
      updatedAt: "2024-01-16T11:30:00Z",
      isResolved: false,
      repliesCount: 8,
      tags: ["collaboration", "stem", "teaching", "best-practices"],
      lastReplyAt: "2024-01-16T11:30:00Z",
      lastReplyBy: "Prof. Martinez",
    },
    // Example generic announcement
    {
      id: "3",
      threadType: "generic",
      title: "New AI-Powered Study Tools Now Available",
      content:
        "We're excited to announce the launch of our new AI-powered study tools! These features include:\n\n- **Smart Study Plans**: Personalized learning paths based on your progress\n- **Concept Explanations**: AI-generated explanations for complex topics\n- **Practice Problem Generation**: Unlimited practice questions tailored to your level\n\nThese tools are now available across all subjects. Check them out and let us know what you think!",
      authorId: "admin1",
      authorName: "Platform Admin",
      category: "announcements",
      visibility: "public",
      createdAt: "2024-01-16T08:00:00Z",
      updatedAt: "2024-01-16T08:00:00Z",
      isResolved: false,
      repliesCount: 12,
      tags: ["ai", "study-tools", "announcement", "features"],
      lastReplyAt: "2024-01-16T15:45:00Z",
      lastReplyBy: "excited_student",
    },
    // Another classroom thread from different classroom
    {
      id: "4",
      threadType: "classroom",
      title: "Help with organic chemistry mechanisms",
      content:
        "I'm having trouble understanding the SN2 reaction mechanism. Could someone explain why the nucleophile attacks from the back side?",
      authorId: "student2",
      authorName: "Bob Chen",
      classroomId: "classroom2",
      classroomName: "Organic Chemistry 101",
      unitId: "unit5",
      unitName: "Substitution Reactions",
      createdAt: "2024-01-16T13:20:00Z",
      updatedAt: "2024-01-16T13:20:00Z",
      isResolved: false,
      repliesCount: 0,
      tags: ["organic-chemistry", "mechanisms", "sn2"],
      hasAiInsights: false,
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalType, setCreateModalType] = useState<
    "classroom" | "generic"
  >("generic");
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);

  const handleCreateThread = (threadType: "classroom" | "generic") => {
    setCreateModalType(threadType);
    setShowCreateModal(true);
  };

  const handleSubmitThread = async (
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
      hasAiInsights: false,
    } as Thread;

    setThreads((prev) => [newThread, ...prev]);
    setShowCreateModal(false);
  };

  const handleThreadClick = (thread: Thread) => {
    setSelectedThread(thread);
  };

  const handleBackToList = () => {
    setSelectedThread(null);
  };

  // Filter threads based on context
  const contextualThreads =
    context === "classroom" && classroomData
      ? threads.filter(
          (thread) =>
            // Show classroom-specific threads for this classroom
            (thread.threadType === "classroom" &&
              thread.classroomId === classroomData.id) ||
            // Also show global threads (they're visible everywhere)
            thread.threadType === "generic"
        )
      : threads; // In global context, show all threads

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
        threads={contextualThreads}
        onThreadClick={handleThreadClick}
        onCreateThread={handleCreateThread}
        showFilters={true}
        classroomContext={context === "classroom" ? classroomData : undefined}
      />

      {showCreateModal && (
        <EnhancedNewThreadModal
          threadType={createModalType}
          classroomId={context === "classroom" ? classroomData?.id : undefined}
          classroomName={
            context === "classroom" ? classroomData?.name : undefined
          }
          units={context === "classroom" ? classroomData?.units : undefined}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleSubmitThread}
        />
      )}
    </div>
  );
};

export default ThreadsManager;
