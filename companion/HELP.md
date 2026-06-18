# MediaKind RX1

Control and monitor a **MediaKind RX1** Integrated Receiver Decoder (IRD) from Companion
over its HTTP REST API. The module lists the receiver's services, lets you start/stop them,
and exposes live input/decode/output status as variables and feedbacks.

## Requirements

- A MediaKind RX1 reachable on your network over HTTP.
- The RX1's REST API enabled and accessible from the machine running Companion.

## Configuration

| Field | Description |
| --- | --- |
| **RX1 IP Address** | IP address of the receiver (e.g. `192.168.1.50`). Required. |
| **Port** | HTTP port of the REST API. Default `80`. |
| **Enable Polling** | When on, the module periodically refreshes services and status. |
| **Poll Interval (seconds)** | How often to poll, `1`–`60` seconds. Default `5`. Only shown when polling is enabled. |

When the connection succeeds the instance status turns **OK**. If the IP is missing it
reports **Bad Configuration**; if the receiver can't be reached it reports **Connection
Failure**.

Services are discovered automatically. They appear in the action/feedback dropdowns after
the first successful poll — use the **Refresh Services** action if you add or change services
on the receiver and don't want to wait for the next poll.

## Actions

| Action | Description |
| --- | --- |
| **Start Service** | Start the selected service. |
| **Stop Service** | Stop the selected service. |
| **Toggle Service** | Start the service if stopped, stop it if started. |
| **Start All Services** | Start every currently stopped service. |
| **Stop All Services** | Stop every currently started service. |
| **Refresh Services** | Re-fetch the service list and server status immediately. |
| **Get Service Status** | Force a detailed status refresh for one service. |
| **Get Services by Type** | Query services of a given type (Content Processing, Mux, Live Packaging, Live Encoding, Stream Conditioning, SRT, TS Splicer). |
| **Export Service Configuration** | Fetch a service's configuration and log it (visible in Companion's log). |
| **Assign Server to Service** | Assign a server (e.g. `Receiver1`) to a service. |
| **Remove Server from Service** | Remove a server from a service. |
| **Custom API GET Request** | Send an arbitrary `GET` to any API path (e.g. `/api/services`); the response is logged. |
| **Custom API POST Request** | Send an arbitrary `POST` with an optional JSON body; the response is logged. |

The service dropdowns let you pick a discovered service or type a custom value in the form
`serviceType/serviceId` (for example `content_processing/SERVICE-1`).

## Feedbacks

Use these to change a button's style based on receiver state. Unless noted, each takes a
**Service** and turns on when the condition is met.

| Feedback | Turns on when… |
| --- | --- |
| **Service State** | The service is in the chosen state (Started / Stopped). |
| **Service Receiving Signal** | The active input source is receiving. |
| **Active Source** | The chosen source (Primary / Secondary) is the active one. |
| **Input Alarm** | An input error counter (CC, Transport, TS Sync Loss, PID, PMT) exceeds a threshold. |
| **Bitrate Threshold** | The active source bitrate is less than / greater than a value (bps). |
| **Descrambling State** | Decode descrambling matches the chosen state (Clear / Scrambled / Descrambled / Unknown). |
| **Decode State** | A video/audio stream is active, or its resolution/codec matches a value. |
| **Program Detected** | A specific (or any) program number is present in the input. |
| **Satellite Input Status** | For a satellite input: RF Lock, Receiving, or BER / C-N Margin / Signal Strength threshold. |
| **ASI Input Status** | For an ASI input: Receiving, or bitrate above a threshold. |
| **Service Blocked** | The service's running state is `blocked`. |
| **Any Service Running** | At least one service is started. |
| **All Services Stopped** | All discovered services are stopped. |
| **Connection Status** | The module is connected to the receiver. |

> Note: **Satellite Input Status**, **ASI Input Status**, **Service Blocked** and
> **Program Detected** identify the service by its **service name** (text field) rather than
> the `serviceType/serviceId` dropdown.

## Variables

The module publishes variables you can drop onto button text.

**Server / chassis:** `$(mediakind-rx1:server_uptime)`, `server_version`, `server_product_name`,
`server_chassis`, `server_mem_size`, `server_disk_size`, `server_tpm`, `server_datetime`,
`server_id`.

**Counts:** `total_services`, `running_services`, `stopped_services`, `blocked_services`.

**SDI ports / PCIe slots:** `sdi_port_<n>_type`, `sdi_port_<n>_service`,
`sdi_port_<n>_service_state`, `sdi_port_<n>_output_active`, `pcie_slot_<n>_desc`,
`pcie_slot_<n>_part`.

**Per-service:** variables are named `service_<name>_<field>`, where `<name>` is the service
name with any non-alphanumeric characters replaced by `_`. Examples:

- State: `service_<name>_state`, `service_<name>_running_state`, `service_<name>_uptime`
- Active input: `service_<name>_active_source`, `service_<name>_primary_receiving`,
  `service_<name>_primary_bitrate`, `service_<name>_primary_cc_errors` (and `secondary_*`)
- Satellite source: `service_<name>_primary_rf_lock`, `_ber`, `_cn_margin`, `_modulation`,
  `_signal_strength`
- Decode: `service_<name>_video_resolution`, `_video_codec`, `_video_framerate`,
  `service_<name>_audio1_lang`, `service_<name>_audio1_codec`
- Output: `service_<name>_output_type`, `service_<name>_sdi_port`, `service_<name>_udp_packets`

Bitrate variables read as e.g. `12.34 Mbps`, `No Data`, or `0 Mbps (No Signal)`. A
`*_bitrate_raw` companion variable holds the raw bits-per-second value where applicable.

> Tip: because per-service variable names come from the service name, **renaming a service on
> the RX1 changes its variable names** and any buttons referencing them will need updating.

## Presets

Ready-made buttons are provided under the **Service Control**, **Status**, and **System**
categories (start/stop, status indicators, and connection/refresh). They use placeholder
service IDs like `content_processing/SERVICE-1` — edit the action/feedback to point at one of
your services.

## Troubleshooting

- **No services in the dropdowns:** confirm the IP/port are correct and the receiver's REST
  API is reachable, then run **Refresh Services**. Check Companion's log for errors.
- **Status stuck / not updating:** make sure **Enable Polling** is on, or trigger
  **Refresh Services** / **Get Service Status** manually.
- **Need to probe the API:** use **Custom API GET Request** (e.g. `/api/services`) and read
  the response in the log.
</content>
