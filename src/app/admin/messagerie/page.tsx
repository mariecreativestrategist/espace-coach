"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/shared/PageShell";
import { initials } from "@/lib/mock/admin-data";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/storage";

interface ChatMessage {
  from: "in" | "out";
  text: string;
  time: string;
}

interface Conversation {
  id: string | number;
  initials: string;
  name: string;
  time: string;
  preview: string;
  unread: boolean;
  online: boolean;
  messages: ChatMessage[];
}

const demoConversations: Conversation[] = [
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
];

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export default function AdminMessageriePage() {
  const [conversations, setConversations] = useState<Conversation[]>(isSupabaseConfigured ? [] : demoConversations);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [activeId, setActiveId] = useState<string | number | null>(isSupabaseConfigured ? null : 1);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const { data: convRows } = await supabase.from("conversations").select("id, client_id").eq("coach_id", user.id);
      const clientIds = (convRows ?? []).map((c) => c.client_id);
      const { data: clientRows } = clientIds.length
        ? await supabase.from("clients").select("id, nom").in("id", clientIds)
        : { data: [] };
      const clientNameById = new Map((clientRows ?? []).map((c) => [c.id, c.nom]));

      const convIds = (convRows ?? []).map((c) => c.id);
      const { data: msgRows } = convIds.length
        ? await supabase.from("messages").select("*").in("conversation_id", convIds).order("horodatage", { ascending: true })
        : { data: [] };

      if (cancelled) return;

      const list: Conversation[] = (convRows ?? []).map((c) => {
        const msgs = (msgRows ?? []).filter((m) => m.conversation_id === c.id);
        const last = msgs[msgs.length - 1];
        const name = clientNameById.get(c.client_id) ?? "Client";
        return {
          id: c.id,
          initials: initials(name),
          name,
          time: last ? fmtTime(last.horodatage) : "",
          preview: last?.contenu ?? "Aucun message pour le moment",
          unread: msgs.some((m) => m.auteur === "client" && !m.lu),
          online: false,
          messages: msgs.map((m) => ({ from: m.auteur === "coach" ? "out" : "in", text: m.contenu, time: fmtTime(m.horodatage) })),
        };
      });
      setConversations(list);
      if (list.length) setActiveId(list[0]!.id);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  async function selectConversation(id: string | number) {
    setActiveId(id);
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unread: false } : c)));
    if (isSupabaseConfigured) {
      const supabase = createClient();
      await supabase.from("messages").update({ lu: true }).eq("conversation_id", id as string).eq("auteur", "client");
    }
  }

  async function sendMessage() {
    const text = draft.trim();
    if (!text || activeId === null) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    if (!isSupabaseConfigured) {
      setConversations((prev) =>
        prev.map((c) => (c.id === activeId ? { ...c, messages: [...c.messages, { from: "out", text, time }] } : c)),
      );
      setDraft("");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from("messages").insert({ conversation_id: activeId as string, auteur: "coach", contenu: text });
    if (error) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, messages: [...c.messages, { from: "out", text, time }], preview: text, time } : c)),
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
          {loading && <div style={{ padding: 16, fontSize: 12.5, color: "var(--text-muted)" }}>Chargement…</div>}
          {!loading && conversations.length === 0 && (
            <div style={{ padding: 16, fontSize: 12.5, color: "var(--text-muted)" }}>Aucune conversation pour le moment.</div>
          )}
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
          {active ? (
            <>
              <div className="chat-header">
                <div className="avatar-sm">{active.initials}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{active.name}</div>
                  {!isSupabaseConfigured && (
                    <div style={{ fontSize: 11.5, color: active.online ? "var(--accent-green)" : "var(--text-muted)" }}>
                      {active.online ? "● En ligne" : "Hors ligne"}
                    </div>
                  )}
                </div>
              </div>
              <div className="chat-body">
                {active.messages.length === 0 && (
                  <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", marginTop: 20 }}>
                    Aucun message pour le moment.
                  </div>
                )}
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
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", fontSize: 13.5 }}>
              {loading ? "Chargement…" : "Sélectionne une conversation."}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
