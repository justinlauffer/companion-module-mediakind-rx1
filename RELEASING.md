# Releasing

This module follows the standard **Bitfocus Companion** module release process. As of
Companion v4.0 the module release cycle is **decoupled** from Companion's own releases —
we decide when to cut a version, and users get it through the in-app Module Store once
it's submitted and approved.

There is **no per-repo "publish" GitHub Action**. Releasing is: bump the version, tag it,
push, then submit the tag through the Bitfocus Developer Portal. CI in this repo only
*validates* the module (`companion-module-checks.yaml`); the Bitfocus infrastructure does
the actual packaging and distribution from the submitted tag.

## Prerequisites (one-time)

- A Bitfocus account linked to GitHub: <https://developer.bitfocus.io/>
- Maintainer/collaborator access to this module in the Developer Portal (the maintainer
  listed in `companion/manifest.json` is `Justin Lauffer`).
- Local checkout with push rights to `origin` and a clean working tree on `main`.

## Versioning

Use **semver** `MAJOR.MINOR.PATCH`:

- **PATCH** (`1.0.0` → `1.0.1`) — bug fixes, no behavior change for configs.
- **MINOR** (`1.0.0` → `1.1.0`) — new actions / feedbacks / variables / presets, backward compatible.
- **MAJOR** (`1.0.0` → `2.0.0`) — breaking changes to config fields, action/feedback option
  IDs, or variable IDs. **A major bump that changes saved-config shape requires an upgrade
  script** in `src/upgrades.js` so existing users migrate cleanly (see below).

Two files carry the version and **must stay in sync**:

- `package.json` → `"version"`
- `companion/manifest.json` → `"version"`

## Release steps

1. **Make sure `main` is green and ready.** All intended changes merged; CI passing on the
   latest commit.

2. **Bump the version** in both `package.json` and `companion/manifest.json` to the new
   `X.Y.Z`. Confirm `companion/HELP.md` is accurate for what's shipping (the store surfaces
   it to users) and update `README.md`/this changelog section if relevant.

3. **Run the local checks** that CI will run, plus a packaging dry-run:

   ```bash
   yarn install
   yarn format          # prettier
   yarn package         # companion-module-build — must produce a package with no errors
   ```

   `yarn package` builds the same artifact the store builds; if it fails locally it will
   fail the submission.

4. **Commit, tag, push.** The tag **must** be the version prefixed with `v`:

   ```bash
   git commit -am "Release v1.1.0"
   git tag v1.1.0
   git push origin main
   git push origin v1.1.0
   ```

   (Equivalently, draft a GitHub Release with tag `v1.1.0` — that creates and pushes the
   tag for you. A GitHub Release is optional but nice for human-readable changelogs.)

5. **Submit the version in the Developer Portal:**
   - Log in at <https://developer.bitfocus.io/> with GitHub.
   - Go to **My Connections** in the sidebar and select **MediaKind RX1** (`mediakind-rx1`).
   - Click **Submit Version**, choose the `v1.1.0` git tag, and submit.

6. **Wait for review/approval.** Bitfocus builds the offline bundle from the tag and, once
   approved, the version appears in Companion's Module Store. New module submissions (the
   very first release) are reviewed before they go live; subsequent versions of an existing
   module are typically faster.

## First-time store submission

The very first time this module goes into the store there are a couple of extra one-time
steps beyond a normal version bump:

- The module `id` (`mediakind-rx1`) must be registered. If it isn't yet, request it via the
  [companion-module-requests](https://github.com/bitfocus/companion-module-requests) repo /
  the Bitfocus Slack `#new-modules` channel, or follow the "add a new module" flow in the
  Developer Portal.
- Ensure `companion/manifest.json` is complete and `companion/HELP.md` contains real
  end-user documentation (configuration fields, what each action/feedback does). The store
  shows HELP.md to users — the current stub must be replaced before first release.

See the **Release Readiness** checklist in [`ROADMAP.md`](./ROADMAP.md) for the gaps to
close before that first store submission.

## Upgrade scripts (breaking changes)

`src/upgrades.js` exports an array of upgrade scripts that migrate saved user configs across
versions. It is currently empty (`module.exports = []`). Add a script here **before** you
release any version that renames or removes:

- a config field id (`host`, `port`, `polling`, `pollInterval`),
- an action or feedback option id (e.g. the `service` dropdown value shape), or
- a variable id.

`runEntrypoint(MediaKindRX1Instance, UpgradeScripts)` in `index.js` already wires these in;
Companion runs them automatically when a user upgrades. Never silently change an option/
variable id without a matching migration — it breaks existing buttons in the field.

## Reference

- Releasing a Companion Module — <https://companion.free/for-developers/module-development/module-lifecycle/releasing-your-module/>
- Module Developers' Guide — <https://companion.free/for-developers/module-development/>
- Developer Portal — <https://developer.bitfocus.io/>
- Module requests — <https://github.com/bitfocus/companion-module-requests>
</content>
