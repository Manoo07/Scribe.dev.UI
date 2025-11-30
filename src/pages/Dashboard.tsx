import { Bell, BookOpen, Calendar, Clock, FileText, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

const OverviewPage = () => {
  const { user, fetchFreshUserData } = useAuth();
  
  useEffect(() => {
    const refreshUserData = async () => {
      try {
        await fetchFreshUserData();
      } catch (error) {
        console.error("Dashboard: Failed to fetch fresh user data:", error);
      }
    };
    
    if (user?.name === "" || !user?.name) {
      refreshUserData();
    }
  }, [user?.name, fetchFreshUserData]);
  const upcomingAssignments = [
    {
      id: 1,
      title: "Math Quiz",
      dueDate: "2024-03-20",
      subject: "Mathematics",
    },
    {
      id: 2,
      title: "History Essay",
      dueDate: "2024-03-22",
      subject: "History",
    },
    {
      id: 3,
      title: "Science Project",
      dueDate: "2024-03-25",
      subject: "Science",
    },
  ];

  const recentAnnouncements = [
    {
      id: 1,
      title: "Spring Break Schedule",
      date: "2024-03-15",
      author: "Principal Smith",
    },
    {
      id: 2,
      title: "Virtual Science Fair",
      date: "2024-03-14",
      author: "Dr. Johnson",
    },
  ];

  const todayClasses = [
    {
      id: 1,
      subject: "Mathematics",
      time: "09:00 AM",
      teacher: "Mrs. Thompson",
    },
    { id: 2, subject: "History", time: "11:00 AM", teacher: "Mr. Anderson" },
    { id: 3, subject: "Science", time: "02:00 PM", teacher: "Dr. Johnson" },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-900 min-h-screen">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">
            Welcome back, {user?.name || "Student"}
          </h1>
          <p className="text-gray-400">
            Here's what's happening in your classes today
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-800 p-4 rounded-lg border border-blue-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-700 rounded-lg">
              <BookOpen className="text-white" size={20} />
            </div>
            <div>
              <p className="text-sm text-blue-200">Active Courses</p>
              <p className="text-xl font-bold text-white">6</p>
            </div>
          </div>
        </div>
        <div className="bg-green-800 p-4 rounded-lg border border-green-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-700 rounded-lg">
              <FileText className="text-white" size={20} />
            </div>
            <div>
              <p className="text-sm text-green-200">Assignments Due</p>
              <p className="text-xl font-bold text-white">3</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-800 p-4 rounded-lg border border-purple-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-700 rounded-lg">
              <Users className="text-white" size={20} />
            </div>
            <div>
              <p className="text-sm text-purple-200">Study Groups</p>
              <p className="text-xl font-bold text-white">2</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-800 p-4 rounded-lg border border-orange-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-700 rounded-lg">
              <Calendar className="text-white" size={20} />
            </div>
            <div>
              <p className="text-sm text-orange-200">Events This Week</p>
              <p className="text-xl font-bold text-white">4</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-sm border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Today's Schedule
            </h2>
            <Clock size={20} className="text-gray-400" />
          </div>
          <div className="space-y-4">
            {todayClasses.map((class_) => (
              <div
                key={class_.id}
                className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg"
              >
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-400"></div>
                <div className="flex-grow min-w-0">
                  <p className="font-medium text-white truncate">
                    {class_.subject}
                  </p>
                  <p className="text-sm text-gray-300 truncate">
                    {class_.teacher}
                  </p>
                </div>
                <div className="text-sm text-gray-400 flex-shrink-0">
                  {class_.time}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Assignments */}
        <div className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-sm border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Upcoming Assignments
            </h2>
            <FileText size={20} className="text-gray-400" />
          </div>
          <div className="space-y-4">
            {upcomingAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg"
              >
                <div className="flex-grow min-w-0">
                  <p className="font-medium text-white truncate">
                    {assignment.title}
                  </p>
                  <p className="text-sm text-gray-300 truncate">
                    {assignment.subject}
                  </p>
                </div>
                <div className="text-sm text-red-400 flex-shrink-0">
                  Due {assignment.dueDate}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-sm border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Recent Announcements
            </h2>
            <Bell size={20} className="text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentAnnouncements.map((announcement) => (
              <div key={announcement.id} className="p-3 bg-gray-700 rounded-lg">
                <p className="font-medium text-white truncate">
                  {announcement.title}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-gray-300 truncate">
                    By {announcement.author}
                  </p>
                  <p className="text-sm text-gray-400">{announcement.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
