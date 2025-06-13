import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Server, Play, Check, Settings, Code, AlertCircle, ExternalLink, Square } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { apiService, CertificateData, ServerConfig as ServerConfigType, ClientConfig } from '../services/api';

interface StepProps {
  onComplete: (data?: any) => void;
  stepData?: any;
  isCompleted: boolean;
  certificateData?: CertificateData | null;
  serverConfig?: ServerConfigType | null;
  clientConfig?: ClientConfig | null;
  onDataUpdate?: () => Promise<void>;
}

const ServerConfiguration: React.FC<StepProps> = ({ 
  onComplete, 
  isCompleted,
  certificateData,
  serverConfig: propServerConfig,
  onDataUpdate 
}) => {
  const [serverConfig, setServerConfig] = useState<ServerConfigType | null>(propServerConfig || null);
  const [port, setPort] = useState(8443);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [httpsUrl, setHttpsUrl] = useState<string>('');

  useEffect(() => {
    if (propServerConfig) {
      setServerConfig(propServerConfig);
      setPort(propServerConfig.port);
      setHttpsUrl(apiService.getHttpsUrl(propServerConfig.port));
    } else {
      fetchServerStatus();
    }
  }, [propServerConfig]);

  const fetchServerStatus = async () => {
    try {
      const response = await apiService.getServerStatus();
      if (response.success) {
        setServerConfig(response.data!);
        setPort(response.data!.port);
        setHttpsUrl(apiService.getHttpsUrl(response.data!.port));
      } else {
        setError(response.error || 'Erro ao buscar status do servidor');
      }
    } catch (error) {
      console.error('Erro ao buscar status do servidor:', error);
      setError('Erro ao buscar status do servidor');
    }
  };

  const configureServer = async () => {
    setIsConfiguring(true);
    setError(null);
    
    try {
      const response = await apiService.configureServer(port);
      if (response.success) {
        setServerConfig(response.data!);
        setHttpsUrl(apiService.getHttpsUrl(port));
        
        if (onDataUpdate) {
          await onDataUpdate();
        }
      } else {
        setError(response.error || 'Erro ao configurar servidor');
      }
    } catch (error) {
      console.error('Erro ao configurar servidor:', error);
      setError('Erro ao configurar servidor');
    } finally {
      setIsConfiguring(false);
    }
  };

  const startServer = async () => {
    setIsStarting(true);
    setError(null);
    
    try {
      const response = await apiService.startServer();
      if (response.success) {
        setServerConfig(response.data!);
        setHttpsUrl(response.data!.url || apiService.getHttpsUrl(port));
        
        if (onDataUpdate) {
          await onDataUpdate();
        }
        
        setTimeout(() => onComplete(response.data), 1000);
      } else {
        setError(response.error || 'Erro ao iniciar servidor');
      }
    } catch (error) {
      console.error('Erro ao iniciar servidor:', error);
      setError('Erro ao iniciar servidor');
    } finally {
      setIsStarting(false);
    }
  };

  const stopServer = async () => {
    setIsStopping(true);
    setError(null);
    
    try {
      const response = await apiService.stopServer();
      if (response.success) {
        setServerConfig(response.data!);
        
        if (onDataUpdate) {
          await onDataUpdate();
        }
      } else {
        setError(response.error || 'Erro ao parar servidor');
      }
    } catch (error) {
      console.error('Erro ao parar servidor:', error);
      setError('Erro ao parar servidor');
    } finally {
      setIsStopping(false);
    }
  };

  const canConfigure = certificateData?.server !== null;
  const canStart = serverConfig?.configured && certificateData?.server !== null;
  const isRunning = serverConfig?.status === 'running';

  const serverCodeExample = `const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Rota de API segura
app.get('/api/secure-test', (req, res) => {
  res.json({ 
    message: 'Conexão HTTPS estabelecida com sucesso!',
    timestamp: new Date().toISOString(),
    secure: true,
    protocol: req.protocol,
    encrypted: req.secure
  });
});

// Configuração HTTPS com certificados reais
const httpsOptions = {
  key: fs.readFileSync('${certificateData?.server?.keyPath || 'server-key.pem'}'),
  cert: fs.readFileSync('${certificateData?.server?.certPath || 'server-cert.pem'}'),
  ca: fs.readFileSync('${certificateData?.ca?.certPath || 'ca-cert.pem'}'),
  requestCert: false, // true para mutual TLS
  rejectUnauthorized: false // Para desenvolvimento
};

// Criar servidor HTTPS
const server = https.createServer(httpsOptions, app);

server.listen(${port}, () => {
  console.log(\`🔒 Servidor HTTPS rodando em https://localhost:${port}\`);
  console.log(\`📋 Teste: curl -k https://localhost:${port}/api/secure-test\`);
});

// Tratar erros de SSL
server.on('clientError', (err, socket) => {
  console.error('Erro SSL:', err.message);
  socket.end('HTTP/1.1 400 Bad Request\\r\\n\\r\\n');
});`;

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center space-x-3 mb-4"
        >
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
            <Server className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Configurar o Servidor</h2>
            <p className="text-gray-600">Etapa 2: Iniciando servidor HTTPS real</p>
          </div>
        </motion.div>
        
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Configure e inicie um servidor HTTPS real usando os certificados SSL/TLS 
          gerados na etapa anterior.
        </p>
      </div>

      {/* Verificação de Pré-requisitos */}
      {!canConfigure && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800">
              É necessário gerar o certificado do servidor primeiro.
            </span>
          </div>
        </motion.div>
      )}

      {/* Erro, se houver */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </motion.div>
      )}

      {/* Configuração do Servidor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="w-6 h-6 text-blue-500" />
          <h3 className="text-xl font-semibold text-gray-800">Configuração do Servidor HTTPS</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="port" className="block text-sm font-medium text-gray-700 mb-2">
              Porta HTTPS
            </label>
            <input
              type="number"
              id="port"
              value={port}
              onChange={(e) => setPort(Number(e.target.value))}
              min={1000}
              max={65535}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={serverConfig?.configured || isRunning}
            />
            <p className="text-xs text-gray-500 mt-1">
              Porta padrão HTTPS: 443 (use 8443 para desenvolvimento)
            </p>
            
            {httpsUrl && (
              <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                <p className="text-xs text-blue-700">URL do servidor:</p>
                <p className="font-mono text-sm text-blue-800">{httpsUrl}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-end space-y-2">
            {/* Botão Configurar */}
            <button
              onClick={configureServer}
              disabled={!canConfigure || serverConfig?.configured || isConfiguring}
              className={`
                py-2 px-6 rounded-lg font-medium transition-all duration-300
                flex items-center justify-center space-x-2
                ${serverConfig?.configured
                  ? 'bg-green-100 text-green-800 cursor-default'
                  : !canConfigure
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }
              `}
            >
              {isConfiguring ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-800 border-t-transparent rounded-full animate-spin" />
                  <span>Configurando...</span>
                </>
              ) : serverConfig?.configured ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Configurado</span>
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4" />
                  <span>Configurar</span>
                </>
              )}
            </button>

            {/* Botão Iniciar/Parar */}
            {serverConfig?.configured && (
              <div className="flex space-x-2">
                <button
                  onClick={startServer}
                  disabled={isRunning || isStarting || !canStart}
                  className={`
                    flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300
                    flex items-center justify-center space-x-2
                    ${isRunning
                      ? 'bg-green-100 text-green-800 cursor-default'
                      : 'bg-green-500 text-white hover:bg-green-600'
                    }
                  `}
                >
                  {isStarting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-green-800 border-t-transparent rounded-full animate-spin" />
                      <span>Iniciando...</span>
                    </>
                  ) : isRunning ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Rodando</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Iniciar</span>
                    </>
                  )}
                </button>

                {isRunning && (
                  <button
                    onClick={stopServer}
                    disabled={isStopping}
                    className="py-2 px-4 rounded-lg font-medium transition-all duration-300
                      bg-red-500 text-white hover:bg-red-600 flex items-center justify-center space-x-2"
                  >
                    {isStopping ? (
                      <>
                        <div className="w-4 h-4 border-2 border-red-800 border-t-transparent rounded-full animate-spin" />
                        <span>Parando...</span>
                      </>
                    ) : (
                      <>
                        <Square className="w-4 h-4" />
                        <span>Parar</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Status do Servidor */}
      {serverConfig && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${
            isRunning 
              ? 'bg-green-50 border-green-200' 
              : serverConfig.configured
                ? 'bg-blue-50 border-blue-200'
                : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Status do Servidor</h4>
              <p className="text-sm text-gray-600">
                {isRunning 
                  ? `🟢 Rodando na porta ${serverConfig.port}` 
                  : serverConfig.configured
                    ? `🟡 Configurado na porta ${serverConfig.port}`
                    : '🔴 Não configurado'
                }
              </p>
            </div>
            
            {isRunning && httpsUrl && (
              <a
                href={httpsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-white rounded-lg 
                  border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm">Testar HTTPS</span>
              </a>
            )}
          </div>
        </motion.div>
      )}

      {/* Código de Exemplo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Code className="w-6 h-6 text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-800">Código do Servidor HTTPS</h3>
        </div>
        
        <p className="text-gray-600 mb-4">
          Exemplo de como implementar um servidor HTTPS em Node.js usando os certificados gerados:
        </p>

        <SyntaxHighlighter
          language="javascript"
          style={tomorrow}
          customStyle={{
            margin: 0,
            borderRadius: '8px'
          }}
        >
          {serverCodeExample}
        </SyntaxHighlighter>
      </motion.div>

      {/* Informações de Segurança */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 rounded-xl p-6 border border-blue-200"
      >
        <h3 className="text-lg font-semibold text-blue-800 mb-3">🔒 Configurações de Segurança</h3>
        <div className="space-y-2 text-blue-700">
          <p>• <strong>TLS 1.2/1.3:</strong> Protocolos modernos e seguros</p>
          <p>• <strong>Ciphers seguros:</strong> ECDHE-RSA-AES256-GCM-SHA384</p>
          <p>• <strong>Perfect Forward Secrecy:</strong> Chaves de sessão únicas</p>
          <p>• <strong>HSTS:</strong> Force HTTPS em todas as conexões</p>
        </div>
      </motion.div>

      {/* Status de Conclusão */}
      {isRunning && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-green-50 rounded-xl p-6 border border-green-200"
        >
          <div className="inline-flex items-center space-x-3 text-green-700">
            <div className="p-2 bg-green-500 rounded-full">
              <Check className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Servidor HTTPS Ativo!</h3>
              <p className="text-sm">
                Seu servidor está rodando com SSL/TLS. Pronto para configurar o cliente!
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ServerConfiguration; 