# Workday QR Code Integration

A complete solution for collecting data via QR code-accessible forms and submitting it to Workday business objects through orchestration.

## 🎯 Overview

This system allows users to:
1. Scan a QR code with their mobile device
2. Fill out a web form with employee/business data
3. Submit data that automatically posts to Workday via orchestration

## 📋 Features

- **Mobile-Friendly Form**: Responsive HTML form accessible via QR code
- **MCP Server**: Express.js server handling form submissions
- **Workday Integration**: Direct integration with Workday orchestration API
- **QR Code Generation**: Automated QR code generation in multiple formats
- **Audit Logging**: All submissions logged for compliance
- **Error Handling**: Comprehensive error handling and validation

## 🏗️ Architecture

```
User Device (QR Scan)
    ↓
HTML Form (public/index.html)
    ↓
MCP Server (server/mcp-server.js)
    ↓
Workday Orchestration (server/workday-orchestration.js)
    ↓
Workday Business Object
```

## 📁 Project Structure

```
workday-qr-integration/
├── public/
│   └── index.html              # Form interface
├── server/
│   ├── mcp-server.js           # Main server
│   ├── workday-orchestration.js # Workday API integration
│   └── qr-generator.js         # QR code generation
├── config/
│   └── workday-config.json     # Configuration file
├── qr-codes/                   # Generated QR codes (created on first run)
├── logs/                       # Submission logs (created on first run)
├── generate-qr.js              # QR code generation script
├── package.json                # Dependencies
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 14.0 or higher
- npm or yarn
- Workday tenant with API access
- Workday orchestration endpoint configured

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd workday-qr-integration
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Workday settings:**
   
   Edit `config/workday-config.json`:
   ```json
   {
     "workday": {
       "orchestrationUrl": "https://your-tenant.workday.com/ccx/api/orchestration/v1/execute",
       "businessObjectName": "Employee_Data",
       "apiKey": "YOUR_API_KEY_HERE",
       "username": "integration_user@tenant",
       "password": "YOUR_PASSWORD_HERE",
       "tenant": "your-tenant"
     }
   }
   ```

4. **Generate QR codes:**
   ```bash
   npm run generate-qr
   ```

5. **Start the server:**
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

6. **Access the form:**
   - Open browser: `http://localhost:3000`
   - Or scan the generated QR code

## ⚙️ Configuration

### Workday Configuration

The `config/workday-config.json` file contains all configuration:

```json
{
  "workday": {
    "orchestrationUrl": "https://your-tenant.workday.com/ccx/api/orchestration/v1/execute",
    "businessObjectName": "Employee_Data",
    "apiKey": "YOUR_API_KEY_HERE",
    "username": "integration_user@tenant",
    "password": "YOUR_PASSWORD_HERE",
    "timeout": 30000,
    "tenant": "your-tenant"
  },
  "server": {
    "port": 3000,
    "host": "localhost"
  },
  "qrCode": {
    "baseUrl": "http://localhost:3000",
    "size": 300,
    "errorCorrectionLevel": "M"
  }
}
```

### Authentication Options

Choose one of the following authentication methods:

1. **API Key (Recommended)**:
   ```json
   "apiKey": "your-api-key"
   ```

2. **Username/Password**:
   ```json
   "username": "integration_user@tenant",
   "password": "your-password"
   ```

## 📱 Using the System

### For End Users

1. **Scan the QR code** with your mobile device camera
2. **Fill out the form** with required information:
   - Employee ID
   - First Name
   - Last Name
   - Email
   - Department
   - Position
   - Start Date
   - Additional Notes (optional)
3. **Submit** the form
4. **Confirmation** message appears on success

### For Administrators

1. **Monitor submissions** via logs in `logs/` directory
2. **View submission history**:
   ```bash
   curl http://localhost:3000/api/logs
   ```
3. **Check server health**:
   ```bash
   curl http://localhost:3000/api/health
   ```

## 🔧 API Endpoints

### POST /api/submit
Submit form data to Workday

**Request Body:**
```json
{
  "employeeId": "EMP001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "department": "IT",
  "position": "Software Engineer",
  "startDate": "2026-06-01",
  "notes": "Additional information"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data submitted successfully to Workday",
  "submissionId": "SUB-1234567890-ABC123",
  "timestamp": "2026-05-21T17:00:00.000Z"
}
```

### GET /api/health
Check server health status

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-05-21T17:00:00.000Z",
  "server": "MCP Workday Integration Server"
}
```

### GET /api/logs
Retrieve submission logs (last 50 entries)

**Response:**
```json
{
  "logs": [
    {
      "timestamp": "2026-05-21T17:00:00.000Z",
      "formData": {...},
      "workdayResponse": {...}
    }
  ]
}
```

## 🎨 Customization

### Form Fields

Edit `public/index.html` to add/modify form fields:

```html
<div class="form-group">
    <label for="customField">Custom Field <span class="required">*</span></label>
    <input type="text" id="customField" name="customField" required>
</div>
```

### QR Code Styling

Modify QR code appearance in `generate-qr.js`:

```javascript
await qrGenerator.generateCustom(
    path.join(outputDir, 'custom-qr.png'),
    null,
    {
        width: 400,
        darkColor: '#667eea',  // Change colors
        lightColor: '#ffffff',
        errorCorrectionLevel: 'H'
    }
);
```

### Workday Business Object Mapping

Edit the `transformToWorkdayFormat` function in `server/mcp-server.js` to match your Workday business object structure.

## 🔒 Security Considerations

1. **HTTPS**: Use HTTPS in production (configure reverse proxy like nginx)
2. **Authentication**: Secure Workday credentials in environment variables
3. **CORS**: Configure allowed origins in production
4. **Rate Limiting**: Enable rate limiting in config for production
5. **Input Validation**: Form includes client and server-side validation

### Environment Variables (Production)

```bash
export WORKDAY_API_KEY="your-api-key"
export WORKDAY_USERNAME="integration_user@tenant"
export WORKDAY_PASSWORD="your-password"
export PORT=3000
```

Update `server/mcp-server.js` to use environment variables:
```javascript
const config = {
    workday: {
        apiKey: process.env.WORKDAY_API_KEY,
        username: process.env.WORKDAY_USERNAME,
        password: process.env.WORKDAY_PASSWORD
    }
};
```

## 🐛 Troubleshooting

### Server won't start
- Check if port 3000 is available
- Verify Node.js version (14.0+)
- Run `npm install` to ensure dependencies are installed

### QR codes not generating
- Install qrcode package: `npm install qrcode`
- Check write permissions in project directory

### Workday connection fails
- Verify orchestration URL is correct
- Check API credentials
- Ensure network connectivity to Workday
- Review Workday API permissions

### Form submission fails
- Check browser console for errors
- Verify server is running
- Check network tab in browser dev tools
- Review server logs

## 📊 Monitoring & Logs

Logs are stored in `logs/` directory with daily rotation:
- Format: `submissions-YYYY-MM-DD.log`
- Each entry is a JSON object with timestamp, form data, and Workday response

View logs:
```bash
# View today's logs
cat logs/submissions-2026-05-21.log

# Monitor in real-time
tail -f logs/submissions-2026-05-21.log
```

## 🚀 Deployment

### Production Deployment

1. **Set up environment variables**
2. **Use process manager** (PM2 recommended):
   ```bash
   npm install -g pm2
   pm2 start server/mcp-server.js --name workday-integration
   pm2 save
   pm2 startup
   ```

3. **Configure reverse proxy** (nginx example):
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

4. **Enable SSL** with Let's Encrypt:
   ```bash
   certbot --nginx -d your-domain.com
   ```

5. **Update QR code URL** in config to production domain

## 📝 License

MIT License - feel free to use and modify for your needs.

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review server logs
3. Verify Workday configuration
4. Check network connectivity

## 🔄 Updates & Maintenance

- Regularly update dependencies: `npm update`
- Monitor logs for errors
- Backup configuration files
- Test Workday connectivity periodically

---

**Version:** 1.0.0  
**Last Updated:** May 2026