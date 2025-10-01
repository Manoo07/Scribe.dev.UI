import { Building, Megaphone, PlusCircle, User, Users } from "lucide-react";
import { useState } from "react";
import AnnouncementCard from "../components/announcements/AnnouncementCard";
import CreateAnnouncementModal from "../components/announcements/CreateAnnouncement";
import Button from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/card";
import { mockAnnouncements } from "../data/mockAnnouncement";

type UserRole = "STUDENT" | "FACULTY" | "ADMIN";

const Announcements = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [announcements, setAnnouncements] = useState(mockAnnouncements);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "classroom" | "college"
  >("all");

  // const userRole = (localStorage.getItem("role") as UserRole) || "STUDENT";
  const userRole = (localStorage.getItem("role") as UserRole) || "STUDENT";
  console.log("userRole", userRole);
  const userId = localStorage.getItem("userId") || "user1";
  const userClassroom = localStorage.getItem("classroom") || "CS101";

  const getFilteredAnnouncements = () => {
    if (userRole === "STUDENT") {
      const filtered = announcements.filter(
        (announcement) =>
          announcement.type === "college" ||
          (announcement.type === "classroom" &&
            announcement.classroom === userClassroom)
      );

      if (activeFilter === "classroom") {
        return filtered.filter((a) => a.type === "classroom");
      }
      if (activeFilter === "college") {
        return filtered.filter((a) => a.type === "college");
      }
      return filtered;
    }

    if (activeFilter === "classroom") {
      return announcements.filter((a) => a.type === "classroom");
    }
    if (activeFilter === "college") {
      return announcements.filter((a) => a.type === "college");
    }
    return announcements;
  };

  const handleCreateAnnouncement = (newAnnouncement: any) => {
    const announcement = {
      id: `ann_${Date.now()}`,
      ...newAnnouncement,
      author: "Current User",
      authorId: userId,
      createdAt: new Date().toISOString(),
    };
    setAnnouncements([announcement, ...announcements]);
  };

  const filteredAnnouncements = getFilteredAnnouncements();
  const myAnnouncements = announcements.filter((a) => a.authorId === userId);

  return (
    <div className="p-6 space-y-6 bg-white dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Megaphone className="text-blue-600" size={32} />
            Announcements
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {userRole == "STUDENT"
              ? "Stay updated with classroom and college announcements"
              : "Create and manage announcements for your students"}
          </p>
        </div>

        {(userRole === "FACULTY" || userRole === "ADMIN") && (
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <PlusCircle size={18} className="mr-2" />
            Create Announcement
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      {(userRole === "FACULTY" || userRole === "ADMIN") && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 bg-white dark:bg-gray-800 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Announcements
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {announcements.length}
                  </p>
                </div>
                <Megaphone className="text-blue-600" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 bg-white dark:bg-gray-800 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    My Announcements
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {myAnnouncements.length}
                  </p>
                </div>
                <User className="text-green-600" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 bg-white dark:bg-gray-800 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    College-wide
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {announcements.filter((a) => a.type === "college").length}
                  </p>
                </div>
                <Building className="text-purple-600" size={24} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeFilter === "all" ? "primary" : "outline"}
          onClick={() => setActiveFilter("all")}
          className={`${
            activeFilter === "all"
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "dark:border-gray-700"
          }`}
        >
          All Announcements
        </Button>
        <Button
          variant={activeFilter === "classroom" ? "primary" : "outline"}
          onClick={() => setActiveFilter("classroom")}
          className={`${
            activeFilter === "classroom"
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "dark:border-gray-700"
          }`}
        >
          <Users size={16} className="mr-2" />
          Classroom
        </Button>
        <Button
          variant={activeFilter === "college" ? "primary" : "outline"}
          onClick={() => setActiveFilter("college")}
          className={`${
            activeFilter === "college"
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "dark:border-gray-700"
          }`}
        >
          <Building size={16} className="mr-2" />
          College-wide
        </Button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center bg-white dark:bg-gray-800">
              <Megaphone
                className="mx-auto text-gray-400 dark:text-gray-500 mb-4"
                size={48}
              />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No announcements found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {userRole === "STUDENT"
                  ? "Check back later for new announcements from your instructors."
                  : "Create your first announcement to get started."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              currentUserId={userId}
              userRole={userRole}
            />
          ))
        )}
      </div>

      {/* Create Announcement Modal */}
      <CreateAnnouncementModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateAnnouncement}
      />
    </div>
  );
};

export default Announcements;
