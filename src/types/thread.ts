export interface Thread {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  unitId: string;
  unitName: string;
  createdAt: string;
  updatedAt: string;
  isResolved: boolean;
  repliesCount: number;
  tags: string[];
  lastReplyAt?: string;
  lastReplyBy?: string;
}

export interface ThreadReply {
  id: string;
  threadId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  isMarkedAsAnswer: boolean;
}

export enum ThreadStatus {
  ALL = "ALL",
  RESOLVED = "RESOLVED",
  UNRESOLVED = "UNRESOLVED",
}
