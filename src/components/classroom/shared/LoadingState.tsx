import React from "react";
import { Card, CardContent } from "../../ui/card";

interface LoadingStateProps {
  cardCount?: number;
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  cardCount = 3,
  className = "",
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {[...Array(cardCount)].map((_, idx) => (
        <Card key={idx} className="bg-[#1a2235] border-[#2d3748]">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              <div className="h-3 bg-gray-700 rounded w-1/4"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LoadingState;
