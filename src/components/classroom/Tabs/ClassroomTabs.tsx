const tabs = ["Units", "Threads", "Assignments", "Students", "Attendance"];

const ClassroomTabs = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => {
  return (
    <div className="flex space-x-4 border-b border-gray-700">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`pb-2 px-3 ${
            tab === activeTab
              ? "border-b-2 border-indigo-500 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default ClassroomTabs;
