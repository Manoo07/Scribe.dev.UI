// types/threads.ts
export interface Thread {
  id: string;
  title: string;
  description: string;
  author: {
    name: string;
    id: string;
  };
  unit?: {
    name: string;
    id: string;
  };
  createdAt: string;
  updatedAt?: string;
  repliesCount: number;
  lastReply?: {
    author: string;
    createdAt: string;
  };
  tags?: string[];
  upvotes: number;
  downvotes: number;
  userVote?: "up" | "down" | null;
}

export interface Reply {
  id: string;
  content: string;
  author: {
    name: string;
    id: string;
  };
  createdAt: string;
  updatedAt?: string;
  isAcceptedAnswer?: boolean;
  upvotes: number;
  downvotes: number;
  userVote?: "up" | "down" | null;
  parentId?: string;
  replies?: Reply[];
  depth: number;
  collapsed?: boolean;
}

export interface Unit {
  id: string;
  name: string;
}

export interface ThreadFormData {
  title: string;
  description: string;
  unitId: string;
}
