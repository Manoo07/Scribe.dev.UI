// types/thread.ts
export interface BaseThread {
  id: string;
  title: string;
  content: string;
  user: {
    id: string;
    name: string;
  };
  threadStatus: "UNANSWERED" | "ANSWERED" | "RESOLVED" | "CLOSED";
  createdAt: string;
  updatedAt?: string;
  acceptedAnswerId?: string | null;
  likesCount: number;
  isLikedByMe: boolean;
  replies?: {
    data: ThreadReply[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      hasNext: boolean;
    };
  };
  // Legacy fields for backward compatibility
  authorId?: string;
  authorName?: string;
  isResolved?: boolean;
  repliesCount?: number;
  tags?: string[];
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
  user: {
    id: string;
    name: string;
  }; 
}

// Generic thread visible to all
export interface GenericThread extends BaseThread {
  threadType: "generic";
  category: string; // e.g., 'general', 'announcements', 'help', 'discussion'
  visibility: "public" | "restricted"; // public for all users, restricted for certain roles
  allowedRoles?: string[]; // if visibility is restricted
  user: {
    id: string;
    name: string;
  };
}

export type Thread = ClassroomThread | GenericThread;

export interface ThreadReply {
  id: string;
  content: string;
  user: {
    id: string;
    name: string;
  };
  createdAt: string;
  likesCount: number;
  isAccepted: boolean;
  isLikedByMe: boolean;
  // Legacy fields for backward compatibility
  threadId?: string;
  authorId?: string;
  authorName?: string;
  isMarkedAsAnswer?: boolean;
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

// Thread creation payload interface
export interface CreateThreadPayload {
  title: string;
  content: string;
  unitId?: string;
  classroomId?: string;
}

// Reply creation payload
export interface CreateReplyPayload {
  content: string;
  threadId: string;
  parentReplyId?: string;
}

// Enhanced thread and reply interfaces with like counts and user like status
export interface ThreadWithLikes extends BaseThread {
  threadType: "classroom" | "generic";
  // Classroom-specific fields
  classroomId?: string;
  classroomName?: string;
  unitId?: string;
  unitName?: string;
  // Generic-specific fields
  category?: string;
  visibility?: "public" | "restricted";
  allowedRoles?: string[];
}

export interface ThreadReplyWithLikes extends ThreadReply {
  // Already includes likesCount and isLikedByMe
}
