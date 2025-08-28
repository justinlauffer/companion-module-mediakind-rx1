const { combineRgb } = require('@companion-module/base')

module.exports = async function (self) {
    const presets = []

    presets.push({
        type: 'button',
        category: 'Service Control',
        name: 'Start Service',
        style: {
            text: 'Start\\nService',
            size: '14',
            color: combineRgb(255, 255, 255),
            bgcolor: combineRgb(0, 128, 0),
        },
        steps: [
            {
                down: [
                    {
                        actionId: 'start_service',
                        options: {
                            service: 'content_processing/SERVICE-1',
                        },
                    },
                ],
                up: [],
            },
        ],
        feedbacks: [
            {
                feedbackId: 'service_state',
                options: {
                    service: 'content_processing/SERVICE-1',
                    state: 'started',
                },
                style: {
                    bgcolor: combineRgb(0, 255, 0),
                    color: combineRgb(0, 0, 0),
                },
            },
        ],
    })

    presets.push({
        type: 'button',
        category: 'Service Control',
        name: 'Stop Service',
        style: {
            text: 'Stop\\nService',
            size: '14',
            color: combineRgb(255, 255, 255),
            bgcolor: combineRgb(128, 0, 0),
        },
        steps: [
            {
                down: [
                    {
                        actionId: 'stop_service',
                        options: {
                            service: 'content_processing/SERVICE-1',
                        },
                    },
                ],
                up: [],
            },
        ],
        feedbacks: [
            {
                feedbackId: 'service_state',
                options: {
                    service: 'content_processing/SERVICE-1',
                    state: 'stopped',
                },
                style: {
                    bgcolor: combineRgb(255, 0, 0),
                    color: combineRgb(255, 255, 255),
                },
            },
        ],
    })

    presets.push({
        type: 'button',
        category: 'Service Control',
        name: 'Toggle Service',
        style: {
            text: 'Toggle\\nService',
            size: '14',
            color: combineRgb(255, 255, 255),
            bgcolor: combineRgb(0, 0, 128),
        },
        steps: [
            {
                down: [
                    {
                        actionId: 'toggle_service',
                        options: {
                            service: 'content_processing/SERVICE-1',
                        },
                    },
                ],
                up: [],
            },
        ],
        feedbacks: [
            {
                feedbackId: 'service_state',
                options: {
                    service: 'content_processing/SERVICE-1',
                    state: 'started',
                },
                style: {
                    bgcolor: combineRgb(0, 255, 0),
                    color: combineRgb(0, 0, 0),
                    text: 'Service\\nRunning',
                },
            },
            {
                feedbackId: 'service_state',
                options: {
                    service: 'content_processing/SERVICE-1',
                    state: 'stopped',
                },
                style: {
                    bgcolor: combineRgb(128, 128, 128),
                    color: combineRgb(255, 255, 255),
                    text: 'Service\\nStopped',
                },
            },
        ],
    })

    presets.push({
        type: 'button',
        category: 'Service Control',
        name: 'Start All Services',
        style: {
            text: 'Start\\nALL',
            size: '14',
            color: combineRgb(255, 255, 255),
            bgcolor: combineRgb(0, 128, 0),
        },
        steps: [
            {
                down: [
                    {
                        actionId: 'start_all_services',
                        options: {},
                    },
                ],
                up: [],
            },
        ],
        feedbacks: [
            {
                feedbackId: 'any_service_running',
                options: {},
                style: {
                    bgcolor: combineRgb(0, 255, 0),
                    color: combineRgb(0, 0, 0),
                },
            },
        ],
    })

    presets.push({
        type: 'button',
        category: 'Service Control',
        name: 'Stop All Services',
        style: {
            text: 'Stop\\nALL',
            size: '14',
            color: combineRgb(255, 255, 255),
            bgcolor: combineRgb(128, 0, 0),
        },
        steps: [
            {
                down: [
                    {
                        actionId: 'stop_all_services',
                        options: {},
                    },
                ],
                up: [],
            },
        ],
        feedbacks: [
            {
                feedbackId: 'all_services_stopped',
                options: {},
                style: {
                    bgcolor: combineRgb(255, 0, 0),
                    color: combineRgb(255, 255, 255),
                },
            },
        ],
    })

    presets.push({
        type: 'button',
        category: 'Status',
        name: 'Signal Status',
        style: {
            text: 'Signal\\nStatus',
            size: '14',
            color: combineRgb(255, 255, 255),
            bgcolor: combineRgb(64, 64, 64),
        },
        steps: [],
        feedbacks: [
            {
                feedbackId: 'service_receiving',
                options: {
                    service: 'content_processing/SERVICE-1',
                },
                style: {
                    bgcolor: combineRgb(0, 255, 0),
                    color: combineRgb(0, 0, 0),
                    text: 'Signal\\nOK',
                },
            },
        ],
    })

    presets.push({
        type: 'button',
        category: 'Status',
        name: 'Input Alarm',
        style: {
            text: 'Input\\nAlarm',
            size: '14',
            color: combineRgb(255, 255, 255),
            bgcolor: combineRgb(64, 64, 64),
        },
        steps: [],
        feedbacks: [
            {
                feedbackId: 'input_alarm',
                options: {
                    service: 'content_processing/SERVICE-1',
                    alarmType: 'ccError',
                    threshold: 0,
                },
                style: {
                    bgcolor: combineRgb(255, 0, 0),
                    color: combineRgb(255, 255, 255),
                    text: 'CC\\nERROR',
                },
            },
        ],
    })

    presets.push({
        type: 'button',
        category: 'Status',
        name: 'Active Source',
        style: {
            text: 'Active\\nSource',
            size: '14',
            color: combineRgb(255, 255, 255),
            bgcolor: combineRgb(64, 64, 64),
        },
        steps: [],
        feedbacks: [
            {
                feedbackId: 'source_active',
                options: {
                    serviceId: 'SERVICE-1',
                    source: 0,
                },
                style: {
                    bgcolor: combineRgb(0, 128, 255),
                    color: combineRgb(255, 255, 255),
                    text: 'Primary\\nActive',
                },
            },
            {
                feedbackId: 'source_active',
                options: {
                    serviceId: 'SERVICE-1',
                    source: 1,
                },
                style: {
                    bgcolor: combineRgb(255, 128, 0),
                    color: combineRgb(255, 255, 255),
                    text: 'Secondary\\nActive',
                },
            },
        ],
    })

    presets.push({
        type: 'button',
        category: 'Status',
        name: 'Descrambling Status',
        style: {
            text: 'CA\\nStatus',
            size: '14',
            color: combineRgb(255, 255, 255),
            bgcolor: combineRgb(64, 64, 64),
        },
        steps: [],
        feedbacks: [
            {
                feedbackId: 'descrambling_state',
                options: {
                    serviceId: 'SERVICE-1',
                    state: 'clear',
                },
                style: {
                    bgcolor: combineRgb(0, 255, 0),
                    color: combineRgb(0, 0, 0),
                    text: 'Clear',
                },
            },
            {
                feedbackId: 'descrambling_state',
                options: {
                    serviceId: 'SERVICE-1',
                    state: 'scrambled',
                },
                style: {
                    bgcolor: combineRgb(255, 0, 0),
                    color: combineRgb(255, 255, 255),
                    text: 'Scrambled',
                },
            },
            {
                feedbackId: 'descrambling_state',
                options: {
                    serviceId: 'SERVICE-1',
                    state: 'descrambled',
                },
                style: {
                    bgcolor: combineRgb(0, 128, 255),
                    color: combineRgb(255, 255, 255),
                    text: 'Descrambled',
                },
            },
        ],
    })

    presets.push({
        type: 'button',
        category: 'System',
        name: 'Refresh',
        style: {
            text: 'Refresh',
            size: '14',
            color: combineRgb(255, 255, 255),
            bgcolor: combineRgb(0, 0, 128),
        },
        steps: [
            {
                down: [
                    {
                        actionId: 'refresh_services',
                        options: {},
                    },
                ],
                up: [],
            },
        ],
        feedbacks: [],
    })

    presets.push({
        type: 'button',
        category: 'System',
        name: 'Connection Status',
        style: {
            text: 'RX1\\nStatus',
            size: '14',
            color: combineRgb(255, 255, 255),
            bgcolor: combineRgb(64, 64, 64),
        },
        steps: [],
        feedbacks: [
            {
                feedbackId: 'connection_status',
                options: {},
                style: {
                    bgcolor: combineRgb(0, 255, 0),
                    color: combineRgb(0, 0, 0),
                    text: 'RX1\\nConnected',
                },
            },
        ],
    })

    self.setPresetDefinitions(presets)
}