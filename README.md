# TLS Local Demo

## Overview
Local TLS/SSL demonstration with self-signed certificates. Creates both HTTP (insecure) and HTTPS (secure) servers to show the difference in practice.

## Quick Start
```bash
npm install
npm run generate-certs  # Generate self-signed certificates
npm start                # Start HTTP (6968) and HTTPS (6969) servers
```

## Access
- **HTTP**: http://localhost:6968 (insecure)
- **HTTPS**: https://localhost:6969 (secure, requires accepting self-signed cert warning)

## Technical Implementation

### Certificate Generation
- Uses `node-forge` for cross-platform compatibility
- Generates 2048-bit RSA key pair
- Self-signed certificate with 10-year validity
- Includes Subject Alternative Names for localhost, 127.0.0.1, and ::1

### Server Architecture  
- Express.js dual-server setup
- HTTP server on port 6968
- HTTPS server on port 6969 with TLS certificate validation
- Simple HTML response displaying "ESTABLISHING TLS"

### File Structure
```
├── server-fixed.js           # Main server (HTTP/HTTPS)
├── generate-certs-forge.js   # Certificate generator
├── certs/
│   ├── certificate.pem       # Public certificate
│   └── private-key.pem       # Private key
└── package.json
```

## Key Learning
Demonstrates the practical difference between encrypted (HTTPS) and unencrypted (HTTP) connections using locally generated certificates. 