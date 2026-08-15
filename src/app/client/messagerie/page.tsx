"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/shared/PageShell";
import { profile as demoProfile } from "@/lib/mock/client-data";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/storage";

interface ChatMessage {
  from: "in" | "out";
  text: string;
  time: string;
}

const demoMessages: ChatMessage[] = [
  { from: "in", text: "Salut Lisa ! Comment tu te sens après la séance jambes de lundi ?", time: "08:32" },
  { from: "out", text: "Salut coach ! J'ai fini la séance jambes 🔥", time: "08:40" },
  { from: "in", text: "Trop bien ! Combien de séries sur le squat ?", time: "08:44" },
  { from: "out", text: "5x5 à 62kg, c'est passé nickel", time: "08:47" },
  { from: "in", text: "Parfait, on monte à 65kg la semaine prochaine. Je t'envoie le nouveau plan.", time: "08:50" },
  { from: "out", text: "Merci coach, je valide le plan 💪", time: "09:14" },
];

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export default function ClientMessageriePage() {
  const [messages, setMessages] = useState<ChatMessage[]>(isSupabaseConfigured ? [] : demoMessages);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [name, setName] = useState(demoProfile.name);
  const [coachName, setCoachName] = useState(demoProfile.coachName);
  const [coachInitials, setCoachInitials] = useState(demoProfile.coachInitials);
  const [initials, setInitials] = useState(demoProfile.initials);
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

      const { data: clientRow } = await supabase.from("clients").select("id, nom, coach_id").eq("auth_user_id", user.id).single();
      if (!clientRow || cancelled) return;
      setName(clientRow.nom);
      setInitials(clientRow.nom.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join(""));

      const { data: coachRow } = await supabase.from("coaches").select("nom").eq("id", clientRow.coach_id).single();
      if (coachRow) {
        setCoachName(coachRow.nom);
        setCoachInitials(coachRow.nom.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join(""));
      }

      const { data: convRow } = await supabase.from("conversations").select("id").eq("client_id", clientRow.id).maybeSingle();
      if (!convRow || cancelled) return;
      setConversationId(convRow.id);

      const { data: msgRows } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", convRow.id)
        .order("horodatage", { ascending: true });
      if (cancelled) return;
      setMessages((msgRows ?? []).map((m) => ({ from: m.auteur === "client" ? "out" : "in", text: m.contenu, time: fmtTime(m.horodatage) })));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function sendMessage() {
    const text = draft.trim();
    if (!text) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    if (isSupabaseConfigured && conversationId) {
      const supabase = createClient();
      const { error } = await supabase.from("messages").insert({ conversation_id: conversationId, auteur: "client", contenu: text });
      if (error) return;
    }

    setMessages((prev) => [...prev, { from: "out", text, time }]);
    setDraft("");

    fetch("/api/send-message-notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderName: name, text }),
    }).catch(() => {
      // Notification best-effort : un échec d'email ne doit pas bloquer l'envoi du message.
    });
  }

  return (
    <PageShell title="Messagerie" subtitle="Discute directement avec ton coach" avatarInitials={initials}>
      <div className="chat-card">
        <div className="chat-header">
          <div className="avatar-sm">{coachInitials}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>{coachName}</div>
            {!isSupabaseConfigured && <div style={{ fontSize: 11.5, color: "var(--accent-green)" }}>● En ligne</div>}
          </div>
        </div>
        <div className="chat-body">
          {loading && <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", marginTop: 20 }}>Chargement…</div>}
          {!loading && messages.length === 0 && (
            <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", marginTop: 20 }}>Aucun message pour le moment.</div>
          )}
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
