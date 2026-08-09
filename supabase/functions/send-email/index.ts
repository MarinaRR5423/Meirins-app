// supabase/functions/send-email/index.ts
// Auth Hook — send_email
// Intercepta todos los emails de autenticación de Supabase y los envía
// vía Resend en el idioma preferido de la usuaria (es/en/fr/it).
//
// Configuración en Supabase Dashboard:
//   Authentication → Hooks → Send Email → Esta función
//   Secret: SUPABASE_HOOK_SECRET (mismo valor en Secrets de la función)

import { createClient } from 'npm:@supabase/supabase-js@2';

// ── Tipos ────────────────────────────────────────────────────────────────────

type Lang = 'es' | 'en' | 'fr' | 'it';

type EmailActionType =
  | 'signup'
  | 'magiclink'
  | 'recovery'
  | 'email_change'
  | 'email_change_new'
  | 'invite'
  | 'reauthentication';

interface HookPayload {
  user: { id: string; email: string };
  email_data: {
    token: string;
    token_hash: string;
    token_new?: string;
    token_hash_new?: string;
    redirect_to: string;
    email_action_type: EmailActionType;
    site_url: string;
  };
}

// ── Traducciones ─────────────────────────────────────────────────────────────

const i18n: Record<
  EmailActionType,
  Record<Lang, { subject: string; title: string; body: string; cta: string }>
> = {
  signup: {
    es: {
      subject: 'Confirma tu cuenta en Blumm',
      title: 'Bienvenida a Blumm',
      body: 'Gracias por unirte. Confirma tu email para activar tu cuenta y empezar a usar la app.',
      cta: 'Confirmar cuenta',
    },
    en: {
      subject: 'Confirm your Blumm account',
      title: 'Welcome to Blumm',
      body: 'Thanks for joining. Confirm your email to activate your account and start using the app.',
      cta: 'Confirm account',
    },
    fr: {
      subject: 'Confirme ton compte Blumm',
      title: 'Bienvenue sur Blumm',
      body: "Merci de nous avoir rejointes. Confirme ton email pour activer ton compte et commencer à utiliser l'app.",
      cta: 'Confirmer le compte',
    },
    it: {
      subject: 'Conferma il tuo account Blumm',
      title: 'Benvenuta su Blumm',
      body: "Grazie per esserti unita. Conferma la tua email per attivare l'account e iniziare a usare l'app.",
      cta: 'Conferma account',
    },
  },
  magiclink: {
    es: {
      subject: 'Tu enlace de acceso a Blumm',
      title: 'Accede a tu cuenta',
      body: 'Pulsa el botón para iniciar sesión en Blumm sin contraseña. Este enlace caduca en 1 hora.',
      cta: 'Iniciar sesión',
    },
    en: {
      subject: 'Your Blumm magic link',
      title: 'Sign in to your account',
      body: 'Click the button to sign in to Blumm without a password. This link expires in 1 hour.',
      cta: 'Sign in',
    },
    fr: {
      subject: 'Ton lien de connexion Blumm',
      title: 'Accéder à ton compte',
      body: 'Clique sur le bouton pour te connecter à Blumm sans mot de passe. Ce lien expire dans 1 heure.',
      cta: 'Se connecter',
    },
    it: {
      subject: 'Il tuo link di accesso Blumm',
      title: 'Accedi al tuo account',
      body: "Clicca il pulsante per accedere a Blumm senza password. Questo link scade tra 1 ora.",
      cta: 'Accedi',
    },
  },
  recovery: {
    es: {
      subject: 'Restablece tu contraseña de Blumm',
      title: 'Restablece tu contraseña',
      body: 'Hemos recibido una solicitud para restablecer tu contraseña. Si no has sido tú, puedes ignorar este email.',
      cta: 'Restablecer contraseña',
    },
    en: {
      subject: 'Reset your Blumm password',
      title: 'Reset your password',
      body: "We received a request to reset your password. If that wasn't you, you can ignore this email.",
      cta: 'Reset password',
    },
    fr: {
      subject: 'Réinitialise ton mot de passe Blumm',
      title: 'Réinitialiser ton mot de passe',
      body: "Nous avons reçu une demande de réinitialisation de ton mot de passe. Si ce n'était pas toi, ignore cet email.",
      cta: 'Réinitialiser le mot de passe',
    },
    it: {
      subject: 'Reimposta la tua password Blumm',
      title: 'Reimposta la password',
      body: 'Abbiamo ricevuto una richiesta di reimpostazione della password. Se non sei stata tu, ignora questa email.',
      cta: 'Reimposta password',
    },
  },
  email_change: {
    es: {
      subject: 'Confirma tu nuevo email',
      title: 'Confirma tu nuevo email',
      body: 'Confirma que quieres usar esta dirección para tu cuenta de Blumm.',
      cta: 'Confirmar nuevo email',
    },
    en: {
      subject: 'Confirm your new email',
      title: 'Confirm your new email',
      body: 'Confirm that you want to use this address for your Blumm account.',
      cta: 'Confirm new email',
    },
    fr: {
      subject: 'Confirme ton nouvel email',
      title: 'Confirmer ton nouvel email',
      body: 'Confirme que tu souhaites utiliser cette adresse pour ton compte Blumm.',
      cta: 'Confirmer le nouvel email',
    },
    it: {
      subject: 'Conferma la tua nuova email',
      title: 'Conferma la nuova email',
      body: 'Conferma che vuoi usare questo indirizzo per il tuo account Blumm.',
      cta: 'Conferma nuova email',
    },
  },
  email_change_new: {
    es: {
      subject: 'Confirma tu nuevo email',
      title: 'Confirma tu nuevo email',
      body: 'Confirma que quieres usar esta dirección para tu cuenta de Blumm.',
      cta: 'Confirmar nuevo email',
    },
    en: {
      subject: 'Confirm your new email',
      title: 'Confirm your new email',
      body: 'Confirm that you want to use this address for your Blumm account.',
      cta: 'Confirm new email',
    },
    fr: {
      subject: 'Confirme ton nouvel email',
      title: 'Confirmer ton nouvel email',
      body: 'Confirme que tu souhaites utiliser cette adresse pour ton compte Blumm.',
      cta: 'Confirmer le nouvel email',
    },
    it: {
      subject: 'Conferma la tua nuova email',
      title: 'Conferma la nuova email',
      body: 'Conferma che vuoi usare questo indirizzo per il tuo account Blumm.',
      cta: 'Conferma nuova email',
    },
  },
  invite: {
    es: {
      subject: 'Te han invitado a Blumm',
      title: 'Te han invitado a Blumm',
      body: 'Alguien te ha invitado a unirte a Blumm. Acepta la invitación para crear tu cuenta.',
      cta: 'Aceptar invitación',
    },
    en: {
      subject: "You've been invited to Blumm",
      title: "You've been invited to Blumm",
      body: "Someone has invited you to join Blumm. Accept the invitation to create your account.",
      cta: 'Accept invitation',
    },
    fr: {
      subject: 'Tu as été invitée sur Blumm',
      title: 'Tu as été invitée sur Blumm',
      body: 'Quelqu\'un t\'a invitée à rejoindre Blumm. Accepte l\'invitation pour créer ton compte.',
      cta: "Accepter l'invitation",
    },
    it: {
      subject: 'Sei stata invitata su Blumm',
      title: 'Sei stata invitata su Blumm',
      body: 'Qualcuno ti ha invitata a unirti a Blumm. Accetta l\'invito per creare il tuo account.',
      cta: "Accetta l'invito",
    },
  },
  reauthentication: {
    es: {
      subject: 'Tu código de verificación de Blumm',
      title: 'Verifica tu identidad',
      body: 'Usa este código para confirmar una acción sensible en tu cuenta. Caduca en unos minutos.',
      cta: '',
    },
    en: {
      subject: 'Your Blumm verification code',
      title: 'Verify your identity',
      body: 'Use this code to confirm a sensitive action on your account. It expires in a few minutes.',
      cta: '',
    },
    fr: {
      subject: 'Ton code de vérification Blumm',
      title: 'Vérifie ton identité',
      body: 'Utilise ce code pour confirmer une action sensible sur ton compte. Il expire dans quelques minutes.',
      cta: '',
    },
    it: {
      subject: 'Il tuo codice di verifica Blumm',
      title: 'Verifica la tua identità',
      body: 'Usa questo codice per confermare un\'azione sensibile sul tuo account. Scade tra pochi minuti.',
      cta: '',
    },
  },
};

const fallbackNote: Record<Lang, string> = {
  es: 'Si el botón no funciona, copia y pega este enlace:',
  en: "If the button doesn't work, copy and paste this link:",
  fr: 'Si le bouton ne fonctionne pas, copie et colle ce lien :',
  it: 'Se il pulsante non funziona, copia e incolla questo link:',
};

const ignoreNote: Record<Lang, string> = {
  es: 'Si no has solicitado esto, ignora este email.',
  en: "If you didn't request this, ignore this email.",
  fr: "Si tu n'as pas demandé cela, ignore cet email.",
  it: 'Se non hai richiesto questo, ignora questa email.',
};

// ── HTML builder ─────────────────────────────────────────────────────────────

const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace";
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const ORANGE = '#FE6004';

function buildHtml(opts: {
  lang: Lang;
  title: string;
  body: string;
  cta: string;
  confirmationUrl?: string;
  token?: string;
  isOtp?: boolean;
  actionType: EmailActionType;
}): string {
  const { lang, title, body, cta, confirmationUrl, token, isOtp, actionType } = opts;

  const ctaBlock = isOtp
    ? `<tr>
        <td style="padding:0 32px 8px 32px;text-align:center;">
          <div style="display:inline-block;background-color:#F5F5F5;border-radius:12px;padding:18px 36px;font-family:${MONO};font-size:30px;font-weight:700;letter-spacing:8px;color:#0A0A0A;">${token}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 32px 32px 32px;text-align:center;">
          <p style="margin:0;font-family:${MONO};font-size:11px;color:#A3A3A3;">${ignoreNote[lang]}</p>
        </td>
      </tr>`
    : `<tr>
        <td style="padding:0 32px 24px 32px;text-align:center;">
          <a href="${confirmationUrl}" style="display:inline-block;background-color:${ORANGE};color:#FFFFFF;font-family:${MONO};font-size:14px;font-weight:700;text-decoration:none;padding:14px 34px;border-radius:999px;">${cta}</a>
        </td>
      </tr>
      <tr>
        <td style="padding:0 32px 32px 32px;">
          <p style="margin:0;font-family:${MONO};font-size:11px;line-height:16px;color:#A3A3A3;text-align:center;">${fallbackNote[lang]}<br><a href="${confirmationUrl}" style="color:#429FE7;word-break:break-all;">${confirmationUrl}</a></p>
        </td>
      </tr>`;

  return `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background-color:#F5F5F5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F5F5;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#FFFFFF;border-radius:20px;">
          <tr>
            <td style="padding:36px 32px 0 32px;text-align:center;">
              <img src="https://blummapp.com/blumm-logo.png" alt="Blumm" width="110" style="display:block;margin:0 auto;height:auto;border:0;">
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px 8px 32px;">
              <h1 style="margin:0;font-family:${SANS};font-size:22px;font-weight:800;color:#0A0A0A;text-align:center;">${title}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 28px 32px;">
              <p style="margin:0;font-family:${MONO};font-size:14px;line-height:22px;color:#525252;text-align:center;">${body}</p>
            </td>
          </tr>
          ${ctaBlock}
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
          <tr>
            <td style="padding:24px 32px 0 32px;text-align:center;">
              <p style="margin:0;font-family:${MONO};font-size:11px;color:#A3A3A3;">Blumm · <a href="https://blummapp.com" style="color:#A3A3A3;">blummapp.com</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── URL builder ──────────────────────────────────────────────────────────────

function buildConfirmationUrl(
  supabaseUrl: string,
  tokenHash: string,
  actionType: EmailActionType,
  redirectTo: string,
): string {
  // Convierte action type al tipo que espera el endpoint /verify
  const typeMap: Partial<Record<EmailActionType, string>> = {
    signup: 'signup',
    magiclink: 'magiclink',
    recovery: 'recovery',
    email_change: 'email_change',
    email_change_new: 'email_change_new',
    invite: 'invite',
  };
  const verifyType = typeMap[actionType] ?? actionType;
  const params = new URLSearchParams({ token: tokenHash, type: verifyType, redirect_to: redirectTo });
  return `${supabaseUrl}/auth/v1/verify?${params.toString()}`;
}

// ── Handler principal ────────────────────────────────────────────────────────

// ── Standard Webhooks verification ──────────────────────────────────────────
// Supabase firma el body con HMAC-SHA256 usando el secret (v1,whsec_<base64>)
// Cabeceras: webhook-id · webhook-timestamp · webhook-signature

async function verifyWebhookSignature(req: Request, body: string): Promise<boolean> {
  const secret = Deno.env.get('HOOK_SECRET') ?? '';
  if (!secret) return true; // sin secret configurado, no verificar (dev)

  const msgId = req.headers.get('webhook-id') ?? '';
  const msgTimestamp = req.headers.get('webhook-timestamp') ?? '';
  const msgSignature = req.headers.get('webhook-signature') ?? '';
  if (!msgId || !msgTimestamp || !msgSignature) return false;

  // Extraer bytes del secret (formato v1,whsec_<base64>)
  const b64 = secret.replace(/^v1,whsec_/, '');
  const keyBytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

  // Contenido firmado: "{id}.{timestamp}.{body}"
  const signedContent = `${msgId}.${msgTimestamp}.${body}`;
  const encoder = new TextEncoder();

  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(signedContent));
  const computedB64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  const computedSig = `v1,${computedB64}`;

  // webhook-signature puede contener múltiples firmas separadas por espacio
  return msgSignature.split(' ').some((s) => s === computedSig);
}

Deno.serve(async (req: Request) => {
  // Solo POST
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const body = await req.text();

  // Verificar firma Standard Webhooks
  const valid = await verifyWebhookSignature(req, body);
  if (!valid) {
    return new Response('Unauthorized', { status: 401 });
  }

  const payload: HookPayload = JSON.parse(body);
  const { user, email_data } = payload;
  const { email_action_type, token, token_hash, token_hash_new, redirect_to, site_url } = email_data;

  // ── Buscar idioma de la usuaria ──────────────────────────────────────────
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  let lang: Lang = 'es'; // fallback

  // Timeout de 3s para no superar el límite de 5s del hook
  const langFromUrl = (): Lang => {
    try {
      const url = new URL(redirect_to);
      const urlLang = url.searchParams.get('lang') ?? '';
      if (['es', 'en', 'fr', 'it'].includes(urlLang)) return urlLang as Lang;
    } catch { /* noop */ }
    return 'es';
  };

  try {
    const admin = createClient(supabaseUrl, serviceRoleKey);

    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 3000)
    );
    const queryPromise = admin
      .from('profiles')
      .select('profile_extended')
      .eq('id', user.id)
      .maybeSingle()
      .then((r) => r.data);

    const data = await Promise.race([queryPromise, timeoutPromise]);
    const candidate = data?.profile_extended?.language;

    if (candidate && ['es', 'en', 'fr', 'it'].includes(candidate)) {
      lang = candidate as Lang;
    } else {
      // Usuaria nueva (signup) o sin idioma — leer ?lang= del redirectTo
      lang = langFromUrl();
    }
  } catch {
    lang = langFromUrl();
  }

  // ── Construir email ──────────────────────────────────────────────────────
  const t = i18n[email_action_type]?.[lang] ?? i18n[email_action_type]?.['es'];
  if (!t) {
    // Tipo desconocido — dejar que Supabase lo gestione con su template por defecto
    return new Response(JSON.stringify({}), { status: 200 });
  }

  const isOtp = email_action_type === 'reauthentication';

  // Para email_change_new usamos el token_hash_new
  const effectiveHash =
    email_action_type === 'email_change_new' && token_hash_new
      ? token_hash_new
      : token_hash;

  const confirmationUrl = isOtp
    ? undefined
    : buildConfirmationUrl(supabaseUrl, effectiveHash, email_action_type, redirect_to);

  const html = buildHtml({
    lang,
    title: t.title,
    body: t.body,
    cta: t.cta,
    confirmationUrl,
    token,
    isOtp,
    actionType: email_action_type,
  });

  // ── Enviar vía Resend ────────────────────────────────────────────────────
  const resendKey = Deno.env.get('RESEND_API_KEY') ?? '';
  const fromAddress = Deno.env.get('EMAIL_FROM') ?? 'Blumm <hola@blummapp.com>';

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [user.email],
      subject: t.subject,
      html,
    }),
  });

  if (!resendRes.ok) {
    const err = await resendRes.text();
    console.error(`Resend error ${resendRes.status}: ${err}`);
    // Devolvemos error para que Supabase pueda reintentar
    return new Response(JSON.stringify({ error: `Resend error: ${resendRes.status}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Respuesta vacía = éxito para el hook de Supabase
  return new Response(JSON.stringify({}), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
