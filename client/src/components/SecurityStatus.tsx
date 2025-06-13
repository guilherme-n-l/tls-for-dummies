import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldAlert, Lock, Unlock, Globe, Server } from 'lucide-react';

interface SecurityStatusProps {
  isSecure: boolean;
  isServerRunning: boolean;
  certificatesGenerated: boolean;
  currentUrl: string;
}

const SecurityStatus: React.FC<SecurityStatusProps> = ({
  isSecure,
  isServerRunning,
  certificatesGenerated,
  currentUrl
}) => {
  const getSecurityIcon = () => {
    if (isSecure && isServerRunning) {
      return <Lock className="w-6 h-6 text-green-600" />;
    }
    return <Unlock className="w-6 h-6 text-red-500" />;
  };

  const getSecurityColor = () => {
    if (isSecure && isServerRunning) return 'from-green-500 to-green-600';
    return 'from-red-500 to-red-600';
  };

  const getSecurityMessage = () => {
    if (isSecure && isServerRunning) {
      return {
        title: 'Conexão Segura',
        description: 'Este site está protegido por certificados SSL/TLS',
        status: 'secure'
      };
    }
    if (certificatesGenerated && !isServerRunning) {
      return {
        title: 'Servidor HTTPS Parado',
        description: 'Certificados gerados, mas servidor HTTPS não está rodando',
        status: 'warning'
      };
    }
    return {
      title: 'Conexão Não Segura',
      description: 'Este site não está protegido por SSL/TLS',
      status: 'insecure'
    };
  };

  const security = getSecurityMessage();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className={`bg-gradient-to-r ${getSecurityColor()} rounded-lg p-4 text-white shadow-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              {getSecurityIcon()}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{security.title}</h3>
              <p className="text-sm opacity-90">{security.description}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-1">
              <Globe className="w-4 h-4" />
              <span className="text-sm font-mono">{currentUrl}</span>
            </div>
            {isServerRunning && (
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4" />
                <span className="text-xs">Servidor HTTPS Ativo</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Barra de progresso visual */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span>Status de Segurança</span>
            <span>
              {isSecure && isServerRunning ? '100%' : certificatesGenerated ? '75%' : '0%'} Seguro
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div
              className="bg-white h-2 rounded-full"
              initial={{ width: '0%' }}
              animate={{ 
                width: isSecure && isServerRunning ? '100%' : 
                       certificatesGenerated ? '75%' : '0%' 
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
      
      {/* Mensagens específicas */}
      {!certificatesGenerated && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Para tornar este site seguro, você precisa gerar certificados SSL/TLS primeiro.
            </span>
          </div>
        </motion.div>
      )}
      
      {certificatesGenerated && !isServerRunning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              Certificados prontos! Configure e inicie o servidor HTTPS para ativar a segurança.
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SecurityStatus; 