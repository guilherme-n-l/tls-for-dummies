const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const app = express();

const HTTP_PORT = 6968;
const HTTPS_PORT = 6969;

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - ${req.secure ? 'HTTPS' : 'HTTP'}`);
  next();
});

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TLS</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;900&display=swap" rel="stylesheet">
      <style>
        body {
          margin: 0;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          background: #fff;
          color: #000;
        }
        h1 {
          font-size: 8rem;
          font-weight: 900;
          text-align: center;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
      </style>
    </head>
    <body>
      <h1>${req.secure ? 'SECURE' : 'INSECURE'}</h1>
    </body>
    </html>
  `);
});

app.get('/cert-info', (req, res) => {
  if (!req.secure) {
    return res.json({
      error: 'This route is only available via HTTPS',
      redirect: `https://localhost:${HTTPS_PORT}/cert-info`
    });
  }

  const cert = req.connection.getPeerCertificate();
  
  res.json({
    protocol: 'HTTPS',
    secure: true,
    connection: {
      cipher: req.connection.getCipher(),
      protocol: req.connection.getProtocol ? req.connection.getProtocol() : 'TLS',
      authorized: req.connection.authorized
    },
    certificate: {
      subject: 'localhost',
      issuer: 'TLS for Dummies',
      algorithm: 'SHA-256',
      keySize: '2048 bits',
      selfSigned: true
    },
    timestamp: new Date().toISOString()
  });
});

function checkCertificates() {
  const certPath = path.join(__dirname, 'certs', 'certificate.pem');
  const keyPath = path.join(__dirname, 'certs', 'private-key.pem');
  
  console.log('Verifying certificates...');
  console.log(`Certificate path: ${certPath}`);
  console.log(`Private key path: ${keyPath}`);
  
  if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    console.log('Certificates not found.');
    console.log("Run 'node generate-certs-forge.js' to generate them.");
    return null;
  }
  
  try {
    const cert = fs.readFileSync(certPath, 'utf8');
    const key = fs.readFileSync(keyPath, 'utf8');
    
    if (!cert.includes('-----BEGIN CERTIFICATE-----') || !cert.includes('-----END CERTIFICATE-----')) {
      throw new Error('Invalid certificate format');
    }
    
    if (!key.includes('-----BEGIN') || !key.includes('-----END')) {
      throw new Error('Invalid private key format');
    }
    
    console.log('Certificates validated.');
    console.log(`Certificate length: ${cert.length} characters`);
    console.log(`Private key length: ${key.length} characters`);
    
    return { cert, key };
    
  } catch (error) {
    console.error('Error validating certificates:', error.message);
    return null;
  }
}

function startServers() {
  console.log('Starting servers...\n');
  
  const httpServer = http.createServer(app);
  httpServer.listen(HTTP_PORT, (err) => {
    if (err) {
      console.error(`HTTP server error: ${err.message}`);
    } else {
      console.log(`HTTP server running on: http://localhost:${HTTP_PORT}`);
    }
  });

  const credentials = checkCertificates();
  
  if (credentials) {
    try {
      const httpsServer = https.createServer(credentials, app);
      
      httpsServer.on('error', (err) => {
        console.error(`HTTPS server error: ${err.message}`);
        if (err.code === 'ERR_SSL_SERVER_CERT_BAD_FORMAT') {
          console.log('Regenerating certificates...');
          console.log('Run: node generate-certs-forge.js');
        }
      });
      
      httpsServer.listen(HTTPS_PORT, (err) => {
        if (err) {
          console.error(`HTTPS server error: ${err.message}`);
        } else {
          console.log(`HTTPS server running on: https://localhost:${HTTPS_PORT}`);
          console.log('\nInstructions:');
          console.log('1. Open https://localhost:6969 in your browser');
          console.log('2. The browser will warn about a self-signed certificate');
          console.log('3. Click "Advanced" and then "Proceed to localhost"');
          console.log('4. Compare with http://localhost:6968');
          console.log('\nObjective: Understand TLS/SSL in practice.');
        }
      });
      
    } catch (error) {
      console.error('Error creating HTTPS server:', error.message);
      console.log('Try regenerating the certificates: node generate-certs-forge.js');
    }
  } else {
    console.log('HTTPS server not started due to certificate issues.');
  }
}

const certsExist = fs.existsSync(path.join(__dirname, 'certs', 'certificate.pem')) && 
                  fs.existsSync(path.join(__dirname, 'certs', 'private-key.pem'));

if (!certsExist) {
  console.log('Certificates not found.');
  console.log("Please run 'node generate-certs-forge.js' first.\n");
}

startServers(); 