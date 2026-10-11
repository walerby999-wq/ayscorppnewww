# AYS Corp / Cuadra — Despliegue y configuración

## Arquitectura

- **Sitio estático** sin paso de compilación. Cada página es un archivo `*.dc.html` (Design Component) que se renderiza en el navegador con `support.js`.
- **HTML inicial indexable:** cada ruta tiene en su `<head>` estático el `title`, la descripción, la canónica, `hreflang`, Open Graph/Twitter y el favicon (y JSON-LD en las portadas). Dentro de `<noscript>` va una versión semántica del contenido (H1, H2, textos, precios y enlaces) para rastreadores que no ejecutan JavaScript. Google renderiza JavaScript, pero no dependas de ello para los metadatos.
- **Función serverless:** `api/contact.js` → `POST /api/contact` (Node 18+, sin dependencias) envía las solicitudes a `info@ayscorp.online` mediante la API de Resend.
- **Rutas** (`vercel.json`):

| URL pública | Archivo | Idioma |
|---|---|---|
| `/` | `index.dc.html` | ES |
| `/en` | `en.dc.html` (importa `index` con `lang="en"`) | EN |
| `/aviso-legal` · `/legal-notice` | `aviso-legal.dc.html` · `legal-notice.dc.html` | ES · EN |
| `/politica-de-privacidad` · `/privacy-policy` | … | ES · EN |
| `/politica-de-cookies` · `/cookie-policy` | … | ES · EN |
| `/terminos-del-servicio` · `/terms-of-service` | … | ES · EN |

  Todas las rutas están en la raíz, de modo que las rutas relativas (`assets/…`, `./support.js`) funcionan igual en local y en producción. Los archivos `*.dc.html` accedidos directamente envían `X-Robots-Tag: noindex` para evitar contenido duplicado.
- **Idioma:** lo determina la URL. El selector ES/EN es un enlace real (`<a href hreflang>`) a la página equivalente y recuerda la elección en `localStorage` (`cuadra_lang`).
- **No se despliegan** (`.vercelignore`): `backup/`, `uploads/`, `screenshots/`, `.claude/`, `DEPLOY.md`, `.env.example`.

## 1. Formulario → info@ayscorp.online (Resend)

Estado actual: **el código está listo, pero no se ha probado en producción.** Para probarlo faltan las credenciales, la verificación del dominio y un despliegue real.

1. Crea una cuenta en https://resend.com.
2. **Verifica el dominio:** Resend → *Domains* → *Add domain* → `ayscorp.online` (o un subdominio de envío como `send.ayscorp.online`). Añade en tu DNS los registros que indique Resend (SPF/MX y DKIM; DMARC recomendado) y espera a que el estado sea *Verified*.
3. **Crea la clave API:** Resend → *API Keys* → *Create API key* con permiso *Sending access* (limitada a ese dominio si es posible). Cópiala: solo se muestra una vez.
4. **Variables en Vercel** → *Project → Settings → Environment Variables* (entorno *Production*, y *Preview* si quieres probar ahí):
   - `RESEND_API_KEY` = la clave de Resend (secreta).
   - `CONTACT_FROM` = `Cuadra <formularios@ayscorp.online>` (cualquier dirección del dominio verificado). No uses `info@ayscorp.online` como remitente salvo que también esté autorizada en Resend.
   - `ALLOWED_ORIGINS` = `https://www.ayscorp.online,https://ayscorp.online`
   - `ALLOW_VERCEL_PREVIEWS` = `true` solo si quieres enviar desde URLs `*.vercel.app`.
5. **Vuelve a desplegar:** *Deployments* → último despliegue → *Redeploy* (las variables solo se aplican en despliegues nuevos), o haz `git push`.
6. **Prueba:** envía **una** solicitud desde https://www.ayscorp.online/#contacto, comprueba la respuesta `200 {"ok":true,"id":"…"}` en la pestaña *Network*, revisa *Resend → Emails* (estado *Delivered*) y la bandeja de `info@ayscorp.online`.

Destinatario fijo en el código (`info@ayscorp.online`). El email del visitante se usa solo como `Reply-To`, después de validarlo. Asunto: «Nueva solicitud de demo — Cuadra · {Empresa}».

**Seguridad aplicada:** validación en servidor (longitudes, email, valores permitidos de sector/volumen, consentimiento), escape HTML del contenido, campo trampa (*honeypot*), tiempo mínimo de 3 s con el formulario abierto, comprobación de `Origin`, límite de 5 envíos cada 10 min por IP (en memoria, por instancia; para un límite estricto usa Upstash Redis o Vercel KV), errores sin detalles internos y `Cache-Control: no-store`.

**Estados en la web:** validación en cliente (errores por campo y foco en el primero), *Enviando…* con el botón desactivado, éxito solo si el servidor confirma que Resend lo ha aceptado, error temporal o límite de envíos con los datos conservados y posibilidad de reintentar, y servicio no configurado (503) con un mensaje claro. En la vista previa del editor (sin servidor) se muestra un aviso explícito de que no se ha enviado nada.

Para probar en local: `npm i -g vercel`, `vercel link`, `vercel env pull .env.local` y `vercel dev`.

## 2. Tipografía

- **Titulares (H1, H2, títulos de capas y de páginas legales):** *Newsreader* (Production Type, SIL Open Font License), con pesos 400/500 y cursiva para el acento del H1. Es una serif editorial con eje óptico: aporta credibilidad y personalidad «financiera» sin perder legibilidad.
- **Interfaz, texto, tablas, cifras y precios:** *Geist* (Vercel, SIL OFL), con pesos 400/500/600 y `tabular-nums` en las cifras.
- **Referencias, etiquetas y datos técnicos:** *Geist Mono* (SIL OFL).
- Alternativas del sistema: Georgia para la serif y system-ui para la sans.

**Pendiente: alojar las fuentes en el propio servidor.** Ahora se cargan desde Google Fonts, lo que envía la IP del visitante a Google (ya se indica en las políticas). No he podido descargar los archivos binarios en este entorno. Pasos:
1. Descarga los WOFF2 de las fuentes oficiales: https://github.com/vercel/geist-font/releases (Geist, Geist Mono) y https://github.com/productiontype/Newsreader (o la descarga de Google Fonts). Incluye el `OFL.txt` de cada una.
2. Guárdalos en `assets/fonts/` (solo los pesos usados: Geist 400/500/600, Geist Mono 400/500 y Newsreader 400/500 normal y 400/500 cursiva).
3. En el `<helmet>` de `index.dc.html` y `Legal.dc.html`, sustituye el `<link>` de Google Fonts por reglas `@font-face { font-family:'Geist'; src:url('assets/fonts/…woff2') format('woff2'); font-weight:400; font-display:swap; }` y elimina los `preconnect`.
4. Actualiza la política de privacidad y la de cookies, que hoy mencionan Google Fonts.

## 3. SEO

Ya hecho:
- `title` y descripción únicos por URL (10 URLs: portada y 4 páginas legales, en ES y EN).
- Canónica absoluta en `https://www.ayscorp.online`, `hreflang` es/en/x-default con equivalentes reales y `lang` correcto en `<html>`.
- Open Graph y Twitter con `assets/og-image.png` (1200×630).
- JSON-LD en las portadas: `Organization` (nombre, URL, logo, email), `WebSite` y `SoftwareApplication` con ofertas de 89 € y 149 €/mes sin IVA. Sin valoraciones, reseñas, dirección ni datos que no se vean en la página.
- `sitemap.xml` con las 10 URLs y sus alternativas, y `robots.txt` (permite todo salvo `/api/`).
- Enlaces rastreables `<a href>` en el menú, el footer y el selector de idioma.
- Copy reforzado con naturalidad: conciliación de facturas, cobros y extractos; conciliación para clínicas y para pymes.

Pendiente (requiere el sitio desplegado):
- [ ] Comprobar que `ayscorp.online` redirige a `www.ayscorp.online` (Vercel → *Domains*: marcar www como principal).
- [ ] Revisar las 10 URLs con `curl -I` (200) y `curl -s URL | grep -E "<title>|canonical|hreflang"`.
- [ ] Validar el JSON-LD con https://validator.schema.org y la Prueba de resultados enriquecidos de Google.
- [ ] Dar de alta la propiedad en Google Search Console, enviar el `sitemap.xml` e inspeccionar `/` y `/en`.
- [ ] Ejecutar Lighthouse / PageSpeed Insights (no se ha medido; no hay puntuaciones).
- [ ] Opcional, mejora mayor: generar HTML prerenderizado completo por ruta (por ejemplo, migrando a Astro o con un script de prerender) si se quiere que todo el contenido visible esté en el HTML inicial sin depender de `<noscript>`.

## 4. Antes de publicar (checklist)

1. Completar los datos legales marcados como «Pendiente» (razón social, NIF, domicilio, registro, conservación, proveedores, prueba y cancelación, jurisdicción).
2. Configurar Resend y las variables (sección 1) y redesplegar.
3. Enviar una solicitud de prueba real y confirmar que llega.
4. Confirmar que no hay analítica activa en Vercel. Si se activa, hay que implantar antes un sistema de consentimiento.
5. Alojar las fuentes localmente (sección 2).
6. Repasar la checklist SEO (sección 3).

## Skill de diseño

`.claude/skills/design-director/` (formato de skills de Claude Code: `SKILL.md` con *frontmatter* `name`/`description` y la carpeta `references/`).
- **Ámbito proyecto:** Claude Code la carga desde `.claude/skills/` de este repositorio.
- **Para todos tus proyectos:** cópiala a `~/.claude/skills/design-director/`.
- **Invocación:** se activa sola cuando la tarea encaja con su descripción (diseño, revisión o refinamiento visual), o puedes pedirla expresamente: «usa la skill design-director para revisar esta página». Comprueba con tu versión de Claude Code que las skills están habilitadas (`/skills` o la documentación de tu instalación).

## Copias de seguridad

`backup/2026-10-fase1/`: versión anterior a la fase 2 de todas las páginas y archivos de configuración modificados.
