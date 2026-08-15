import { NextResponse } from "next/server";
import { SITE_NAME } from "@/lib/config";

/**
 * Envoie un email de notification via Resend quand un client écrit dans la
 * messagerie. Le destinataire est lu depuis la variable d'environnement
 * COACH_NOTIFICATION_EMAIL (jamais depuis le corps de la requête, pour ne
 * pas transformer cette route en relais d'envoi vers une adresse arbitraire).
 *
 * Si les variables Resend ne sont pas configurées, la route répond
 * simplement `skipped: true` sans erreur — la messagerie reste utilisable
 * même sans email branché.
 */
export async function POST(request: Request) {
  const { senderName, text } = (await request.json()) as { senderName?: string; text?: string };

  const to = process.env.COACH_NOTIFICATION_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!to || !apiKey || !from) {
    return NextResponse.json({ skipped: true });
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: `Nouveau message de ${senderName ?? "un client"} sur ${SITE_NAME}`,
      text: text ?? "",
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    return NextResponse.json({ error: body }, { status: 502 });
  }

  return NextResponse.json({ sent: true });
}
