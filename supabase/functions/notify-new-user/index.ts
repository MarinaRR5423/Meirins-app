// supabase/functions/notify-new-user/index.ts
// Se dispara desde un trigger en profiles (AFTER UPDATE) cuando una usuaria
// completa el onboarding y guarda su nombre por primera vez.
// Envía un email de notificación a blummapp@gmail.com con nombre y email.

interface NewUserPayload {
  name: string;
  email: string;
  created_at?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Verificar secret compartido con el trigger
  const expectedSecret = Deno.env.get('BETA_NOTIFY_SECRET') ?? '';
  const receivedSecret = req.headers.get('x-notify-secret') ?? '';
  if (!expectedSecret || receivedSecret !== expectedSecret) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let payload: NewUserPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { name, email } = payload;

  const resendKey   = Deno.env.get('RESEND_API_KEY') ?? '';
  const fromAddress = Deno.env.get('EMAIL_FROM') ?? 'Blumm <hola@blummapp.com>';
  const alertTo     = Deno.env.get('BETA_NOTIFY_TO') ?? 'blummapp@gmail.com';

  const html = `
    <div style="font-family:-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#0A0A0A;margin-bottom:4px">🎉 Nueva usuaria en Blumm</h2>
      <p style="color:#737373;font-size:14px;margin-top:0">Ha completado el onboarding</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px">
        <tr>
          <td style="padding:10px 0;color:#737373;font-size:14px;width:100px">Nombre</td>
          <td style="padding:10px 0;font-size:16px"><strong>${name}</strong></td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#737373;font-size:14px">Email</td>
          <td style="padding:10px 0;font-size:14px">${email}</td>
        </tr>
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
      subject: `🎉 Nueva usuaria: ${name}`,
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
