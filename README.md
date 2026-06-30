# companion-module-mediakind-rx1

A [Bitfocus Companion](https://bitfocus.io/companion) module to control and monitor a
**MediaKind RX1** Integrated Receiver Decoder (IRD) over its HTTP REST API.

It discovers the receiver's services, lets you start/stop them (individually or in bulk), and
exposes live input / decode / output status as Companion variables and feedbacks.

## Features

- Start, stop, toggle, and bulk start/stop services
- Auto-discovery of services with periodic polling
- Feedbacks for service state, signal/receiving, input alarms, bitrate thresholds,
  descrambling, satellite/ASI input health, blocked services, and more
- A large set of variables: server/chassis info, per-service input/decode/output status,
  SDI ports, and PCIe slots
- Custom API GET/POST actions for advanced use

## Installation

This module is distributed through Companion's built-in **Module Store**. In Companion, add a
connection and search for **MediaKind RX1**.

To run from source for development, see [Developing](#developing) below.

## Configuration

| Field                       | Description                                                 |
| --------------------------- | ----------------------------------------------------------- |
| **RX1 IP Address**          | IP address of the receiver. Required.                       |
| **Port**                    | HTTP port of the REST API (default `80`).                   |
| **Server ID**               | Server id used by the statistics API (default `Receiver1`). |
| **Enable Polling**          | Periodically refresh services and status.                   |
| **Poll Interval (seconds)** | Poll cadence, `1`–`60` (default `5`).                       |

Full end-user documentation — every action, feedback, and variable — is in
[`companion/HELP.md`](./companion/HELP.md), which is also shown inside Companion.

## Developing

Requires Node.js 22 and [Yarn 4](https://yarnpkg.com) (via Corepack).

```bash
yarn install     # install dependencies
yarn test        # run unit tests (node --test)
yarn format      # format with prettier
yarn package     # build a distributable module package
```

Architecture notes for contributors and AI assistants are in [`CLAUDE.md`](./CLAUDE.md). The
REST endpoints this module uses are documented in [`docs/API.md`](./docs/API.md).

## Project docs

- [`ROADMAP.md`](./ROADMAP.md) — planned work and release-readiness checklist
- [`RELEASING.md`](./RELEASING.md) — how to cut and submit a release
- [`companion/HELP.md`](./companion/HELP.md) — end-user help
- [`docs/API.md`](./docs/API.md) — RX1 REST API reference (as used by this module)

## License

[MIT](./LICENSE)
