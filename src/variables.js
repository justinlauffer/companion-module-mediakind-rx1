module.exports = async function (self) {
    const variables = []

    // Helper function to format bitrates
    const formatBitrate = (bitrate, receiving = true) => {
        // If not receiving signal, show "No Data"
        if (!receiving) return 'No Data'
        // If bitrate is undefined or null, show "No Data"
        if (bitrate === undefined || bitrate === null) return 'No Data'
        // If bitrate is 0, it might mean no signal
        if (bitrate === 0) return '0 Mbps (No Signal)'
        // Otherwise format the bitrate
        const mbps = (bitrate / 1000000).toFixed(2)
        return `${mbps} Mbps`
    }

    self.log('debug', 'Starting variable definitions registration')

    // Server variables
    variables.push(
        { name: 'Server Uptime', variableId: 'server_uptime' },
        { name: 'Server Uptime Seconds', variableId: 'server_uptime_sec' },
        { name: 'Server Chassis', variableId: 'server_chassis' },
        { name: 'Server Product Name', variableId: 'server_product_name' },
        { name: 'Server DateTime', variableId: 'server_datetime' },
        { name: 'Server Memory Size (GB)', variableId: 'server_mem_size' },
        { name: 'Server Disk Size (GB)', variableId: 'server_disk_size' },
        { name: 'Server TPM', variableId: 'server_tpm' },
        { name: 'Server Version', variableId: 'server_version' },
        { name: 'Server ID', variableId: 'server_id' }
    )

    // Service count variables
    variables.push(
        { name: 'Total Services', variableId: 'total_services' },
        { name: 'Running Services', variableId: 'running_services' },
        { name: 'Stopped Services', variableId: 'stopped_services' },
        { name: 'Blocked Services', variableId: 'blocked_services' }
    )

    // SDI Port variables
    for (let i = 0; i < 5; i++) {
        variables.push(
            { name: `SDI Port ${i} Type`, variableId: `sdi_port_${i}_type` },
            { name: `SDI Port ${i} Service`, variableId: `sdi_port_${i}_service` },
            { name: `SDI Port ${i} Service Type`, variableId: `sdi_port_${i}_service_type` },
            { name: `SDI Port ${i} Service State`, variableId: `sdi_port_${i}_service_state` },
            { name: `SDI Port ${i} Output Active`, variableId: `sdi_port_${i}_output_active` }
        )
    }

    // PCIe Slot variables
    for (let i = 0; i < 4; i++) {
        variables.push(
            { name: `PCIe Slot ${i} Description`, variableId: `pcie_slot_${i}_desc` },
            { name: `PCIe Slot ${i} Part Number`, variableId: `pcie_slot_${i}_part` }
        )
    }

    // Dynamic service variables
    self.log('debug', `Registering variables for ${self.services ? self.services.length : 0} services`)
    if (self.services) {
        self.services.forEach(service => {
            const safeName = service.serviceName.replace(/[^a-zA-Z0-9_]/g, '_')

            // Basic service info
            variables.push(
                { name: `${service.serviceName} State`, variableId: `service_${safeName}_state` },
                { name: `${service.serviceName} Type`, variableId: `service_${safeName}_type` },
                { name: `${service.serviceName} ID`, variableId: `service_${safeName}_id` },
                { name: `${service.serviceName} State Modified`, variableId: `service_${safeName}_state_modified` },
                { name: `${service.serviceName} Uptime`, variableId: `service_${safeName}_uptime` },
                { name: `${service.serviceName} Running State`, variableId: `service_${safeName}_running_state` }
            )

            // Input variables
            variables.push(
                { name: `${service.serviceName} Active Source`, variableId: `service_${safeName}_active_source` },
                { name: `${service.serviceName} Network ID`, variableId: `service_${safeName}_network_id` },
                { name: `${service.serviceName} Original Network ID`, variableId: `service_${safeName}_orig_network_id` },
                { name: `${service.serviceName} Transport Stream ID`, variableId: `service_${safeName}_ts_id` },
                { name: `${service.serviceName} Program Count`, variableId: `service_${safeName}_program_count` }
            )

            // Source-specific variables for primary and secondary
            for (let sourceIdx = 0; sourceIdx < 2; sourceIdx++) {
                const sourceName = sourceIdx === 0 ? 'primary' : 'secondary'

                // Common source variables
                variables.push(
                    { name: `${service.serviceName} ${sourceName} Type`, variableId: `service_${safeName}_${sourceName}_type` },
                    { name: `${service.serviceName} ${sourceName} Receiving`, variableId: `service_${safeName}_${sourceName}_receiving` },
                    { name: `${service.serviceName} ${sourceName} Bitrate`, variableId: `service_${safeName}_${sourceName}_bitrate` },
                    { name: `${service.serviceName} ${sourceName} Bitrate (Raw)`, variableId: `service_${safeName}_${sourceName}_bitrate_raw` },
                    { name: `${service.serviceName} ${sourceName} CC Errors`, variableId: `service_${safeName}_${sourceName}_cc_errors` },
                    { name: `${service.serviceName} ${sourceName} PID Errors`, variableId: `service_${safeName}_${sourceName}_pid_errors` },
                    { name: `${service.serviceName} ${sourceName} PMT Errors`, variableId: `service_${safeName}_${sourceName}_pmt_errors` },
                    { name: `${service.serviceName} ${sourceName} Sync Byte Errors`, variableId: `service_${safeName}_${sourceName}_sync_errors` },
                    { name: `${service.serviceName} ${sourceName} Transport Errors`, variableId: `service_${safeName}_${sourceName}_transport_errors` },
                    { name: `${service.serviceName} ${sourceName} TS Sync Loss`, variableId: `service_${safeName}_${sourceName}_sync_loss` }
                )

                // Satellite-specific variables
                variables.push(
                    { name: `${service.serviceName} ${sourceName} BER`, variableId: `service_${safeName}_${sourceName}_ber` },
                    { name: `${service.serviceName} ${sourceName} C/N Margin`, variableId: `service_${safeName}_${sourceName}_cn_margin` },
                    { name: `${service.serviceName} ${sourceName} FEC Rate`, variableId: `service_${safeName}_${sourceName}_fec_rate` },
                    { name: `${service.serviceName} ${sourceName} Modulation`, variableId: `service_${safeName}_${sourceName}_modulation` },
                    { name: `${service.serviceName} ${sourceName} RF Lock`, variableId: `service_${safeName}_${sourceName}_rf_lock` },
                    { name: `${service.serviceName} ${sourceName} Signal Strength`, variableId: `service_${safeName}_${sourceName}_signal_strength` },
                    { name: `${service.serviceName} ${sourceName} Delivery System`, variableId: `service_${safeName}_${sourceName}_delivery` }
                )
            }

            // Decode processing variables
            variables.push(
                { name: `${service.serviceName} Program Number`, variableId: `service_${safeName}_program_number` },
                { name: `${service.serviceName} Program Auto Selected`, variableId: `service_${safeName}_program_auto` },
                { name: `${service.serviceName} Descrambling State`, variableId: `service_${safeName}_descrambling` }
            )

            // Stream variables (video)
            variables.push(
                { name: `${service.serviceName} Video PID`, variableId: `service_${safeName}_video_pid` },
                { name: `${service.serviceName} Video Bitrate`, variableId: `service_${safeName}_video_bitrate` },
                { name: `${service.serviceName} Video Bitrate (Raw)`, variableId: `service_${safeName}_video_bitrate_raw` },
                { name: `${service.serviceName} Video Resolution`, variableId: `service_${safeName}_video_resolution` },
                { name: `${service.serviceName} Video Width`, variableId: `service_${safeName}_video_width` },
                { name: `${service.serviceName} Video Height`, variableId: `service_${safeName}_video_height` },
                { name: `${service.serviceName} Video Interlaced`, variableId: `service_${safeName}_video_interlaced` },
                { name: `${service.serviceName} Video Frame Rate`, variableId: `service_${safeName}_video_framerate` },
                { name: `${service.serviceName} Video Codec`, variableId: `service_${safeName}_video_codec` },
                { name: `${service.serviceName} Video Chroma Format`, variableId: `service_${safeName}_video_chroma` }
            )

            // Stream variables (audio) - up to 8 audio streams
            for (let audioIdx = 1; audioIdx <= 8; audioIdx++) {
                variables.push(
                    { name: `${service.serviceName} Audio ${audioIdx} PID`, variableId: `service_${safeName}_audio${audioIdx}_pid` },
                    { name: `${service.serviceName} Audio ${audioIdx} Language`, variableId: `service_${safeName}_audio${audioIdx}_lang` },
                    { name: `${service.serviceName} Audio ${audioIdx} Codec`, variableId: `service_${safeName}_audio${audioIdx}_codec` },
                    { name: `${service.serviceName} Audio ${audioIdx} Bitrate`, variableId: `service_${safeName}_audio${audioIdx}_bitrate` },
                    { name: `${service.serviceName} Audio ${audioIdx} Bitrate (Raw)`, variableId: `service_${safeName}_audio${audioIdx}_bitrate_raw` },
                    { name: `${service.serviceName} Audio ${audioIdx} Sample Rate`, variableId: `service_${safeName}_audio${audioIdx}_samplerate` },
                    { name: `${service.serviceName} Audio ${audioIdx} Channels`, variableId: `service_${safeName}_audio${audioIdx}_channels` }
                )
            }

            // Output variables
            variables.push(
                { name: `${service.serviceName} Output Type`, variableId: `service_${safeName}_output_type` },
                { name: `${service.serviceName} SDI Output Port`, variableId: `service_${safeName}_sdi_port` },
                { name: `${service.serviceName} Remote Production Status`, variableId: `service_${safeName}_remote_prod_status` }
            )

            // TS Passthrough specific
            variables.push(
                { name: `${service.serviceName} UDP Output Packets`, variableId: `service_${safeName}_udp_packets` }
            )
        })
    }

    self.log('debug', `Registering ${variables.length} total variables`)
    self.setVariableDefinitions(variables)

    // Set initial values
    const values = {}

    // Basic counts
    values['total_services'] = self.services ? self.services.length : 0
    values['running_services'] = self.services ? self.services.filter(s => s.state === 'started').length : 0
    values['stopped_services'] = self.services ? self.services.filter(s => s.state === 'stopped').length : 0
    values['blocked_services'] = 0 // Will be updated when we get status

    // Server status
    if (self.serverStatus) {
        values['server_uptime'] = self.serverStatus.uptime || '0 days 00:00:00'
        values['server_uptime_sec'] = self.serverStatus.uptimeSec || 0
        values['server_chassis'] = self.serverStatus.chassisName || self.serverStatus.productName || 'Unknown'
        values['server_product_name'] = self.serverStatus.productName || 'Unknown'
        values['server_datetime'] = self.serverStatus.dateTime || ''
        values['server_mem_size'] = self.serverStatus.memSizeGByte || 0
        values['server_disk_size'] = self.serverStatus.diskSizeGByte || 0
        values['server_tpm'] = self.serverStatus.tpm ? 'Yes' : 'No'
        values['server_version'] = self.serverStatus.version || 'Unknown'
        values['server_id'] = self.serverStatus.id || 'Receiver1'

        // SDI Ports
        if (self.serverStatus.sdiPorts) {
            self.serverStatus.sdiPorts.forEach((port, idx) => {
                values[`sdi_port_${idx}_type`] = port.type || 'Unknown'
                values[`sdi_port_${idx}_service`] = port.serviceName || 'None'

                // Find the service details for this port
                if (port.serviceName && self.services) {
                    const service = self.services.find(s => s.serviceName === port.serviceName)
                    if (service) {
                        values[`sdi_port_${idx}_service_type`] = service.serviceType || 'Unknown'
                        values[`sdi_port_${idx}_service_state`] = service.state || 'Unknown'
                        values[`sdi_port_${idx}_output_active`] = service.state === 'started' ? 'Yes' : 'No'
                    } else {
                        values[`sdi_port_${idx}_service_type`] = 'Unknown'
                        values[`sdi_port_${idx}_service_state`] = 'Unknown'
                        values[`sdi_port_${idx}_output_active`] = 'No'
                    }
                } else {
                    values[`sdi_port_${idx}_service_type`] = 'None'
                    values[`sdi_port_${idx}_service_state`] = 'None'
                    values[`sdi_port_${idx}_output_active`] = 'No'
                }
            })
        }

        // PCIe Slots
        if (self.serverStatus.pcieSlots) {
            self.serverStatus.pcieSlots.forEach((slot, idx) => {
                if (slot) {
                    values[`pcie_slot_${idx}_desc`] = slot.description || 'Empty'
                    values[`pcie_slot_${idx}_part`] = slot.partNumber || 'N/A'
                } else {
                    values[`pcie_slot_${idx}_desc`] = 'Empty'
                    values[`pcie_slot_${idx}_part`] = 'N/A'
                }
            })
        }
    }

    // Service-specific values
    if (self.services) {
        self.services.forEach(service => {
            const safeName = service.serviceName.replace(/[^a-zA-Z0-9_]/g, '_')

            // Basic service info
            values[`service_${safeName}_state`] = service.state
            values[`service_${safeName}_type`] = service.serviceType
            values[`service_${safeName}_id`] = service.serviceId
            values[`service_${safeName}_state_modified`] = service.stateModifiedAt || ''

            // Get detailed status if available
            const status = self.serviceStatus ? self.serviceStatus[service.serviceName] : null

            if (status) {
                values[`service_${safeName}_uptime`] = status.uptimeSec || 0
                values[`service_${safeName}_running_state`] = status.runningState || 'unknown'

                // Input status
                if (status.inputs) {
                    values[`service_${safeName}_active_source`] = status.inputs.activeSourceIndex === 0 ? 'Primary' : 'Secondary'
                    values[`service_${safeName}_network_id`] = status.inputs.networkId || 0
                    values[`service_${safeName}_orig_network_id`] = status.inputs.originalNetworkId || 0
                    values[`service_${safeName}_ts_id`] = status.inputs.transportStreamId || 0
                    values[`service_${safeName}_program_count`] = status.inputs.mptsPrograms ? status.inputs.mptsPrograms.length : 0

                    // Source status
                    if (status.inputs.sources) {
                        status.inputs.sources.forEach((source, idx) => {
                            const sourceName = idx === 0 ? 'primary' : 'secondary'

                            values[`service_${safeName}_${sourceName}_type`] = source.type || 'unknown'
                            values[`service_${safeName}_${sourceName}_receiving`] = source.receiving ? 'Yes' : 'No'
                            values[`service_${safeName}_${sourceName}_bitrate`] = formatBitrate(source.bitRate, source.receiving)
                            values[`service_${safeName}_${sourceName}_bitrate_raw`] = source.bitRate || 0
                            values[`service_${safeName}_${sourceName}_cc_errors`] = source.ccError || 0
                            values[`service_${safeName}_${sourceName}_pid_errors`] = source.pidError || 0
                            values[`service_${safeName}_${sourceName}_pmt_errors`] = source.pmtError || 0
                            values[`service_${safeName}_${sourceName}_sync_errors`] = source.syncByteError || 0
                            values[`service_${safeName}_${sourceName}_transport_errors`] = source.transportError || 0
                            values[`service_${safeName}_${sourceName}_sync_loss`] = source.tsSyncLoss || 0

                            // Satellite-specific
                            if (source.type === 'sat') {
                                values[`service_${safeName}_${sourceName}_ber`] = source.ber || '<1e-7'
                                values[`service_${safeName}_${sourceName}_cn_margin`] = source.cnMargin || 0
                                values[`service_${safeName}_${sourceName}_fec_rate`] = source.fecRate || 'Unknown'
                                values[`service_${safeName}_${sourceName}_modulation`] = source.modulation || 'Unknown'
                                values[`service_${safeName}_${sourceName}_rf_lock`] = source.rfLock ? 'Yes' : 'No'
                                values[`service_${safeName}_${sourceName}_signal_strength`] = source.signalStrength || 0
                                values[`service_${safeName}_${sourceName}_delivery`] = source.deliverySystem || 'Unknown'
                            }
                        })
                    }
                }

                // Processing status
                if (status.processings) {
                    if (status.processings.decode) {
                        const decode = status.processings.decode
                        values[`service_${safeName}_program_number`] = decode.programNumber || 0
                        values[`service_${safeName}_program_auto`] = decode.programAutoSelected ? 'Yes' : 'No'
                        values[`service_${safeName}_descrambling`] = decode.descramblingState || 'unknown'

                        // Stream status
                        if (decode.streams) {
                            // Video stream
                            const videoStream = decode.streams.find(s => s.type === 'video')
                            if (videoStream) {
                                values[`service_${safeName}_video_pid`] = videoStream.pid || 0
                                // Check if we're actually decoding (have valid dimensions)
                                const isDecoding = videoStream.width > 0 && videoStream.height > 0
                                values[`service_${safeName}_video_bitrate`] = formatBitrate(videoStream.bitRate, isDecoding)
                                values[`service_${safeName}_video_bitrate_raw`] = videoStream.bitRate || 0
                                values[`service_${safeName}_video_width`] = videoStream.width || 0
                                values[`service_${safeName}_video_height`] = videoStream.height || 0
                                values[`service_${safeName}_video_resolution`] = `${videoStream.width || 0}x${videoStream.height || 0}`
                                values[`service_${safeName}_video_interlaced`] = videoStream.interlaced ? 'Yes' : 'No'
                                values[`service_${safeName}_video_framerate`] = videoStream.frameRateNumerator && videoStream.frameRateDenominator
                                    ? `${videoStream.frameRateNumerator}/${videoStream.frameRateDenominator}`
                                    : 'Unknown'
                                values[`service_${safeName}_video_codec`] = videoStream.codec || 'Unknown'
                                values[`service_${safeName}_video_chroma`] = videoStream.chromaFormat || 'Unknown'
                            }

                            // Audio streams
                            const audioStreams = decode.streams.filter(s => s.type === 'audio')
                            audioStreams.forEach((audioStream, idx) => {
                                const audioNum = idx + 1
                                values[`service_${safeName}_audio${audioNum}_pid`] = audioStream.pid || 0
                                values[`service_${safeName}_audio${audioNum}_lang`] = audioStream.language || 'Unknown'
                                values[`service_${safeName}_audio${audioNum}_codec`] = audioStream.codec || 'Unknown'
                                values[`service_${safeName}_audio${audioNum}_bitrate`] = formatBitrate(audioStream.bitRate)
                                values[`service_${safeName}_audio${audioNum}_bitrate_raw`] = audioStream.bitRate || 0
                                values[`service_${safeName}_audio${audioNum}_samplerate`] = audioStream.samplingRate || 0
                                values[`service_${safeName}_audio${audioNum}_channels`] = audioStream.channelCount || 0
                            })
                        }
                    }

                    // Passthrough services
                    if (status.processings.passThroughServices) {
                        // Handle passthrough services if needed
                    }
                }

                // Output status
                if (status.outputs && status.outputs.length > 0) {
                    const output = status.outputs[0]
                    values[`service_${safeName}_output_type`] = output.type || 'Unknown'

                    if (output.type === 'sdiOutput') {
                        values[`service_${safeName}_sdi_port`] = output.port || 'Unknown'
                        values[`service_${safeName}_remote_prod_status`] = output.remoteProductionMasterSlaveStatus || 'N/A'
                    } else if (output.type === 'udpOutput') {
                        if (output.multicasts && output.multicasts[0]) {
                            values[`service_${safeName}_udp_packets`] = output.multicasts[0].udpOutputPacketCount || 0
                        }
                    }
                }
            }
        })
    }

    self.log('debug', `Setting ${Object.keys(values).length} variable values`)
    self.setVariableValues(values)
}