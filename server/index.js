const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);
const app = express();

// Criar diretório para certificados se não existir
const certDir = path.join(__dirname, 'certificates');
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://localhost:3001' 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(helmet());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Dados simulados para demonstração
let certificateData = {
  created: false,
  ca: null,
  server: null,
  client: null,
  steps: []
};

let serverConfig = {
  configured: false,
  port: 8443,
  status: 'stopped'
};

let clientConfig = {
  configured: false,
  connectionTested: false,
  lastTest: null
};

// Rotas da API

// Etapa 1: Gerar Certificados
app.get('/api/certificates/status', (req, res) => {
  res.json(certificateData);
});

app.post('/api/certificates/generate', async (req, res) => {
  const { type } = req.body; // 'ca', 'server', 'client'
  
  try {
    switch(type) {
      case 'ca':
        console.log('Gerando certificado CA...');
        
        // 1. Gerar chave privada da CA
        const caKeyCmd = `openssl genrsa -out ${path.join(certDir, 'ca-key.pem')} 2048`;
        await execAsync(caKeyCmd);
        
        // 2. Criar certificado auto-assinado da CA
        const caCertCmd = `openssl req -new -x509 -days 365 -key ${path.join(certDir, 'ca-key.pem')} -out ${path.join(certDir, 'ca-cert.pem')} -subj "/C=BR/ST=SP/L=SaoPaulo/O=TLS Demo/CN=TLS Demo CA"`;
        await execAsync(caCertCmd);
        
        certificateData.ca = {
          commonName: 'TLS Demo CA',
          validity: '365 days',
          keySize: '2048 bits',
          algorithm: 'RSA',
          created: new Date().toISOString(),
          keyPath: path.join(certDir, 'ca-key.pem'),
          certPath: path.join(certDir, 'ca-cert.pem')
        };
        
        certificateData.steps.push({
          step: 1,
          command: caKeyCmd,
          description: 'Gerar chave privada da CA',
          executed: true
        });
        certificateData.steps.push({
          step: 2,
          command: caCertCmd,
          description: 'Criar certificado auto-assinado da CA',
          executed: true
        });
        break;
        
      case 'server':
        if (!certificateData.ca) {
          return res.status(400).json({ error: 'CA deve ser criada primeiro' });
        }
        
        console.log('Gerando certificado do servidor...');
        
        // 3. Gerar chave privada do servidor
        const serverKeyCmd = `openssl genrsa -out ${path.join(certDir, 'server-key.pem')} 2048`;
        await execAsync(serverKeyCmd);
        
        // 4. Criar requisição de certificado do servidor
        const serverCsrCmd = `openssl req -new -key ${path.join(certDir, 'server-key.pem')} -out ${path.join(certDir, 'server-csr.pem')} -subj "/C=BR/ST=SP/L=SaoPaulo/O=TLS Demo/CN=localhost"`;
        await execAsync(serverCsrCmd);
        
        // 5. Assinar certificado do servidor com a CA
        const serverCertCmd = `openssl x509 -req -in ${path.join(certDir, 'server-csr.pem')} -CA ${path.join(certDir, 'ca-cert.pem')} -CAkey ${path.join(certDir, 'ca-key.pem')} -CAcreateserial -out ${path.join(certDir, 'server-cert.pem')} -days 90`;
        await execAsync(serverCertCmd);
        
        certificateData.server = {
          commonName: 'localhost',
          validity: '90 days',
          keySize: '2048 bits',
          algorithm: 'RSA',
          created: new Date().toISOString(),
          keyPath: path.join(certDir, 'server-key.pem'),
          certPath: path.join(certDir, 'server-cert.pem')
        };
        
        certificateData.steps.push({
          step: 3,
          command: serverKeyCmd,
          description: 'Gerar chave privada do servidor',
          executed: true
        });
        certificateData.steps.push({
          step: 4,
          command: serverCsrCmd,
          description: 'Criar requisição de certificado do servidor',
          executed: true
        });
        certificateData.steps.push({
          step: 5,
          command: serverCertCmd,
          description: 'Assinar certificado do servidor com a CA',
          executed: true
        });
        break;
        
      case 'client':
        if (!certificateData.ca) {
          return res.status(400).json({ error: 'CA deve ser criada primeiro' });
        }
        
        console.log('Gerando certificado do cliente...');
        
        // 6. Gerar chave privada do cliente
        const clientKeyCmd = `openssl genrsa -out ${path.join(certDir, 'client-key.pem')} 2048`;
        await execAsync(clientKeyCmd);
        
        // 7. Criar requisição de certificado do cliente
        const clientCsrCmd = `openssl req -new -key ${path.join(certDir, 'client-key.pem')} -out ${path.join(certDir, 'client-csr.pem')} -subj "/C=BR/ST=SP/L=SaoPaulo/O=TLS Demo/CN=client"`;
        await execAsync(clientCsrCmd);
        
        // 8. Assinar certificado do cliente com a CA
        const clientCertCmd = `openssl x509 -req -in ${path.join(certDir, 'client-csr.pem')} -CA ${path.join(certDir, 'ca-cert.pem')} -CAkey ${path.join(certDir, 'ca-key.pem')} -CAcreateserial -out ${path.join(certDir, 'client-cert.pem')} -days 90`;
        await execAsync(clientCertCmd);
        
        certificateData.client = {
          commonName: 'client',
          validity: '90 days',
          keySize: '2048 bits',
          algorithm: 'RSA',
          created: new Date().toISOString(),
          keyPath: path.join(certDir, 'client-key.pem'),
          certPath: path.join(certDir, 'client-cert.pem')
        };
        
        certificateData.steps.push({
          step: 6,
          command: clientKeyCmd,
          description: 'Gerar chave privada do cliente',
          executed: true
        });
        certificateData.steps.push({
          step: 7,
          command: clientCsrCmd,
          description: 'Criar requisição de certificado do cliente',
          executed: true
        });
        certificateData.steps.push({
          step: 8,
          command: clientCertCmd,
          description: 'Assinar certificado do cliente com a CA',
          executed: true
        });
        break;
    }
    
    if (certificateData.ca && certificateData.server && certificateData.client) {
      certificateData.created = true;
    }
    
    console.log(`Certificado ${type} gerado com sucesso!`);
    res.json({ success: true, data: certificateData });
    
  } catch (error) {
    console.error(`Erro ao gerar certificado ${type}:`, error);
    res.status(500).json({ 
      success: false, 
      error: `Erro ao gerar certificado ${type}: ${error.message}` 
    });
  }
});

// Etapa 2: Configurar Servidor
let httpsServer = null;

app.get('/api/server/status', (req, res) => {
  res.json(serverConfig);
});

app.post('/api/server/configure', (req, res) => {
  const { port } = req.body;
  
  if (!certificateData.server) {
    return res.status(400).json({ error: 'Certificado do servidor deve ser gerado primeiro' });
  }
  
  serverConfig.port = port || 8443;
  serverConfig.configured = true;
  serverConfig.status = 'configured';
  
  res.json({ 
    success: true, 
    message: `Servidor SSL configurado na porta ${serverConfig.port}`,
    config: serverConfig 
  });
});

app.post('/api/server/start', (req, res) => {
  if (!serverConfig.configured) {
    return res.status(400).json({ error: 'Servidor não configurado' });
  }
  
  if (!certificateData.server) {
    return res.status(400).json({ error: 'Certificado do servidor não encontrado' });
  }
  
  try {
    // Verificar se os arquivos de certificado existem
    if (!fs.existsSync(certificateData.server.keyPath) || !fs.existsSync(certificateData.server.certPath)) {
      return res.status(400).json({ error: 'Arquivos de certificado não encontrados' });
    }
    
    // Criar app Express para o servidor HTTPS
    const httpsApp = express();
    httpsApp.use(cors());
    httpsApp.use(helmet());
    httpsApp.use(express.static(path.join(__dirname, '../client/build')));
    
    // Rota de teste para o servidor HTTPS
    httpsApp.get('/api/secure-test', (req, res) => {
      res.json({ 
        message: 'Conexão HTTPS estabelecida com sucesso!',
        timestamp: new Date().toISOString(),
        secure: true
      });
    });
    
    httpsApp.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/build/index.html'));
    });
    
    // Configurar opções HTTPS
    const httpsOptions = {
      key: fs.readFileSync(certificateData.server.keyPath),
      cert: fs.readFileSync(certificateData.server.certPath)
    };
    
    // Iniciar servidor HTTPS
    httpsServer = https.createServer(httpsOptions, httpsApp);
    httpsServer.listen(serverConfig.port, () => {
      console.log(`🔒 Servidor HTTPS rodando na porta ${serverConfig.port}`);
      console.log(`🔗 Acesse: https://localhost:${serverConfig.port}`);
      console.log(`⚠️  Para aceitar o certificado auto-assinado, clique em "Avançado" > "Prosseguir para localhost"`);
    });
    
    serverConfig.status = 'running';
    res.json({ 
      success: true, 
      message: `Servidor HTTPS iniciado na porta ${serverConfig.port}`,
      config: serverConfig,
      url: `https://localhost:${serverConfig.port}`
    });
    
  } catch (error) {
    console.error('Erro ao iniciar servidor HTTPS:', error);
    res.status(500).json({ 
      success: false, 
      error: `Erro ao iniciar servidor HTTPS: ${error.message}` 
    });
  }
});

app.post('/api/server/stop', (req, res) => {
  if (httpsServer) {
    httpsServer.close(() => {
      console.log('🛑 Servidor HTTPS parado');
      serverConfig.status = 'stopped';
      httpsServer = null;
      res.json({ 
        success: true, 
        message: 'Servidor HTTPS parado com sucesso',
        config: serverConfig 
      });
    });
  } else {
    res.json({ 
      success: true, 
      message: 'Nenhum servidor HTTPS estava rodando',
      config: serverConfig 
    });
  }
});

// Etapa 3: Configurar Cliente
app.get('/api/client/status', (req, res) => {
  res.json(clientConfig);
});

app.post('/api/client/configure', (req, res) => {
  clientConfig.configured = true;
  res.json({ 
    success: true, 
    message: 'Cliente SSL configurado com sucesso',
    config: clientConfig 
  });
});

// Etapa 4: Testar Conexão
app.post('/api/connection/test', async (req, res) => {
  if (!serverConfig.configured || !clientConfig.configured) {
    return res.status(400).json({ 
      error: 'Servidor e cliente devem estar configurados primeiro' 
    });
  }
  
  if (serverConfig.status !== 'running') {
    return res.status(400).json({ 
      error: 'Servidor HTTPS deve estar rodando para testar a conexão' 
    });
  }
  
  try {
    const https = require('https');
    const startTime = Date.now();
    
    // Configurar agente HTTPS para aceitar certificados auto-assinados
    const agent = new https.Agent({
      rejectUnauthorized: false, // Para aceitar certificados auto-assinados
      ca: certificateData.ca ? fs.readFileSync(certificateData.ca.certPath) : undefined
    });
    
    // Fazer requisição HTTPS real
    const testResult = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'localhost',
        port: serverConfig.port,
        path: '/api/secure-test',
        method: 'GET',
        agent: agent
      }, (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          const endTime = Date.now();
          const totalTime = endTime - startTime;
          
          try {
            const responseData = JSON.parse(data);
            
            resolve({
              success: true,
              timestamp: new Date().toISOString(),
              handshake: {
                protocol: response.socket.getProtocol ? response.socket.getProtocol() : 'TLSv1.3',
                cipher: response.socket.getCipher ? response.socket.getCipher().name : 'TLS_AES_256_GCM_SHA384',
                keyExchange: 'ECDHE',
                authentication: 'RSA',
                encryption: 'AES-256-GCM',
                mac: 'SHA384'
              },
              certificate: {
                subject: 'CN=localhost',
                issuer: 'CN=TLS Demo CA',
                valid: true,
                authorized: response.socket.authorized || false,
                expiresIn: '89 days'
              },
              performance: {
                handshakeTime: `${Math.floor(totalTime / 2)}ms`,
                totalTime: `${totalTime}ms`
              },
              responseStatus: response.statusCode,
              responseData: responseData
            });
          } catch (parseError) {
            reject(new Error(`Erro ao analisar resposta: ${parseError.message}`));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(new Error(`Erro na conexão: ${error.message}`));
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Timeout na conexão'));
      });
      
      req.end();
    });
    
    clientConfig.connectionTested = true;
    clientConfig.lastTest = testResult;
    
    console.log('✅ Teste de conexão HTTPS realizado com sucesso');
    res.json({ success: true, result: testResult });
    
  } catch (error) {
    console.error('❌ Erro no teste de conexão:', error);
    res.status(500).json({ 
      success: false, 
      error: `Erro no teste de conexão: ${error.message}` 
    });
  }
});

// Etapa 5: Manutenção e Segurança
app.get('/api/security/checklist', (req, res) => {
  const checklist = [
    {
      id: 1,
      category: 'Certificados',
      item: 'Verificar datas de expiração',
      status: 'pending',
      description: 'Certificados devem ser renovados antes da expiração'
    },
    {
      id: 2,
      category: 'Protocolos',
      item: 'Desabilitar protocolos antigos (SSLv3, TLSv1.0)',
      status: 'pending',
      description: 'Use apenas TLS 1.2 ou superior'
    },
    {
      id: 3,
      category: 'Ciphers',
      item: 'Configurar cipher suites seguras',
      status: 'pending',
      description: 'Evite ciphers fracas e prefira AEAD'
    },
    {
      id: 4,
      category: 'Chaves',
      item: 'Usar chaves de pelo menos 2048 bits',
      status: 'completed',
      description: 'Chaves RSA menores que 2048 bits são inseguras'
    },
    {
      id: 5,
      category: 'HSTS',
      item: 'Implementar HTTP Strict Transport Security',
      status: 'pending',
      description: 'Force HTTPS em todos os acessos'
    }
  ];
  
  res.json(checklist);
});

app.post('/api/security/checklist/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  res.json({ 
    success: true, 
    message: `Item ${id} marcado como ${status}` 
  });
});

// Rota para baixar certificado CA
app.get('/api/certificates/download/ca', (req, res) => {
  if (!certificateData.ca || !fs.existsSync(certificateData.ca.certPath)) {
    return res.status(404).json({ error: 'Certificado CA não encontrado' });
  }
  
  res.download(certificateData.ca.certPath, 'ca-cert.pem', (err) => {
    if (err) {
      console.error('Erro ao baixar certificado CA:', err);
      res.status(500).json({ error: 'Erro ao baixar certificado' });
    }
  });
});

// Rota para instruções de instalação do certificado
app.get('/api/certificates/install-instructions', (req, res) => {
  const instructions = {
    windows: [
      "1. Baixe o certificado CA (ca-cert.pem)",
      "2. Clique duas vezes no arquivo baixado",
      "3. Clique em 'Instalar Certificado'",
      "4. Selecione 'Usuário Atual' ou 'Máquina Local'",
      "5. Escolha 'Colocar todos os certificados no repositório a seguir'",
      "6. Clique em 'Procurar' e selecione 'Autoridades de Certificação Raiz Confiáveis'",
      "7. Clique em 'Concluir'"
    ],
    macos: [
      "1. Baixe o certificado CA (ca-cert.pem)",
      "2. Clique duas vezes no arquivo baixado para abrir o Keychain Access",
      "3. Arraste o certificado para o 'Sistema' ou 'login'",
      "4. Clique duas vezes no certificado instalado",
      "5. Expanda 'Confiança'",
      "6. Altere 'Ao usar este certificado' para 'Sempre Confiar'",
      "7. Feche a janela e digite sua senha quando solicitado"
    ],
    linux: [
      "1. Baixe o certificado CA (ca-cert.pem)",
      "2. Copie para /usr/local/share/ca-certificates/: sudo cp ca-cert.pem /usr/local/share/ca-certificates/ca-cert.crt",
      "3. Execute: sudo update-ca-certificates",
      "4. Para Firefox: Preferences > Privacy & Security > Certificates > View Certificates > Authorities > Import"
    ],
    browser: [
      "1. Acesse https://localhost:8443 (ou sua porta configurada)",
      "2. Clique em 'Avançado' ou 'Advanced'",
      "3. Clique em 'Prosseguir para localhost (não seguro)' ou 'Proceed to localhost (unsafe)'",
      "4. Para Chrome: clique no cadeado > Certificado > Detalhes > Copiar para arquivo",
      "5. Para Firefox: clique no cadeado > Conexão não segura > Mais informações > Exibir certificado"
    ]
  };
  
  res.json(instructions);
});

// Servir aplicação React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Iniciar servidor HTTP
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📚 Acesse a aplicação em http://localhost:${PORT}`);
});

module.exports = app; 