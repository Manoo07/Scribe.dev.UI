// utils/threadUtils.ts
import { Reply, Thread } from "./threadTypes";

export const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

export const updateVoteInReplies = (
  replies: Reply[],
  replyId: string,
  voteType: "up" | "down"
): Reply[] => {
  return replies.map((reply) => {
    if (reply.id === replyId) {
      let newUpvotes = reply.upvotes;
      let newDownvotes = reply.downvotes;
      let newUserVote: "up" | "down" | null = voteType;

      if (reply.userVote === voteType) {
        newUserVote = null;
        if (voteType === "up") newUpvotes--;
        else newDownvotes--;
      } else {
        if (reply.userVote === "up") newUpvotes--;
        if (reply.userVote === "down") newDownvotes--;

        if (voteType === "up") newUpvotes++;
        else newDownvotes++;
      }

      return {
        ...reply,
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        userVote: newUserVote,
      };
    }
    if (reply.replies) {
      return {
        ...reply,
        replies: updateVoteInReplies(reply.replies, replyId, voteType),
      };
    }
    return reply;
  });
};

export const addReplyToNested = (
  replies: Reply[],
  parentId: string,
  newReply: Reply
): Reply[] => {
  return replies.map((reply) => {
    if (reply.id === parentId) {
      return {
        ...reply,
        replies: [
          ...(reply.replies || []),
          { ...newReply, depth: reply.depth + 1 },
        ],
      };
    }
    if (reply.replies) {
      return {
        ...reply,
        replies: addReplyToNested(reply.replies, parentId, newReply),
      };
    }
    return reply;
  });
};

// Mock data
export const getMockThreads = (): Thread[] => [
  {
    id: "1",
    title: "Why Custom Agents Orchestrators?",
    description:
      "I am observing a lot of people writing custom orchestrators to manage their agentic workflows, I fail to understand why?\n\nThis is really troubling me, is it just an ego question to write custom orchestrators or just about laziness to search online or there is some actual need which current frameworks/orchestrators (langgraph, autogen and so many others) are unable to fulfill.\n\nHelp me!",
    author: { name: "jain-nivedit", id: "user1" },
    unit: { name: "Question | Help", id: "unit1" },
    createdAt: "2024-01-15T10:30:00Z",
    repliesCount: 10,
    lastReply: {
      author: "nullcone",
      createdAt: "2024-01-15T14:45:00Z",
    },
    upvotes: 3,
    downvotes: 0,
    userVote: null,
  },
];

export const getMockReplies = (): Reply[] => [
  {
    id: "1",
    content:
      "Remember every request includes the full history, all toolcalls, all responses etc",
    author: { name: "Due-Horse-5446", id: "user2" },
    createdAt: "2024-01-15T11:00:00Z",
    upvotes: 43,
    downvotes: 0,
    userVote: null,
    depth: 0,
    replies: [
      {
        id: "2",
        content: "Yes exactly!",
        author: { name: "jain-nivedit", id: "user1" },
        createdAt: "2024-01-15T11:30:00Z",
        upvotes: 3,
        downvotes: 0,
        userVote: null,
        parentId: "1",
        depth: 1,
      },
    ],
  },
  {
    id: "3",
    content:
      "When you have the LLM on a good path(it did a task like 95%+ correct) ask it to export a detailed yet compressed memory file in .md format. It'll just spit out a markdown file and summarize the chat and put what it did at a high level and then add next steps.\n\nIn a new chat reference these files and start there. I find it gives very accurate results and uses less tokens.",
    author: { name: "-hellozukohere-", id: "user3" },
    createdAt: "2024-01-15T11:45:00Z",
    upvotes: 35,
    downvotes: 0,
    userVote: null,
    depth: 0,
    replies: [
      {
        id: "4",
        content:
          "Thats a nice point. What I actually do is, I discuss with gemini pro in AI studio, and after the tech design, I tell it to spit out a tech design doc, and use that in cursor. Works like a charm",
        author: { name: "jain-nivedit", id: "user1" },
        createdAt: "2024-01-15T12:00:00Z",
        upvotes: 8,
        downvotes: 0,
        userVote: null,
        parentId: "3",
        depth: 1,
        replies: [
          {
            id: "5",
            content: "Ya I have found something similar.",
            author: { name: "-hellozukohere-", id: "user3" },
            createdAt: "2024-01-15T12:15:00Z",
            upvotes: 4,
            downvotes: 0,
            userVote: null,
            parentId: "4",
            depth: 2,
          },
        ],
      },
      {
        id: "6",
        content:
          "GPT 6 thinking to create a plan with referenced files and items I need done. I find it very meticulous and accurate. And break down into smaller tasks and a small description and ask it to use a 5 graded point system on difficulty.\n\nThen I feed opus 3+ tasks and sonnet 1-3 depending. Seems to work like a charm.",
        author: { name: "-hellozukohere-", id: "user3" },
        createdAt: "2024-01-15T12:30:00Z",
        upvotes: 4,
        downvotes: 0,
        userVote: null,
        parentId: "3",
        depth: 1,
        replies: [
          {
            id: "7",
            content:
              "Try gemini 2.5 pro in AI studio to create a plan. It is free and large context window.",
            author: { name: "jain-nivedit", id: "user1" },
            createdAt: "2024-01-15T12:45:00Z",
            upvotes: 3,
            downvotes: 0,
            userVote: null,
            parentId: "6",
            depth: 2,
          },
          {
            id: "8",
            content: "I'll give it a go. Thanks for the advice.",
            author: { name: "-hellozukohere-", id: "user3" },
            createdAt: "2024-01-15T13:00:00Z",
            upvotes: 0,
            downvotes: 0,
            userVote: null,
            parentId: "7",
            depth: 3,
          },
        ],
      },
    ],
  },
  {
    id: "9",
    content:
      "Because our way is the way we want it and others ways are harder to get to do what you want.\n\n**Beauty** of local models and custom software is it does what you want how you want",
    author: { name: "fasti-au", id: "user4" },
    createdAt: "2024-01-15T13:30:00Z",
    upvotes: 3,
    downvotes: 0,
    userVote: null,
    depth: 0,
    replies: [
      {
        id: "10",
        content: "I mean, React, Django, FastAPI are frameworks we all love (:",
        author: { name: "jain-nivedit", id: "user1" },
        createdAt: "2024-01-15T13:45:00Z",
        upvotes: 1,
        downvotes: 0,
        userVote: null,
        parentId: "9",
        depth: 1,
      },
    ],
  },
];
