const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

const certsDir = path.join(__dirname, 'certs');
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

['ca-cert.pem', 'server-cert.pem', 'server-key.pem'].forEach(filename => {
  const filePath = path.join(certsDir, filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
});

try {
  const caKeys = forge.pki.rsa.generateKeyPair(2048);
  const caCert = forge.pki.createCertificate();
  caCert.publicKey = caKeys.publicKey;
  caCert.serialNumber = '01';
  caCert.validity.notBefore = new Date();
  caCert.validity.notAfter = new Date();
  caCert.validity.notAfter.setFullYear(caCert.validity.notBefore.getFullYear() + 10);

  const caAttrs = [
    { name: 'commonName', value: 'InteliCA' },
    { name: 'countryName', value: 'BR' },
    { name: 'stateOrProvinceName', value: 'Localhost' },
    { name: 'localityName', value: 'Localhost' },
    { name: 'organizationName', value: 'Inteli' },
    { name: 'organizationalUnitName', value: 'Security' }
  ];

  caCert.setSubject(caAttrs);
  caCert.setIssuer(caAttrs);
  caCert.setExtensions([
    { name: 'basicConstraints', cA: true },
    { name: 'keyUsage', keyCertSign: true, digitalSignature: true },
    { name: 'subjectKeyIdentifier' }
  ]);
  caCert.sign(caKeys.privateKey, forge.md.sha256.create());

  const serverKeys = forge.pki.rsa.generateKeyPair(2048);
  const serverCert = forge.pki.createCertificate();
  serverCert.publicKey = serverKeys.publicKey;
  serverCert.serialNumber = '02';
  serverCert.validity.notBefore = new Date();
  serverCert.validity.notAfter = new Date();
  serverCert.validity.notAfter.setFullYear(serverCert.validity.notBefore.getFullYear() + 5);

  const serverAttrs = [
    { name: 'commonName', value: 'localhost' },
    { name: 'countryName', value: 'BR' },
    { name: 'stateOrProvinceName', value: 'Localhost' },
    { name: 'organizationName', value: 'Stablishing TLS' },
    { name: 'organizationalUnitName', value: 'Silk Road' }
  ];

  serverCert.setSubject(serverAttrs);
  serverCert.setIssuer(caCert.subject.attributes);
  serverCert.setExtensions([
    { name: 'basicConstraints', cA: false },
    {
      name: 'keyUsage',
      digitalSignature: true,
      keyEncipherment: true
    },
    {
      name: 'extKeyUsage',
      serverAuth: true
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
  serverCert.sign(caKeys.privateKey, forge.md.sha256.create());

  fs.writeFileSync(path.join(certsDir, 'ca-cert.pem'), forge.pki.certificateToPem(caCert), 'utf8');
  fs.writeFileSync(path.join(certsDir, 'server-cert.pem'), forge.pki.certificateToPem(serverCert), 'utf8');
  fs.writeFileSync(path.join(certsDir, 'server-key.pem'), forge.pki.privateKeyToPem(serverKeys.privateKey), 'utf8');

  const testData = 'tls-check';
  const md = forge.md.sha256.create();
  md.update(testData, 'utf8');
  const signature = serverKeys.privateKey.sign(md);
  
  const mdVerify = forge.md.sha256.create();
  mdVerify.update(testData, 'utf8');
  const verified = serverCert.publicKey.verify(mdVerify.digest().bytes(), signature);
  
  if (verified) {
    console.log('✅ Certificado do servidor validado com sucesso.');
  } else {
    console.log('⚠️ Problema na verificação do certificado do servidor.');
  }
  console.log('\n📂 Arquivos gerados em /certs:');
  console.log('- ca-cert.pem       (⚠️ Importar no navegador)');
  console.log('- server-cert.pem   (Usar no servidor)');
  console.log('- server-key.pem    (Usar no servidor)');

} catch (error) {
  console.error('❌ Erro ao gerar certificados:', error.message);
  console.log(error.stack);
}