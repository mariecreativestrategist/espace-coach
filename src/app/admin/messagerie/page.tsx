"use client";

import { useState } from "react";
import { PageShell } from "@/components/shared/PageShell";

interface ChatMessage {
  from: "in" | "out";
  text: string;
  time: string;
}

interface Conversation {
  id: number;
  initials: string;
  name: string;
  time: string;
  preview: string;
  unread: boolean;
  online: boolean;
  messages: ChatMessage[];
}

const initialConversations: Conversation[] = [
  {
    id: 1, initials: "LC", name: "Lisa Carion", time: "09:14", preview: "Merci coach, je valide le plan 💪", unread: false, online: true,
    messages: [
      { from: "in", text: "Salut coach ! J'ai fini la séance jambes 🔥", time: "08:40" },
      { from: "out", text: "Trop bien ! Combien de séries sur le squat ?", time: "08:44" },
      { from: "in", text: "5x5 à 62kg, c'est passé nickel", time: "08:47" },
      { from: "out", text: "Parfait, on monte à 65kg la semaine prochaine. Je t'envoie le nouveau plan.", time: "08:50" },
      { from: "in", text: "Merci coach, je valide le plan 💪", time: "09:14" },
    ],
  },
  {
    id: 2, initials: "TM", name: "Tom Mercier", time: "08:52", preview: "Je peux décaler à 12h ?", unread: true, online: false,
    messages: [{ from: "in", text: "Je peux décaler à 12h ?", time: "08:52" }],
  },
  {
    id: 3, initials: "SB", name: "Sarah Ben", time: "Hier", preview: "Séance envoyée, à demain !", unread: false, online: false,
    messages: [{ from: "out", text: "Séance envoyée, à demain !", time: "18:20" }],
  },
  {
    id: 4, initials: "JD", name: "Julie Dorval", time: "Hier", preview: "Je suis dispo mardi finalement", unread: true, online: false,
    messages: [{ from: "in", text: "Je suis dispo mardi finalement", time: "17:05" }],
  },
  {
    id: 5, initials: "MF", name: "Marc Ferreira", time: "Lun.", preview: "Top, à jeudi alors", unread: false, online: false,
    messages: [{ from: "in", text: "Top, à jeudi alors", time: "10:00" }],
  },
];

export default function AdminMessageriePage() {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState(1);
  const [draft, setDraft] = useState("");

  const active = conversations.find((c) => c.id === activeId)!;

  function selectConversation(id: number) {
    setActiveId(id);
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unread: false } : c)));
  }

  function sendMessage() {
    const text = draft.trim();
    if (!text) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, messages: [...c.messages, { from: "out", text, time }] } : c)),
    );
    setDraft("");
  }

  return (
    <PageShell title="Messagerie" subtitle="Échangez avec vos clients en temps réel" search="Rechercher un client, une facture…" avatarInitials="MG">
      <div className="messagerie">
        <div className="conv-list">
          <div className="conv-search">
            <div className="search-bar" style={{ width: "100%" }}>
              <svg className="icon" viewBox="0 0 24 24" style={{ width: 14, height: 14 }}>
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input placeholder="Chercher une conversation" />
            </div>
          </div>
          {conversations.map((c) => (
            <div
              key={c.id}
              className={`conv-item${c.id === activeId ? " active" : ""}`}
              onClick={() => selectConversation(c.id)}
            >
              <div className="avatar-sm">{c.initials}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span className="conv-name">{c.name}</span>
                  <span className="conv-time">{c.time}</span>
                  {c.unread && <span className="unread-dot" />}
                </div>
                <div className="conv-preview">{c.preview}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="chat-window">
          <div className="chat-header">
            <div className="avatar-sm">{active.initials}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{active.name}</div>
              <div style={{ fontSize: 11.5, color: active.online ? "var(--accent-green)" : "var(--text-muted)" }}>
                {active.online ? "● En ligne" : "Hors ligne"}
              </div>
            </div>
          </div>
          <div className="chat-body">
            {active.messages.map((m, i) => (
              <div className={`msg ${m.from}`} key={i}>
                {m.text}
                <div className="msg-time">{m.time}</div>
              </div>
            ))}
          </div>
          <div className="chat-input">
            <button className="icon-btn" type="button">
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M21 15V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h12" />
                <circle cx="9" cy="9" r="2" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </button>
            <input
              placeholder="Écrire un message…"
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
      </div>
    </PageShell>
  );
}
