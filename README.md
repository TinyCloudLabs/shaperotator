# Shaperotator

Shaperotator is a small handoff app that imports Shape account data into a
user-owned TinyCloud KV space.

The current Shape API is deliberately mocked:

- account code: `shapedemo-account`
- account URL: `https://shape.example/migrate?code=shapedemo-account`
- initial local migration key: `123456789`
- response data: deterministic pseudo-random JSON seeded by the account ID

TinyCloud persistence is real. The user first logs in through OpenKey, enters
the account code (or pastes a URL containing it) and 9-digit migration key, then
selects **Migrate**. The app fetches the mock record and writes it to:

```text
space: shaperotator
key:   accounts/<accountId>
```

Opening the app with `?code=<accountCode>` pre-fills the account code field.

## Dummy server endpoints

The app serves the user and admin operations from separate endpoints:

```text
POST /api/account
POST /api/admin/migration-key
```

The admin endpoint uses a separate admin bearer token. In local development,
the dummy token is `shapedemo_admin_token`. Set `SHAPE_DEMO_ADMIN_TOKEN` for any
non-development environment.

Generate and activate a new random 9-digit migration key:

```bash
curl -X POST \
  -H 'authorization: Bearer shapedemo_admin_token' \
  http://127.0.0.1:5173/api/admin/migration-key
```

Set a specific 9-digit migration key:

```bash
curl -X POST \
  -H 'authorization: Bearer shapedemo_admin_token' \
  -H 'content-type: application/json' \
  -d '{"migrationKey":"987654321"}' \
  http://127.0.0.1:5173/api/admin/migration-key
```

The response contains the active migration key for the admin to share with the
user out of band. Rotating it immediately invalidates the previous key.

This dummy server keeps the active key in process memory. Restarting it resets
the local key to `123456789`; a production implementation should use durable
storage.

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
API. Keep the response type in `src/lib/account.ts` stable, move migration-key
validation to durable server-side state, and replace only the mock request
handler.

The UI never stores the migration key in TinyCloud. Only the returned account
record and import metadata are written.
