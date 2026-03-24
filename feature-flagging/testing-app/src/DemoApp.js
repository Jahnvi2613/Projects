import React from "react";
import { useFlags } from "./feature-flag-sdk";

export default function DemoApp() {
  const { flags, loading } = useFlags();

  if (loading) return <p>Loading flags...</p>;

  const darkMode = flags["dark_mode"];
  const newFeature = flags["new_feature"];

  return (
    <div
      style={{
        backgroundColor: darkMode ? "#222" : "#f4f4f4",
        color: darkMode ? "#fff" : "#000",
        height: "100vh",
        textAlign: "center",
        paddingTop: "50px",
        transition: "all 0.4s ease",
      }}
    >
      <h1>🌟 Feature Flag Demo</h1>
      <p>Dark Mode: {darkMode ? "ON 🌙" : "OFF ☀️"}</p>

      {newFeature ? (
        <button style={{ padding: "10px 20px", fontSize: "16px" }}>
          🧪 Try the New Feature
        </button>
      ) : (
        <p>🚫 New Feature Disabled</p>
      )}
    </div>
  );
}