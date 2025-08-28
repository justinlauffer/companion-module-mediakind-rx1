module.exports = function (self) {
    self.setActionDefinitions({
        start_service: {
            name: 'Start Service',
            options: [
                {
                    type: 'dropdown',
                    label: 'Service',
                    id: 'service',
                    default: '',
                    choices: self.serviceChoices || [],
                    allowCustom: true,
                    regex: '/^[a-zA-Z0-9_-]+\\/[a-zA-Z0-9_-]+$/',
                },
            ],
            callback: async (event) => {
                const parts = event.options.service.split('/')
                if (parts.length === 2) {
                    await self.startService(parts[0], parts[1])
                } else {
                    self.log('warn', 'Invalid service format. Use: serviceType/serviceId')
                }
            },
        },

        stop_service: {
            name: 'Stop Service',
            options: [
                {
                    type: 'dropdown',
                    label: 'Service',
                    id: 'service',
                    default: '',
                    choices: self.serviceChoices || [],
                    allowCustom: true,
                    regex: '/^[a-zA-Z0-9_-]+\\/[a-zA-Z0-9_-]+$/',
                },
            ],
            callback: async (event) => {
                const parts = event.options.service.split('/')
                if (parts.length === 2) {
                    await self.stopService(parts[0], parts[1])
                } else {
                    self.log('warn', 'Invalid service format. Use: serviceType/serviceId')
                }
            },
        },

        toggle_service: {
            name: 'Toggle Service',
            options: [
                {
                    type: 'dropdown',
                    label: 'Service',
                    id: 'service',
                    default: '',
                    choices: self.serviceChoices || [],
                    allowCustom: true,
                    regex: '/^[a-zA-Z0-9_-]+\\/[a-zA-Z0-9_-]+$/',
                },
            ],
            callback: async (event) => {
                const parts = event.options.service.split('/')
                if (parts.length === 2) {
                    const service = self.services.find(s =>
                        s.serviceType === parts[0] && s.serviceId === parts[1]
                    )

                    if (service) {
                        if (service.state === 'started') {
                            await self.stopService(parts[0], parts[1])
                        } else {
                            await self.startService(parts[0], parts[1])
                        }
                    } else {
                        self.log('warn', 'Service not found')
                    }
                } else {
                    self.log('warn', 'Invalid service format. Use: serviceType/serviceId')
                }
            },
        },

        refresh_services: {
            name: 'Refresh Services',
            options: [],
            callback: async () => {
                await self.getServices()
                await self.getServerStatus()
            },
        },

        custom_api_get: {
            name: 'Custom API GET Request',
            options: [
                {
                    type: 'textinput',
                    label: 'API Path',
                    id: 'path',
                    default: '/api/services',
                    tooltip: 'The API path to request (e.g., /api/services)',
                },
            ],
            callback: async (event) => {
                try {
                    const result = await self.makeRequest(event.options.path)
                    self.log('info', `API Response: ${JSON.stringify(result)}`)
                } catch (error) {
                    self.log('error', `API Request failed: ${error.message}`)
                }
            },
        },

        custom_api_post: {
            name: 'Custom API POST Request',
            options: [
                {
                    type: 'textinput',
                    label: 'API Path',
                    id: 'path',
                    default: '/api/services/content_processing/SERVICE-1/start',
                    tooltip: 'The API path for POST request',
                },
                {
                    type: 'textinput',
                    label: 'JSON Body (optional)',
                    id: 'body',
                    default: '',
                    tooltip: 'Optional JSON body for the request',
                },
            ],
            callback: async (event) => {
                try {
                    let body = null
                    if (event.options.body) {
                        try {
                            body = JSON.parse(event.options.body)
                        } catch (e) {
                            self.log('warn', 'Invalid JSON body, sending without body')
                        }
                    }
                    const result = await self.makeRequest(event.options.path, 'POST', body)
                    self.log('info', `API Response: ${JSON.stringify(result)}`)
                } catch (error) {
                    self.log('error', `API Request failed: ${error.message}`)
                }
            },
        },

        start_all_services: {
            name: 'Start All Services',
            options: [],
            callback: async () => {
                for (const service of self.services) {
                    if (service.state === 'stopped') {
                        await self.startService(service.serviceType, service.serviceId)
                        await new Promise(resolve => setTimeout(resolve, 500))
                    }
                }
            },
        },

        stop_all_services: {
            name: 'Stop All Services',
            options: [],
            callback: async () => {
                for (const service of self.services) {
                    if (service.state === 'started') {
                        await self.stopService(service.serviceType, service.serviceId)
                        await new Promise(resolve => setTimeout(resolve, 500))
                    }
                }
            },
        },

        get_service_status: {
            name: 'Get Service Status',
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
            callback: async (event) => {
                const parts = event.options.service.split('/')
                if (parts.length === 2) {
                    const service = self.services.find(s =>
                        s.serviceType === parts[0] && s.serviceId === parts[1]
                    )
                    if (service) {
                        await self.getServiceStatus(service.serviceName, service.serviceId)
                    }
                }
            },
        },

        export_service_config: {
            name: 'Export Service Configuration',
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
            callback: async (event) => {
                const parts = event.options.service.split('/')
                if (parts.length === 2) {
                    try {
                        // URL encode the service type and ID to handle special characters
                        const encodedType = encodeURIComponent(parts[0])
                        const encodedId = encodeURIComponent(parts[1])
                        const config = await self.makeRequest(`/api/services/${encodedType}/${encodedId}/config`)
                        self.log('info', `Service config exported: ${JSON.stringify(config)}`)
                    } catch (error) {
                        self.log('error', `Failed to export config: ${error.message}`)
                    }
                }
            },
        },

        assign_server: {
            name: 'Assign Server to Service',
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
                    type: 'textinput',
                    label: 'Server ID',
                    id: 'serverId',
                    default: 'Receiver1',
                    tooltip: 'The server ID to assign (e.g., Receiver1)',
                },
            ],
            callback: async (event) => {
                const parts = event.options.service.split('/')
                if (parts.length === 2) {
                    try {
                        // URL encode all parts to handle special characters
                        const encodedType = encodeURIComponent(parts[0])
                        const encodedId = encodeURIComponent(parts[1])
                        const encodedServerId = encodeURIComponent(event.options.serverId)
                        await self.makeRequest(
                            `/api/assign/services/${encodedType}/${encodedId}/servers/${encodedServerId}`,
                            'PUT'
                        )
                        self.log('info', `Assigned ${event.options.serverId} to service ${parts[1]}`)
                    } catch (error) {
                        self.log('error', `Failed to assign server: ${error.message}`)
                    }
                }
            },
        },

        remove_server: {
            name: 'Remove Server from Service',
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
                    type: 'textinput',
                    label: 'Server ID',
                    id: 'serverId',
                    default: 'Receiver1',
                    tooltip: 'The server ID to remove (e.g., Receiver1)',
                },
            ],
            callback: async (event) => {
                const parts = event.options.service.split('/')
                if (parts.length === 2) {
                    try {
                        // URL encode all parts to handle special characters
                        const encodedType = encodeURIComponent(parts[0])
                        const encodedId = encodeURIComponent(parts[1])
                        const encodedServerId = encodeURIComponent(event.options.serverId)
                        await self.makeRequest(
                            `/api/assign/services/${encodedType}/${encodedId}/servers/${encodedServerId}`,
                            'DELETE'
                        )
                        self.log('info', `Removed ${event.options.serverId} from service ${parts[1]}`)
                    } catch (error) {
                        self.log('error', `Failed to remove server: ${error.message}`)
                    }
                }
            },
        },

        get_service_by_type: {
            name: 'Get Services by Type',
            options: [
                {
                    type: 'dropdown',
                    label: 'Service Type',
                    id: 'serviceType',
                    default: 'content_processing',
                    choices: [
                        { id: 'content_processing', label: 'Content Processing' },
                        { id: 'mux', label: 'Multiplexer' },
                        { id: 'live_packaging', label: 'Live Packaging' },
                        { id: 'live_encoding', label: 'Live Encoding' },
                        { id: 'stream_conditioning', label: 'Stream Conditioning' },
                        { id: 'srt', label: 'SRT' },
                        { id: 'ts_splicer', label: 'TS Splicer' },
                    ],
                },
            ],
            callback: async (event) => {
                try {
                    const services = await self.makeRequest(`/api/services/${event.options.serviceType}`)
                    self.log('info', `Found ${services.length} ${event.options.serviceType} services`)
                    // Update internal service list
                    if (services && services.length > 0) {
                        services.forEach(service => {
                            const existing = self.services.find(s => s.serviceId === service.serviceId)
                            if (!existing) {
                                self.services.push(service)
                            }
                        })
                        await self.getServices()
                    }
                } catch (error) {
                    self.log('error', `Failed to get services by type: ${error.message}`)
                }
            },
        },
    })
}