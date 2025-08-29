"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const [ws, setWs] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        // get session + token
        const res = await fetch("/api/session", { credentials: "include" });
        const data = await res.json();

        if (!data.user || !data.token) {
          router.push("/login");
          return;
        }

        // pass token in query string
        const socket = new WebSocket(`ws://localhost:8080?token=${data.token}`);

        

        socket.onopen = () => console.log("✅ Connected to chat");
        socket.onmessage = (event) => {
          const msg = JSON.parse(event.data);
          setMessages((prev) => [...prev, `${msg.user}: ${msg.text}`]);
        };
        socket.onclose = () => console.log("❌ Disconnected from chat");

        setWs(socket);

        return () => socket.close();
      } catch (err) {
        console.error("Session check failed", err);
        router.push("/login");
      }
    };

    checkSession();
  }, [router]);

  const sendMessage = () => {
    if (ws && input.trim() !== "") {
      ws.send(input);
      setInput("");
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-xl font-bold mb-4">Simple Chat</h1>

      <div className="border w-80 h-64 p-2 overflow-y-auto mb-2 bg-gray-100">
        {messages.map((msg, i) => (
          <p key={i} className="p-1 bg-white rounded mb-1 shadow">
            {msg}
          </p>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border p-2 rounded w-60"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-3 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
