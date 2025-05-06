import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MarkdownEditor from './MarkdownEditor';

const UnitsTab = ({ classroomId }: { classroomId: string }) => {
  const [units, setUnits] = useState<any[]>([]);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [editingUnit, setEditingUnit] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/classroom/${classroomId}/units`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUnits(response.data || []);
    } catch (err) {
      console.error('Failed to fetch units:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateUnit = async () => {
    if (!title.trim()) return;

    const payload = { title, content: markdown };

    try {
      if (editingUnit) {
        await axios.put(`http://localhost:3000/api/v1/units/${editingUnit.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`http://localhost:3000/api/v1/classroom/${classroomId}/units`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      resetForm();
      fetchUnits();
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const handleEdit = (unit: any) => {
    setEditingUnit(unit);
    setTitle(unit.title);
    setMarkdown(unit.content || '');
    setActiveUnitId(unit.id);
  };

  const handleDelete = async (unitId: string) => {
    if (!confirm('Are you sure you want to delete this unit?')) return;

    try {
      await axios.delete(`http://localhost:3000/api/v1/units/${unitId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (activeUnitId === unitId) setActiveUnitId(null);
      fetchUnits();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const resetForm = () => {
    setEditingUnit(null);
    setTitle('');
    setMarkdown('');
    setActiveUnitId(null);
  };

  return (
    <div className="flex">
      <aside className="w-1/4 pr-4 border-r border-gray-700">
        <h2 className="text-white text-lg mb-2">Units</h2>
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <ul className="space-y-2">
            {units.map((unit) => (
              <li
                key={unit.id}
                onClick={() => setActiveUnitId(unit.id)}
                className={`cursor-pointer p-2 rounded hover:bg-gray-800 ${
                  activeUnitId === unit.id ? 'bg-gray-800' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-white">{unit.title}</span>
                  <div className="space-x-2">
                    <button
                      className="text-blue-400 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(unit);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-400 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(unit.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <section className="flex-1 pl-4">
        <h2 className="text-white text-lg mb-4">{editingUnit ? 'Edit Unit' : 'Add New Unit'}</h2>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Unit Title"
          className="w-full mb-3 p-2 rounded bg-gray-700 text-white"
        />

        <MarkdownEditor initialValue={markdown} onChange={setMarkdown} />

        <div className="mt-4 space-x-2">
          <button
            onClick={handleCreateOrUpdateUnit}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
          >
            {editingUnit ? 'Update' : 'Create'}
          </button>
          {editingUnit && (
            <button onClick={resetForm} className="text-gray-400 hover:text-white text-sm">
              Cancel
            </button>
          )}
        </div>

        {activeUnitId && (
          <div className="mt-8 bg-gray-800 p-4 rounded">
            <h3 className="text-white text-lg mb-2">
              {units.find((u) => u.id === activeUnitId)?.title}
            </h3>
            <div
              className="prose prose-invert"
              dangerouslySetInnerHTML={{
                __html: markdown, // Optionally render markdown if pre-parsed
              }}
            />
          </div>
        )}
      </section>
    </div>
  );
};

export default UnitsTab;
