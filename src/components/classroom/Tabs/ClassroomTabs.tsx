import { useState } from "react";
import { Menu } from "lucide-react";
import { cn } from "../../../lib/utils";

const tabs = ["Units", "Threads", "Assignments", "Students", "Attendance"];

const ClassroomTabs = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative">
      {/* Mobile dropdown menu */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center justify-between w-full px-4 py-2 bg-gray-800 rounded-md border border-gray-700"
        >
          <span className="text-white font-medium">{activeTab}</span>
          <Menu className="h-5 w-5 text-gray-400" />
        </button>

        {isMenuOpen && (
          <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg animate-fade-in">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "block w-full text-left px-4 py-2 hover:bg-gray-700",
                  tab === activeTab
                    ? "bg-gray-700 text-indigo-400"
                    : "text-gray-300"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop tabs */}
      <div className="hidden md:flex overflow-x-auto space-x-1 border-b border-gray-700 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "pb-2 px-3 whitespace-nowrap transition-colors",
              tab === activeTab
                ? "border-b-2 border-indigo-500 text-white font-medium"
                : "text-gray-400 hover:text-white"
            )}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ClassroomTabs;