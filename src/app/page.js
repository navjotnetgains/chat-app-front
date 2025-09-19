    "use client";
    import { useEffect, useState } from "react";
    import { useRouter } from "next/navigation";
    import { IoSend } from "react-icons/io5";
    import { CgAttachment } from "react-icons/cg";

    export default function ChatPage() {
      const [ws, setWs] = useState(null);
      const [messages, setMessages] = useState([]);
      const [input, setInput] = useState("");
      const [users, setUsers] = useState([]);
      const [selectedUser, setSelectedUser] = useState(null);
      const [currentUser, setCurrentUser] = useState(null);
      const [selectedImage,setSelectedIamge]=useState(null);
      const router = useRouter();

      useEffect(() => {
        const checkSession = async () => {
          try {
            const res = await fetch("http://localhost:4000/api/session", { method: "GET", credentials: "include" });
            console.log(res)
            const data = await res.json();
            if (!data.user || !data.token) {
              router.push("/login");
              return;
            }
            setCurrentUser(data.user);

            const usersRes = await fetch("http://localhost:4000/api/users", { credentials: "include" });
            const usersData = await usersRes.json();
            setUsers(usersData.users || []);

          const socket = new WebSocket(`ws://localhost:4000?token=${data.token}`);
            socket.onopen = () => console.log("✅ Connected to chat");
            socket.onmessage = (event) => {
              const msg = JSON.parse(event.data);
              if (msg.to === data.user._id || msg.from === data.user._id) {
                setMessages((prev) => [...prev, msg]);
              }
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
        if (ws && input.trim() !== "" && selectedUser) {
          const messageObj = {
            from: currentUser._id,
            to: selectedUser._id,
            text: input,
          };
          ws.send(JSON.stringify(messageObj));
          setInput("");
        }
      };

      const handleSelect = async (user) => {
        setSelectedUser(user);
        const res = await fetch(`http://localhost:4000/api/messages/${user._id}`,{method:'GET', credentials:"include"});
        const data = await res.json();
        setMessages(data.messages || []);
      };

      const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedUser) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("http://localhost:4000/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    console.log(data)
    if (ws) {
      const messageObj = {
        from: currentUser._id,
        to: selectedUser._id,
        mediaUrl: data.url,              // <-- use url instead of path
        mediaType: data.type.startsWith("image") ? "image" : "file",
      };
      ws.send(JSON.stringify(messageObj));
    }
  };

      return (
        <div className="flex h-screen bg-gray-100">
          {/* Sidebar */}
          <div
            className={`w-full md:w-1/4 bg-white border-r flex flex-col ${
              selectedUser ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="p-4 border-b font-bold text-lg">Chats</div>
            <div className="flex-1 overflow-y-auto">
              {users
                .filter((u) => u._id !== currentUser?._id)
                .map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleSelect(user)}
                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 ${
                      selectedUser?._id === user._id ? "bg-gray-200" : ""
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-xs text-gray-500">Click to chat</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Chat area */}
          <div
            className={`flex flex-col flex-1 ${
              !selectedUser ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Chat header */}
            <div className="flex items-center gap-3 p-4 border-b bg-white shadow-sm">
              {/* Back button for mobile */}
              <button
                onClick={() => setSelectedUser(null)}
                className="md:hidden text-xl"
              >
                ←
              </button>

              {selectedUser ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                    {selectedUser.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{selectedUser.username}</p>
                    <p className="text-xs text-gray-500">online</p>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Select a user to start chatting</p>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-chat-pattern">
              {messages
                .filter(
                  (m) =>
                    (m.from === currentUser?._id && m.to === selectedUser?._id) ||
                    (m.from === selectedUser?._id && m.to === currentUser?._id)
                )
                .map((msg, i) => (
                  <div
                    key={i}
                    className={`max-w-xs p-2 rounded-lg shadow break-words ${
                      msg.from === currentUser?._id
                        ? "ml-auto bg-green-200"
                        : "mr-auto bg-white"
                    }`}
                  >
                    {msg.text && <p>{msg.text}</p>}
                    {msg.mediaUrl && msg.mediaType === "image" && (
                      <img
                        src={msg.mediaUrl}
                        alt="media"
                        className="max-w-[150px] rounded mt-1"
                      />
                    )}
                    {msg.mediaUrl && msg.mediaType !== "image" && (
                      <a
                        href={msg.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline mt-1 block"
                      >
                        <CgAttachment />
                      </a>
                    )}
                    <p className="text-[10px] text-gray-500 text-right mt-1">
                      {new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
            </div>

            {/* Input area */}
            {selectedUser && (
              <div className="flex items-center gap-2 p-3 border-t bg-white">
                <input
                  type="file"
                  id="fileInput"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <label
                  htmlFor="fileInput"
                  className="cursor-pointer text-gray-500 hover:text-gray-700"
                >
                  <CgAttachment />
                </label>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 border rounded-full px-4 py-2 focus:outline-none bg-gray-100"
                  placeholder="Type a message..."
                />
                <button
                  onClick={sendMessage}
                  className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600"
                >
                <IoSend/>
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }
