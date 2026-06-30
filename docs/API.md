# RX1 REST API Reference

This documents the subset of the MediaKind RX1 HTTP REST API that this module uses, so the
behaviour is easy to reason about and to adapt when RX1 firmware changes. All requests use
`Content-Type: application/json` and are made over plain HTTP to the configured host/port.
This is a working reference derived from the module's usage, **not** official MediaKind
documentation — verify against your unit's firmware.

Implementation: `makeRequest(path, method, body)` in [`../index.js`](../index.js). GET
requests are retried (exponential backoff) on transient failure; non-idempotent requests
(POST/PUT/DELETE) are not retried.

## Endpoints

### Services

| Method | Path                                             | Purpose                                                                                                 |
| ------ | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `GET`  | `/api/services`                                  | List all services. Each item has `serviceName`, `serviceId`, `serviceType`, `state`, `stateModifiedAt`. |
| `GET`  | `/api/services/{serviceType}`                    | List services of one type (e.g. `content_processing`).                                                  |
| `GET`  | `/api/services/{serviceType}/{serviceId}/config` | Fetch a service's configuration.                                                                        |
| `POST` | `/api/services/{serviceType}/{serviceId}/start`  | Start a service.                                                                                        |
| `POST` | `/api/services/{serviceType}/{serviceId}/stop`   | Stop a service.                                                                                         |

### Statistics

| Method | Path                                                                                 | Purpose                                                                                                                             |
| ------ | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/api/statistics/current?serverId={serverId}&type=content_processing_server&id=0`    | Server/chassis status (uptime, version, memory/disk, SDI ports, PCIe slots, and a `services` array of detailed per-service status). |
| `GET`  | `/api/statistics/current?serverId={serverId}&type=content_processing&id={serviceId}` | Detailed status for one service (inputs, processings/decode, outputs).                                                              |

`{serverId}` comes from the **Server ID** config field (default `Receiver1`).

### Server assignment

| Method   | Path                                                                | Purpose                         |
| -------- | ------------------------------------------------------------------- | ------------------------------- |
| `PUT`    | `/api/assign/services/{serviceType}/{serviceId}/servers/{serverId}` | Assign a server to a service.   |
| `DELETE` | `/api/assign/services/{serviceType}/{serviceId}/servers/{serverId}` | Remove a server from a service. |

> All path segments (`serviceType`, `serviceId`, `serverId`) are passed through
> `encodeURIComponent` because they can contain special characters.

## Detailed service status shape

The per-service status (and the entries in the server status `services` array) drive most
variables and feedbacks. Fields the module reads:

- `uptimeSec`, `runningState` (may contain `blocked`)
- `inputs`
  - `activeSourceIndex` (0 = primary, 1 = secondary), `networkId`, `originalNetworkId`,
    `transportStreamId`, `mptsPrograms[]` (each with `programNumber`)
  - `sources[]` — per source: `type` (`sat` / `asi` / …), `receiving`, `bitRate`,
    `ccError`, `pidError`, `pmtError`, `syncByteError`, `transportError`, `tsSyncLoss`
    - satellite extras: `ber`, `cnMargin`, `fecRate`, `modulation`, `rfLock`,
      `signalStrength`, `deliverySystem`
- `processings.decode`
  - `programNumber`, `programAutoSelected`, `descramblingState`
  - `streams[]` — `type` (`video` / `audio`), `pid`, `bitRate`, `codec`
    - video: `width`, `height`, `interlaced`, `frameRateNumerator`/`frameRateDenominator`,
      `chromaFormat`
    - audio: `language`, `samplingRate`, `channelCount`
- `outputs[]` — `type` (`sdiOutput` / `udpOutput`); for SDI: `port`,
  `remoteProductionMasterSlaveStatus`; for UDP: `multicasts[].udpOutputPacketCount`

## Server status shape

- `uptime`, `uptimeSec`, `productName`, `chassisName`, `dateTime`, `memSizeGByte`,
  `diskSizeGByte`, `tpm`, `version`, `id`
- `sdiPorts[]` — `type`, `serviceName`
- `pcieSlots[]` — `description`, `partNumber`
- `services[]` — detailed per-service status (see above)

## Known assumptions / open questions

- `serverId` defaults to `Receiver1` and the server status uses `id=0`. These should be
  validated across RX1 deployments (tracked in [`../ROADMAP.md`](../ROADMAP.md)).
- The module communicates over plain HTTP with no authentication. If your RX1 requires
  credentials or TLS, that support is not yet implemented.
