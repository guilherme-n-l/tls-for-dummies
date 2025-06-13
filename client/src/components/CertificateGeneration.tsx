import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Server, User, Play, Check, Copy, Terminal, Download, AlertCircle } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { apiService, CertificateData, ServerConfig, ClientConfig } from '../services/api';

interface StepProps {
  onComplete: (data?: any) => void;
  stepData?: any;
  isCompleted: boolean;
  certificateData?: CertificateData | null;
  serverConfig?: ServerConfig | null;
  clientConfig?: ClientConfig | null;
  onDataUpdate?: () => Promise<void>;
}

const CertificateGeneration: React.FC<StepProps> = ({ 
  onComplete, 
  isCompleted, 
  certificateData: propCertificateData,
  onDataUpdate 
}) => {
  const [certificates, setCertificates] = useState<CertificateData | null>(propCertificateData || null);
  const [currentGeneration, setCurrentGeneration] = useState<string | null>(null);
  const [showCommands, setShowCommands] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [installInstructions, setInstallInstructions] = useState<any>(null);

  useEffect(() => {
    if (propCertificateData) {
      setCertificates(propCertificateData);
    } else {
      fetchCertificateStatus();
    }
  }, [propCertificateData]);

  useEffect(() => {
    fetchInstallInstructions();
  }, []);

  const fetchCertificateStatus = async () => {
    try {
      const response = await apiService.getCertificateStatus();
      if (response.success) {
        setCertificates(response.data!);
      } else {
        setError(response.error || 'Erro ao buscar status dos certificados');
      }
    } catch (error) {
      console.error('Erro ao buscar status dos certificados:', error);
      setError('Erro ao buscar status dos certificados');
    }
  };

  const fetchInstallInstructions = async () => {
    try {
      const response = await apiService.getInstallInstructions();
      if (response.success) {
        setInstallInstructions(response.data);
      }
    } catch (error) {
      console.error('Erro ao buscar instruções:', error);
    }
  };

  const generateCertificate = async (type: 'ca' | 'server' | 'client') => {
    setCurrentGeneration(type);
    setError(null);
    
    try {
      const response = await apiService.generateCertificate(type);
      
      if (response.success) {
        setCertificates(response.data!);
        
        // Atualizar dados no componente pai
        if (onDataUpdate) {
          await onDataUpdate();
        }
        
        // Se todos os certificados foram criados, marcar como completo
        if (response.data!.created) {
          setTimeout(() => onComplete(response.data), 1000);
        }
      } else {
        setError(response.error || `Erro ao gerar certificado ${type}`);
      }
    } catch (error) {
      console.error(`Erro ao gerar certificado ${type}:`, error);
      setError(`Erro ao gerar certificado ${type}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setCurrentGeneration(null);
    }
  };

  const downloadCACertificate = async () => {
    try {
      await apiService.downloadCACertificate();
    } catch (error) {
      console.error('Erro ao baixar certificado CA:', error);
      setError('Erro ao baixar certificado CA');
    }
  };

  const copyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
  };

  const certificateTypes = [
    {
      id: 'ca',
      title: 'Autoridade Certificadora (CA)',
      icon: Shield,
      description: 'Cria uma CA raiz que assinará os outros certificados',
      color: 'from-purple-500 to-purple-600',
      data: certificates?.ca,
      canGenerate: true
    },
    {
      id: 'server',
      title: 'Certificado do Servidor',
      icon: Server,
      description: 'Certificado para a aplicação servidora HTTPS',
      color: 'from-blue-500 to-blue-600',
      data: certificates?.server,
      canGenerate: certificates?.ca !== null
    },
    {
      id: 'client',
      title: 'Certificado do Cliente',
      icon: User,
      description: 'Certificado para autenticação mútua (opcional)',
      color: 'from-green-500 to-green-600',
      data: certificates?.client,
      canGenerate: certificates?.ca !== null
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
          <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Gerar Certificados</h2>
            <p className="text-gray-600">Etapa 1: Criando a infraestrutura PKI real</p>
          </div>
        </motion.div>
        
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Vamos criar certificados SSL/TLS reais usando OpenSSL. Estes certificados 
          serão utilizados para transformar seu site HTTP em HTTPS.
        </p>
      </div>

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

      {/* Cards de Certificados */}
      <div className="grid md:grid-cols-3 gap-6">
        {certificateTypes.map((certType, index) => {
          const IconComponent = certType.icon;
          const isGenerated = certType.data !== null;
          const isGenerating = currentGeneration === certType.id;
          const canGenerate = certType.canGenerate;
          
          return (
            <motion.div
              key={certType.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                relative bg-white border-2 rounded-xl p-6 transition-all duration-300
                certificate-card hover:shadow-xl
                ${isGenerated 
                  ? 'border-green-300 bg-green-50' 
                  : canGenerate 
                    ? 'border-gray-200 hover:border-blue-300'
                    : 'border-gray-100 bg-gray-50'
                }
              `}
            >
              {/* Status Badge */}
              {isGenerated && (
                <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-2">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Icon */}
              <div className={`
                w-16 h-16 rounded-xl flex items-center justify-center mb-4 mx-auto
                bg-gradient-to-r ${certType.color}
                ${!canGenerate ? 'opacity-50' : ''}
              `}>
                <IconComponent className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
                {certType.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4 text-center">
                {certType.description}
              </p>

              {/* Certificate Info */}
              {isGenerated && certType.data && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-white rounded-lg p-3 mb-4 border"
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">CN:</span>
                      <span className="font-mono">{certType.data.commonName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Algoritmo:</span>
                      <span className="font-mono">{certType.data.algorithm}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Chave:</span>
                      <span className="font-mono">{certType.data.keySize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Validade:</span>
                      <span className="font-mono">{certType.data.validity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Criado:</span>
                      <span className="font-mono text-xs">
                        {new Date(certType.data.created).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Generate Button */}
              <button
                onClick={() => generateCertificate(certType.id as 'ca' | 'server' | 'client')}
                disabled={isGenerated || isGenerating || !canGenerate}
                className={`
                  w-full py-3 px-4 rounded-lg font-medium transition-all duration-300
                  flex items-center justify-center space-x-2
                  ${isGenerated
                    ? 'bg-green-100 text-green-800 cursor-default'
                    : !canGenerate
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isGenerating
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                  }
                `}
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-800 border-t-transparent rounded-full animate-spin" />
                    <span>Gerando...</span>
                  </>
                ) : isGenerated ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Gerado</span>
                  </>
                ) : !canGenerate ? (
                  <>
                    <span>Requer CA</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Gerar</span>
                  </>
                )}
              </button>
              
              {/* Download CA Button */}
              {certType.id === 'ca' && isGenerated && (
                <button
                  onClick={downloadCACertificate}
                  className="w-full mt-2 py-2 px-4 rounded-lg font-medium transition-all duration-300
                    bg-purple-100 text-purple-800 hover:bg-purple-200 flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar CA</span>
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Comandos Executados */}
      {certificates && certificates.steps && certificates.steps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <Terminal className="w-5 h-5" />
              <span>Comandos OpenSSL Executados</span>
            </h3>
            <button
              onClick={() => setShowCommands(!showCommands)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showCommands ? 'Ocultar' : 'Mostrar'} Comandos
            </button>
          </div>

          <AnimatePresence>
            {showCommands && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                {certificates.steps.map((step, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">
                        Etapa {step.step}: {step.description}
                      </span>
                      <button
                        onClick={() => copyCommand(step.command)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Copiar comando"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <SyntaxHighlighter
                      language="bash"
                      style={tomorrow}
                      customStyle={{
                        margin: 0,
                        padding: '12px',
                        fontSize: '12px',
                        borderRadius: '6px'
                      }}
                    >
                      {step.command}
                    </SyntaxHighlighter>
                    {step.executed && (
                      <div className="mt-2 flex items-center text-green-600 text-sm">
                        <Check className="w-4 h-4 mr-1" />
                        Executado com sucesso
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Instruções de Instalação do CA */}
      {certificates?.ca && installInstructions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 rounded-xl p-6 border border-blue-200"
        >
          <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Como Instalar o Certificado CA</span>
          </h3>
          
          <p className="text-blue-700 mb-4">
            Para remover os avisos de segurança do navegador, instale o certificado CA no seu sistema:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">🪟 Windows</h4>
              <ol className="text-sm text-gray-600 space-y-1">
                {installInstructions.windows?.map((instruction: string, index: number) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">🍎 macOS</h4>
              <ol className="text-sm text-gray-600 space-y-1">
                {installInstructions.macos?.map((instruction: string, index: number) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>
          </div>

          <div className="mt-4 bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">🌐 Navegador (Método Rápido)</h4>
            <ol className="text-sm text-gray-600 space-y-1">
              {installInstructions.browser?.map((instruction: string, index: number) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </div>
        </motion.div>
      )}

      {/* Status Summary */}
      {certificates && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className={`
            inline-flex items-center space-x-2 px-6 py-3 rounded-full
            ${certificates.created 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
            }
          `}>
            {certificates.created ? (
              <>
                <Check className="w-5 h-5" />
                <span className="font-medium">
                  Todos os certificados foram gerados com sucesso!
                </span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span className="font-medium">
                  {certificates.ca ? 'Continue gerando os certificados restantes' : 'Comece gerando o certificado CA'}
                </span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CertificateGeneration;