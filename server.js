import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { URL } from "url";
import dotenv from "dotenv";

dotenv.config(); // Load .env variables
const SECRET = process.env.JWT_SECRET || "fallback_secret"; // fallback for dev

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws, req) => {
  try {
    // Parse query params
    const url = new URL(req.url, `http://${req.headers.host}`);
    const tokenFromQuery = url.searchParams.get("token");

    // Parse cookies
    const cookies = cookie.parse(req.headers.cookie || "");
    const tokenFromCookie = cookies.token;

    // Prefer query string token, fallback to cookie
    const token = tokenFromQuery || tokenFromCookie;
    if (!token) throw new Error("No token provided");

    // Verify JWT
    const decoded = jwt.verify(token, SECRET);
    console.log("✅ Authenticated user:", decoded);

    ws.user = decoded;
    ws.send(JSON.stringify({ user: "server", text: `Welcome ${decoded.email}` }));

    // Handle incoming messages
    ws.on("message", (msg) => {
      console.log(`📩 ${ws.user.email}: ${msg.toString()}`);

      // Broadcast to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === ws.OPEN) {
          client.send(JSON.stringify({ user: ws.user.email, text: msg.toString() }));
        }
      });
    });

  } catch (err) {
    console.error("❌ Invalid token:", err.message);
    ws.send(JSON.stringify({ user: "server", text: "Authentication failed. Disconnecting..." }));
    ws.close();
  }
});
