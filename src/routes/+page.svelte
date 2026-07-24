<script lang="ts">
  import {
    DEMO_ACCOUNT_INPUT,
    type ShapeAccount,
  } from "$lib/account";
  import { onMount } from "svelte";

  type StatusTone = "idle" | "working" | "success" | "error";

  let accountReference = $state(DEMO_ACCOUNT_INPUT);
  let migrationKey = $state("");
  let account = $state<ShapeAccount | null>(null);
  let connectedAddress = $state("");
  let statusTone = $state<StatusTone>("idle");
  let statusMessage = $state("Log in to TinyCloud to begin.");
  let connecting = $state(false);
  let migrating = $state(false);

  onMount(() => {
    const codeFromUrl = new URL(window.location.href).searchParams.get("code");
    if (codeFromUrl) accountReference = codeFromUrl;
  });

  async function connect() {
    connecting = true;
    statusTone = "working";
    statusMessage = "Waiting for OpenKey and TinyCloud authorization…";

    try {
      const { connectTinyCloud } = await import("$lib/tinycloud");
      const auth = await connectTinyCloud();
      connectedAddress = auth.address;
      statusTone = "success";
      statusMessage = "TinyCloud is connected. Enter the migration details.";
    } catch (error) {
      statusTone = "error";
      statusMessage =
        error instanceof Error ? error.message : "TinyCloud connection failed";
    } finally {
      connecting = false;
    }
  }

  async function migrateAccount() {
    if (!connectedAddress) return;

    migrating = true;
    account = null;
    statusTone = "working";
    statusMessage = "Retrieving the Shape account…";

    try {
      const response = await fetch("/api/account", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${migrationKey}`,
        },
        body: JSON.stringify({ accountCode: accountReference }),
      });
      const payload = (await response.json()) as {
        account?: ShapeAccount;
        error?: string;
      };

      if (!response.ok || !payload.account) {
        throw new Error(payload.error || "Shape account lookup failed");
      }

      account = payload.account;
      statusMessage = `Writing accounts/${payload.account.accountId}…`;
      const { importAccount } = await import("$lib/tinycloud");
      const key = await importAccount(payload.account);
      statusTone = "success";
      statusMessage = `Migration complete. Stored at ${key}.`;
    } catch (error) {
      statusTone = "error";
      statusMessage =
        error instanceof Error ? error.message : "Account migration failed";
    } finally {
      migrating = false;
    }
  }
</script>

<svelte:head>
  <title>Migrate account · Shaperotator</title>
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
      <h1 id="page-title">Migrate a Shape account</h1>
      <p>
        Log in, provide the Shape account code and migration key, then migrate
        the account into your TinyCloud space.
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

      <div class="step">
        <h3><span>1</span> Log in to TinyCloud</h3>
        <p>
          Authorize access to the <code>accounts/</code> prefix in your
          Shaperotator space.
        </p>
        <button
          class="button primary"
          type="button"
          onclick={connect}
          disabled={connecting || Boolean(connectedAddress)}
        >
          {connectedAddress
            ? "Logged in to TinyCloud"
            : connecting
              ? "Logging in…"
              : "Log in to TinyCloud"}
        </button>
        {#if connectedAddress}
          <p class="connected-address" title={connectedAddress}>
            Connected as {connectedAddress}
          </p>
        {/if}
      </div>

      <div class="divider"></div>

      <form onsubmit={(event) => { event.preventDefault(); migrateAccount(); }}>
        <fieldset disabled={!connectedAddress || migrating}>
          <legend><span>2</span> Enter migration details</legend>

          <label for="account-code">Shape account code or URL</label>
          <input
            id="account-code"
            name="account-code"
            type="text"
            bind:value={accountReference}
            autocomplete="off"
            required
          />
          <p class="field-help">
            Loaded from this page’s <code>?code=…</code> when present; URLs
            containing a code also work.
          </p>

          <label for="migration-key">9-digit migration key</label>
          <input
            id="migration-key"
            name="migration-key"
            type="password"
            bind:value={migrationKey}
            inputmode="numeric"
            pattern="[0-9]{9}"
            minlength="9"
            maxlength="9"
            autocomplete="off"
            required
          />
          <p class="field-help">
            Provided privately by the Shape admin.
          </p>

          <div class="divider"></div>

          <div class="step">
            <h3><span>3</span> Migrate account</h3>
            <p>
              The migration key is used for this request only and is never
              stored.
            </p>
            <button class="button primary" type="submit">
              {migrating ? "Migrating…" : "Migrate"}
            </button>
          </div>
        </fieldset>
      </form>
    </section>

    <section class="preview" aria-labelledby="preview-title">
      <div class="preview-heading">
        <div>
          <h2 id="preview-title">Migrated account JSON</h2>
          <p>The account payload written inside the TinyCloud import envelope.</p>
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
          <p>No account migrated yet.</p>
          <small>Log in and complete the migration form to see the record.</small>
        </div>
      {/if}
    </section>
  </div>

  <div class:status-error={statusTone === "error"} class="status" aria-live="polite">
    <span class="status-dot" data-tone={statusTone} aria-hidden="true"></span>
    <span>{statusMessage}</span>
  </div>
</main>
