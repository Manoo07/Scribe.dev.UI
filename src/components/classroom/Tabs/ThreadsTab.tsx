const ThreadsTab = ({ classroomId }: { classroomId: string }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Discussion Threads</h2>
        <button className="bg-indigo-600 px-3 py-1 rounded text-sm hover:bg-indigo-500">
          + New Thread
        </button>
      </div>
      <div className="space-y-2">
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="text-white">Thread Title</h3>
          <p className="text-gray-300">Thread preview, comments, likes...</p>
        </div>
      </div>
    </div>
  );
};

export default ThreadsTab;
