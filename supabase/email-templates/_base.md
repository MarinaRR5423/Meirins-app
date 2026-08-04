# Plantillas de email — Blumm / Supabase Auth

Diseño compartido para los 6 emails transaccionales de Supabase Auth (pestaña
**Templates** en Authentication → Emails). Cada archivo `.html` de esta carpeta
es el contenido exacto a pegar en el campo "Message body" de su plantilla
correspondiente en el dashboard.

## Sobre las fuentes

Los clientes de email (Gmail, Outlook, Apple Mail...) no cargan fuentes
personalizadas de forma fiable — Bricolage Grotesque y Aglet Mono no se
pueden usar tal cual. Se aproximan con pilas de fuentes "web-safe":

- Títulos → `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif` en negrita/extrabold (aproxima el peso de Bricolage)
- Cuerpo/botones → `ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace` (aproxima Aglet Mono, que sí es monoespaciada)

## Colores de marca usados

- Texto principal: `#0A0A0A`
- Texto secundario: `#525252` / `#A3A3A3`
- Acento (botón CTA): `#FE6004` (naranja Blumm)
- Enlace secundario: `#429FE7`
- Fondo de página: `#F5F5F5`, tarjeta: `#FFFFFF`

## Logo

`https://blummapp.com/blumm-logo.png` — ya alojado en producción (mismo que
usa la legal-website), versión oscura para fondo claro.

## Archivos

| Archivo | Plantilla en Supabase | Variable |
|---|---|---|
| `confirm-signup.html` | Confirm signup | `{{ .ConfirmationURL }}` |
| `reset-password.html` | Reset password | `{{ .ConfirmationURL }}` |
| `magic-link.html` | Magic link | `{{ .ConfirmationURL }}` |
| `change-email.html` | Change email address | `{{ .ConfirmationURL }}` |
| `invite-user.html` | Invite user | `{{ .ConfirmationURL }}` |
| `reauthentication.html` | Reauthentication | `{{ .Token }}` (código, no link) |

Cada archivo trae también la línea de "Subject" recomendada como comentario
al principio — cámbiala en el campo "Subject heading" del dashboard, no
dentro del HTML.
