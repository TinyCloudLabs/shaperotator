<script lang="ts">
  import {
    DEMO_ACCOUNT_URL,
    DEMO_API_KEY,
    type ShapeAccount,
  } from "$lib/account";

  type StatusTone = "idle" | "working" | "success" | "error";

  let accountUrl = $state(DEMO_ACCOUNT_URL);
  let apiKey = $state(DEMO_API_KEY);
  let account = $state<ShapeAccount | null>(null);
  let connectedAddress = $state("");
  let statusTone = $state<StatusTone>("idle");
  let statusMessage = $state(
    "Fetch the mock record, inspect it, then import it.",
  );
  let fetching = $state(false);
  let connecting = $state(false);
  let importing = $state(false);

  async function fetchAccount() {
    fetching = true;
    account = null;
    statusTone = "working";
    statusMessage = "Checking the Shape account link…";

    try {
      const response = await fetch("/api/account", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ accountUrl }),
      });
      const payload = (await response.json()) as {
        account?: ShapeAccount;
        error?: string;
      };

      if (!response.ok || !payload.account) {
        throw new Error(payload.error || "Shape account lookup failed");
      }

      account = payload.account;
      statusTone = "success";
      statusMessage = `Fetched mock data for ${payload.account.accountId}.`;
    } catch (error) {
      statusTone = "error";
      statusMessage =
        error instanceof Error ? error.message : "Shape account lookup failed";
    } finally {
      fetching = false;
    }
  }

  async function connect() {
    connecting = true;
    statusTone = "working";
    statusMessage = "Waiting for OpenKey and TinyCloud authorization…";

    try {
      const { connectTinyCloud } = await import("$lib/tinycloud");
      const auth = await connectTinyCloud();
      connectedAddress = auth.address;
      statusTone = "success";
      statusMessage = "TinyCloud is connected. The account is ready to import.";
    } catch (error) {
      statusTone = "error";
      statusMessage =
        error instanceof Error ? error.message : "TinyCloud connection failed";
    } finally {
      connecting = false;
    }
  }

  async function storeAccount() {
    if (!account) return;

    importing = true;
    statusTone = "working";
    statusMessage = `Writing accounts/${account.accountId}…`;

    try {
      const { importAccount } = await import("$lib/tinycloud");
      const key = await importAccount(account);
      statusTone = "success";
      statusMessage = `Imported successfully to ${key}.`;
    } catch (error) {
      statusTone = "error";
      statusMessage =
        error instanceof Error ? error.message : "TinyCloud import failed";
    } finally {
      importing = false;
    }
  }
</script>

<svelte:head>
  <title>Import account · Shaperotator</title>
</svelte:head>

<header class="app-header">
  <a class="brand" href="/" aria-label="Shaperotator home">
    <span class="brand-mark" aria-hidden="true">S</span>
    <span>Shaperotator</span>
  </a>
  <span class="environment">Mock Shape API · TinyCloud KV</span>
</header>

<main>
  <section class="intro" aria-labelledby="page-title">
    <div>
      <h1 id="page-title">Import a Shape account</h1>
      <p>
        Fetch one deterministic demo record, verify the JSON, and store it in
        your TinyCloud space.
      </p>
    </div>
    <div class="destination">
      <span>KV destination</span>
      <code>shaperotator/accounts/&lt;accountId&gt;</code>
    </div>
  </section>

  <div class="workspace">
    <section class="workflow" aria-labelledby="workflow-title">
      <h2 id="workflow-title" class="sr-only">Import workflow</h2>

      <form onsubmit={(event) => { event.preventDefault(); fetchAccount(); }}>
        <fieldset disabled={fetching}>
          <legend><span>1</span> Fetch account data</legend>

          <label for="account-url">Shape account link</label>
          <input
            id="account-url"
            name="account-url"
            type="url"
            bind:value={accountUrl}
            autocomplete="url"
            required
          />
          <p class="field-help">
            The final URL segment becomes the deterministic mock seed.
          </p>

          <label for="api-key">Shape API key</label>
          <input
            id="api-key"
            name="api-key"
            type="password"
            bind:value={apiKey}
            autocomplete="off"
            required
          />
          <p class="field-help">
            Demo only: <code>shapedemo_api_key</code>
          </p>

          <button class="button primary" type="submit">
            {fetching ? "Fetching…" : "Fetch account"}
          </button>
        </fieldset>
      </form>

      <div class="divider"></div>

      <div class="step">
        <h3><span>2</span> Connect TinyCloud</h3>
        <p>
          Authorize access to the <code>accounts/</code> prefix in your
          Shaperotator space.
        </p>
        <button
          class="button secondary"
          type="button"
          onclick={connect}
          disabled={connecting || Boolean(connectedAddress)}
        >
          {connectedAddress
            ? "TinyCloud connected"
            : connecting
              ? "Connecting…"
              : "Connect TinyCloud"}
        </button>
        {#if connectedAddress}
          <p class="connected-address" title={connectedAddress}>
            Connected as {connectedAddress}
          </p>
        {/if}
      </div>

      <div class="divider"></div>

      <div class="step">
        <h3><span>3</span> Import record</h3>
        <p>The API key is not stored. Only the previewed record is written.</p>
        <button
          class="button primary"
          type="button"
          onclick={storeAccount}
          disabled={!account || !connectedAddress || importing}
        >
          {importing ? "Importing…" : "Import to TinyCloud"}
        </button>
      </div>
    </section>

    <section class="preview" aria-labelledby="preview-title">
      <div class="preview-heading">
        <div>
          <h2 id="preview-title">Account JSON</h2>
          <p>Exact payload nested inside the TinyCloud import envelope.</p>
        </div>
        {#if account}
          <span class="mock-badge">Mock data</span>
        {/if}
      </div>

      {#if account}
        <pre><code>{JSON.stringify(account, null, 2)}</code></pre>
      {:else}
        <div class="empty-state">
          <span aria-hidden="true">{"{ }"}</span>
          <p>No account fetched yet.</p>
          <small>Use the seeded demo values to generate a preview.</small>
        </div>
      {/if}
    </section>
  </div>

  <div class:status-error={statusTone === "error"} class="status" aria-live="polite">
    <span class="status-dot" data-tone={statusTone} aria-hidden="true"></span>
    <span>{statusMessage}</span>
  </div>
</main>
