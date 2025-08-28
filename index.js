const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./src/upgrades')
const UpdateActions = require('./src/actions')
const UpdateFeedbacks = require('./src/feedbacks')
const UpdateVariableDefinitions = require('./src/variables')
const UpdatePresets = require('./src/presets')
const http = require('http')

class MediaKindRX1Instance extends InstanceBase {
    constructor(internal) {
        super(internal)

        this.services = []
        this.serviceStatus = {}
        this.serverStatus = {}
        this.serviceIdToName = {} // Map serviceId to serviceName for lookups
    }

    async init(config) {
        this.config = config

        this.updateStatus(InstanceStatus.Connecting)

        this.updateActions()
        this.updateFeedbacks()
        this.updateVariableDefinitions()
        this.updatePresets()

        this.initConnection()
    }

    async destroy() {
        this.log('debug', 'destroy')

        if (this.pollTimer) {
            clearInterval(this.pollTimer)
            delete this.pollTimer
        }
    }

    async configUpdated(config) {
        this.config = config

        this.updateStatus(InstanceStatus.Connecting)
        this.initConnection()
    }

    getConfigFields() {
        return [
            {
                type: 'static-text',
                id: 'info',
                width: 12,
                label: 'Information',
                value: 'This module will control MediaKind RX1 Receiver via its REST API.',
            },
            {
                type: 'textinput',
                id: 'host',
                label: 'RX1 IP Address',
                width: 8,
                regex: Regex.IP,
            },
            {
                type: 'textinput',
                id: 'port',
                label: 'Port',
                width: 4,
                default: '80',
                regex: Regex.PORT,
            },
            {
                type: 'checkbox',
                id: 'polling',
                label: 'Enable Polling',
                width: 6,
                default: true,
            },
            {
                type: 'number',
                id: 'pollInterval',
                label: 'Poll Interval (seconds)',
                width: 6,
                min: 1,
                max: 60,
                default: 5,
                isVisible: (configValues) => configValues.polling === true,
            },
        ]
    }

    updateActions() {
        UpdateActions(this)
    }

    updateFeedbacks() {
        UpdateFeedbacks(this)
    }

    updateVariableDefinitions() {
        this.log('debug', 'Updating variable definitions')
        UpdateVariableDefinitions(this)
    }

    updatePresets() {
        UpdatePresets(this)
    }

    initConnection() {
        if (!this.config.host) {
            this.updateStatus(InstanceStatus.BadConfig)
            this.log('error', 'RX1 IP address is required')
            return
        }

        if (this.pollTimer) {
            clearInterval(this.pollTimer)
            delete this.pollTimer
        }

        // Initial data fetch
        this.getServices().then(() => {
            // After getting services, get their detailed status
            this.getServerStatus()
            this.pollAllServiceStatus()
        })

        if (this.config.polling) {
            this.pollTimer = setInterval(() => {
                this.getServices().then(() => {
                    this.getServerStatus()
                    this.pollAllServiceStatus()
                })
            }, this.config.pollInterval * 1000)
        }
    }

    async pollAllServiceStatus() {
        if (!this.services || this.services.length === 0) return

        // Poll each service's detailed status
        for (const service of this.services) {
            try {
                await this.getServiceStatus(service.serviceName, service.serviceId)
            } catch (error) {
                this.log('debug', `Failed to poll status for ${service.serviceName}: ${error.message}`)
            }
        }

        // Update variable definitions to ensure all are registered
        this.updateVariableDefinitions()
    }

    makeRequest(path, method = 'GET', body = null) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: this.config.host,
                port: this.config.port || 80,
                path: path,
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
            }

            const req = http.request(options, (res) => {
                let data = ''

                res.on('data', (chunk) => {
                    data += chunk
                })

                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            if (data) {
                                resolve(JSON.parse(data))
                            } else {
                                resolve({})
                            }
                        } catch (e) {
                            resolve(data)
                        }
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${data}`))
                    }
                })
            })

            req.on('error', (error) => {
                reject(error)
            })

            if (body) {
                req.write(JSON.stringify(body))
            }

            req.end()
        })
    }

    async getServices() {
        try {
            const services = await this.makeRequest('/api/services')
            this.services = services || []

            // Create choices using serviceId (GUID) for the API calls
            const serviceChoices = this.services.map(service => ({
                id: `${service.serviceType}/${service.serviceId}`,
                label: `${service.serviceName} (${service.serviceType})`
            }))

            this.serviceChoices = serviceChoices

            // Build serviceId to serviceName mapping
            this.serviceIdToName = {}
            this.services.forEach(service => {
                this.serviceIdToName[service.serviceId] = service.serviceName
            })

            // Update variables for each service
            this.services.forEach(service => {
                const safeName = service.serviceName.replace(/[^a-zA-Z0-9_]/g, '_')
                this.setVariableValues({
                    [`service_${safeName}_state`]: service.state,
                    [`service_${safeName}_type`]: service.serviceType,
                    [`service_${safeName}_id`]: service.serviceId,
                    [`service_${safeName}_state_modified`]: service.stateModifiedAt || '',
                })
            })

            // Update actions with new service choices
            this.updateActions()

            // Rebuild variable definitions when services change
            this.updateVariableDefinitions()

            this.updateStatus(InstanceStatus.Ok)
            this.checkFeedbacks()
        } catch (error) {
            this.updateStatus(InstanceStatus.ConnectionFailure)
            this.log('error', `Failed to get services: ${error.message}`)
        }
    }

    async getServerStatus() {
        try {
            const status = await this.makeRequest('/api/statistics/current?serverId=Receiver1&type=content_processing_server&id=0')
            this.serverStatus = status || {}

            if (status) {
                // Update server variables
                const serverVars = {
                    'server_uptime': status.uptime || '0 days 00:00:00',
                    'server_uptime_sec': status.uptimeSec || 0,
                    'server_chassis': status.chassisName || status.productName || 'Unknown',
                    'server_product_name': status.productName || 'Unknown',
                    'server_datetime': status.dateTime || '',
                    'server_mem_size': status.memSizeGByte || 0,
                    'server_disk_size': status.diskSizeGByte || 0,
                    'server_tpm': status.tpm ? 'Yes' : 'No',
                    'server_version': status.version || 'Unknown',
                    'server_id': status.id || 'Receiver1'
                }

                // SDI Ports
                if (status.sdiPorts) {
                    status.sdiPorts.forEach((port, idx) => {
                        serverVars[`sdi_port_${idx}_type`] = port.type || 'Unknown'
                        serverVars[`sdi_port_${idx}_service`] = port.serviceName || 'None'

                        // Find the service details for this port
                        if (port.serviceName && this.services) {
                            const service = this.services.find(s => s.serviceName === port.serviceName)
                            if (service) {
                                serverVars[`sdi_port_${idx}_service_type`] = service.serviceType || 'Unknown'
                                serverVars[`sdi_port_${idx}_service_state`] = service.state || 'Unknown'
                                serverVars[`sdi_port_${idx}_output_active`] = service.state === 'started' ? 'Yes' : 'No'
                            } else {
                                serverVars[`sdi_port_${idx}_service_type`] = 'Unknown'
                                serverVars[`sdi_port_${idx}_service_state`] = 'Unknown'
                                serverVars[`sdi_port_${idx}_output_active`] = 'No'
                            }
                        } else {
                            serverVars[`sdi_port_${idx}_service_type`] = 'None'
                            serverVars[`sdi_port_${idx}_service_state`] = 'None'
                            serverVars[`sdi_port_${idx}_output_active`] = 'No'
                        }
                    })
                }

                // PCIe Slots
                if (status.pcieSlots) {
                    status.pcieSlots.forEach((slot, idx) => {
                        if (slot) {
                            serverVars[`pcie_slot_${idx}_desc`] = slot.description || 'Empty'
                            serverVars[`pcie_slot_${idx}_part`] = slot.partNumber || 'N/A'
                        } else {
                            serverVars[`pcie_slot_${idx}_desc`] = 'Empty'
                            serverVars[`pcie_slot_${idx}_part`] = 'N/A'
                        }
                    })
                }

                this.setVariableValues(serverVars)

                // If server status includes services, update their detailed status
                if (status.services && Array.isArray(status.services)) {
                    let blockedCount = 0
                    for (const serviceStatus of status.services) {
                        const service = this.services.find(s => s.serviceId === serviceStatus.id)
                        if (service) {
                            // Store the detailed status
                            this.serviceStatus[service.serviceName] = serviceStatus

                            // Check if blocked
                            if (serviceStatus.runningState && serviceStatus.runningState.includes('blocked')) {
                                blockedCount++
                            }

                            // Update all service variables
                            this.updateServiceVariables(service.serviceName, serviceStatus)
                        }
                    }
                    this.setVariableValues({ 'blocked_services': blockedCount })
                }
            }

            // Rebuild variable definitions to include all service-specific variables
            this.updateVariableDefinitions()
            this.checkFeedbacks()
        } catch (error) {
            this.log('debug', `Failed to get server status: ${error.message}`)
        }
    }

    formatBitrate(bitrate, receiving = true) {
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

    updateServiceVariables(serviceName, status) {
        this.log('debug', `Updating variables for service: ${serviceName}`)
        const safeName = serviceName.replace(/[^a-zA-Z0-9_]/g, '_')
        const vars = {}

        // Basic status
        vars[`service_${safeName}_uptime`] = status.uptimeSec || 0
        vars[`service_${safeName}_running_state`] = status.runningState || 'unknown'

        // Check if service is actually running and receiving data
        const isBlocked = status.runningState && status.runningState.includes('blocked')
        const isRunning = status.runningState && !status.runningState.includes('blocked')

        // Input status
        if (status.inputs) {
            vars[`service_${safeName}_active_source`] = status.inputs.activeSourceIndex === 0 ? 'Primary' : 'Secondary'
            vars[`service_${safeName}_network_id`] = status.inputs.networkId || 0
            vars[`service_${safeName}_orig_network_id`] = status.inputs.originalNetworkId || 0
            vars[`service_${safeName}_ts_id`] = status.inputs.transportStreamId || 0
            vars[`service_${safeName}_program_count`] = status.inputs.mptsPrograms ? status.inputs.mptsPrograms.length : 0

            // Source status for primary and secondary
            if (status.inputs.sources) {
                status.inputs.sources.forEach((source, idx) => {
                    const sourceName = idx === 0 ? 'primary' : 'secondary'

                    vars[`service_${safeName}_${sourceName}_type`] = source.type || 'unknown'
                    vars[`service_${safeName}_${sourceName}_receiving`] = source.receiving ? 'Yes' : 'No'
                    vars[`service_${safeName}_${sourceName}_bitrate`] = this.formatBitrate(source.bitRate, source.receiving)
                    vars[`service_${safeName}_${sourceName}_bitrate_raw`] = source.bitRate || 0
                    vars[`service_${safeName}_${sourceName}_cc_errors`] = source.ccError || 0
                    vars[`service_${safeName}_${sourceName}_pid_errors`] = source.pidError || 0
                    vars[`service_${safeName}_${sourceName}_pmt_errors`] = source.pmtError || 0
                    vars[`service_${safeName}_${sourceName}_sync_errors`] = source.syncByteError || 0
                    vars[`service_${safeName}_${sourceName}_transport_errors`] = source.transportError || 0
                    vars[`service_${safeName}_${sourceName}_sync_loss`] = source.tsSyncLoss || 0

                    // Satellite-specific
                    if (source.type === 'sat') {
                        vars[`service_${safeName}_${sourceName}_ber`] = source.ber || '<1e-7'
                        vars[`service_${safeName}_${sourceName}_cn_margin`] = source.cnMargin || 0
                        vars[`service_${safeName}_${sourceName}_fec_rate`] = source.fecRate || 'Unknown'
                        vars[`service_${safeName}_${sourceName}_modulation`] = source.modulation || 'Unknown'
                        vars[`service_${safeName}_${sourceName}_rf_lock`] = source.rfLock ? 'Yes' : 'No'
                        vars[`service_${safeName}_${sourceName}_signal_strength`] = source.signalStrength || 0
                        vars[`service_${safeName}_${sourceName}_delivery`] = source.deliverySystem || 'Unknown'
                    }
                })
            }
        }

        // Processing status
        if (status.processings) {
            if (status.processings.decode) {
                const decode = status.processings.decode
                vars[`service_${safeName}_program_number`] = decode.programNumber || 0
                vars[`service_${safeName}_program_auto`] = decode.programAutoSelected ? 'Yes' : 'No'
                vars[`service_${safeName}_descrambling`] = decode.descramblingState || 'unknown'

                // Stream status
                if (decode.streams) {
                    // Video stream
                    const videoStream = decode.streams.find(s => s.type === 'video')
                    if (videoStream) {
                        vars[`service_${safeName}_video_pid`] = videoStream.pid || 0
                        // Check if we're actually decoding (have valid dimensions)
                        const isDecoding = videoStream.width > 0 && videoStream.height > 0
                        vars[`service_${safeName}_video_bitrate`] = this.formatBitrate(videoStream.bitRate, isDecoding)
                        vars[`service_${safeName}_video_bitrate_raw`] = videoStream.bitRate || 0
                        vars[`service_${safeName}_video_width`] = videoStream.width || 0
                        vars[`service_${safeName}_video_height`] = videoStream.height || 0
                        vars[`service_${safeName}_video_resolution`] = `${videoStream.width || 0}x${videoStream.height || 0}`
                        vars[`service_${safeName}_video_interlaced`] = videoStream.interlaced ? 'Yes' : 'No'
                        vars[`service_${safeName}_video_framerate`] = videoStream.frameRateNumerator && videoStream.frameRateDenominator
                            ? `${videoStream.frameRateNumerator}/${videoStream.frameRateDenominator}`
                            : 'Unknown'
                        vars[`service_${safeName}_video_codec`] = videoStream.codec || 'Unknown'
                        vars[`service_${safeName}_video_chroma`] = videoStream.chromaFormat || 'Unknown'
                    }

                    // Audio streams
                    const audioStreams = decode.streams.filter(s => s.type === 'audio')
                    audioStreams.forEach((audioStream, idx) => {
                        const audioNum = idx + 1
                        vars[`service_${safeName}_audio${audioNum}_pid`] = audioStream.pid || 0
                        vars[`service_${safeName}_audio${audioNum}_lang`] = audioStream.language || 'Unknown'
                        vars[`service_${safeName}_audio${audioNum}_codec`] = audioStream.codec || 'Unknown'
                        vars[`service_${safeName}_audio${audioNum}_bitrate`] = this.formatBitrate(audioStream.bitRate)
                        vars[`service_${safeName}_audio${audioNum}_bitrate_raw`] = audioStream.bitRate || 0
                        vars[`service_${safeName}_audio${audioNum}_samplerate`] = audioStream.samplingRate || 0
                        vars[`service_${safeName}_audio${audioNum}_channels`] = audioStream.channelCount || 0
                    })
                }
            }
        }

        // Output status
        if (status.outputs && status.outputs.length > 0) {
            const output = status.outputs[0]
            vars[`service_${safeName}_output_type`] = output.type || 'Unknown'

            if (output.type === 'sdiOutput') {
                vars[`service_${safeName}_sdi_port`] = output.port || 'Unknown'
                vars[`service_${safeName}_remote_prod_status`] = output.remoteProductionMasterSlaveStatus || 'N/A'
            } else if (output.type === 'udpOutput') {
                if (output.multicasts && output.multicasts[0]) {
                    vars[`service_${safeName}_udp_packets`] = output.multicasts[0].udpOutputPacketCount || 0
                }
            }
        }

        this.log('debug', `Setting ${Object.keys(vars).length} variables for service ${serviceName}`)
        this.setVariableValues(vars)
    }

    async getServiceStatus(serviceName, serviceId) {
        try {
            // Use serviceId for the status API call
            const actualId = serviceId || serviceName
            // URL encode the ID to handle special characters
            const encodedId = encodeURIComponent(actualId)
            const status = await this.makeRequest(`/api/statistics/current?serverId=Receiver1&type=content_processing&id=${encodedId}`)
            this.serviceStatus[serviceName] = status || {}

            if (status) {
                this.updateServiceVariables(serviceName, status)
            } else {
                // Clear variables if we can't get status
                this.clearServiceVariables(serviceName)
            }

            this.checkFeedbacks()
            return status
        } catch (error) {
            this.log('debug', `Failed to get service status: ${error.message}`)
            // Clear variables on error
            this.clearServiceVariables(serviceName)
            return null
        }
    }

    clearServiceVariables(serviceName) {
        const safeName = serviceName.replace(/[^a-zA-Z0-9_]/g, '_')
        const vars = {}

        // Set all bitrate variables to "No Data"
        vars[`service_${safeName}_primary_bitrate`] = 'No Data'
        vars[`service_${safeName}_secondary_bitrate`] = 'No Data'
        vars[`service_${safeName}_video_bitrate`] = 'No Data'

        // Clear other dynamic values
        vars[`service_${safeName}_running_state`] = 'offline'
        vars[`service_${safeName}_primary_receiving`] = 'No'
        vars[`service_${safeName}_secondary_receiving`] = 'No'

        this.setVariableValues(vars)
    }

    async startService(serviceType, serviceId) {
        try {
            // URL encode the service type and ID to handle special characters
            const encodedType = encodeURIComponent(serviceType)
            const encodedId = encodeURIComponent(serviceId)
            await this.makeRequest(`/api/services/${encodedType}/${encodedId}/start`, 'POST')
            this.log('info', `Started service ${serviceId}`)
            setTimeout(() => this.getServices(), 1000)
            return true
        } catch (error) {
            this.log('error', `Failed to start service: ${error.message}`)
            return false
        }
    }

    async stopService(serviceType, serviceId) {
        try {
            // URL encode the service type and ID to handle special characters
            const encodedType = encodeURIComponent(serviceType)
            const encodedId = encodeURIComponent(serviceId)
            await this.makeRequest(`/api/services/${encodedType}/${encodedId}/stop`, 'POST')
            this.log('info', `Stopped service ${serviceId}`)
            setTimeout(() => this.getServices(), 1000)
            return true
        } catch (error) {
            this.log('error', `Failed to stop service: ${error.message}`)
            return false
        }
    }
}

runEntrypoint(MediaKindRX1Instance, UpgradeScripts)