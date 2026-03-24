// feature-flag-sdk/index.js
import React, { createContext, useContext, useEffect, useState } from "react";

const FlagContext = createContext();

export function FlagProvider({ children }) {
  const [flags, setFlags] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch flags initially
  const fetchFlags = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/flags");
      const data = await res.json();

      const flagMap = {};
      data.forEach((flag) => {
        flagMap[flag.key] = flag.enabled ?? false;
      });
      setFlags(flagMap);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching flags:", err);
    }
  };

  useEffect(() => {
    fetchFlags();

    // ✅ Connect WebSocket for real-time updates
    const ws = new WebSocket("ws://localhost:4000");

    ws.onopen = () => {
      console.log("🔌 Connected to flag updates WebSocket");
    };

    ws.onmessage = (msg) => {
      try {
        const update = JSON.parse(msg.data);
        console.log("⚡ Flag update received:", update);

        if (update.key) {
          // Re-fetch only that flag
          fetchFlags();
        }
      } catch (err) {
        console.error("WebSocket message error:", err);
      }
    };

    ws.onerror = (err) => console.error("WebSocket error:", err);
    ws.onclose = () => console.log("🔌 WebSocket disconnected");

    return () => ws.close();
  }, []);

  return (
    <FlagContext.Provider value={{ flags, loading }}>
      {children}
    </FlagContext.Provider>
  );
}

export function useFlags() {
  return useContext(FlagContext);
}