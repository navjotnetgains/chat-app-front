"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const [ws, setWs] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [users,setUsers]=useState([]);
  const router = useRouter();
  const [currentUser,setCurrentUser]=useState("");
  const [selectedUser,setSelectedUser]=useState("");

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

        setCurrentUser(data.user);

        console.log("current",currentUser,data.user)
        
        const usersRes = await fetch("/api/login", { credentials: "include" });
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);

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
    <div className="flex">
 <div className="w-64 border rounded p-3 bg-gray-50">
        <h2 className="font-semibold mb-2">Online Users</h2>
        <ul className="space-y-1">
          {users.filter((use)=>use.id!=currentUser.id).map((user) => (
            <li
              key={user._id}
              className="p-2 bg-white rounded shadow text-sm"
            >
              {user.email}
            </li>
          ))}
        </ul>
      </div>

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
    </div>
  );
}
