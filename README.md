# Shaperotator

Shaperotator is a small handoff app that imports Shape account data into a
user-owned TinyCloud KV space.

The current Shape API is deliberately mocked:

- account code: `shapedemo-account`
- account URL: `https://shape.example/migrate?code=shapedemo-account`
- 9-digit API key: `123456789`
- response data: deterministic pseudo-random JSON seeded by the account ID

TinyCloud persistence is real. The user first logs in through OpenKey, enters
the account code (or pastes a URL containing it) and 9-digit API key, then
selects **Migrate**. The app fetches the mock record and writes it to:

```text
space: shaperotator
key:   accounts/<accountId>
```

Opening the app with `?code=<accountCode>` pre-fills the account code field.

## Local development

Requires [Bun](https://bun.sh/).

```bash
bun install
bun run dev
```

The development server defaults to `http://localhost:5173`. TinyCloud requests
use `http://127.0.0.1:8000` in development and `https://node.tinycloud.xyz` in
production. Override either environment with:

```bash
VITE_TINYCLOUD_HOST=https://node.tinycloud.xyz bun run dev
```

## Verification

```bash
bun test
bun run check
bun run build
```

## Handoff boundary

`src/routes/api/account/+server.ts` is the seam to replace with the real Shape
API. Keep the response type in `src/lib/account.ts` stable, move the API key to
server-side configuration, and replace only the mock request handler.

The UI never stores the Shape API key in TinyCloud. Only the returned account
record and import metadata are written.
