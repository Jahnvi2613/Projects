import React, { useState } from "react";

export default function FlagForm({ onCreate }) {
  const [form, setForm] = useState({
    name: "",
    key: "",
    description: "",
    enabled: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.key.trim() || !form.name.trim()) return alert("Name & key required");
    onCreate(form);
    setForm({ name: "", key: "", description: "", enabled: false });
  };

  return (
    <form className="flag-form" onSubmit={handleSubmit}>
      <h3>Create New Feature Flag</h3>
      <input
        type="text"
        name="name"
        placeholder="Feature Name"
        value={form.name}
        onChange={handleChange}
      />
      <input
        type="text"
        name="key"
        placeholder="Unique Key (e.g. dark_mode)"
        value={form.key}
        onChange={handleChange}
      />
      <input
        type="text"
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
      />
      <label>
        <input
          type="checkbox"
          name="enabled"
          checked={form.enabled}
          onChange={handleChange}
        />
        Enabled
      </label>
      <button type="submit">Add Flag</button>
    </form>
  );
}