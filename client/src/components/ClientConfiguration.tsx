import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Check, Code, Terminal, Globe } from 'lucide-react';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface StepProps {
  onComplete: (data?: any) => void;
  stepData?: any;
  isCompleted: boolean;
}

interface ClientConfig {
  configured: boolean;
  connectionTested: boolean;
  lastTest: any;
}

const ClientConfiguration: React.FC<StepProps> = ({ onComplete, isCompleted }) => {
  const [clientConfig, setClientConfig] = useState<ClientConfig>({
    configured: false,
    connectionTested: false,
    lastTest: null
  });
  const [isConfiguring, setIsConfiguring] = useState(false);

  useEffect(() => {
    fetchClientStatus();
  }, []);

  const fetchClientStatus = async () => {
    try {
      const response = await axios.get('/api/client/status');
      setClientConfig(response.data);
    } catch (error) {
      console.error('Erro ao buscar status do cliente:', error);
    }
  };

  const configureClient = async () => {
    setIsConfiguring(true);
    try {
      const response = await axios.post('/api/client/configure');
      setClientConfig(response.data.config);
      setTimeout(() => onComplete(response.data.config), 1000);
    } catch (error) {
      console.error('Erro ao configurar cliente:', error);
    } finally {
      setIsConfiguring(false);
    }
  };

  const nodeClientExample = `const https = require('https');
const fs = require('fs');

// Opções para cliente SSL
const clientOptions = {
  hostname: 'localhost',
  port: 8443,
  path: '/api/secure',
  method: 'GET',
  
  // Certificados para validação
  ca: fs.readFileSync('ca-cert.pem'),
  
  // Para mutual TLS (autenticação mútua)
  key: fs.readFileSync('client-key.pem'),  // Opcional
  cert: fs.readFileSync('client-cert.pem'), // Opcional
  
  // Validações de segurança
  rejectUnauthorized: true, // Validar certificado do servidor
  checkServerIdentity: (hostname, cert) => {
    // Verificação customizada do hostname
    return undefined; // undefined = OK
  }
};

// Fazer requisição HTTPS
const req = https.request(clientOptions, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  // Informações do certificado do servidor
  const cert = res.connection.getPeerCertificate();
  console.log('Certificado do servidor:', {
    subject: cert.subject,
    issuer: cert.issuer,
    valid_from: cert.valid_from,
    valid_to: cert.valid_to
  });
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Resposta:', data);
  });
});

req.on('error', (error) => {
  console.error('Erro:', error.message);
});

req.end();`;

  const curlExample = `# Requisição básica com validação de certificado
curl -v --cacert ca-cert.pem https://localhost:8443/api/secure

# Com autenticação mútua (mutual TLS)
curl -v \\
  --cacert ca-cert.pem \\
  --cert client-cert.pem \\
  --key client-key.pem \\
  https://localhost:8443/api/secure

# Ignorar validação de certificado (apenas para desenvolvimento)
curl -k https://localhost:8443/api/secure

# Ver detalhes do handshake SSL
curl -v --trace-ascii trace.txt https://localhost:8443/api/secure

# Testar cipher suites específicas
curl --ciphers ECDHE-RSA-AES256-GCM-SHA384 \\
  --cacert ca-cert.pem \\
  https://localhost:8443/api/secure`;

  const pythonExample = `import ssl
import urllib.request
import json

# Criar contexto SSL
ssl_context = ssl.create_default_context()

# Carregar CA certificate
ssl_context.load_verify_locations('ca-cert.pem')

# Para mutual TLS (opcional)
# ssl_context.load_cert_chain('client-cert.pem', 'client-key.pem')

# Configurações de segurança
ssl_context.check_hostname = True
ssl_context.verify_mode = ssl.CERT_REQUIRED

try:
    # Fazer requisição HTTPS
    request = urllib.request.Request('https://localhost:8443/api/secure')
    
    with urllib.request.urlopen(request, context=ssl_context) as response:
        print(f"Status: {response.status}")
        print(f"Headers: {dict(response.headers)}")
        
        # Informações do certificado
        cert = response.fp.raw._sock.getpeercert()
        print(f"Certificado: {cert['subject']}")
        print(f"Emissor: {cert['issuer']}")
        print(f"Válido até: {cert['notAfter']}")
        
        # Resposta
        data = json.loads(response.read().decode())
        print(f"Resposta: {data}")
        
except ssl.SSLError as e:
    print(f"Erro SSL: {e}")
except Exception as e:
    print(f"Erro: {e}")`;

  const clientTypes = [
    {
      title: 'Node.js',
      icon: Code,
      description: 'Cliente JavaScript/Node.js com https module',
      color: 'from-green-500 to-green-600',
      code: nodeClientExample,
      language: 'javascript'
    },
    {
      title: 'cURL',
      icon: Terminal,
      description: 'Cliente de linha de comando para testes',
      color: 'from-blue-500 to-blue-600',
      code: curlExample,
      language: 'bash'
    },
    {
      title: 'Python',
      icon: Globe,
      description: 'Cliente Python com ssl e urllib',
      color: 'from-yellow-500 to-yellow-600',
      code: pythonExample,
      language: 'python'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center space-x-3 mb-4"
        >
          <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Configurar o Cliente</h2>
            <p className="text-gray-600">Etapa 3: Configurando aplicação cliente para SSL</p>
          </div>
        </motion.div>
        
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Configure aplicações cliente para se conectarem ao servidor HTTPS de forma segura,
          validando certificados e estabelecendo conexões criptografadas.
        </p>
      </div>

      {/* Botão de Configuração */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.button
          onClick={configureClient}
          disabled={clientConfig.configured || isConfiguring}
          className={`
            py-4 px-8 rounded-xl font-medium text-lg transition-all duration-300
            flex items-center justify-center space-x-3 mx-auto
            ${clientConfig.configured
              ? 'bg-green-500 text-white cursor-default'
              : 'bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600'
            }
          `}
          whileHover={!clientConfig.configured ? { scale: 1.05 } : {}}
          whileTap={!clientConfig.configured ? { scale: 0.95 } : {}}
        >
          {isConfiguring ? (
            <>
              <div className="loading-spinner w-6 h-6" />
              <span>Configurando Cliente...</span>
            </>
          ) : clientConfig.configured ? (
            <>
              <Check className="w-6 h-6" />
              <span>Cliente Configurado</span>
            </>
          ) : (
            <>
              <Users className="w-6 h-6" />
              <span>Configurar Cliente SSL</span>
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Exemplos de Clientes */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-800 text-center">
          Exemplos de Implementação
        </h3>
        
        {clientTypes.map((clientType, index) => {
          const IconComponent = clientType.icon;
          
          return (
            <motion.div
              key={clientType.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-xl p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center
                  bg-gradient-to-r ${clientType.color}
                `}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-800">{clientType.title}</h4>
                  <p className="text-gray-600">{clientType.description}</p>
                </div>
              </div>
              
              <SyntaxHighlighter
                language={clientType.language}
                style={tomorrow}
                className="rounded-lg"
                customStyle={{
                  margin: 0,
                  fontSize: '0.875rem',
                  maxHeight: '400px'
                }}
              >
                {clientType.code}
              </SyntaxHighlighter>
            </motion.div>
          );
        })}
      </div>

      {/* Informações sobre Validação */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-purple-50 rounded-xl p-6 border-l-4 border-purple-500"
      >
        <h3 className="text-lg font-semibold text-purple-800 mb-3">🔍 Validações do Cliente</h3>
        <div className="grid md:grid-cols-2 gap-4 text-purple-700">
          <div>
            <h4 className="font-medium mb-2">Validações Obrigatórias:</h4>
            <ul className="space-y-1 text-sm">
              <li>• Verificar assinatura do certificado</li>
              <li>• Validar cadeia de certificados</li>
              <li>• Verificar data de validade</li>
              <li>• Confirmar hostname/CN</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Opcionais (Mutual TLS):</h4>
            <ul className="space-y-1 text-sm">
              <li>• Apresentar certificado cliente</li>
              <li>• Autenticação bidirecional</li>
              <li>• Maior nível de segurança</li>
              <li>• Usado em APIs críticas</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Troubleshooting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-red-50 rounded-xl p-6 border-l-4 border-red-500"
      >
        <h3 className="text-lg font-semibold text-red-800 mb-3">⚠️ Problemas Comuns</h3>
        <div className="space-y-3 text-red-700">
          <div>
            <h4 className="font-medium">Certificate verify failed:</h4>
            <p className="text-sm">CA certificate não encontrado ou inválido. Verifique o caminho para ca-cert.pem</p>
          </div>
          <div>
            <h4 className="font-medium">Hostname mismatch:</h4>
            <p className="text-sm">O CN do certificado não confere com o hostname. Use 'localhost' no certificado</p>
          </div>
          <div>
            <h4 className="font-medium">Connection refused:</h4>
            <p className="text-sm">Servidor não está rodando ou porta incorreta. Verifique se o servidor SSL está ativo</p>
          </div>
          <div>
            <h4 className="font-medium">SSL handshake failure:</h4>
            <p className="text-sm">Incompatibilidade de cipher suites. Verifique as configurações de criptografia</p>
          </div>
        </div>
      </motion.div>

      {/* Status de Conclusão */}
      {clientConfig.configured && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-green-50 rounded-xl p-6 border border-green-200"
        >
          <div className="inline-flex items-center space-x-3 text-green-700">
            <div className="p-2 bg-green-500 rounded-full">
              <Check className="w-6 h-6 text-white checkmark" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Cliente SSL Configurado!</h3>
              <p className="text-sm">Pronto para testar a conexão com o servidor HTTPS</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ClientConfiguration; 