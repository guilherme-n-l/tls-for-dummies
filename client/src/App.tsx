import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Server, Users, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import StepNavigation from './components/StepNavigation';
import CertificateGeneration from './components/CertificateGeneration';
import ServerConfiguration from './components/ServerConfiguration';
import ClientConfiguration from './components/ClientConfiguration';
import ConnectionTest from './components/ConnectionTest';
import SecurityMaintenance from './components/SecurityMaintenance';
import Header from './components/Header';
import SecurityStatus from './components/SecurityStatus';
import { apiService, CertificateData, ServerConfig, ClientConfig } from './services/api';
import './App.css';

const steps = [
  {
    id: 1,
    title: 'Gerar Certificados',
    description: 'Criar CA, certificados do servidor e cliente',
    icon: Shield,
    component: CertificateGeneration
  },
  {
    id: 2,
    title: 'Configurar o Servidor',
    description: 'Configurar aplicação servidora com SSL',
    icon: Server,
    component: ServerConfiguration
  },
  {
    id: 3,
    title: 'Configurar o Cliente',
    description: 'Configurar aplicação cliente para SSL',
    icon: Users,
    component: ClientConfiguration
  },
  {
    id: 4,
    title: 'Testar a Conexão',
    description: 'Verificar handshake SSL e conectividade',
    icon: Lock,
    component: ConnectionTest
  },
  {
    id: 5,
    title: 'Manutenção e Segurança',
    description: 'Boas práticas e manutenção contínua',
    icon: CheckCircle,
    component: SecurityMaintenance
  }
];

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [stepData, setStepData] = useState<Record<number, any>>({});
  
  // Estados para status de segurança
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [serverConfig, setServerConfig] = useState<ServerConfig | null>(null);
  const [clientConfig, setClientConfig] = useState<ClientConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
    
    // Atualizar status a cada 5 segundos
    const interval = setInterval(loadInitialData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [certResponse, serverResponse, clientResponse] = await Promise.all([
        apiService.getCertificateStatus(),
        apiService.getServerStatus(),
        apiService.getClientStatus()
      ]);

      if (certResponse.success) {
        setCertificateData(certResponse.data!);
      }
      
      if (serverResponse.success) {
        setServerConfig(serverResponse.data!);
      }
      
      if (clientResponse.success) {
        setClientConfig(clientResponse.data!);
      }

      // Atualizar etapas completadas baseado no status
      const completed: number[] = [];
      if (certResponse.data?.created) completed.push(1);
      if (serverResponse.data?.configured) completed.push(2);
      if (clientResponse.data?.configured) completed.push(3);
      if (clientResponse.data?.connectionTested) completed.push(4);
      
      setCompletedSteps(completed);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepComplete = (stepId: number, data?: any) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    
    if (data) {
      setStepData((prev: Record<number, any>) => ({ ...prev, [stepId]: data }));
    }

    // Recarregar dados após completar uma etapa
    loadInitialData();

    // Automaticamente avançar para próxima etapa se não for a última
    if (stepId < steps.length) {
      setTimeout(() => {
        setCurrentStep(stepId + 1);
      }, 1500);
    }
  };

  const getCurrentComponent = () => {
    const step = steps.find(s => s.id === currentStep);
    if (!step) return null;

    const Component = step.component;
    return (
      <Component
        onComplete={(data?: any) => handleStepComplete(currentStep, data)}
        stepData={stepData[currentStep]}
        isCompleted={completedSteps.includes(currentStep)}
        certificateData={certificateData}
        serverConfig={serverConfig}
        clientConfig={clientConfig}
        onDataUpdate={loadInitialData}
      />
    );
  };

  // Determinar se o site está seguro
  const isSecure = apiService.isCurrentlySecure();
  const isServerRunning = serverConfig?.status === 'running';
  const certificatesGenerated = certificateData?.created || false;
  const currentUrl = apiService.getCurrentUrl();

  if (isLoading && !certificateData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Carregando dados do sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Status de Segurança */}
          <SecurityStatus
            isSecure={isSecure}
            isServerRunning={isServerRunning}
            certificatesGenerated={certificatesGenerated}
            currentUrl={currentUrl}
          />

          {/* Título Principal */}
          <div className="text-center mb-12">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              TLS para Leigos
            </motion.h1>
            <motion.p 
              className="text-xl text-blue-100 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Aprenda como transformar um site inseguro em seguro usando certificados SSL/TLS reais
            </motion.p>
            
            {/* Demonstração de diferença HTTP vs HTTPS */}
            {isServerRunning && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6 p-4 bg-white/10 backdrop-blur rounded-xl"
              >
                <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                  <div className="text-center">
                    <div className="p-3 bg-red-500/20 rounded-lg mb-2">
                      <AlertCircle className="w-6 h-6 text-red-300 mx-auto" />
                    </div>
                    <p className="text-sm text-red-200">HTTP (Atual)</p>
                    <p className="text-xs text-red-300 font-mono">{currentUrl}</p>
                  </div>
                  
                  <div className="text-white">
                    <span className="text-2xl">→</span>
                  </div>
                  
                  <div className="text-center">
                    <div className="p-3 bg-green-500/20 rounded-lg mb-2">
                      <Lock className="w-6 h-6 text-green-300 mx-auto" />
                    </div>
                    <p className="text-sm text-green-200">HTTPS (Disponível)</p>
                    <a 
                      href={apiService.getHttpsUrl(serverConfig?.port)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-300 font-mono hover:underline"
                    >
                      {apiService.getHttpsUrl(serverConfig?.port)}
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Erro, se houver */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800">{error}</span>
                <button
                  onClick={loadInitialData}
                  className="ml-auto p-1 text-red-600 hover:text-red-800"
                  title="Tentar novamente"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Navegação das Etapas */}
          <StepNavigation
            steps={steps}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={setCurrentStep}
          />

          {/* Conteúdo da Etapa Atual */}
          <div className="mt-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-2xl p-8 min-h-[600px]"
              >
                {getCurrentComponent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progresso Global */}
          <motion.div 
            className="mt-8 bg-white/10 backdrop-blur rounded-xl p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-between text-white mb-2">
              <span className="font-medium">Progresso de Segurança</span>
              <span className="text-sm">
                {completedSteps.length} de {steps.length} etapas concluídas
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            
            {completedSteps.length === steps.length && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center text-green-300"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">
                  🎉 Parabéns! Seu site agora está seguro com SSL/TLS!
                </span>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default App;
