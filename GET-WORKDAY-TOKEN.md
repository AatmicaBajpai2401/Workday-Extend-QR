# How to Get Workday Extend API Token

Your Workday Extend orchestration requires a Bearer token for authentication. Here's how to obtain it:

## Method 1: From Workday Studio (Recommended)

1. **Open Workday Studio**
   - Log into your Workday tenant
   - Navigate to Workday Studio

2. **Go to your Extend application**
   - Find your app: `test_extend_mcp_run_mybkqw`
   - Open the orchestration: `TEST_Extend_Run`

3. **Get the API Token**
   - Look for "API Credentials" or "Authentication" section
   - Copy the Bearer token or API key
   - This token is usually long-lived

4. **Add to config**
   - Open `config/workday-config.json`
   - Add the token:
   ```json
   {
     "workday": {
       "apiKey": "YOUR_BEARER_TOKEN_HERE",
       "orchestrationUrl": "https://api.us.wcp.workday.com/orchestrate/v1/apps/test_extend_mcp_run_mybkqw/orchestrations/TEST_Extend_Run/launch"
     }
   }
   ```

## Method 2: OAuth Client Credentials (Advanced)

If you need to use OAuth:

1. **Register API Client in Workday**
   - Go to Workday > Integrations > API Clients
   - Create new API Client
   - Note the `client_id` and `client_secret`

2. **Update config with OAuth credentials**
   ```json
   {
     "workday": {
       "clientId": "your_client_id",
       "clientSecret": "your_client_secret",
       "tenant": "wcpdev.wd101",
       "tokenUrl": "https://wcpdev.wd101.workday.com/ccx/oauth2/wcpdev.wd101/token",
       "orchestrationUrl": "https://api.us.wcp.workday.com/orchestrate/v1/apps/test_extend_mcp_run_mybkqw/orchestrations/TEST_Extend_Run/launch"
     }
   }
   ```

## Method 3: Test with Postman First

1. **Open Postman**
2. **Create new request:**
   - Method: POST
   - URL: `https://api.us.wcp.workday.com/orchestrate/v1/apps/test_extend_mcp_run_mybkqw/orchestrations/TEST_Extend_Run/launch`

3. **Set Authorization:**
   - Type: Bearer Token
   - Token: (paste your token)

4. **Set Body:**
   ```json
   {
     "employeeId": "12345",
     "firstName": "Test",
     "lastName": "User",
     "email": "test@example.com",
     "department": "IT",
     "position": "Developer",
     "startDate": "2026-05-22"
   }
   ```

5. **Send request**
   - If successful (200 OK), copy the token to your config
   - If 401, the token is invalid or expired

## Method 4: Contact Workday Admin

If you don't have access to generate tokens:

1. Contact your Workday administrator
2. Request an API token for the orchestration:
   - App: `test_extend_mcp_run_mybkqw`
   - Orchestration: `TEST_Extend_Run`
3. They can generate a token from Workday Studio

## Troubleshooting

### Still getting 401 Unauthorized?

1. **Check token expiry**
   - Some tokens expire after a certain time
   - Generate a new token if expired

2. **Verify permissions**
   - Ensure the token has permission to execute the orchestration
   - Check in Workday Studio > Security

3. **Check endpoint URL**
   - Verify the orchestration URL is correct
   - Ensure it ends with `/launch`

4. **Test in browser/Postman first**
   - Confirm the token works outside of the application
   - This isolates whether it's a token issue or code issue

## Current Configuration

Your current config has:
- Username/Password: These don't work for Extend orchestrations
- You need: Bearer token (apiKey)

**Next Step:** Get the Bearer token and add it to `config/workday-config.json` as `apiKey`.

---

Once you have the token, restart the server:
```bash
npm start
```

Then test the form again at http://localhost:3000