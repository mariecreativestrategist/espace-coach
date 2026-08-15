"use client";

import { useState } from "react";
import { PageShell } from "@/components/shared/PageShell";
import { profile } from "@/lib/mock/client-data";

interface ChatMessage {
  from: "in" | "out";
  text: string;
  time: string;
}

const initialMessages: ChatMessage[] = [
  { from: "in", text: "Salut Lisa ! Comment tu te sens après la séance jambes de lundi ?", time: "08:32" },
  { from: "out", text: "Salut coach ! J'ai fini la séance jambes 🔥", time: "08:40" },
  { from: "in", text: "Trop bien ! Combien de séries sur le squat ?", time: "08:44" },
  { from: "out", text: "5x5 à 62kg, c'est passé nickel", time: "08:47" },
  { from: "in", text: "Parfait, on monte à 65kg la semaine prochaine. Je t'envoie le nouveau plan.", time: "08:50" },
  { from: "out", text: "Merci coach, je valide le plan 💪", time: "09:14" },
];

export default function ClientMessageriePage() {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");

  function sendMessage() {
    const text = draft.trim();
    if (!text) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    setMessages((prev) => [...prev, { from: "out", text, time }]);
    setDraft("");

    fetch("/api/send-message-notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderName: profile.name, text }),
    }).catch(() => {
      // Notification best-effort : un échec d'email ne doit pas bloquer l'envoi du message.
    });
  }

  return (
    <PageShell title="Messagerie" subtitle="Discute directement avec ton coach" avatarInitials={profile.initials}>
      <div className="chat-card">
        <div className="chat-header">
          <div className="avatar-sm">{profile.coachInitials}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>{profile.coachName}</div>
            <div style={{ fontSize: 11.5, color: "var(--accent-green)" }}>● En ligne</div>
          </div>
        </div>
        <div className="chat-body">
          {messages.map((m, i) => (
            <div className={`msg ${m.from}`} key={i}>
              {m.text}
              <div className="msg-time">{m.time}</div>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            placeholder="Écrire un message à ton coach…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />
          <button className="send-btn" type="button" onClick={sendMessage}>
            <svg className="icon" viewBox="0 0 24 24" style={{ stroke: "#07130d" }}>
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />
            </svg>
          </button>
        </div>
      </div>
    </PageShell>
  );
}
