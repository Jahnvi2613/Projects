import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

function Chat() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setChat((prevChat) => [...prevChat, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === "" || username.trim() === "") return;

    const time = new Date().toLocaleTimeString();
    const newMessage = { username, message, time };
    socket.emit("send_message", newMessage);
    setMessage("");
  };

  return (
    <div style={{ width: "400px", margin: "20px auto", border: "1px solid black", padding: "10px" }}>
      <h2 style={{ textAlign: "center" }}>Real-Time Chat</h2>
      <input
        type="text"
        placeholder="Enter your name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      />
      <div
        style={{
          border: "1px solid gray",
          height: "250px",
          overflowY: "auto",
          marginBottom: "10px",
          padding: "5px",
        }}
      >
        {chat.map((msg, index) => (
          <div key={index}>
            <strong>{msg.username}</strong> [{msg.time}]: {msg.message}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ width: "80%" }}
        />
        <button type="submit" style={{ width: "18%", marginLeft: "2%" }}>
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;
