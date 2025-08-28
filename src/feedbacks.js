const { combineRgb } = require('@companion-module/base')

module.exports = async function (self) {
    self.setFeedbackDefinitions({
        service_state: {
            name: 'Service State',
            type: 'boolean',
            label: 'Service State',
            defaultStyle: {
                bgcolor: combineRgb(0, 255, 0),
                color: combineRgb(0, 0, 0),
            },
            options: [
                {
                    type: 'dropdown',
                    label: 'Service',
                    id: 'service',
                    default: '',
                    choices: self.serviceChoices || [],
                    allowCustom: true,
                },
                {
                    type: 'dropdown',
                    label: 'State',
                    id: 'state',
                    default: 'started',
                    choices: [
                        { id: 'started', label: 'Started' },
                        { id: 'stopped', label: 'Stopped' },
                    ],
                },
            ],
            callback: (feedback) => {
                const parts = feedback.options.service.split('/')
                if (parts.length === 2) {
                    const service = self.services.find(s =>
                        s.serviceType === parts[0] && s.serviceId === parts[1]
                    )
                    return service && service.state === feedback.options.state
                }
                return false
            },
        },

        service_receiving: {
            name: 'Service Receiving Signal',
            type: 'boolean',
            label: 'Service Receiving',
            defaultStyle: {
                bgcolor: combineRgb(0, 255, 0),
                color: combineRgb(0, 0, 0),
            },
            options: [
                {
                    type: 'dropdown',
                    label: 'Service',
                    id: 'service',
                    default: '',
                    choices: self.serviceChoices || [],
                    allowCustom: true,
                },
            ],
            callback: (feedback) => {
                const parts = feedback.options.service.split('/')
                if (parts.length === 2) {
                    const serviceId = parts[1]
                    const serviceName = self.serviceIdToName[serviceId]
                    if (serviceName) {
                        const status = self.serviceStatus[serviceName]
                        if (status && status.inputs && status.inputs.sources) {
                            const activeSource = status.inputs.sources[status.inputs.activeSourceIndex || 0]
                            return activeSource && activeSource.receiving === true
                        }
                    }
                }
                return false
            },
        },

        input_alarm: {
            name: 'Input Alarm',
            type: 'boolean',
            label: 'Input Alarm',
            defaultStyle: {
                bgcolor: combineRgb(255, 0, 0),
                color: combineRgb(255, 255, 255),
            },
            options: [
                {
                    type: 'dropdown',
                    label: 'Service',
                    id: 'service',
                    default: '',
                    choices: self.serviceChoices || [],
                    allowCustom: true,
                },
                {
                    type: 'dropdown',
                    label: 'Alarm Type',
                    id: 'alarmType',
                    default: 'ccError',
                    choices: [
                        { id: 'ccError', label: 'CC Errors' },
                        { id: 'transportError', label: 'Transport Errors' },
                        { id: 'tsSyncLoss', label: 'TS Sync Loss' },
                        { id: 'pidError', label: 'PID Errors' },
                        { id: 'pmtError', label: 'PMT Errors' },
                    ],
                },
                {
                    type: 'number',
                    label: 'Threshold',
                    id: 'threshold',
                    default: 0,
                    min: 0,
                    max: 10000,
                },
            ],
            callback: (feedback) => {
                const parts = feedback.options.service.split('/')
                if (parts.length === 2) {
                    const serviceId = parts[1]
                    const serviceName = self.serviceIdToName[serviceId]
                    if (serviceName) {
                        const status = self.serviceStatus[serviceName]
                        if (status && status.inputs && status.inputs.sources) {
                            const activeSource = status.inputs.sources[status.inputs.activeSourceIndex || 0]
                            if (activeSource) {
                                const value = activeSource[feedback.options.alarmType] || 0
                                return value > feedback.options.threshold
                            }
                        }
                    }
                }
                return false
            },
        },

        bitrate_threshold: {
            name: 'Bitrate Threshold',
            type: 'boolean',
            label: 'Bitrate Threshold',
            defaultStyle: {
                bgcolor: combineRgb(255, 255, 0),
                color: combineRgb(0, 0, 0),
            },
            options: [
                {
                    type: 'dropdown',
                    label: 'Service',
                    id: 'service',
                    default: '',
                    choices: self.serviceChoices || [],
                    allowCustom: true,
                },
                {
                    type: 'dropdown',
                    label: 'Comparison',
                    id: 'comparison',
                    default: 'less',
                    choices: [
                        { id: 'less', label: 'Less Than' },
                        { id: 'greater', label: 'Greater Than' },
                    ],
                },
                {
                    type: 'number',
                    label: 'Bitrate (bps)',
                    id: 'bitrate',
                    default: 1000000,
                    min: 0,
                    max: 100000000,
                },
            ],
            callback: (feedback) => {
                const parts = feedback.options.service.split('/')
                if (parts.length === 2) {
                    const serviceId = parts[1]
                    const serviceName = self.serviceIdToName[serviceId]
                    if (serviceName) {
                        const status = self.serviceStatus[serviceName]
                        if (status && status.inputs && status.inputs.sources) {
                            const activeSource = status.inputs.sources[status.inputs.activeSourceIndex || 0]
                            if (activeSource && activeSource.bitRate !== undefined) {
                                const bitrateValue = activeSource.bitRate
                                if (feedback.options.comparison === 'less') {
                                    return bitrateValue < feedback.options.bitrate
                                } else {
                                    return bitrateValue > feedback.options.bitrate
                                }
                            }
                        }
                    }
                }
                return false
            },
        },

        descrambling_state: {
            name: 'Descrambling State',
            type: 'boolean',
            label: 'Descrambling State',
            defaultStyle: {
                bgcolor: combineRgb(0, 255, 0),
                color: combineRgb(0, 0, 0),
            },
            options: [
                {
                    type: 'dropdown',
                    label: 'Service',
                    id: 'service',
                    default: '',
                    choices: self.serviceChoices || [],
                    allowCustom: true,
                },
                {
                    type: 'dropdown',
                    label: 'State',
                    id: 'state',
                    default: 'clear',
                    choices: [
                        { id: 'clear', label: 'Clear' },
                        { id: 'scrambled', label: 'Scrambled' },
                        { id: 'descrambled', label: 'Descrambled' },
                        { id: 'unknown', label: 'Unknown' },
                    ],
                },
            ],
            callback: (feedback) => {
                const parts = feedback.options.service.split('/')
                if (parts.length === 2) {
                    const serviceId = parts[1]
                    const serviceName = self.serviceIdToName[serviceId]
                    if (serviceName) {
                        const status = self.serviceStatus[serviceName]
                        if (status && status.processings && status.processings.decode) {
                            return status.processings.decode.descramblingState === feedback.options.state
                        }
                    }
                }
                return false
            },
        },

        source_active: {
            name: 'Active Source',
            type: 'boolean',
            label: 'Active Source',
            defaultStyle: {
                bgcolor: combineRgb(0, 128, 255),
                color: combineRgb(255, 255, 255),
            },
            options: [
                {
                    type: 'dropdown',
                    label: 'Service',
                    id: 'service',
                    default: '',
                    choices: self.serviceChoices || [],
                    allowCustom: true,
                },
                {
                    type: 'dropdown',
                    label: 'Source',
                    id: 'source',
                    default: 0,
                    choices: [
                        { id: 0, label: 'Primary (Source 1)' },
                        { id: 1, label: 'Secondary (Source 2)' },
                    ],
                },
            ],
            callback: (feedback) => {
                const parts = feedback.options.service.split('/')
                if (parts.length === 2) {
                    const serviceId = parts[1]
                    const serviceName = self.serviceIdToName[serviceId]
                    if (serviceName) {
                        const status = self.serviceStatus[serviceName]
                        if (status && status.inputs) {
                            return status.inputs.activeSourceIndex === feedback.options.source
                        }
                    }
                }
                return false
            },
        },

        connection_status: {
            name: 'Connection Status',
            type: 'boolean',
            label: 'Connection Status',
            defaultStyle: {
                bgcolor: combineRgb(0, 255, 0),
                color: combineRgb(0, 0, 0),
            },
            options: [],
            callback: () => {
                return self.status === 2
            },
        },

        any_service_running: {
            name: 'Any Service Running',
            type: 'boolean',
            label: 'Any Service Running',
            defaultStyle: {
                bgcolor: combineRgb(0, 255, 0),
                color: combineRgb(0, 0, 0),
            },
            options: [],
            callback: () => {
                return self.services.some(service => service.state === 'started')
            },
        },

        all_services_stopped: {
            name: 'All Services Stopped',
            type: 'boolean',
            label: 'All Services Stopped',
            defaultStyle: {
                bgcolor: combineRgb(128, 128, 128),
                color: combineRgb(255, 255, 255),
            },
            options: [],
            callback: () => {
                return self.services.length > 0 && self.services.every(service => service.state === 'stopped')
            },
        },

        satellite_input_status: {
            name: 'Satellite Input Status',
            type: 'boolean',
            label: 'Satellite Input Status',
            defaultStyle: {
                bgcolor: combineRgb(0, 255, 0),
                color: combineRgb(0, 0, 0),
            },
            options: [
                {
                    type: 'textinput',
                    label: 'Service Name',
                    id: 'serviceName',
                    default: '',
                    tooltip: 'The service name to check',
                },
                {
                    type: 'dropdown',
                    label: 'Check Type',
                    id: 'checkType',
                    default: 'rfLock',
                    choices: [
                        { id: 'rfLock', label: 'RF Lock' },
                        { id: 'receiving', label: 'Receiving' },
                        { id: 'ber', label: 'BER Threshold' },
                        { id: 'cnMargin', label: 'C/N Margin' },
                        { id: 'signalStrength', label: 'Signal Strength' },
                    ],
                },
                {
                    type: 'number',
                    label: 'Threshold Value',
                    id: 'threshold',
                    default: 0,
                    min: -100,
                    max: 100,
                    tooltip: 'Threshold for BER, C/N Margin, or Signal Strength checks',
                    isVisible: (options) => ['ber', 'cnMargin', 'signalStrength'].includes(options.checkType),
                },
            ],
            callback: (feedback) => {
                const status = self.serviceStatus[feedback.options.serviceName]
                if (status && status.inputs && status.inputs.sources) {
                    const satSource = status.inputs.sources.find(s => s.type === 'sat')
                    if (satSource) {
                        switch (feedback.options.checkType) {
                            case 'rfLock':
                                return satSource.rfLock === true
                            case 'receiving':
                                return satSource.receiving === true
                            case 'ber':
                                // Parse BER scientific notation
                                const berValue = parseFloat(satSource.ber)
                                return !isNaN(berValue) && berValue < feedback.options.threshold
                            case 'cnMargin':
                                return satSource.cnMargin > feedback.options.threshold
                            case 'signalStrength':
                                return satSource.signalStrength > feedback.options.threshold
                        }
                    }
                }
                return false
            },
        },

        asi_input_status: {
            name: 'ASI Input Status',
            type: 'boolean',
            label: 'ASI Input Status',
            defaultStyle: {
                bgcolor: combineRgb(0, 255, 0),
                color: combineRgb(0, 0, 0),
            },
            options: [
                {
                    type: 'textinput',
                    label: 'Service Name',
                    id: 'serviceName',
                    default: '',
                    tooltip: 'The service name to check',
                },
                {
                    type: 'dropdown',
                    label: 'Check Type',
                    id: 'checkType',
                    default: 'receiving',
                    choices: [
                        { id: 'receiving', label: 'Receiving' },
                        { id: 'bitrate', label: 'Bitrate Threshold' },
                    ],
                },
                {
                    type: 'number',
                    label: 'Bitrate Threshold (bps)',
                    id: 'threshold',
                    default: 1000000,
                    min: 0,
                    max: 100000000,
                    isVisible: (options) => options.checkType === 'bitrate',
                },
            ],
            callback: (feedback) => {
                const status = self.serviceStatus[feedback.options.serviceName]
                if (status && status.inputs && status.inputs.sources) {
                    const asiSource = status.inputs.sources.find(s => s.type === 'asi')
                    if (asiSource) {
                        switch (feedback.options.checkType) {
                            case 'receiving':
                                return asiSource.receiving === true
                            case 'bitrate':
                                const asiThreshold = feedback.options.threshold || 1000000
                                return asiSource.bitRate > asiThreshold
                        }
                    }
                }
                return false
            },
        },

        service_blocked: {
            name: 'Service Blocked',
            type: 'boolean',
            label: 'Service Blocked',
            defaultStyle: {
                bgcolor: combineRgb(255, 128, 0),
                color: combineRgb(255, 255, 255),
            },
            options: [
                {
                    type: 'textinput',
                    label: 'Service Name',
                    id: 'serviceName',
                    default: '',
                    tooltip: 'The service name to check',
                },
            ],
            callback: (feedback) => {
                const status = self.serviceStatus[feedback.options.serviceName]
                if (status) {
                    return status.runningState && status.runningState.includes('blocked')
                }
                return false
            },
        },

        program_detected: {
            name: 'Program Detected',
            type: 'boolean',
            label: 'Program Detected',
            defaultStyle: {
                bgcolor: combineRgb(0, 128, 255),
                color: combineRgb(255, 255, 255),
            },
            options: [
                {
                    type: 'textinput',
                    label: 'Service Name',
                    id: 'serviceName',
                    default: '',
                    tooltip: 'The service name to check',
                },
                {
                    type: 'number',
                    label: 'Program Number',
                    id: 'programNumber',
                    default: 0,
                    min: 0,
                    max: 65535,
                    tooltip: 'The program number to look for (0 = any program)',
                },
            ],
            callback: (feedback) => {
                const status = self.serviceStatus[feedback.options.serviceName]
                if (status && status.inputs && status.inputs.mptsPrograms) {
                    if (feedback.options.programNumber === 0) {
                        // Check if any programs exist
                        return status.inputs.mptsPrograms.length > 0
                    } else {
                        // Check for specific program number
                        return status.inputs.mptsPrograms.some(
                            prog => prog.programNumber === feedback.options.programNumber
                        )
                    }
                }
                return false
            },
        },

        decode_state: {
            name: 'Decode State',
            type: 'boolean',
            label: 'Decode State',
            defaultStyle: {
                bgcolor: combineRgb(0, 255, 0),
                color: combineRgb(0, 0, 0),
            },
            options: [
                {
                    type: 'textinput',
                    label: 'Service Name',
                    id: 'serviceName',
                    default: '',
                    tooltip: 'The service name to check',
                },
                {
                    type: 'dropdown',
                    label: 'Stream Type',
                    id: 'streamType',
                    default: 'video',
                    choices: [
                        { id: 'video', label: 'Video' },
                        { id: 'audio', label: 'Audio' },
                    ],
                },
                {
                    type: 'dropdown',
                    label: 'Check',
                    id: 'check',
                    default: 'active',
                    choices: [
                        { id: 'active', label: 'Active/Decoding' },
                        { id: 'resolution', label: 'Resolution Match' },
                        { id: 'codec', label: 'Codec Match' },
                    ],
                },
                {
                    type: 'textinput',
                    label: 'Match Value',
                    id: 'matchValue',
                    default: '',
                    tooltip: 'Value to match for resolution or codec checks',
                    isVisible: (options) => options.check !== 'active',
                },
            ],
            callback: (feedback) => {
                const status = self.serviceStatus[feedback.options.serviceName]
                if (status && status.processings && status.processings.decode) {
                    const decode = status.processings.decode
                    const stream = decode.streams.find(s => s.type === feedback.options.streamType)

                    if (stream) {
                        switch (feedback.options.check) {
                            case 'active':
                                return true // Stream exists and is being decoded
                            case 'resolution':
                                if (feedback.options.streamType === 'video') {
                                    const resolution = `${stream.width}x${stream.height}`
                                    return resolution === feedback.options.matchValue
                                }
                                return false
                            case 'codec':
                                return stream.codec === feedback.options.matchValue
                        }
                    }
                }
                return false
            },
        },
    })
}