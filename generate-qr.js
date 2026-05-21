/**
 * QR Code Generation Script
 * Run this script to generate QR codes for the form
 */

const QRCodeGenerator = require('./server/qr-generator');
const fs = require('fs');
const path = require('path');

// Load configuration
const configPath = path.join(__dirname, 'config/workday-config.json');
let config = {};

try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (error) {
    console.error('Error loading config file:', error.message);
    console.log('Using default configuration');
    config = {
        qrCode: {
            baseUrl: 'http://localhost:3000',
            size: 300,
            errorCorrectionLevel: 'M'
        }
    };
}

// Create QR code generator instance
const qrGenerator = new QRCodeGenerator(config.qrCode);

// Create output directory
const outputDir = path.join(__dirname, 'qr-codes');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function generateAllQRCodes() {
    console.log('='.repeat(60));
    console.log('QR Code Generator for Workday Integration');
    console.log('='.repeat(60));
    console.log(`Form URL: ${config.qrCode.baseUrl}`);
    console.log(`Output Directory: ${outputDir}`);
    console.log('='.repeat(60));

    try {
        // Generate PNG QR code
        console.log('\n1. Generating PNG QR code...');
        await qrGenerator.generatePNG(
            path.join(outputDir, 'workday-form-qr.png')
        );

        // Generate SVG QR code
        console.log('\n2. Generating SVG QR code...');
        await qrGenerator.generateSVG(
            path.join(outputDir, 'workday-form-qr.svg')
        );

        // Generate HTML page with QR code
        console.log('\n3. Generating HTML page with QR code...');
        await qrGenerator.generateHTMLPage(
            path.join(outputDir, 'qr-code-page.html')
        );

        // Generate custom styled QR code
        console.log('\n4. Generating custom styled QR code...');
        await qrGenerator.generateCustom(
            path.join(outputDir, 'workday-form-qr-custom.png'),
            null,
            {
                width: 400,
                darkColor: '#667eea',
                lightColor: '#ffffff',
                errorCorrectionLevel: 'H'
            }
        );

        console.log('\n' + '='.repeat(60));
        console.log('✓ All QR codes generated successfully!');
        console.log('='.repeat(60));
        console.log('\nGenerated files:');
        console.log(`  - ${path.join(outputDir, 'workday-form-qr.png')}`);
        console.log(`  - ${path.join(outputDir, 'workday-form-qr.svg')}`);
        console.log(`  - ${path.join(outputDir, 'workday-form-qr-custom.png')}`);
        console.log(`  - ${path.join(outputDir, 'qr-code-page.html')}`);
        console.log('\nYou can now:');
        console.log('  1. Print the QR codes');
        console.log('  2. Share the HTML page');
        console.log('  3. Embed QR codes in your materials');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n✗ Error generating QR codes:', error.message);
        process.exit(1);
    }
}

// Run the generator
generateAllQRCodes();

// Made with Bob
