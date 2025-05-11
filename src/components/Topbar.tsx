import { Bell, ChevronDown } from "lucide-react";

const TopBar = () => {
  return (
    <header className="bg-gray-800 px-6 py-3 flex items-center justify-between border-b border-gray-700">
      <div className="flex items-center space-x-3">
        <h1 className="text-xl font-bold">YourLogo</h1>
        <span className="text-gray-400">Dashboard</span>
      </div>
      <div className="flex-1 mx-6">
        <input
          type="text"
          placeholder="Search unit, thread, student..."
          className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600"
        />
      </div>
      <div className="flex items-center space-x-4">
        <Bell className="text-white" />
        <div className="flex items-center space-x-2 cursor-pointer">
          <img
            src="https://i.pravatar.cc/32"
            className="w-8 h-8 rounded-full"
            alt="avatar"
          />
          <ChevronDown className="text-white w-4 h-4" />
        </div>
      </div>
    </header>
  );
};

export default TopBar;
