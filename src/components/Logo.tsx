import React from "react";
import { BookOpen, PenTool } from "lucide-react";

interface LogoProps {
  darkMode?: boolean;
}

const Logo: React.FC<LogoProps> = ({ darkMode = false }) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex items-center justify-center h-8 w-8 bg-blue-600 rounded-md overflow-hidden">
        <BookOpen
          size={20}
          className="text-white absolute"
          style={{ left: "1px" }}
        />
        <PenTool
          size={18}
          className="text-white absolute"
          style={{ right: "1px", top: "5px" }}
        />
      </div>
      <span
        className={`text-lg md:text-xl font-bold ${
          darkMode ? "text-white" : "text-gray-800"
        }`}
      >
        SCRIBE
      </span>
    </div>
  );
};

export default Logo;
