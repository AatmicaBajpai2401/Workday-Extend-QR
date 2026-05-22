/**
 * Test Workday Connection Script
 * Use this to test your Workday credentials and endpoint
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load configuration
const configPath = path.join(__dirname, 'config/workday-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const workdayConfig = config.workday;

console.log('='.repeat(70));
console.log('Workday Connection Test');
console.log('='.repeat(70));
console.log('\nConfiguration:');
console.log('- Endpoint:', workdayConfig.orchestrationUrl);
console.log('- Tenant:', workdayConfig.tenant);
console.log('- API Key provided:', workdayConfig.apiKey ? 'Yes (length: ' + workdayConfig.apiKey.length + ')' : 'No');
console.log('='.repeat(70));

// Test payload
const testPayload = {
    employeeId: "TEST001",
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    department: "IT",
    position: "Developer",
    startDate: "2026-05-22",
    notes: "Connection test",
    submissionTimestamp: new Date().toISOString(),
    source: "Connection_Test"
};

async function testConnection() {
    console.log('\n📤 Sending test request...\n');
    console.log('Payload:', JSON.stringify(testPayload, null, 2));
    console.log('\n' + '='.repeat(70));

    try {
        console.log('\n🧪 Testing with JSON payload and Workday-specific headers...\n');

        const response = await axios.post(
            workdayConfig.orchestrationUrl,
            testPayload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${workdayConfig.apiKey}`,
                    'X-Workday-Client': 'QR-Integration-Client'
                },
                timeout: 30000,
                validateStatus: function (status) {
                    return status >= 200 && status < 600; // Accept all status codes
                }
            }
        );

        console.log('\n✅ Response received!');
        console.log('Status:', response.status, response.statusText);
        console.log('\nResponse Headers:');
        console.log(JSON.stringify(response.headers, null, 2));
        console.log('\nResponse Body:');
        console.log(JSON.stringify(response.data, null, 2));

        if (response.status >= 200 && response.status < 300) {
            console.log('\n' + '='.repeat(70));
            console.log('🎉 SUCCESS! Connection is working!');
            console.log('='.repeat(70));
        } else if (response.status === 401) {
            console.log('\n' + '='.repeat(70));
            console.log('❌ AUTHENTICATION FAILED (401)');
            console.log('='.repeat(70));
            console.log('\nPossible issues:');
            console.log('1. Bearer token is invalid or expired');
            console.log('2. Token doesn\'t have permission for this orchestration');
            console.log('3. Token format is incorrect');
            console.log('\nNext steps:');
            console.log('- Verify token in Workday Studio');
            console.log('- Check token permissions');
            console.log('- Try generating a new token');
            console.log('- Contact your Workday administrator');
        } else {
            console.log('\n' + '='.repeat(70));
            console.log('⚠️  Unexpected response status:', response.status);
            console.log('='.repeat(70));
        }

    } catch (error) {
        console.log('\n❌ ERROR occurred!');
        console.log('='.repeat(70));
        
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Response:', JSON.stringify(error.response.data, null, 2));
            console.log('Headers:', JSON.stringify(error.response.headers, null, 2));
        } else if (error.request) {
            console.log('No response received from server');
            console.log('Error:', error.message);
            console.log('\nPossible issues:');
            console.log('- Network connectivity problem');
            console.log('- Firewall blocking the request');
            console.log('- Incorrect endpoint URL');
        } else {
            console.log('Error:', error.message);
        }
    }

    console.log('\n' + '='.repeat(70));
}

// Run the test
testConnection();

// Made with Bob
