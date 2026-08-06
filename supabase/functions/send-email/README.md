# send-email — Auth Hook multiidioma

Edge Function que intercepta todos los emails de autenticación de Supabase
y los envía en el idioma preferido de la usuaria (es / en / fr / it) vía Resend.

## Emails que cubre

| Tipo Supabase | Email |
|---|---|
| `signup` | Confirmación de cuenta |
| `magiclink` | Enlace mágico de acceso |
| `recovery` | Restablecimiento de contraseña |
| `email_change` / `email_change_new` | Cambio de email |
| `invite` | Invitación |
| `reauthentication` | Código OTP de verificación |

## Setup paso a paso

### 1. Crear cuenta en Resend

1. Ve a [resend.com](https://resend.com) → Create account (gratis, 3 000 emails/mes)
2. Dashboard → **API Keys** → Create API Key → copia la clave
3. Dashboard → **Domains** → Add Domain → verifica `blummapp.com`
4. Una vez verificado, el from address `hola@blummapp.com` estará disponible

### 2. Desplegar la función

```bash
supabase functions deploy send-email --no-verify-jwt
```

> `--no-verify-jwt` es necesario porque el hook no lleva JWT de usuario,
> sino el shared secret propio del hook.

### 3. Configurar Secrets en Supabase

En el Dashboard → **Edge Functions → send-email → Secrets** (o vía CLI):

```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
supabase secrets set SUPABASE_HOOK_SECRET=un-secreto-largo-aleatorio
supabase secrets set EMAIL_FROM="Blumm <hola@blummapp.com>"
```

`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` ya están disponibles automáticamente
en todas las Edge Functions — no hace falta configurarlos.

### 4. Activar el Hook en Supabase

1. Dashboard → **Authentication → Hooks**
2. En **Send Email** → Enable
3. URL: `https://<project-ref>.supabase.co/functions/v1/send-email`
4. Secret: el mismo valor que pusiste en `SUPABASE_HOOK_SECRET`
5. Guardar

### 5. Desactivar los templates nativos de Supabase

Una vez activo el hook, Supabase no usará sus propios templates — los emails
los enviará esta función. Puedes dejar los templates HTML tal como están
(sirven como referencia), pero ya no se usarán.

## Lógica de idioma

La función busca `profiles.profile_extended->>'language'` para el `user.id`
que llega en el payload del hook. Si no hay perfil (usuaria nueva en signup)
o el idioma no es uno de los 4 soportados, usa `es` como fallback.

## Test local

```bash
supabase functions serve send-email

curl -X POST http://localhost:54321/functions/v1/send-email \
  -H "Authorization: Bearer <SUPABASE_HOOK_SECRET>" \
  -H "Content-Type: application/json" \
  -d '{
    "user": { "id": "<uuid>", "email": "test@example.com" },
    "email_data": {
      "token": "123456",
      "token_hash": "abc123",
      "redirect_to": "https://blummapp.com",
      "email_action_type": "signup",
      "site_url": "https://<project-ref>.supabase.co"
    }
  }'
```
