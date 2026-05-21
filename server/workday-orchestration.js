/**
 * Workday Orchestration Integration Module
 * Handles communication with Workday REST API and Orchestration services
 */

const axios = require('axios');

class WorkdayOrchestration {
    constructor(config) {
        this.config = config;
        this.baseUrl = config.orchestrationUrl;
        this.tenant = config.tenant;
        this.apiKey = config.apiKey;
        this.username = config.username;
        this.password = config.password;
    }

    /**
     * Execute Workday orchestration to post data to business object
     */
    async executeOrchestration(payload) {
        try {
            const orchestrationPayload = this.buildOrchestrationPayload(payload);
            
            const response = await axios.post(
                this.baseUrl,
                orchestrationPayload,
                {
                    headers: this.getHeaders(),
                    auth: this.getAuth(),
                    timeout: this.config.timeout || 30000
                }
            );

            return {
                success: true,
                data: response.data,
                status: response.status,
                orchestrationId: response.data.orchestrationId || response.data.id
            };

        } catch (error) {
            console.error('Workday orchestration error:', error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Build orchestration payload in Workday format
     */
    buildOrchestrationPayload(data) {
        return {
            orchestration: {
                name: 'Post_Employee_Data',
                version: 'v1'
            },
            input: {
                businessObject: data.businessObject,
                data: data.data,
                metadata: {
                    ...data.metadata,
                    tenant: this.tenant,
                    timestamp: new Date().toISOString()
                }
            }
        };
    }

    /**
     * Post data directly to Workday business object
     * Alternative method using REST API
     */
    async postToBusinessObject(businessObjectName, data) {
        try {
            const url = `${this.baseUrl.replace('/orchestration/', '/businessObjects/')}/${businessObjectName}`;
            
            const response = await axios.post(
                url,
                data,
                {
                    headers: this.getHeaders(),
                    auth: this.getAuth(),
                    timeout: this.config.timeout || 30000
                }
            );

            return {
                success: true,
                data: response.data,
                status: response.status,
                objectId: response.data.id
            };

        } catch (error) {
            console.error('Business object post error:', error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Get Workday business object by ID
     */
    async getBusinessObject(businessObjectName, objectId) {
        try {
            const url = `${this.baseUrl.replace('/orchestration/', '/businessObjects/')}/${businessObjectName}/${objectId}`;
            
            const response = await axios.get(
                url,
                {
                    headers: this.getHeaders(),
                    auth: this.getAuth(),
                    timeout: this.config.timeout || 30000
                }
            );

            return {
                success: true,
                data: response.data,
                status: response.status
            };

        } catch (error) {
            console.error('Business object get error:', error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Update Workday business object
     */
    async updateBusinessObject(businessObjectName, objectId, data) {
        try {
            const url = `${this.baseUrl.replace('/orchestration/', '/businessObjects/')}/${businessObjectName}/${objectId}`;
            
            const response = await axios.put(
                url,
                data,
                {
                    headers: this.getHeaders(),
                    auth: this.getAuth(),
                    timeout: this.config.timeout || 30000
                }
            );

            return {
                success: true,
                data: response.data,
                status: response.status
            };

        } catch (error) {
            console.error('Business object update error:', error.message);
            throw this.handleError(error);
        }
    }

    /**
     * Get request headers
     */
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        if (this.apiKey) {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
        }

        return headers;
    }

    /**
     * Get authentication credentials
     */
    getAuth() {
        if (this.username && this.password) {
            return {
                username: this.username,
                password: this.password
            };
        }
        return null;
    }

    /**
     * Handle and format errors
     */
    handleError(error) {
        if (error.response) {
            // Workday API returned an error response
            return new Error(
                `Workday API Error: ${error.response.status} - ${
                    error.response.data?.message || error.response.statusText
                }`
            );
        } else if (error.request) {
            // Request was made but no response received
            return new Error('No response from Workday - check network connectivity and endpoint URL');
        } else {
            // Error in request setup
            return new Error(`Request setup error: ${error.message}`);
        }
    }

    /**
     * Test connection to Workday
     */
    async testConnection() {
        try {
            const testUrl = this.baseUrl.replace('/execute', '/health');
            
            const response = await axios.get(
                testUrl,
                {
                    headers: this.getHeaders(),
                    auth: this.getAuth(),
                    timeout: 5000
                }
            );

            return {
                success: true,
                message: 'Connection to Workday successful',
                status: response.status
            };

        } catch (error) {
            return {
                success: false,
                message: 'Connection to Workday failed',
                error: error.message
            };
        }
    }

    /**
     * Validate orchestration payload
     */
    validatePayload(payload) {
        const errors = [];

        if (!payload.businessObject) {
            errors.push('businessObject is required');
        }

        if (!payload.data) {
            errors.push('data is required');
        }

        if (errors.length > 0) {
            throw new Error(`Payload validation failed: ${errors.join(', ')}`);
        }

        return true;
    }
}

module.exports = WorkdayOrchestration;

// Made with Bob
