import React from "react";
import "./App.css";
import AdminPanel from "./components/AdminPanel";

function App() {
  return (
    <div className="app">
      <header className="navbar">
        <h1>🧩 Feature Flag Admin Console</h1>
      </header>
      
      {/* AdminPanel handles fetching, displaying, and creating flags */}
      <AdminPanel />
    </div>
  );
}

export default App;