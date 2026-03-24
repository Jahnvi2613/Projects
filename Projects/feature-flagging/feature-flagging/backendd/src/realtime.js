const WebSocket = require("ws");
const { getSub } = require("./services/redisClient");

let wss;

function initRealtime(server) {
  wss = new WebSocket.Server({ server });
  console.log("✅ WebSocket server ready");

  const sub = getSub();

  // When Redis publishes a flag update
  sub.on("message", (channel, message) => {
    if (channel === "flags_updates") {
      console.log("📢 Broadcasting flag update:", message);
      // Send to all connected frontend clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  });

  // When a new frontend connects
  wss.on("connection", (ws) => {
    console.log("🌐 New WebSocket client connected");
    ws.send(JSON.stringify({ type: "welcome", message: "Connected to real-time updates" }));
  });
}

module.exports = { initRealtime };