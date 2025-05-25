import React from "react";

interface LogoProps {
  darkMode?: boolean;
}

const Logo: React.FC<LogoProps> = ({ darkMode = false }) => {
  return (
    <div className="flex items-center">
      <div className="flex items-center justify-center">
        <img
          src="/ScribeLogo.png"
          height={48}
          width={48}
          alt="Scribe logo"
          className="h-12 w-12 object-contain"
        />
      </div>
      <span
        className={`text-xl md:text-2xl font-bold ${
          darkMode ? "text-white" : "text-gray-800"
        }`}
      >
        SCRIBE
      </span>
    </div>
  );
};

export default Logo;
