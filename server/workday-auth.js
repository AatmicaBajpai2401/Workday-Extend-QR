/**
 * Workday Authentication Helper
 * Handles OAuth token generation for Workday Extend
 */

const axios = require('axios');

class WorkdayAuth {
    constructor(config) {
        this.config = config;
        this.token = null;
        this.tokenExpiry = null;
    }

    /**
     * Get OAuth token for Workday Extend
     * You need to obtain this from Workday Studio or your Workday admin
     */
    async getAccessToken() {
        // Check if we have a valid cached token
        if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.token;
        }

        // If apiKey is provided, use it directly as bearer token
        if (this.config.apiKey) {
            console.log('Using provided API key as bearer token');
            this.token = this.config.apiKey;
            this.tokenExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
            return this.token;
        }

        // For Workday Extend, you typically need to:
        // 1. Register an API client in Workday
        // 2. Get client_id and client_secret
        // 3. Use OAuth 2.0 client credentials flow

        if (this.config.clientId && this.config.clientSecret) {
            return await this.getOAuthToken();
        }

        throw new Error('No valid authentication method configured. Please provide either apiKey or clientId/clientSecret');
    }

    /**
     * Get OAuth token using client credentials
     */
    async getOAuthToken() {
        try {
            const tokenUrl = this.config.tokenUrl || 
                `https://${this.config.tenant}.workday.com/ccx/oauth2/${this.config.tenant}/token`;

            const params = new URLSearchParams();
            params.append('grant_type', 'client_credentials');

            const response = await axios.post(
                tokenUrl,
                params,
                {
                    auth: {
                        username: this.config.clientId,
                        password: this.config.clientSecret
                    },
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            this.token = response.data.access_token;
            // Set expiry to 90% of actual expiry to refresh before it expires
            this.tokenExpiry = Date.now() + (response.data.expires_in * 900);

            console.log('OAuth token obtained successfully');
            return this.token;

        } catch (error) {
            console.error('Error obtaining OAuth token:', error.message);
            if (error.response) {
                console.error('Token error response:', error.response.data);
            }
            throw new Error('Failed to obtain OAuth token');
        }
    }

    /**
     * Clear cached token (force refresh on next request)
     */
    clearToken() {
        this.token = null;
        this.tokenExpiry = null;
    }
}

module.exports = WorkdayAuth;

// Made with Bob
