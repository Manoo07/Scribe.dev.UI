// components/MarkdownRenderer.tsx
import React from "react";

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
}) => {
  const renderMarkdown = (text: string) => {
    return text.split("\n\n").map((paragraph, index) => {
      // Handle bullet points
      if (paragraph.includes("•") || paragraph.match(/^\s*[\*\-\+]\s/m)) {
        const items = paragraph.split("\n").filter((line) => line.trim());
        return (
          <ul key={index} className="list-disc list-inside space-y-1 mb-4">
            {items.map((item, i) => (
              <li key={i} className="text-gray-200">
                {item.replace(/^[\s\*\-\+•]\s*/, "")}
              </li>
            ))}
          </ul>
        );
      }

      // Handle regular paragraphs with inline formatting
      let formattedText = paragraph
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(
          /`(.*?)`/g,
          '<code class="bg-gray-700 px-1 rounded text-sm">$1</code>'
        );

      return (
        <p
          key={index}
          className="mb-4 last:mb-0"
          dangerouslySetInnerHTML={{ __html: formattedText }}
        />
      );
    });
  };

  return (
    <div className="text-gray-200 text-sm leading-relaxed">
      {renderMarkdown(content)}
    </div>
  );
};
