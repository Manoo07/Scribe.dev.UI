import React, { useEffect, useState } from "react";
import axios from "axios";
import MarkdownEditor from "../MarkdownEditor";
import { marked } from "marked";

interface EducationalContent {
  id: string;
  content: string;
  type: "MARKDOWN" | "FILE"; // adjust if your enum differs
  createdAt: string;
  version: number;
}

interface Unit {
  id: string;
  name: string;
  educationalContents: EducationalContent[];
}

const UnitsTab = ({ classroomId }: { classroomId: string }) => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/classroom/${classroomId}/units`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUnits(response.data || []);
    } catch (err) {
      console.error("Failed to fetch units:", err);
    } finally {
      setLoading(false);
    }
  };

  const uploadFiles = async (unitId: string) => {
    const uploads = files.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "FILE");

      await axios.post(
        `http://localhost:3000/api/v1/units/${unitId}/contents`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
    });

    await Promise.all(uploads);
  };

  const handleCreateOrUpdateUnit = async () => {
    if (!title.trim()) return;

    try {
      let unitId: string;

      if (editingUnit) {
        await axios.put(
          `http://localhost:3000/api/v1/units/${editingUnit.id}`,
          { name: title },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        unitId = editingUnit.id;
      } else {
        const response = await axios.post(
          `http://localhost:3000/api/v1/classroom/${classroomId}/units`,
          { name: title },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        unitId = response.data.id;
      }

      // Save markdown content
      if (markdown.trim()) {
        await axios.post(
          `http://localhost:3000/api/v1/units/${unitId}/contents`,
          { content: markdown, type: "MARKDOWN" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Upload files
      if (files.length) {
        await uploadFiles(unitId);
      }

      setMessage(editingUnit ? "Unit updated." : "Unit created.");
      resetForm();
      fetchUnits();
    } catch (err) {
      console.error("Save failed:", err);
      setMessage("Save failed.");
    }
  };

  const handleEdit = (unit: Unit) => {
    const latestMarkdown = getLatestContent(
      unit.educationalContents,
      "MARKDOWN"
    );
    setEditingUnit(unit);
    setTitle(unit.name);
    setMarkdown(latestMarkdown?.content || "");
    setFiles([]);
    setActiveUnitId(unit.id);
  };

  const handleDelete = async (unitId: string) => {
    if (!confirm("Are you sure you want to delete this unit?")) return;

    try {
      await axios.delete(`http://localhost:3000/api/v1/units/${unitId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (activeUnitId === unitId) setActiveUnitId(null);
      fetchUnits();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const getLatestContent = (contents: EducationalContent[], type: string) => {
    const filtered = contents?.filter((c) => c.type === type);
    if (!filtered?.length) return null;
    return [...filtered].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  };

  const resetForm = () => {
    setEditingUnit(null);
    setTitle("");
    setMarkdown("");
    setFiles([]);
    setActiveUnitId(null);
    setMessage("");
  };

  const activeUnit = units.find((u) => u.id === activeUnitId);

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
                  activeUnitId === unit.id ? "bg-gray-800" : ""
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-white">{unit.name}</span>
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
        <h2 className="text-white text-lg mb-4">
          {editingUnit ? "Edit Unit" : "Add New Unit"}
        </h2>

        {message && (
          <div className="text-green-400 text-sm mb-2">{message}</div>
        )}

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Unit Title"
          className="w-full mb-3 p-2 rounded bg-gray-700 text-white"
        />

        <MarkdownEditor initialValue={markdown} onChange={setMarkdown} />

        <input
          type="file"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
          className="block mt-3 mb-4 text-white"
        />

        <div className="mt-2 space-x-2">
          <button
            onClick={handleCreateOrUpdateUnit}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
          >
            {editingUnit ? "Update" : "Create"}
          </button>
          {editingUnit && (
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-white text-sm"
            >
              Cancel
            </button>
          )}
        </div>

        {activeUnit && (
          <div className="mt-8 bg-gray-800 p-4 rounded">
            <h3 className="text-white text-lg mb-2">{activeUnit.name}</h3>

            {/* Markdown content */}
            {getLatestContent(activeUnit.educationalContents, "MARKDOWN")
              ?.content && (
              <div
                className="prose prose-invert"
                dangerouslySetInnerHTML={{
                  __html: marked(
                    getLatestContent(activeUnit.educationalContents, "MARKDOWN")
                      ?.content || ""
                  ),
                }}
              />
            )}

            {/* File attachments */}
            {activeUnit.educationalContents.filter((c) => c.type === "FILE")
              .length > 0 && (
              <div className="mt-6">
                <h4 className="text-white text-sm mb-2">Files</h4>
                <ul className="list-disc list-inside text-blue-300">
                  {activeUnit.educationalContents
                    .filter((c) => c.type === "FILE")
                    .map((file) => (
                      <li key={file.id}>
                        <a
                          href={`http://localhost:3000/files/${file.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download File (v{file.version})
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default UnitsTab;
