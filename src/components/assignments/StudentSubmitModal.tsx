import React, { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { Upload } from 'lucide-react';

const StudentSubmitModal = ({ open, onClose, assignmentId, existingSubmission, onSubmitted }: any) => {
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    setFile(f || null);
  };

  const handleSubmit = async () => {
    if (!assignmentId) return;
    setSubmitting(true);
    try {
      if (!file) {
        toast.error('Please choose a file to submit');
        setSubmitting(false);
        return;
      }
      const fd = new FormData();
      fd.append('submissionFile', file);
      if (existingSubmission && existingSubmission.id) {
        const res = await api.patch(`/assignments/submissions/${existingSubmission.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        onSubmitted && onSubmitted(res.data);
      } else {
        const res = await api.post(`/assignments/${assignmentId}/submit`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        onSubmitted && onSubmitted(res.data);
      }
    } catch (err) {
      console.error('Submit failed', err);
      toast.error('Submission failed');
    } finally {
      setSubmitting(false);
      onClose && onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-white text-lg">Submit Assignment</h3>
          <button onClick={onClose} className="text-gray-400">Close</button>
        </div>

        <div className="space-y-3">
          <label className="block text-sm text-gray-300">Upload File</label>
          <div className="relative">
            <input 
              required 
              type="file" 
              onChange={handleFileChange} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              id="file-upload"
            />
            <label 
              htmlFor="file-upload" 
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-600 rounded cursor-pointer hover:bg-gray-700 text-gray-300"
            >
              <Upload size={16} />
              {file ? file.name : 'Choose File'}
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-3 py-1 rounded bg-gray-700 text-gray-200">Cancel</button>
            <button onClick={handleSubmit} disabled={submitting} className="px-3 py-1 rounded bg-indigo-600 text-white">{existingSubmission ? 'Update' : 'Submit'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSubmitModal;
