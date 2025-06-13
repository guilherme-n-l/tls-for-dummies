#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Função para fazer requisições HTTP
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const client = options.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: JSON.parse(responseData)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: responseData
          });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testSSLImplementation() {
  const baseUrl = 'http://localhost:3001';
  
  console.log('🚀 Testando implementação SSL real...\n');
  
  try {
    // 1. Gerar certificado CA
    console.log('1. Gerando certificado CA...');
    const caResult = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/certificates/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, { type: 'ca' });
    
    if (caResult.data.success) {
      console.log('✅ Certificado CA gerado com sucesso');
    } else {
      throw new Error('Falha ao gerar CA: ' + caResult.data.error);
    }
    
    // 2. Gerar certificado do servidor
    console.log('\n2. Gerando certificado do servidor...');
    const serverCertResult = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/certificates/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, { type: 'server' });
    
    if (serverCertResult.data.success) {
      console.log('✅ Certificado do servidor gerado com sucesso');
    } else {
      throw new Error('Falha ao gerar certificado do servidor: ' + serverCertResult.data.error);
    }
    
    // 3. Gerar certificado do cliente
    console.log('\n3. Gerando certificado do cliente...');
    const clientCertResult = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/certificates/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, { type: 'client' });
    
    if (clientCertResult.data.success) {
      console.log('✅ Certificado do cliente gerado com sucesso');
    } else {
      throw new Error('Falha ao gerar certificado do cliente: ' + clientCertResult.data.error);
    }
    
    // 4. Configurar servidor
    console.log('\n4. Configurando servidor HTTPS...');
    const configResult = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/server/configure',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, { port: 8443 });
    
    if (configResult.data.success) {
      console.log('✅ Servidor configurado para porta 8443');
    } else {
      throw new Error('Falha ao configurar servidor: ' + configResult.data.error);
    }
    
    // 5. Iniciar servidor HTTPS
    console.log('\n5. Iniciando servidor HTTPS...');
    const startResult = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/server/start',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (startResult.data.success) {
      console.log('✅ Servidor HTTPS iniciado com sucesso');
      console.log(`🔗 URL: ${startResult.data.url}`);
    } else {
      throw new Error('Falha ao iniciar servidor HTTPS: ' + startResult.data.error);
    }
    
    // 6. Configurar cliente
    console.log('\n6. Configurando cliente...');
    const clientConfigResult = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/client/configure',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (clientConfigResult.data.success) {
      console.log('✅ Cliente configurado com sucesso');
    } else {
      throw new Error('Falha ao configurar cliente: ' + clientConfigResult.data.error);
    }
    
    // 7. Aguardar um momento para o servidor inicializar
    console.log('\n7. Aguardando servidor inicializar...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 8. Testar conexão HTTPS
    console.log('\n8. Testando conexão HTTPS...');
    const testResult = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/connection/test',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (testResult.data.success) {
      console.log('✅ Teste de conexão HTTPS realizado com sucesso!');
      console.log('\n📊 Resultados do teste:');
      console.log(`   Protocol: ${testResult.data.result.handshake.protocol}`);
      console.log(`   Cipher: ${testResult.data.result.handshake.cipher}`);
      console.log(`   Handshake Time: ${testResult.data.result.performance.handshakeTime}`);
      console.log(`   Total Time: ${testResult.data.result.performance.totalTime}`);
      console.log(`   Certificate Valid: ${testResult.data.result.certificate.valid}`);
    } else {
      throw new Error('Falha no teste de conexão: ' + testResult.data.error);
    }
    
    console.log('\n🎉 Implementação SSL real funcionando perfeitamente!');
    console.log('\n📝 Próximos passos:');
    console.log('   1. Acesse https://localhost:8443 no seu navegador');
    console.log('   2. Aceite o certificado auto-assinado');
    console.log('   3. Baixe o certificado CA em http://localhost:3001/api/certificates/download/ca');
    console.log('   4. Instale o certificado CA no seu sistema para remover avisos de segurança');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    process.exit(1);
  }
}

// Executar teste se este arquivo for chamado diretamente
if (require.main === module) {
  testSSLImplementation();
}

module.exports = { testSSLImplementation }; 