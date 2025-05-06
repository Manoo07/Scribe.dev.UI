import React from 'react';
import ReactMarkdown from 'react-markdown';
import SimpleMDE from 'react-simplemde-editor';
import 'simplemde/dist/simplemde.min.css'; // Import SimpleMDE styles

interface MarkdownEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ initialValue, onChange }) => {
  const handleEditorChange = (value: string) => {
    onChange(value); // Notify parent of the change
  };

  return (
    <div className="bg-gray-800 p-4 rounded">
      <h3 className="text-white mb-2">Notes</h3>
      <div className="text-gray-300">
        <SimpleMDE
          value={initialValue}  // Bind value to initialValue prop
          onChange={handleEditorChange}  // Handle change event
          options={{
            minHeight: '200px',
            spellChecker: false,
            toolbar: ['bold', 'italic', 'heading', '|', 'quote', 'unordered-list', 'ordered-list', 'link'],
          }}
        />
      </div>
      <div className="mt-4 bg-gray-700 p-4 rounded">
        <h4 className="text-white mb-2">Markdown Preview</h4>
        <div className="text-gray-300">
          <ReactMarkdown>{initialValue}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditor;
