// Edge Function "welcome-email"
// Appelée par un Database Webhook (table public.profiles, évènement INSERT).
// Envoie : « Bienvenue chez Full Grind, ton espace pour te surpasser,
// tout en étant accompagné » + le code d'inscription de l'élève.
//
// Secrets requis (Supabase > Edge Functions > Secrets) :
//   RESEND_API_KEY  = clé API Resend (resend.com)
//   MAIL_FROM       = ex. "Full Grind <bienvenue@ton-domaine.fr>" (domaine vérifié dans Resend)

const esc = (s: string) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );

Deno.serve(async (req) => {
  // Seul le trigger de ta base connaît ce secret : personne d'autre ne peut déclencher d'envoi.
  if (req.headers.get("x-webhook-secret") !== Deno.env.get("WEBHOOK_SECRET")) {
    return new Response("forbidden", { status: 403 });
  }

  const payload = await req.json().catch(() => null);
  const rec = payload?.record;

  if (payload?.type !== "INSERT" || !rec?.email || !rec?.code || rec.role !== "student") {
    return new Response("ignored", { status: 200 });
  }

  const name = esc(rec.name || "");
  const code = esc(rec.code);
  const baseline = "Bienvenue chez Full Grind, ton espace pour te surpasser, tout en étant accompagné.";

  const html = `<!doctype html>
<html lang="fr"><body style="margin:0;background:#fbf9ff;font-family:Arial,Helvetica,sans-serif;color:#14082e">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:24px;border:1px solid #e4dcf7">
      <tr><td style="padding:32px 32px 8px;font-size:22px;font-weight:700;letter-spacing:-0.02em;color:#5a2bff">Full Grind</td></tr>
      <tr><td style="padding:8px 32px 0;font-size:26px;line-height:1.2;font-weight:700">Salut ${name} 👋</td></tr>
      <tr><td style="padding:12px 32px 0;font-size:16px;line-height:1.5">${esc(baseline)}</td></tr>
      <tr><td style="padding:24px 32px 0;font-size:14px;color:#6a5f85">Ton code d'inscription :</td></tr>
      <tr><td style="padding:8px 32px 0">
        <div style="background:#f1ecff;border-radius:16px;padding:18px;text-align:center;font:700 32px 'Courier New',monospace;letter-spacing:4px;color:#5a2bff">${code}</div>
      </td></tr>
      <tr><td style="padding:16px 32px 32px;font-size:14px;line-height:1.5;color:#6a5f85">Garde-le précieusement : il te permet de te connecter à ton espace. À très vite, et que le grind commence 🔥</td></tr>
    </table>
  </td></tr></table>
</body></html>`;

  const text = `Salut ${rec.name || ""},\n\n${baseline}\n\nTon code d'inscription : ${rec.code}\n\nGarde-le précieusement : il te permet de te connecter à ton espace.`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: Deno.env.get("MAIL_FROM"),
      to: [rec.email],
      subject: "Bienvenue chez Full Grind",
      html,
      text,
    }),
  });

  return new Response(await res.text(), { status: res.ok ? 200 : 502 });
});
