import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import { marked } from 'marked';
import { useToast } from '../../hooks/use-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate?: () => Promise<void>;
  classroomId?: string | null;
  initialData?: any;
}

const CreateAssignmentModal: React.FC<Props> = ({ open, onClose, onCreate, classroomId, initialData }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState<'NOTE' | 'QUESTION_FILE'>('NOTE');
  const [noteContent, setNoteContent] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      const contentType = initialData.content || (initialData.questionFileUrl ? 'QUESTION_FILE' : 'NOTE');
      setContent(contentType);
      setNoteContent(initialData.noteContent || '');
      if (initialData.deadline) {
        const date = new Date(initialData.deadline);
        setDueDate(date.toISOString().slice(0, 16)); 
      }
    }
  }, [initialData]);

  if (!open) return null;

  const reset = () => {
    setTitle('');
    setDescription('');
    setContent('NOTE');
    setNoteContent('');
    setDueDate('');
    setFile(null);
    setShowPreview(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    try {
      if (content === 'NOTE' && !noteContent.trim()) {
        toast.error('Please provide note content');
        setLoading(false);
        return;
      }
     if (content === 'QUESTION_FILE' && !file && !initialData) {
        toast.error('Please select a question file');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('content', content);
      formData.append('deadline', new Date(dueDate).toISOString());
      
      if (content === 'NOTE' && noteContent.trim()) {
        formData.append('noteContent', noteContent);
      }
      
      if (content === 'QUESTION_FILE' && file) {
        formData.append('questionFile', file);
      }
      
      if (classroomId) {
        formData.append('classroomId', classroomId);
      }

      if (initialData && initialData.id) {
        await api.default.put(`/assignments/${initialData.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Assignment updated');
      } else {
        await api.default.post('/assignments', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Assignment created');
      }

      reset();
      await onCreate?.();
      onClose();
    } catch (err) {
      console.error('Create assignment failed', err);
      toast.error('Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-xl border border-gray-700 animate-fadeIn max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-700 p-4">
          <h3 className="text-lg font-medium text-white">
            {initialData ? 'Edit Assignment' : 'Create Assignment'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid gap-3">
            <label className="block">
              <span className="text-sm text-gray-300">Title</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </label>

            <label className="block">
              <span className="text-sm text-gray-300">Description</span>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none" rows={3} />
            </label>

            <label className="block">
              <span className="text-sm text-gray-300">Content Type</span>
              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  className={`flex-1 p-2 rounded-lg border transition-colors ${
                    content === 'NOTE'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-graiy-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => setContent('NOTE')}
                >
                  Note Content
                </button>
                <button
                  type="button"
                  className={`flex-1 p-2 rounded-lg border transition-colors ${
                    content === 'QUESTION_FILE'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => setContent('QUESTION_FILE')}
                >
                  Question File
                </button>
              </div>
            </label>

            {content === 'NOTE' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Note Content (Markdown supported)</span>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </button>
                </div>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="# Title&#10;Your note content here..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={8}
                />
                {showPreview && (
                  <div className="mt-3 bg-gray-700 border border-gray-600 rounded-lg p-3">
                    <div className="text-sm text-gray-300 mb-2 font-medium">Preview:</div>
                    <div
                      className="prose prose-invert max-w-none text-sm"
                      dangerouslySetInnerHTML={{
                        __html: marked(noteContent || "*Preview will appear here*")
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {content === 'QUESTION_FILE' && (
              <label className="block">
                <span className="text-sm text-gray-300">
                  Question File
                  {initialData && initialData.questionFileUrl && (
                    <span className="text-xs text-gray-400 ml-1">(Leave empty to keep existing file)</span>
                  )}
                </span>
                <input 
                  type="file" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)} 
                  className="mt-1 w-full" 
                  required={!initialData} 
                />
                {initialData && initialData.questionFileUrl && (
                  <div className="mt-2">
                    <a 
                      href={initialData.questionFileUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      View current file
                    </a>
                  </div>
                )}
              </label>
            )}

            <label className="block">
              <span className="text-sm text-gray-300">Deadline</span>
              <input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white mt-1" required />
            </label>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors" disabled={loading}>Cancel</button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50" disabled={loading}>
              {loading ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssignmentModal;
