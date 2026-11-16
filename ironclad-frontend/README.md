# Ironclad Frontend

Car showroom web UI (static HTML/CSS/JS served by unprivileged nginx), part of the **Ironclad** DevSecOps & GitOps platform.

## How it talks to the backend

The page calls `/api/info` and `/api/cars` as relative paths. The Kubernetes **Ingress** routes `/api/*` to `backend-svc` and everything else here, so this image has no backend address baked in and runs unchanged on any cluster.

## Structure

| Path | Purpose |
|---|---|
| `public/lib.js` | Pure logic (formatting, URL allow-list), unit-tested |
| `public/app.js` | DOM and fetch glue, builds elements with `textContent` (no `innerHTML`) |
| `nginx.conf` | Port 8080, `/healthz` probe, security headers |

## Local

```bash
npm test
```

## Security

- Non-root nginx (UID 101) on port 8080, `server_tokens off`
- Strict Content-Security-Policy: no inline scripts or styles, images only from `images.unsplash.com`
- `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`
- Image URLs from the API are checked against an allow-list before rendering
