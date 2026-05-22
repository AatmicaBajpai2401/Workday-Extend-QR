/**
 * MCP Server for Workday Integration
 * This server receives form data and triggers Workday orchestration
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const WorkdayAuth = require('./workday-auth');

// Load configuration
const configPath = path.join(__dirname, '../config/workday-config.json');
let config = {};

try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (error) {
    console.error('Error loading config file:', error.message);
    console.log('Using default configuration');
}

// Initialize Workday authentication
const workdayAuth = new WorkdayAuth(config.workday || {});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        server: 'MCP Workday Integration Server'
    });
});

/**
 * Main form submission endpoint
 * Receives form data and triggers Workday orchestration
 */
app.post('/api/submit', async (req, res) => {
    try {
        const formData = req.body;
        
        // Validate required fields
        const requiredFields = ['employeeId', 'firstName', 'lastName', 'email', 'department', 'position', 'startDate'];
        const missingFields = requiredFields.filter(field => !formData[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                error: 'Missing required fields',
                missingFields: missingFields
            });
        }

        console.log('Received form submission:', {
            employeeId: formData.employeeId,
            name: `${formData.firstName} ${formData.lastName}`,
            department: formData.department
        });

        // Transform data for Workday
        const workdayPayload = transformToWorkdayFormat(formData);

        // Trigger Workday orchestration
        const workdayResponse = await triggerWorkdayOrchestration(workdayPayload);

        // Log successful submission
        logSubmission(formData, workdayResponse);

        res.json({
            success: true,
            message: 'Data submitted successfully to Workday',
            submissionId: workdayResponse.submissionId || generateSubmissionId(),
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error processing submission:', error);
        res.status(500).json({
            error: 'Failed to process submission',
            message: error.message
        });
    }
});

/**
 * Transform form data to Workday Extend orchestration format
 */
function transformToWorkdayFormat(formData) {
    // Format for Workday Extend orchestration
    return {
        employeeId: formData.employeeId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        department: formData.department,
        position: formData.position,
        startDate: formData.startDate,
        notes: formData.notes || '',
        submissionTimestamp: formData.timestamp,
        source: 'QR_Code_Form'
    };
}

/**
 * Trigger Workday Extend orchestration
 * This function calls the Workday Extend orchestration endpoint
 */
async function triggerWorkdayOrchestration(payload) {
    const workdayConfig = config.workday || {};
    
    // If Workday is not configured, simulate the call
    if (!workdayConfig.orchestrationUrl) {
        console.log('Workday not configured - simulating orchestration call');
        console.log('Payload:', JSON.stringify(payload, null, 2));
        
        return {
            success: true,
            submissionId: generateSubmissionId(),
            message: 'Simulated submission (configure Workday endpoint in config)',
            timestamp: new Date().toISOString()
        };
    }

    try {
        // Get authentication token
        let token = null;
        try {
            token = await workdayAuth.getAccessToken();
            console.log('Authentication token obtained');
        } catch (authError) {
            console.error('Authentication error:', authError.message);
            throw new Error('Failed to authenticate with Workday. Please check your credentials.');
        }

        // Prepare headers for Workday Extend IFW orchestration
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        console.log('Calling Workday orchestration:', workdayConfig.orchestrationUrl);
        console.log('Payload:', JSON.stringify(payload, null, 2));

        // Convert payload to URL-encoded format for IFW orchestration
        const urlEncodedPayload = new URLSearchParams();
        Object.keys(payload).forEach(key => {
            urlEncodedPayload.append(key, payload[key]);
        });

        console.log('URL-encoded payload:', urlEncodedPayload.toString());

        // Call Workday Extend orchestration endpoint
        const response = await axios.post(
            workdayConfig.orchestrationUrl,
            urlEncodedPayload,
            {
                headers: headers,
                timeout: workdayConfig.timeout || 30000,
                validateStatus: function (status) {
                    return status >= 200 && status < 500; // Don't throw on 4xx errors
                }
            }
        );

        console.log('Workday orchestration response status:', response.status);
        console.log('Workday orchestration response:', JSON.stringify(response.data, null, 2));
        
        if (response.status >= 200 && response.status < 300) {
            return {
                success: true,
                submissionId: response.data.id || response.data.instanceId || generateSubmissionId(),
                workdayResponse: response.data,
                timestamp: new Date().toISOString()
            };
        } else if (response.status === 401) {
            // Clear token and retry once
            workdayAuth.clearToken();
            throw new Error('Authentication failed. Please verify your Workday credentials and API token.');
        } else {
            throw new Error(`Workday API error: ${response.status} - ${JSON.stringify(response.data)}`);
        }

    } catch (error) {
        console.error('Workday orchestration error:', error.message);
        
        if (error.response) {
            console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
            throw new Error(`Workday API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
            throw new Error('No response from Workday - check network connectivity and endpoint URL');
        } else {
            throw new Error(`Request setup error: ${error.message}`);
        }
    }
}

/**
 * Log submission to file for audit trail
 */
function logSubmission(formData, workdayResponse) {
    const logDir = path.join(__dirname, '../logs');
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    const logEntry = {
        timestamp: new Date().toISOString(),
        formData: formData,
        workdayResponse: workdayResponse
    };

    const logFile = path.join(logDir, `submissions-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
}

/**
 * Generate unique submission ID
 */
function generateSubmissionId() {
    return `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

/**
 * Get submission logs (for admin purposes)
 */
app.get('/api/logs', (req, res) => {
    const logDir = path.join(__dirname, '../logs');
    
    if (!fs.existsSync(logDir)) {
        return res.json({ logs: [] });
    }

    const logFiles = fs.readdirSync(logDir);
    const logs = [];

    logFiles.forEach(file => {
        const content = fs.readFileSync(path.join(logDir, file), 'utf8');
        const entries = content.split('\n').filter(line => line.trim());
        entries.forEach(entry => {
            try {
                logs.push(JSON.parse(entry));
            } catch (e) {
                // Skip invalid entries
            }
        });
    });

    res.json({ logs: logs.slice(-50) }); // Return last 50 entries
});

// Start server
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('MCP Workday Integration Server');
    console.log('='.repeat(60));
    console.log(`Server running on port ${PORT}`);
    console.log(`Form URL: http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Workday configured: ${!!config.workday?.orchestrationUrl}`);
    console.log('='.repeat(60));
});

module.exports = app;

// Made with Bob
