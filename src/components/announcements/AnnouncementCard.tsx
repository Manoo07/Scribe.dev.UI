import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Users, Building, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: "classroom" | "college";
  priority: "low" | "medium" | "high";
  author: string;
  authorId: string;
  classroom?: string;
  createdAt: string;
}

interface AnnouncementCardProps {
  announcement: Announcement;
  currentUserId: string;
  userRole: string;
}

const AnnouncementCard = ({
  announcement,
  currentUserId,
  userRole,
}: AnnouncementCardProps) => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const isMyAnnouncement = announcement.authorId === currentUserId;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400";
      case "medium":
        return "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400";
      case "low":
        return "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400";
      default:
        return "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getTypeIcon = (type: string) => {
    return type === "classroom" ? <Users size={12} /> : <Building size={12} />;
  };

  const getTypeColor = (type: string) => {
    return type === "classroom"
      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
      : "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Card
        className={`w-full max-w-md sm:max-w-full mx-auto sm:mx-0 group transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 border border-gray-200 dark:border-gray-800 shadow-sm bg-white/90 backdrop-blur-sm dark:bg-gray-900/80 cursor-pointer ${
          isMyAnnouncement ? "ring-1 ring-blue-200 dark:ring-blue-800" : ""
        }`}
        onClick={() => setIsDetailModalOpen(true)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-medium">
                  {announcement.author
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white text-sm leading-tight truncate">
                  {announcement.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  <span className="truncate">{announcement.author}</span>
                  {isMyAnnouncement && (
                    <Badge
                      variant="outline"
                      className="text-xs px-1.5 py-0 h-4 bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                    >
                      You
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-1.5 shrink-0">
              <Badge
                className={`${getTypeColor(
                  announcement.type
                )} text-xs px-2 py-0.5 h-5 border-0`}
              >
                {getTypeIcon(announcement.type)}
                <span className="ml-1 hidden sm:inline capitalize">
                  {announcement.type}
                </span>
              </Badge>
              <Badge
                className={`${getPriorityColor(
                  announcement.priority
                )} text-xs px-2 py-0.5 h-5 border-0 font-medium`}
              >
                {announcement.priority.charAt(0).toUpperCase() +
                  announcement.priority.slice(1)}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-1 pb-4 px-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2 mb-3">
            {announcement.content}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>
                {formatDistanceToNow(new Date(announcement.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            {announcement.classroom && (
              <div className="flex items-center gap-1 truncate max-w-[120px]">
                <Users size={12} />
                <span className="truncate">{announcement.classroom}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Announcement Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="w-full max-w-xl max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-900 px-6 py-5 rounded-xl">
          <DialogHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start space-x-4 min-w-0 flex-1">
                <Avatar className="w-12 h-12 shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                    {announcement.author
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white leading-tight mb-2">
                    {announcement.title}
                  </DialogTitle>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <span>by</span>
                      <span className="font-medium">{announcement.author}</span>
                      {isMyAnnouncement && (
                        <Badge
                          variant="outline"
                          className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                        >
                          Your post
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                <Badge
                  className={`${getTypeColor(
                    announcement.type
                  )} text-sm px-3 py-1 border-0`}
                >
                  {getTypeIcon(announcement.type)}
                  <span className="ml-1.5 capitalize">{announcement.type}</span>
                </Badge>
                <Badge
                  className={`${getPriorityColor(
                    announcement.priority
                  )} text-sm px-3 py-1 border-0 font-medium`}
                >
                  {announcement.priority.toUpperCase()} Priority
                </Badge>
              </div>
            </div>
          </DialogHeader>

          <div className="py-6">
            <div className="prose prose-sm max-w-none">
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-base">
                {announcement.content}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Clock size={16} />
                  <span>{formatDate(announcement.createdAt)}</span>
                </div>
                {announcement.classroom && (
                  <div className="flex items-center gap-1.5">
                    <Users size={16} />
                    <span className="font-medium">
                      {announcement.classroom}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                Posted{" "}
                {formatDistanceToNow(new Date(announcement.createdAt), {
                  addSuffix: true,
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AnnouncementCard;
