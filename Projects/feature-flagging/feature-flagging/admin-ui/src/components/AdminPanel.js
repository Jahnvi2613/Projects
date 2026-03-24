// admin-interface/src/components/AdminPanel.js
import React, { useEffect, useState } from "react";
import FlagForm from "./FlagForm";

export default function AdminPanel() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = "http://localhost:4000/api/flags";

  useEffect(() => {
    fetchFlags();
  }, []);

  const fetchFlags = async () => {
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();
      setFlags(data);
    } catch (err) {
      console.error("Error fetching flags:", err);
    } finally {
      setLoading(false);
    }
  };

  const createFlag = async (newFlag) => {
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFlag),
      });
      const saved = await res.json();
      setFlags([...flags, saved]);
    } catch (err) {
      console.error("Error creating flag:", err);
    }
  };

  const toggleFlag = async (flag) => {
    const updated = { ...flag, enabled: !flag.enabled };
    try {
      await fetch(`${API_BASE}/${flag.key}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      setFlags(flags.map((f) => (f.key === flag.key ? updated : f)));
    } catch (err) {
      console.error("Error toggling flag:", err);
    }
  };

  const deleteFlag = async (key) => {
    if (!window.confirm("Are you sure you want to delete this flag?")) return;
    try {
      await fetch(`${API_BASE}/${key}`, { method: "DELETE" });
      setFlags(flags.filter((f) => f.key !== key));
    } catch (err) {
      console.error("Error deleting flag:", err);
    }
  };

  if (loading) return <p>Loading flags...</p>;

  return (
    <div className="admin-panel">
      <FlagForm onCreate={createFlag} />

      <div className="flag-list">
        {flags.map((flag) => (
          <div key={flag.key} className="flag-item">
            <div>
              <h3>{flag.key}</h3>
              <p>{flag.description || "No description"}</p>
            </div>
            <div>
              <button
                className={`toggle-btn ${flag.enabled ? "on" : "off"}`}
                onClick={() => toggleFlag(flag)}
              >
                {flag.enabled ? "ON" : "OFF"}
              </button>
              <button className="delete-btn" onClick={() => deleteFlag(flag.key)}>
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}