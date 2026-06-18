# Roadmap

Direction for the `mediakind-rx1` Companion module. This is a living document — priorities
shift with user feedback and MediaKind RX1 firmware changes. For _how_ to ship any of this,
see [`RELEASING.md`](./RELEASING.md).

Current version: **1.0.0** (not yet published to the Bitfocus Module Store).

## Release Readiness (blocks first store submission)

These are the gaps between "works on my bench" and "ready for the public Module Store." They
should land before — or as part of — the first store release.

- [x] **Real end-user HELP.md.** `companion/HELP.md` documents the config fields, actions,
      feedbacks, variable naming scheme, presets, and troubleshooting. The store displays this
      to users.
- [x] **Flesh out README.md.** README now covers overview, features, config, developing, and
      links to HELP.md, ROADMAP, RELEASING, and the API reference.
- [ ] **(partial) Confirm device API assumptions.** `serverId` is now a config field (default
      `Receiver1`) instead of hardcoded; `id=0` for the server stats call remains fixed. Still
      needs validation against real RX1 units across deployments (hardware-dependent).
- [ ] **Authentication / HTTPS.** The module talks plain `http` with no auth. Confirm whether
      production RX1 units require credentials or TLS; if so this is a release blocker.
- [ ] **Field-test against real hardware** across a poll cycle, start/stop, and a connection
      drop, confirming status transitions and variable clearing behave.

## v1.x — Near term (backward-compatible)

Additive work; no breaking changes to config, option ids, or variable ids.

- [x] **Resilience:** `makeRequest` now retries idempotent GETs with exponential backoff;
      POST/PUT/DELETE are not retried (no double start/stop). `ConnectionFailure` → `Ok`
      recovery is driven by the polling loop.
- [x] **Reduce redundant work:** variable _definitions_ are now only re-registered when the
      definition set actually changes (signature check in `src/variables.js`); _values_ still
      push every poll.
- [x] **De-duplicate `formatBitrate`:** extracted to `src/util.js` (with `sanitizeName`) and
      consumed by both `index.js` and `src/variables.js`.
- [x] **Replace magic numbers:** `connection_status` now checks `self.isConnected`, kept in
      sync via a `setStatus()` wrapper around `updateStatus(InstanceStatus.Ok | …)`.
- [ ] **More feedbacks/variables** driven by user requests (e.g. per-output health, redundancy
      switchover state, alarm summaries).
- [ ] **Presets pass:** ship presets that map to the most common operator buttons so users get
      value without building from scratch.

## v1.x — Quality & tooling

- [x] **Add a test harness.** `node --test` runs (`yarn test`); `test/util.test.js` covers
      `formatBitrate` and `sanitizeName`. Next: status→variable mapping tests with a mocked
      `self`.
- [ ] **Lint:** adopt the `@companion-module/tools` eslint config for consistency beyond
      prettier. Deferred — the official module template ships no eslint config, and the
      existing source isn't prettier-clean (4-space vs tabs), so a `--check` gate would need a
      repo-wide reformat first.
- [x] **Document the REST API surface** we depend on — see [`docs/API.md`](./docs/API.md)
      (endpoints, payload shapes, and known assumptions).

## v2.0 — Possible breaking changes (require upgrade scripts)

Only do these together, behind a major bump, with `src/upgrades.js` migrations:

- [ ] **Stable variable identity:** today per-service variables are keyed by a sanitized
      _service name_, so renaming a service in the RX1 changes variable ids and breaks
      buttons. Consider keying on the stable `serviceId` (with friendly names as labels).
- [ ] **Config restructure** if auth/TLS or multi-receiver support needs new/renamed fields.
- [ ] **Multi-server / multi-receiver** support if a single instance should manage more than
      one RX1 (currently single-host).

## Ongoing

- [ ] Keep `@companion-module/base` and dev deps current (Dependabot opens daily PRs).
- [ ] Cut releases per [`RELEASING.md`](./RELEASING.md): bump `package.json` **and**
      `companion/manifest.json`, tag `vX.Y.Z`, submit via the Developer Portal.
- [ ] Track and triage user-reported issues at
      <https://github.com/justinlauffer/companion-module-mediakind-rx1/issues>.
