// types/thread.ts
export interface BaseThread {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  isResolved: boolean;
  repliesCount: number;
  tags: string[];
  lastReplyAt?: string;
  lastReplyBy?: string;
  aiSummary?: string;
  aiSuggestedAnswer?: string;
  hasAiInsights?: boolean;
}

// Classroom-specific thread
export interface ClassroomThread extends BaseThread {
  threadType: "classroom";
  classroomId: string;
  classroomName: string;
  unitId: string;
  unitName: string;
}

// Generic thread visible to all
export interface GenericThread extends BaseThread {
  threadType: "generic";
  category: string; // e.g., 'general', 'announcements', 'help', 'discussion'
  visibility: "public" | "restricted"; // public for all users, restricted for certain roles
  allowedRoles?: string[]; // if visibility is restricted
}

export type Thread = ClassroomThread | GenericThread;

export interface ThreadReply {
  id: string;
  threadId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  isMarkedAsAnswer: boolean;
  isFromAi?: boolean;
  parentReplyId?: string; // for nested replies
}

// Like interface
export interface Like {
  id: string;
  threadId?: string; // optional - for thread likes
  replyId?: string; // optional - for reply likes
  userId: string;
  createdAt: string;
}

// Like request payload
export interface LikeRequest {
  threadId?: string;
  replyId?: string;
}

// Like response
export interface LikeResponse extends Like {}

// Enhanced thread and reply interfaces with like counts and user like status
export interface ThreadWithLikes extends Thread {
  likesCount: number;
  isLikedByUser: boolean;
}

export interface ThreadReplyWithLikes extends ThreadReply {
  likesCount: number;
  isLikedByUser: boolean;
}
