const forge = require('node-forge');
const fs = require('fs');
const path = require('path');


const certsDir = path.join(__dirname, 'certs');
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

const certPath = path.join(certsDir, 'certificate.pem');
const keyPath = path.join(certsDir, 'private-key.pem');

if (fs.existsSync(certPath)) fs.unlinkSync(certPath);
if (fs.existsSync(keyPath)) fs.unlinkSync(keyPath);

try {  
  const keys = forge.pki.rsa.generateKeyPair(2048);
    
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);
  
  const attrs = [
    { name: 'commonName', value: 'localhost' },
    { name: 'countryName', value: 'CHN' },
    { name: 'stateOrProvinceName', value: 'Shenzhen' },
    { name: 'localityName', value: 'Shenzhen' },
    { name: 'organizationName', value: 'Stablishing TLS' },
    { name: 'organizationalUnitName', value: 'Silk Road' }
  ];
  
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  
  cert.setExtensions([
    {
      name: 'basicConstraints',
      cA: true
    },
    {
      name: 'keyUsage',
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true
    },
    {
      name: 'extKeyUsage',
      serverAuth: true,
      clientAuth: true
    },
    {
      name: 'subjectAltName',
      altNames: [
        { type: 2, value: 'localhost' },
        { type: 2, value: '*.localhost' },
        { type: 7, ip: '127.0.0.1' },
        { type: 7, ip: '::1' }
      ]
    }
  ]);
  
  
  cert.sign(keys.privateKey, forge.md.sha256.create());
  
  console.log('💾 Salvando arquivos...');
  
  const certPem = forge.pki.certificateToPem(cert);
  const keyPem = forge.pki.privateKeyToPem(keys.privateKey);
  
  fs.writeFileSync(certPath, certPem, 'utf8');
  fs.writeFileSync(keyPath, keyPem, 'utf8');
  
  const certStats = fs.statSync(certPath);
  const keyStats = fs.statSync(keyPath);

  try {
    const loadedCert = forge.pki.certificateFromPem(certPem);
    const loadedKey = forge.pki.privateKeyFromPem(keyPem);

    const testData = 'test';
    const signature = loadedKey.sign(forge.md.sha256.create().update(testData).digest());
    const verified = loadedCert.publicKey.verify(
      forge.md.sha256.create().update(testData).digest().bytes(),
      signature
    );
    
    if (verified) {
      console.log('✅ Certificado validado - Chaves correspondem!');
    } else {
      console.log('⚠️ Aviso: Problema na validação das chaves');
    }
  } catch (validationError) {
    console.log('⚠️ Aviso na validação:', validationError.message);
  }
  
} catch (error) {
  console.error('❌ Erro ao gerar certificados:', error.message);
  console.log('\n🔧 Detalhes do erro:');
  console.log(error.stack);
} 