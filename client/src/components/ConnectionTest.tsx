import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Play, Check, AlertCircle, Clock, Shield } from 'lucide-react';
import axios from 'axios';

interface StepProps {
  onComplete: (data?: any) => void;
  stepData?: any;
  isCompleted: boolean;
}

interface TestResult {
  success: boolean;
  timestamp: string;
  handshake: {
    protocol: string;
    cipher: string;
    keyExchange: string;
    authentication: string;
    encryption: string;
    mac: string;
  };
  certificate: {
    subject: string;
    issuer: string;
    valid: boolean;
    expiresIn: string;
  };
  performance: {
    handshakeTime: string;
    totalTime: string;
  };
}

const ConnectionTest: React.FC<StepProps> = ({ onComplete, isCompleted }) => {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runConnectionTest = async () => {
    setIsTesting(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/connection/test');
      setTestResult(response.data.result);
      setTimeout(() => onComplete(response.data.result), 1500);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao testar conexão');
    } finally {
      setIsTesting(false);
    }
  };

  const getProtocolColor = (protocol: string) => {
    switch (protocol) {
      case 'TLSv1.3': return 'text-green-600';
      case 'TLSv1.2': return 'text-blue-600';
      default: return 'text-orange-600';
    }
  };

  const getSecurityLevel = (cipher: string) => {
    if (cipher.includes('AES-256-GCM')) return { level: 'Alto', color: 'text-green-600' };
    if (cipher.includes('AES-128-GCM')) return { level: 'Médio', color: 'text-blue-600' };
    return { level: 'Baixo', color: 'text-orange-600' };
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center space-x-3 mb-4"
        >
          <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Testar a Conexão</h2>
            <p className="text-gray-600">Etapa 4: Verificando handshake SSL e conectividade</p>
          </div>
        </motion.div>
        
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Teste a conexão SSL entre cliente e servidor, validando o handshake,
          certificados e verificando a segurança da comunicação estabelecida.
        </p>
      </div>

      {/* Botão de Teste */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.button
          onClick={runConnectionTest}
          disabled={isTesting}
          className={`
            py-4 px-8 rounded-xl font-medium text-lg transition-all duration-300
            flex items-center justify-center space-x-3 mx-auto
            ${isTesting
              ? 'bg-orange-500 text-white cursor-wait'
              : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
            }
          `}
          whileHover={!isTesting ? { scale: 1.05 } : {}}
          whileTap={!isTesting ? { scale: 0.95 } : {}}
        >
          {isTesting ? (
            <>
              <div className="loading-spinner w-6 h-6" />
              <span>Testando Conexão SSL...</span>
            </>
          ) : (
            <>
              <Play className="w-6 h-6" />
              <span>Iniciar Teste de Conexão</span>
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-200 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 text-red-700">
            <AlertCircle className="w-6 h-6" />
            <div>
              <h3 className="text-lg font-semibold">Erro no Teste</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading Animation */}
      {isTesting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-8"
        >
          <div className="text-center">
            <div className="inline-flex items-center space-x-4 mb-4">
              <div className="loading-spinner w-8 h-8 border-4" />
              <span className="text-lg font-medium text-blue-700">
                Estabelecendo conexão SSL...
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-blue-600">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                ✓ Iniciando handshake TLS
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
              >
                ✓ Validando certificado do servidor
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                ✓ Negociando cipher suite
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Test Results */}
      {testResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Success Header */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 text-green-700 mb-4">
              <div className="p-2 bg-green-500 rounded-full">
                <Check className="w-6 h-6 text-white checkmark" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Conexão SSL Estabelecida!</h3>
                <p className="text-sm">Teste realizado em {new Date(testResult.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Handshake Details */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-500" />
              Detalhes do Handshake
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Protocolo</div>
                <div className={`text-lg font-semibold ${getProtocolColor(testResult.handshake.protocol)}`}>
                  {testResult.handshake.protocol}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Cipher Suite</div>
                <div className="text-sm font-mono text-gray-800">
                  {testResult.handshake.cipher}
                </div>
                <div className={`text-xs ${getSecurityLevel(testResult.handshake.cipher).color}`}>
                  Segurança: {getSecurityLevel(testResult.handshake.cipher).level}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Troca de Chaves</div>
                <div className="text-lg font-semibold text-purple-600">
                  {testResult.handshake.keyExchange}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Autenticação</div>
                <div className="text-lg font-semibold text-indigo-600">
                  {testResult.handshake.authentication}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Criptografia</div>
                <div className="text-lg font-semibold text-green-600">
                  {testResult.handshake.encryption}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">MAC</div>
                <div className="text-lg font-semibold text-orange-600">
                  {testResult.handshake.mac}
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Info */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Informações do Certificado
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Sujeito:</span>
                    <div className="font-mono text-sm bg-gray-50 p-2 rounded">
                      {testResult.certificate.subject}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-500">Emissor:</span>
                    <div className="font-mono text-sm bg-gray-50 p-2 rounded">
                      {testResult.certificate.issuer}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Status do Certificado:</span>
                  <span className="flex items-center text-green-600">
                    <Check className="w-4 h-4 mr-1" />
                    Válido
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Expira em:</span>
                  <span className="text-blue-600 font-semibold">
                    {testResult.certificate.expiresIn}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-orange-500" />
              Performance
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {testResult.performance.handshakeTime}
                </div>
                <div className="text-sm text-orange-600">Tempo do Handshake</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {testResult.performance.totalTime}
                </div>
                <div className="text-sm text-blue-600">Tempo Total</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Educational Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-indigo-50 rounded-xl p-6 border-l-4 border-indigo-500"
      >
        <h3 className="text-lg font-semibold text-indigo-800 mb-3">🔍 O que estamos verificando?</h3>
        <div className="space-y-2 text-indigo-700">
          <p>• <strong>Handshake TLS:</strong> Processo de negociação e estabelecimento da conexão segura</p>
          <p>• <strong>Cipher Suite:</strong> Algoritmos de criptografia, autenticação e integridade usados</p>
          <p>• <strong>Certificado:</strong> Validação da identidade do servidor e cadeia de confiança</p>
          <p>• <strong>Performance:</strong> Tempo necessário para estabelecer a conexão segura</p>
          <p>• <strong>Protocolo:</strong> Versão do TLS/SSL sendo utilizada (TLS 1.3 é o mais seguro)</p>
        </div>
      </motion.div>

      {/* Success State */}
      {testResult?.success && (
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
              <h3 className="text-lg font-semibold">Teste de Conexão Concluído!</h3>
              <p className="text-sm">A comunicação SSL está funcionando perfeitamente</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ConnectionTest; 