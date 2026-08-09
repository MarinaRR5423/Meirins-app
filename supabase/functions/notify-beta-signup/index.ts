// supabase/functions/notify-beta-signup/index.ts
// Se dispara desde un trigger de Postgres (AFTER INSERT en beta_testers) vía
// pg_net y envía un email de alerta a blummapp@gmail.com con los datos de la
// nueva inscrita a la beta.
//
// Protegida con un secreto compartido (BETA_NOTIFY_SECRET) enviado en el
// header X-Notify-Secret por el trigger — no requiere JWT de usuario, así que
// se despliega con --no-verify-jwt.

interface BetaSignupPayload {
  first_name: string;
  last_name: string;
  email: string;
  platform?: string | null;
  locale?: string | null;
  how_heard?: string | null;
  created_at?: string;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)
  );
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const expectedSecret = Deno.env.get('BETA_NOTIFY_SECRET') ?? '';
  const receivedSecret = req.headers.get('x-notify-secret') ?? '';
  if (!expectedSecret || receivedSecret !== expectedSecret) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let payload: BetaSignupPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { first_name, last_name, email, platform, locale, how_heard } = payload;

  const resendKey = Deno.env.get('RESEND_API_KEY') ?? '';
  const fromAddress = Deno.env.get('EMAIL_FROM') ?? 'Blumm <hola@blummapp.com>';
  const alertTo = Deno.env.get('BETA_NOTIFY_TO') ?? 'blummapp@gmail.com';

  const html = `
    <div style="font-family:-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#0A0A0A;margin-bottom:4px">Nueva inscrita a la beta 🎉</h2>
      <p style="color:#737373;font-size:14px;margin-top:0">Landing page — Blumm</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px">
        <tr><td style="padding:8px 0;color:#737373;font-size:14px">Nombre</td><td style="padding:8px 0;font-size:14px"><strong>${escapeHtml(first_name)} ${escapeHtml(last_name)}</strong></td></tr>
        <tr><td style="padding:8px 0;color:#737373;font-size:14px">Email</td><td style="padding:8px 0;font-size:14px"><strong>${escapeHtml(email)}</strong></td></tr>
        <tr><td style="padding:8px 0;color:#737373;font-size:14px">Plataforma</td><td style="padding:8px 0;font-size:14px">${escapeHtml(platform ?? '—')}</td></tr>
        <tr><td style="padding:8px 0;color:#737373;font-size:14px">Idioma</td><td style="padding:8px 0;font-size:14px">${escapeHtml(locale ?? '—')}</td></tr>
        <tr><td style="padding:8px 0;color:#737373;font-size:14px">Cómo nos conoció</td><td style="padding:8px 0;font-size:14px">${escapeHtml(how_heard ?? '—')}</td></tr>
      </table>
    </div>
  `;

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [alertTo],
      subject: `Nueva beta tester: ${first_name} ${last_name}`,
      html,
    }),
  });

  if (!resendRes.ok) {
    const err = await resendRes.text();
    console.error(`Resend error ${resendRes.status}: ${err}`);
    return new Response(JSON.stringify({ error: `Resend error: ${resendRes.status}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
