import { useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: "system", content: "You are a helpful assistant." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages })
      });

      const data = await res.json();

      // Safely add assistant message
      const assistant = data.assistant ?? {
        role: "assistant",
        content: "No response from assistant."
      };

      setMessages((prev) => [...newMessages, assistant]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...newMessages,
        { role: "assistant", content: "Error: could not get response." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "20px auto", padding: 16 }}>
      <div
        style={{
          minHeight: 300,
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 12,
          overflowY: "auto"
        }}
      >
        {messages
          .filter((m) => m && m.role && m.role !== "system")
          .map((m, i) => (
            <div
              key={i}
              style={{
                margin: "8px 0",
                textAlign: m.role === "user" ? "right" : "left"
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "8px 12px",
                  borderRadius: 12,
                  background: m.role === "user" ? "#e6f0ff" : "#f1f1f1"
                }}
              >
                {m.content}
              </div>
            </div>
          ))}
      </div>

      <form
        onSubmit={sendMessage}
        style={{ display: "flex", gap: 8, marginTop: 8 }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1, padding: 8 }}
        />
        <button disabled={loading} style={{ padding: "8px 16px" }}>
          {loading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}
