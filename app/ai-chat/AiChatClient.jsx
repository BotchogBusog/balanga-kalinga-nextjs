"use client";
// Port of the inline <script> in ai-chat.php. This is a Client Component, so it
// can hold React state (messages, input) and call the /api/ai endpoint.
import { useEffect, useRef, useState } from "react";   // React hooks

// Props come from the server page: current conversation id, the user's name,
// the already-loaded messages, and the list of their conversations.
export default function AiChatClient({ cid: initialCid, userName, initialMessages, conversations }) {
  const [cid, setCid] = useState(initialCid);            // active conversation id
  const [messages, setMessages] = useState(initialMessages); // the chat transcript
  const [input, setInput] = useState("");                // what the user is typing
  const [sending, setSending] = useState(false);         // true while awaiting the server
  const [status, setStatus] = useState(null);            // null = no reply yet; else { live, risk, model } for the last reply
  const boxRef = useRef(null);                           // ref to the scrollable message box
  const firstName = (userName || "there").split(" ")[0]; // first name for the greeting

  // Every time the messages change, scroll the message box to the bottom.
  useEffect(() => { boxRef.current?.scrollTo(0, boxRef.current.scrollHeight); }, [messages]);

  // sendMessage — push the user's text, call the API, then append the reply.
  async function sendMessage() {
    const text = input.trim();                            // ignore surrounding whitespace
    if (!text || sending) return;                         // do nothing if empty or already sending
    setMessages((m) => [...m, { role: "user", content: text }]); // show the user's bubble immediately
    setInput("");                                         // clear the input box
    setSending(true);                                     // lock the send button
    try {
      // POST the message + conversation id to our API route.
      const res = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text, conversation_id: cid }) });
      const data = await res.json();                      // parse the JSON reply
      // If the server returned an error, show it as an assistant bubble.
      if (data.error) setMessages((m) => [...m, { role: "assistant", content: data.error }]);
      else {
        setStatus({ live: data.live === true, risk: data.risk || "low", model: data.model || "" }); // remember how this reply was produced
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]); // show the reply
        // The server may create a new conversation; keep the URL in sync.
        if (data.conversation_id && data.conversation_id !== cid) {
          setCid(data.conversation_id);                                            // switch to the new id
          window.history.replaceState({}, "", "/ai-chat?c=" + data.conversation_id); // update the URL without reload
        }
        // High-risk messages get an immediate, explicit crisis line.
        if (data.risk === "high") {
          setMessages((m) => [...m, { role: "assistant", content: "If you need immediate help, please call NCMH 1553, Hopeline 0917-558-4673, or 911." }]);
        }
      }
    } catch {
      // Network/parse failure -> friendly fallback message.
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    }
    setSending(false);                                    // re-enable the send button
  }

  // Translate the last reply's status into a footer label and colour:
  //  - high risk  -> a crisis safety response (the safe scripted text is used on
  //                  purpose, so it must NOT be labelled "offline");
  //  - live       -> the AI model that actually answered;
  //  - otherwise  -> a genuine offline fallback (no provider configured/failed).
  let statusLabel = null;
  if (status) {
    if (status.risk === "high") statusLabel = { text: "Crisis safety response", color: "#b42318" };
    else if (status.live) statusLabel = { text: `Live AI${status.model ? ` (${status.model})` : ""}`, color: "#0a7a2e" };
    else statusLabel = { text: "Offline fallback response", color: "#8a5a00" };
  }

  return (
    <div className="chat-wrap" style={{ marginTop: 14 }}>
      {/* Left column: the list of conversations. */}
      <div className="chat-sidebar">
        <strong style={{ fontSize: 13 }}>Your conversations</strong>
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          {/* One link per conversation, highlighted when it is the active one. */}
          {conversations.length ? conversations.map((c) => (
            <a key={c.id} href={`/ai-chat?c=${c.id}`} style={{ display: "block", padding: "8px 10px", borderRadius: 8, background: cid === c.id ? "#eef4ff" : "#fff", border: "1px solid #e5e7eb", textDecoration: "none", color: "#1f3a5f", fontSize: 13 }}>
              <div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title || "Talk with Kalinga AI"}</div>
              <div className="muted" style={{ fontSize: 11 }}>{new Date(c.created_at).toLocaleString()}</div>
            </a>
          )) : <p className="muted" style={{ fontSize: 13 }}>No chats yet. Start one on the right.</p>}
        </div>
        {/* Delete link for the active conversation (confirm first). */}
        {cid && <div style={{ marginTop: 12 }}><a href={`/ai-chat?delete=${cid}`} onClick={(e) => { if (!confirm("Delete this conversation?")) e.preventDefault(); }} style={{ fontSize: 12, color: "#b42318" }}>Delete this chat</a></div>}
        {/* A gentle prompt to help users start talking. */}
        <div className="muted" style={{ fontSize: 12, marginTop: 12, padding: 10, background: "#fff", borderRadius: 8, border: "1px solid #e5e7eb" }}>Tip: Try saying &quot;I have three deadlines and feel overwhelmed&quot; or &quot;I cannot sleep&quot; to see how Kalinga responds.</div>
      </div>
      {/* Right column: the messages and the input box. */}
      <div className="chat-main">
        <div ref={boxRef} className="chat-messages">
          {/* When there are no messages yet, show a warm welcome bubble. */}
          {messages.length === 0 && (
            <>
              <div className="bubble bubble-ai">Hi {firstName}! I am Kalinga AI, your wellness companion. You can tell me about deadlines, sleep, stress, or just how your day has been. I am here to listen without judgment.</div>
              <div className="bubble bubble-ai" style={{ fontSize: 12, color: "#667085" }}>Try: &quot;I feel anxious about my exams&quot; or &quot;Help me prepare for a counselor session&quot;</div>
            </>
          )}
          {/* Render every message; user bubbles align right, assistant bubbles left. */}
          {messages.map((m, i) => (
            <div key={i} className={`bubble ${m.role === "user" ? "bubble-user" : "bubble-ai"}`}>{m.content}</div>
          ))}
        </div>
        {/* Input row: a textarea plus the send button. */}
        <div className="chat-input">
          <textarea rows={2} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message..." style={{ flex: 1 }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} />
          <button onClick={sendMessage} className="btn btn-primary" style={{ height: 42, alignSelf: "flex-end" }} disabled={sending}>{sending ? "..." : "Send"}</button>
        </div>
        {/* Static safety note under the chat. */}
        <div className="muted" style={{ fontSize: 11, padding: "6px 12px", textAlign: "center" }}>Kalinga AI is supportive, not a licensed professional. If you feel unsafe, call NCMH 1553 or 911 right away.</div>
        {/* After the first reply, show how that reply was produced (crisis / live / offline). */}
        {statusLabel && <div style={{ fontSize: 11, padding: "0 12px 8px", textAlign: "center", color: statusLabel.color }}>● {statusLabel.text}</div>}
      </div>
    </div>
  );
}
