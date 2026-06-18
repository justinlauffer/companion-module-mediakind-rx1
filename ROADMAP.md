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
- [ ] **Flesh out README.md.** Currently one line. Add overview, supported devices/firmware,
      setup, and a link to HELP.md.
- [ ] **Confirm device API assumptions.** `serverId=Receiver1` and `id=0` are hardcoded in the
      statistics calls (`index.js`). Verify these hold across RX1 units, or make them
      discovered/configurable before we ship to unknown deployments.
- [ ] **Authentication / HTTPS.** The module talks plain `http` with no auth. Confirm whether
      production RX1 units require credentials or TLS; if so this is a release blocker.
- [ ] **Field-test against real hardware** across a poll cycle, start/stop, and a connection
      drop, confirming status transitions and variable clearing behave.

## v1.x — Near term (backward-compatible)

Additive work; no breaking changes to config, option ids, or variable ids.

- [ ] **Resilience:** retry/backoff for transient HTTP failures in `makeRequest`; avoid
      hammering the device when it's unreachable; surface a clean `ConnectionFailure` →
      `Ok` recovery.
- [ ] **Reduce redundant work:** variable _definitions_ are rebuilt on every poll and after
      every service fetch. Rebuild definitions only when the service set actually changes;
      keep pushing _values_ every poll.
- [ ] **De-duplicate `formatBitrate`:** it's copy-pasted in `index.js` and `src/variables.js`.
      Extract to a shared `src/util.js` so formatting can't drift.
- [ ] **Replace magic numbers:** `connection_status` feedback checks `self.status === 2`; use
      the named `InstanceStatus.Ok` / track status explicitly instead.
- [ ] **More feedbacks/variables** driven by user requests (e.g. per-output health, redundancy
      switchover state, alarm summaries).
- [ ] **Presets pass:** ship presets that map to the most common operator buttons so users get
      value without building from scratch.

## v1.x — Quality & tooling

- [ ] **Add a test harness.** There are currently no tests. Start with unit tests for the pure
      logic (`formatBitrate`, the service-name sanitization, status→variable mapping) using a
      mocked `self`. Wire into CI alongside the existing module checks.
- [ ] **Lint:** adopt the `@companion-module/tools` eslint config (already a transitive option)
      for consistency beyond prettier.
- [ ] **Document the REST API surface** we depend on (endpoints, expected payload shapes) so
      changes in RX1 firmware are easier to spot and adapt to.

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
      </content>
