# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) and other AI assistants when working with this repository.

## Overview

This is a **Bitfocus Companion module** that controls a **MediaKind RX1 IRD** (Integrated Receiver Decoder) over its HTTP REST API. Companion is a stage/broadcast control surface (Stream Deck, etc.); modules like this one expose a device's capabilities as **actions** (things you can do), **feedbacks** (button styling based on device state), **variables** (live values usable on buttons), and **presets** (ready-made button templates).

The module connects to an RX1 receiver by IP/port, polls it for service and server status, and lets operators start/stop the broadcast "services" the receiver runs.

## Tech Stack & Runtime

- **Language:** plain JavaScript (CommonJS, `require`/`module.exports`), no TypeScript, no build/transpile step.
- **Runtime:** Node.js 22 (`runtime.type: node22` in `companion/manifest.json`). Companion loads the module over `nodejs-ipc`.
- **Core dependency:** `@companion-module/base` (~1.11.3) — provides `InstanceBase`, `Regex`, `InstanceStatus`, `combineRgb`, `runEntrypoint`.
- **Dev tooling:** `@companion-module/tools` (build + shared prettier config), `prettier`.
- **Package manager:** **Yarn 4** (Berry), `nodeLinker: node-modules` (see `.yarnrc.yml`). The `packageManager` field pins `yarn@4.9.1`.

## Commands

```bash
yarn install        # install dependencies
yarn format         # run prettier -w . (uses @companion-module/tools/.prettierrc.json)
yarn package        # build a distributable module package via companion-module-build
```

There is **no test suite** and **no lint script** beyond prettier formatting. CI runs Bitfocus's shared module checks (see below) — there are no local unit tests to run.

## Project Structure

```
index.js                 # Entry point: MediaKindRX1Instance class, HTTP/polling logic, REST helpers
src/
  actions.js             # setActionDefinitions — start/stop/toggle services, custom API calls, server assign
  feedbacks.js           # setFeedbackDefinitions — boolean feedbacks for button styling
  variables.js           # setVariableDefinitions — declares all dynamic variable IDs
  presets.js             # setPresetDefinitions — ready-made button templates
  upgrades.js            # UpgradeScripts array (currently empty: module.exports = [])
companion/
  manifest.json          # Module metadata (id, runtime, maintainer, products)
  HELP.md                # End-user help shown in Companion (currently a stub)
.github/
  workflows/companion-module-checks.yaml   # CI via bitfocus/actions module-checks
  dependabot.yml         # daily npm dependency updates
package.json             # name "mediakind-rx1", scripts, deps
```

## Architecture

### Entry point and lifecycle (`index.js`)

`MediaKindRX1Instance extends InstanceBase` and is registered with `runEntrypoint(MediaKindRX1Instance, UpgradeScripts)` at the bottom of the file. Key lifecycle methods:

- `init(config)` — stores config, registers actions/feedbacks/variables/presets, then calls `initConnection()`.
- `configUpdated(config)` — re-runs `initConnection()` when the user changes settings.
- `destroy()` — clears the polling timer.
- `getConfigFields()` — defines the config UI: `host` (IP), `port` (default 80), `polling` (checkbox), `pollInterval` (seconds, 1–60, only visible when polling enabled).

### Communication

- All device communication is **HTTP** via Node's built-in `http` module, wrapped in `makeRequest(path, method = 'GET', body = null)`, which returns a Promise resolving to parsed JSON (or `{}` / raw text). Non-2xx responses reject.
- There is **no external HTTP library** — do not add `axios`/`node-fetch`; follow the existing `http.request` pattern.
- The RX1 REST API is rooted at `/api/...`. Notable endpoints used:
  - `GET /api/services` — list of services.
  - `GET /api/services/{type}` — services of a given type.
  - `POST /api/services/{type}/{id}/start` and `/stop` — control a service.
  - `GET /api/services/{type}/{id}/config` — export service config.
  - `GET /api/statistics/current?serverId=Receiver1&type=content_processing_server&id=0` — server status.
  - `GET /api/statistics/current?serverId=Receiver1&type=content_processing&id={id}` — per-service status.
  - `PUT`/`DELETE /api/assign/services/{type}/{id}/servers/{serverId}` — assign/remove server.
- **Always `encodeURIComponent` the service type, service ID, and server ID** when building paths (they can contain special characters). This is done consistently throughout — match it.

### Polling and state

- `initConnection()` does an initial `getServices()` → `getServerStatus()` → `pollAllServiceStatus()`, then sets up `this.pollTimer` (a `setInterval`) when polling is enabled.
- In-memory state held on the instance:
  - `this.services` — array of service objects from `/api/services`.
  - `this.serviceChoices` — dropdown choices `{ id: "${serviceType}/${serviceId}", label }` used by actions/feedbacks.
  - `this.serviceStatus` — map of `serviceName → detailed status` (used by feedbacks).
  - `this.serverStatus` — last server status payload.
  - `this.serviceIdToName` — map `serviceId → serviceName` (feedbacks receive `type/id` but state is keyed by name).
- Connection state is reported via `this.updateStatus(InstanceStatus.Ok | Connecting | BadConfig | ConnectionFailure)`.

### The four module subsystems (`src/`)

Each file exports a single function `(self) => { ... }` (some are `async`) that calls the corresponding `self.set*Definitions(...)`. `self` is the instance. The `index.js` wrappers `updateActions()`, `updateFeedbacks()`, `updateVariableDefinitions()`, `updatePresets()` call these and are re-invoked whenever the service list changes so dropdowns and variable lists stay current.

- **actions.js** — `setActionDefinitions`. Each action has `name`, `options`, and an `async callback(event)`. The service dropdown value is a `"serviceType/serviceId"` string; callbacks `split('/')` it and validate `parts.length === 2`. Service control goes through `self.startService` / `self.stopService` (defined in `index.js`).
- **feedbacks.js** — `setFeedbackDefinitions`. All feedbacks are `type: 'boolean'` with a `defaultStyle` built from `combineRgb(r,g,b)`. Callbacks read from `self.services` / `self.serviceStatus` and return true/false. Note some feedbacks resolve `serviceName` via `self.serviceIdToName[serviceId]` before looking up `self.serviceStatus`.
- **variables.js** — `setVariableDefinitions`. Declares a flat list of `{ name, variableId }`. Includes fixed server/count variables, looped `sdi_port_{i}_*` (0–4) and `pcie_slot_{i}_*` (0–3), plus per-service variables generated from `self.services`.
- **presets.js** — `setPresetDefinitions`. Button templates that reference action IDs and feedback IDs by string. Example placeholder service is `content_processing/SERVICE-1`.

### Variable naming convention (important)

Per-service variables use a **sanitized service name**:

```js
const safeName = serviceName.replace(/[^a-zA-Z0-9_]/g, '_')
```

Variable IDs then follow patterns like:

- `service_{safeName}_state`, `_running_state`, `_uptime`, `_active_source`
- Input sources: `service_{safeName}_{primary|secondary}_{receiving|bitrate|cc_errors|...}`
- Satellite-only: `..._ber`, `..._cn_margin`, `..._fec_rate`, `..._modulation`, `..._rf_lock`, `..._signal_strength`
- Decode/streams: `service_{safeName}_video_{resolution|codec|framerate|...}`, `service_{safeName}_audio{N}_{pid|lang|codec|...}`
- Outputs: `service_{safeName}_output_type`, `_sdi_port`, `_udp_packets`
- Server/global: `server_*`, `sdi_port_{i}_*`, `pcie_slot_{i}_*`, `total_services`, `running_services`, `stopped_services`, `blocked_services`

**When adding a new per-service variable, register its definition in `src/variables.js` AND set its value where the data is produced** (`updateServiceVariables` / `getServerStatus` in `index.js`, and the value-setting block in `variables.js`). The `formatBitrate` helper (returns `"X.XX Mbps"`, `"No Data"`, or `"0 Mbps (No Signal)"`) is duplicated in both `index.js` and `variables.js` — keep the two copies in sync if you change formatting.

## Conventions

- **Formatting:** Prettier with `@companion-module/tools/.prettierrc.json` (no semicolons, single quotes, tabs). Note: existing source files in `src/` and `index.js` use **4-space indentation**, while prettier's config may reformat differently — run `yarn format` and review before committing. `.prettierignore` excludes `package.json`.
- **Logging:** use `self.log(level, message)` with levels `'debug' | 'info' | 'warn' | 'error'`. Use `debug` for polling noise, `error` for failed requests.
- **Error handling:** wrap API calls in `try/catch`; on failure log and (for status fetches) often update connection status or clear variables rather than throwing.
- **No secrets** in the repo. The device host/port are user-entered config, not committed.

## Upgrade scripts

`src/upgrades.js` exports an array of upgrade scripts (currently empty). When you change variable IDs, action options, or config field shapes in a way that breaks existing user configs, add an upgrade script here so saved Companion configs migrate cleanly. Do not silently rename/remove option IDs without a migration.

## CI / Validation

- `.github/workflows/companion-module-checks.yaml` runs Bitfocus's shared `bitfocus/actions/.github/workflows/module-checks.yaml@main` on every push. This validates the `companion/manifest.json` and module structure.
- Dependabot (`/.github/dependabot.yml`) opens daily npm update PRs.
- Before pushing, run `yarn format` and confirm `companion/manifest.json` stays valid (correct `id`, `runtime.entrypoint: ../index.js`, version bumped when releasing).

## Releasing & roadmap

- **Release process:** see [`RELEASING.md`](./RELEASING.md). In short: bump the version in
  **both** `package.json` and `companion/manifest.json`, tag `vX.Y.Z`, push, then submit the
  tag via the Bitfocus Developer Portal (<https://developer.bitfocus.io/>). There is no
  per-repo publish workflow — CI only validates; Bitfocus builds/distributes from the tag.
  Add an `src/upgrades.js` migration before any release that renames/removes config fields,
  option ids, or variable ids.
- **Roadmap & release-readiness checklist:** see [`ROADMAP.md`](./ROADMAP.md). Notable known
  gaps: `companion/HELP.md` is still a stub, `formatBitrate` is duplicated, and the stats API
  hardcodes `serverId=Receiver1`/`id=0`.

## Gotchas

- The service dropdown carries `"serviceType/serviceId"`, but detailed status (`serviceStatus`) is keyed by **serviceName** — convert via `serviceIdToName` when a feedback/action only has the type/id.
- `serviceChoices` and variable definitions are rebuilt on every `getServices()`; new services appear only after a poll cycle (or the **Refresh Services** action).
- `feedbacks.js`'s `connection_status` checks `self.status === 2` (the numeric `InstanceStatus.Ok`) rather than a named constant — keep this in mind if status semantics change.
- Placeholder IDs like `content_processing/SERVICE-1` in `presets.js`/`actions.js` defaults are examples; real IDs come from the device.
  </content>
  </invoke>
