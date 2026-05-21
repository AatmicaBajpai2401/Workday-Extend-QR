# Setup Guide - Workday QR Code Integration

This guide will walk you through setting up the Workday QR Code Integration system step by step.

## 📋 Prerequisites Checklist

Before you begin, ensure you have:

- [ ] Node.js 14.0 or higher installed
- [ ] npm or yarn package manager
- [ ] Workday tenant access
- [ ] Workday API credentials (API key or username/password)
- [ ] Workday orchestration endpoint URL
- [ ] Text editor or IDE (VS Code recommended)

## 🔧 Step-by-Step Setup

### Step 1: Install Node.js

If you don't have Node.js installed:

1. Visit https://nodejs.org/
2. Download the LTS version
3. Run the installer
4. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### Step 2: Navigate to Project Directory

```bash
cd workday-qr-integration
```

### Step 3: Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web server framework
- `cors` - Cross-origin resource sharing
- `axios` - HTTP client for Workday API calls
- `qrcode` - QR code generation library

### Step 4: Configure Workday Connection

1. **Copy the template configuration:**
   ```bash
   # Windows
   copy config\workday-config.template.json config\workday-config.json
   
   # Mac/Linux
   cp config/workday-config.template.json config/workday-config.json
   ```

2. **Edit `config/workday-config.json`** with your Workday details:

   ```json
   {
     "workday": {
       "orchestrationUrl": "https://YOUR-TENANT.workday.com/ccx/api/orchestration/v1/execute",
       "businessObjectName": "Employee_Data",
       "apiKey": "your-actual-api-key",
       "tenant": "YOUR-TENANT"
     }
   }
   ```

3. **Find your Workday details:**
   - **Tenant Name**: Your Workday URL (e.g., `acme` from `acme.workday.com`)
   - **Orchestration URL**: Contact your Workday admin or check API documentation
   - **API Key**: Generate in Workday under Integrations > API Clients
   - **Business Object Name**: The name of your target business object in Workday

### Step 5: Test the Server

Start the server to verify everything is working:

```bash
npm start
```

You should see:
```
============================================================
MCP Workday Integration Server
============================================================
Server running on port 3000
Form URL: http://localhost:3000
Health check: http://localhost:3000/api/health
Workday configured: true
============================================================
```

### Step 6: Test the Form

1. Open your browser
2. Navigate to `http://localhost:3000`
3. You should see the form interface
4. Try filling out and submitting the form

### Step 7: Generate QR Codes

```bash
npm run generate-qr
```

This creates QR codes in the `qr-codes/` directory:
- `workday-form-qr.png` - Standard PNG QR code
- `workday-form-qr.svg` - Scalable SVG QR code
- `workday-form-qr-custom.png` - Styled QR code
- `qr-code-page.html` - HTML page with embedded QR code

### Step 8: Test QR Code

1. Open `qr-codes/qr-code-page.html` in your browser
2. Scan the QR code with your phone
3. Verify it opens the form on your phone

## 🔐 Workday Configuration Details

### Option A: API Key Authentication (Recommended)

1. Log into Workday as an administrator
2. Navigate to: **Workday > Integrations > API Clients**
3. Create a new API Client
4. Generate an API key
5. Copy the key to your config:
   ```json
   {
     "workday": {
       "apiKey": "your-generated-api-key"
     }
   }
   ```

### Option B: Username/Password Authentication

If using basic authentication:

```json
{
  "workday": {
    "username": "integration_user@tenant",
    "password": "your-password"
  }
}
```

### Setting Up Workday Orchestration

1. **Create an Orchestration in Workday:**
   - Go to **Workday > Integrations > Create Integration**
   - Choose **Orchestration**
   - Name it: `Post_Employee_Data`

2. **Configure the Orchestration:**
   - Add steps to process incoming data
   - Map fields to your business object
   - Set up error handling

3. **Get the Orchestration URL:**
   - After creating, note the endpoint URL
   - Format: `https://tenant.workday.com/ccx/api/orchestration/v1/execute`

4. **Configure Permissions:**
   - Ensure your API user has permissions to:
     - Execute orchestrations
     - Write to the target business object
     - Read business object data (for verification)

## 🌐 Production Deployment

### Update Configuration for Production

1. **Update the base URL** in `config/workday-config.json`:
   ```json
   {
     "qrCode": {
       "baseUrl": "https://your-domain.com"
     }
   }
   ```

2. **Regenerate QR codes** with production URL:
   ```bash
   npm run generate-qr
   ```

### Deploy to Server

1. **Copy files to your server:**
   ```bash
   scp -r workday-qr-integration user@server:/path/to/deploy
   ```

2. **Install dependencies on server:**
   ```bash
   ssh user@server
   cd /path/to/deploy/workday-qr-integration
   npm install --production
   ```

3. **Set up process manager (PM2):**
   ```bash
   npm install -g pm2
   pm2 start server/mcp-server.js --name workday-integration
   pm2 save
   pm2 startup
   ```

4. **Configure reverse proxy (nginx):**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Enable SSL with Let's Encrypt:**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

## 🧪 Testing Checklist

After setup, verify:

- [ ] Server starts without errors
- [ ] Form loads in browser at `http://localhost:3000`
- [ ] Health check returns success: `http://localhost:3000/api/health`
- [ ] QR codes generated successfully
- [ ] QR code scans and opens form on mobile
- [ ] Form submission works (check server logs)
- [ ] Data appears in Workday (verify in Workday UI)
- [ ] Logs are being created in `logs/` directory

## 🐛 Common Issues and Solutions

### Issue: "Cannot find module 'express'"
**Solution:** Run `npm install` in the project directory

### Issue: "Port 3000 already in use"
**Solution:** 
- Change port in `config/workday-config.json`
- Or stop the process using port 3000:
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  
  # Mac/Linux
  lsof -ti:3000 | xargs kill -9
  ```

### Issue: "Workday API error: 401 Unauthorized"
**Solution:**
- Verify API key is correct
- Check username/password if using basic auth
- Ensure API user has proper permissions in Workday

### Issue: "No response from Workday"
**Solution:**
- Verify orchestration URL is correct
- Check network connectivity
- Ensure firewall allows outbound HTTPS
- Verify Workday endpoint is accessible

### Issue: QR code doesn't scan
**Solution:**
- Ensure QR code image is clear and not pixelated
- Try increasing size in config
- Use higher error correction level (H)
- Ensure adequate lighting when scanning

## 📞 Getting Help

If you encounter issues:

1. **Check the logs:**
   ```bash
   # View server output
   npm start
   
   # View submission logs
   cat logs/submissions-YYYY-MM-DD.log
   ```

2. **Test Workday connection:**
   - Use the health check endpoint
   - Verify credentials in Workday
   - Check API permissions

3. **Verify configuration:**
   - Review `config/workday-config.json`
   - Ensure all required fields are filled
   - Check for typos in URLs

4. **Test components individually:**
   - Test form without Workday (check browser console)
   - Test Workday API with curl/Postman
   - Test QR code generation separately

## 🎓 Next Steps

After successful setup:

1. **Customize the form** - Edit `public/index.html` to add/modify fields
2. **Adjust styling** - Modify CSS in the HTML file
3. **Configure business object mapping** - Edit `transformToWorkdayFormat` in `server/mcp-server.js`
4. **Set up monitoring** - Implement log monitoring and alerts
5. **Add security** - Enable rate limiting, HTTPS, and authentication

## 📚 Additional Resources

- [Workday API Documentation](https://community.workday.com/api)
- [Express.js Documentation](https://expressjs.com/)
- [QR Code Best Practices](https://www.qr-code-generator.com/qr-code-marketing/qr-codes-basics/)

---

**Setup Complete!** 🎉

Your Workday QR Code Integration system is now ready to use.