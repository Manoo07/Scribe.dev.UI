import React, { useState } from "react";
import { Unit, ContentType, EducationalContent } from "../types";
import ContentItem from "./ContentItem";
import { ArrowLeft, Plus, FileText, Link2, Video, File } from "lucide-react";
import { formatDate } from "../utils/dateUtils";

interface UnitDetailProps {
  unit: Unit;
  onBack: () => void;
  onAddContent: () => void;
  onRefresh: () => void;
}

const UnitDetail: React.FC<UnitDetailProps> = ({
  unit,
  onBack,
  onAddContent,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<ContentType | "ALL">("ALL");

  const tabs = [
    { id: "ALL", label: "All", icon: null },
    { id: ContentType.NOTE, label: "Notes", icon: <FileText size={16} /> },
    { id: ContentType.LINK, label: "Links", icon: <Link2 size={16} /> },
    { id: ContentType.VIDEO, label: "Videos", icon: <Video size={16} /> },
    { id: ContentType.DOCUMENT, label: "Documents", icon: <File size={16} /> },
  ];

  // Filter contents by active tab
  const filteredContents =
    activeTab === "ALL"
      ? unit.educationalContents
      : unit.educationalContents.filter(
          (content) => content.type === activeTab
        );

  // Group contents by type for the summary section
  const contentsByType = {
    [ContentType.NOTE]: unit.educationalContents.filter(
      (c) => c.type === ContentType.NOTE
    ),
    [ContentType.LINK]: unit.educationalContents.filter(
      (c) => c.type === ContentType.LINK
    ),
    [ContentType.VIDEO]: unit.educationalContents.filter(
      (c) => c.type === ContentType.VIDEO
    ),
    [ContentType.DOCUMENT]: unit.educationalContents.filter(
      (c) => c.type === ContentType.DOCUMENT
    ),
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="bg-gray-800 hover:bg-gray-700 rounded-full p-2 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-2xl font-semibold text-white">{unit.name}</h2>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 mb-6 p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">Overview</h3>
          <div className="text-sm text-gray-400">
            Created {formatDate(new Date(unit.createdAt))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {Object.entries(contentsByType).map(([type, contents]) => {
            let icon = null;
            let bgColor = "";
            let textColor = "";

            switch (type) {
              case ContentType.NOTE:
                icon = <FileText size={20} />;
                bgColor = "bg-emerald-900/30";
                textColor = "text-emerald-400";
                break;
              case ContentType.LINK:
                icon = <Link2 size={20} />;
                bgColor = "bg-purple-900/30";
                textColor = "text-purple-400";
                break;
              case ContentType.VIDEO:
                icon = <Video size={20} />;
                bgColor = "bg-red-900/30";
                textColor = "text-red-400";
                break;
              case ContentType.DOCUMENT:
                icon = <File size={20} />;
                bgColor = "bg-blue-900/30";
                textColor = "text-blue-400";
                break;
            }

            return (
              <div
                key={type}
                className={`${bgColor} ${textColor} rounded-lg p-4 flex flex-col items-center justify-center text-center`}
              >
                {icon}
                <div className="mt-2 font-semibold">{contents.length}</div>
                <div className="text-xs">
                  {type.charAt(0) + type.slice(1).toLowerCase()}s
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onAddContent}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Add Content
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="border-b border-gray-700 flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-3 flex items-center gap-2 text-sm font-medium ${
                activeTab === tab.id
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-gray-200"
              }`}
              onClick={() => setActiveTab(tab.id as ContentType | "ALL")}
            >
              {tab.icon}
              {tab.label}
              {tab.id !== "ALL" && (
                <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded-full">
                  {contentsByType[tab.id as ContentType].length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-4">
          {filteredContents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">
                No content available in this category
              </p>
              <button
                onClick={onAddContent}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Add your first content
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredContents.map((content) => (
                <ContentItem
                  key={content.id}
                  content={content}
                  onRefresh={onRefresh}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnitDetail;
