/**
 * QR Code Generator
 * Generates QR codes that link to the form
 */

const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

class QRCodeGenerator {
    constructor(config) {
        this.config = config;
        this.baseUrl = config.baseUrl || 'http://localhost:3000';
        this.size = config.size || 300;
        this.errorCorrectionLevel = config.errorCorrectionLevel || 'M';
    }

    /**
     * Generate QR code as PNG file
     */
    async generatePNG(outputPath, customUrl = null) {
        try {
            const url = customUrl || this.baseUrl;
            
            const options = {
                errorCorrectionLevel: this.errorCorrectionLevel,
                type: 'png',
                quality: 0.92,
                margin: 1,
                width: this.size,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            };

            await QRCode.toFile(outputPath, url, options);
            
            console.log(`QR code generated successfully: ${outputPath}`);
            return {
                success: true,
                path: outputPath,
                url: url
            };

        } catch (error) {
            console.error('Error generating QR code:', error);
            throw error;
        }
    }

    /**
     * Generate QR code as SVG file
     */
    async generateSVG(outputPath, customUrl = null) {
        try {
            const url = customUrl || this.baseUrl;
            
            const options = {
                errorCorrectionLevel: this.errorCorrectionLevel,
                type: 'svg',
                margin: 1,
                width: this.size,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            };

            await QRCode.toFile(outputPath, url, options);
            
            console.log(`QR code SVG generated successfully: ${outputPath}`);
            return {
                success: true,
                path: outputPath,
                url: url
            };

        } catch (error) {
            console.error('Error generating QR code SVG:', error);
            throw error;
        }
    }

    /**
     * Generate QR code as data URL (base64)
     */
    async generateDataURL(customUrl = null) {
        try {
            const url = customUrl || this.baseUrl;
            
            const options = {
                errorCorrectionLevel: this.errorCorrectionLevel,
                type: 'image/png',
                quality: 0.92,
                margin: 1,
                width: this.size,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            };

            const dataUrl = await QRCode.toDataURL(url, options);
            
            return {
                success: true,
                dataUrl: dataUrl,
                url: url
            };

        } catch (error) {
            console.error('Error generating QR code data URL:', error);
            throw error;
        }
    }

    /**
     * Generate QR code with custom styling
     */
    async generateCustom(outputPath, customUrl = null, customOptions = {}) {
        try {
            const url = customUrl || this.baseUrl;
            
            const options = {
                errorCorrectionLevel: customOptions.errorCorrectionLevel || this.errorCorrectionLevel,
                type: customOptions.type || 'png',
                quality: customOptions.quality || 0.92,
                margin: customOptions.margin || 1,
                width: customOptions.width || this.size,
                color: {
                    dark: customOptions.darkColor || '#000000',
                    light: customOptions.lightColor || '#FFFFFF'
                }
            };

            await QRCode.toFile(outputPath, url, options);
            
            console.log(`Custom QR code generated successfully: ${outputPath}`);
            return {
                success: true,
                path: outputPath,
                url: url,
                options: options
            };

        } catch (error) {
            console.error('Error generating custom QR code:', error);
            throw error;
        }
    }

    /**
     * Generate multiple QR codes with different URLs
     */
    async generateBatch(urls, outputDir) {
        try {
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            const results = [];

            for (let i = 0; i < urls.length; i++) {
                const url = urls[i];
                const filename = `qr-code-${i + 1}.png`;
                const outputPath = path.join(outputDir, filename);

                const result = await this.generatePNG(outputPath, url);
                results.push(result);
            }

            console.log(`Generated ${results.length} QR codes in ${outputDir}`);
            return {
                success: true,
                count: results.length,
                results: results
            };

        } catch (error) {
            console.error('Error generating batch QR codes:', error);
            throw error;
        }
    }

    /**
     * Generate QR code with logo/image in center
     */
    async generateWithLogo(outputPath, logoPath, customUrl = null) {
        try {
            // First generate the base QR code
            const url = customUrl || this.baseUrl;
            
            const options = {
                errorCorrectionLevel: 'H', // High error correction for logo overlay
                type: 'png',
                quality: 0.92,
                margin: 1,
                width: this.size,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            };

            await QRCode.toFile(outputPath, url, options);
            
            console.log(`QR code with logo placeholder generated: ${outputPath}`);
            console.log('Note: Logo overlay requires additional image processing library');
            
            return {
                success: true,
                path: outputPath,
                url: url,
                note: 'Logo overlay requires manual processing or additional library (e.g., sharp, jimp)'
            };

        } catch (error) {
            console.error('Error generating QR code with logo:', error);
            throw error;
        }
    }

    /**
     * Generate HTML page with embedded QR code
     */
    async generateHTMLPage(outputPath, customUrl = null) {
        try {
            const url = customUrl || this.baseUrl;
            const dataUrl = await this.generateDataURL(url);

            const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Workday Form QR Code</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            text-align: center;
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            color: #333;
        }
        h1 {
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
        }
        img {
            max-width: 100%;
            height: auto;
            border: 5px solid #667eea;
            border-radius: 10px;
            margin: 20px 0;
        }
        .url {
            background: #f5f5f5;
            padding: 10px;
            border-radius: 5px;
            word-break: break-all;
            margin-top: 20px;
            font-family: monospace;
        }
        .instructions {
            margin-top: 20px;
            text-align: left;
            background: #f9f9f9;
            padding: 20px;
            border-radius: 10px;
        }
        .instructions h3 {
            margin-top: 0;
        }
        .instructions ol {
            margin: 10px 0;
            padding-left: 20px;
        }
        .instructions li {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Workday Data Submission Form</h1>
        <p class="subtitle">Scan this QR code to access the form</p>
        
        <img src="${dataUrl.dataUrl}" alt="QR Code">
        
        <div class="url">
            <strong>Direct URL:</strong><br>
            ${url}
        </div>
        
        <div class="instructions">
            <h3>Instructions:</h3>
            <ol>
                <li>Open your phone's camera app</li>
                <li>Point it at the QR code above</li>
                <li>Tap the notification that appears</li>
                <li>Fill out the form with required information</li>
                <li>Submit to send data to Workday</li>
            </ol>
        </div>
    </div>
</body>
</html>`;

            fs.writeFileSync(outputPath, html);
            
            console.log(`QR code HTML page generated: ${outputPath}`);
            return {
                success: true,
                path: outputPath,
                url: url
            };

        } catch (error) {
            console.error('Error generating QR code HTML page:', error);
            throw error;
        }
    }
}

module.exports = QRCodeGenerator;

// Made with Bob
