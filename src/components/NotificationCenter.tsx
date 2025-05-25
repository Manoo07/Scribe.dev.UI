import { X } from "lucide-react";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const notifications = [
  {
    id: 1,
    title: "New Assignment Posted",
    message: "Math Quiz due tomorrow at 11:59 PM",
    time: "2 hours ago",
    type: "assignment",
    unread: true,
  },
  {
    id: 2,
    title: "Grade Posted",
    message: "Your History Essay grade has been posted",
    time: "5 hours ago",
    type: "grade",
    unread: true,
  },
  {
    id: 3,
    title: "Class Cancelled",
    message: "Physics class cancelled for tomorrow",
    time: "1 day ago",
    type: "announcement",
    unread: false,
  },
];

const NotificationCenter = ({ isOpen, onClose }: NotificationCenterProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b hover:bg-gray-50 transition-colors ${
                notification.unread ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {notification.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  <span className="text-xs text-gray-500 mt-2 block">
                    {notification.time}
                  </span>
                </div>
                {notification.unread && (
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t">
          <button className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors">
            Mark all as read
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
