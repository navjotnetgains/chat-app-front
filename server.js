// server.js
import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";

const SECRET = "my_secret_key";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", (message) => {
    console.log("received:", message.toString());

    // broadcast to all clients
    wss.clients.forEach((client) => {
      if (client.readyState === ws.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log("✅ WebSocket server running on ws://localhost:8080");
