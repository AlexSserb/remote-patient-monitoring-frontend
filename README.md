# Remote Patient Monitoring — Frontend

Next.js 16 frontend for a remote monitoring system for patients with endocrine disorders.

## Authentication

### Flow

Login is a two-step process (2FA via email OTP):

1. **Step 1 — credentials** (`POST /api/auth/login/`): the user submits email and password. On success the backend sends a one-time code to the user's email and returns a short-lived `pre_auth_token`.
2. **Step 2 — OTP** (`POST /api/auth/verify-otp/`): the user submits the OTP together with the `pre_auth_token`. On success the backend returns a JWT `access` token and a `refresh` token.
3. **Session** — the frontend passes both tokens to the internal Route Handler `POST /api/auth/session`, which sets them as `httpOnly; Secure; SameSite=Strict` cookies. Raw tokens are never stored in JS-accessible storage.
4. **Renewal** — when the access token expires, the Route Handler `POST /api/auth/session/refresh` reads the refresh cookie, calls the backend token-refresh endpoint, and re-sets both cookies.
5. **Logout** (`POST /api/auth/logout/`) — the Route Handler clears the cookies and sends the refresh token to the backend blacklist.

### Token storage

| Token     | Where             | Why                                          |
| --------- | ----------------- | -------------------------------------------- |
| `access`  | `httpOnly` cookie | Not accessible via JavaScript; immune to XSS |
| `refresh` | `httpOnly` cookie | Not accessible via JavaScript; immune to XSS |

Auth state on the client is derived from a lightweight `GET /api/auth/session` check performed in React context on mount — the browser sends the cookies automatically; the Route Handler validates the access token and returns the public user payload.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
