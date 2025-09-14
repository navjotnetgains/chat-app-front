import WebSocket, { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import messageSchema from "./src/models/messageSchema.js";
import mongoose from "mongoose";

// ✅ Load .env file so JWT_SECRET is available
dotenv.config();

//connect mongodb
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const wss = new WebSocketServer({ port: 8080 });
const clients = new Map(); // store userId -> ws

wss.on("connection", (ws, req) => {
  const params = new URLSearchParams(req.url.split("?")[1]);
  const token = params.get("token");

  let userId;
  try {
    console.log("WS JWT_SECRET:", process.env.JWT_SECRET); // debug
    console.log("Incoming token:", token); // debug

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded._id;
    clients.set(userId, ws);
    console.log("✅ User connected:", userId);
  } catch (err) {
    console.error("❌ Invalid token:", err.message);
    ws.close();
    return;
  }

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);
      console.log(data)

     const newMsg = new messageSchema({
        from: data.from,
        to: data.to,
        text: data.text || null,
        mediaUrl: data.mediaUrl || null,   
        mediaType: data.mediaType || null,
      });
      await newMsg.save();

      // find recipient
      const recipientWs = clients.get(data.to);
      if (recipientWs) {
        recipientWs.send(JSON.stringify(data));
      }

      // also echo back to sender so they see their own msg
      ws.send(JSON.stringify(data));
    } catch (err) {
      console.error("Invalid message format:", err);
    }
  });

  ws.on("close", () => {
    clients.delete(userId);
    console.log("❌ User disconnected:", userId);
  });
});
