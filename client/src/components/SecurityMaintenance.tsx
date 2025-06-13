import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Check, X, AlertTriangle, Shield, Calendar, Key, Lock } from 'lucide-react';
import axios from 'axios';

interface StepProps {
  onComplete: (data?: any) => void;
  stepData?: any;
  isCompleted: boolean;
}

interface ChecklistItem {
  id: number;
  category: string;
  item: string;
  status: 'pending' | 'completed' | 'warning';
  description: string;
}

const SecurityMaintenance: React.FC<StepProps> = ({ onComplete, isCompleted }) => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [completedItems, setCompletedItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSecurityChecklist();
  }, []);

  const fetchSecurityChecklist = async () => {
    try {
      const response = await axios.get('/api/security/checklist');
      setChecklist(response.data);
      setCompletedItems(response.data.filter((item: ChecklistItem) => item.status === 'completed').length);
    } catch (error) {
      console.error('Erro ao buscar checklist de segurança:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateItemStatus = async (id: number, status: 'completed' | 'pending') => {
    try {
      await axios.post(`/api/security/checklist/${id}`, { status });
      
      setChecklist(prev => prev.map(item => 
        item.id === id ? { ...item, status } : item
      ));
      
      const newCompletedCount = checklist.filter(item => 
        item.id === id ? status === 'completed' : item.status === 'completed'
      ).length;
      
      setCompletedItems(newCompletedCount);
      
      // Se todos os itens estão completos, marcar a etapa como concluída
      if (newCompletedCount === checklist.length) {
        setTimeout(() => onComplete({ completedAll: true }), 1000);
      }
    } catch (error) {
      console.error(`Erro ao atualizar item ${id}:`, error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <X className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'certificados':
        return <Shield className="w-6 h-6 text-blue-600" />;
      case 'protocolos':
        return <Lock className="w-6 h-6 text-purple-600" />;
      case 'chaves':
        return <Key className="w-6 h-6 text-green-600" />;
      default:
        return <CheckCircle className="w-6 h-6 text-gray-600" />;
    }
  };

  const bestPractices = [
    {
      title: 'Monitoramento Contínuo',
      description: 'Implemente logs detalhados e monitoramento de conexões SSL',
      icon: '📊',
      tips: [
        'Monitore certificados próximos ao vencimento',
        'Rastreie tentativas de conexão mal-sucedidas',
        'Configure alertas para protocolos inseguros',
        'Analise periodicamente cipher suites utilizadas'
      ]
    },
    {
      title: 'Renovação Automática',
      description: 'Configure renovação automática de certificados',
      icon: '🔄',
      tips: [
        'Use Let\'s Encrypt para certificados gratuitos',
        'Implemente scripts de renovação automática',
        'Configure backups dos certificados',
        'Teste o processo de renovação regularmente'
      ]
    },
    {
      title: 'Configuração Segura',
      description: 'Mantenha configurações SSL/TLS atualizadas',
      icon: '⚙️',
      tips: [
        'Desabilite protocolos obsoletos (SSLv3, TLS 1.0)',
        'Use apenas cipher suites seguras',
        'Implemente Perfect Forward Secrecy',
        'Configure HSTS (HTTP Strict Transport Security)'
      ]
    },
    {
      title: 'Testes Regulares',
      description: 'Execute testes de segurança periodicamente',
      icon: '🧪',
      tips: [
        'Use ferramentas como SSL Labs Test',
        'Execute varreduras de vulnerabilidade',
        'Teste diferentes navegadores e clientes',
        'Valide configurações após mudanças'
      ]
    }
  ];

  const securityTools = [
    {
      name: 'SSL Labs SSL Test',
      url: 'https://www.ssllabs.com/ssltest/',
      description: 'Teste abrangente de configuração SSL'
    },
    {
      name: 'OpenSSL',
      url: 'https://www.openssl.org/',
      description: 'Ferramenta de linha de comando para SSL/TLS'
    },
    {
      name: 'Let\'s Encrypt',
      url: 'https://letsencrypt.org/',
      description: 'Certificados SSL gratuitos e automatizados'
    },
    {
      name: 'Mozilla SSL Configuration',
      url: 'https://ssl-config.mozilla.org/',
      description: 'Gerador de configurações SSL seguras'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading-spinner w-8 h-8" />
        <span className="ml-3 text-gray-600">Carregando checklist de segurança...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center space-x-3 mb-4"
        >
          <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Manutenção e Segurança</h2>
            <p className="text-gray-600">Etapa 5: Boas práticas e manutenção contínua</p>
          </div>
        </motion.div>
        
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Mantenha seu ambiente SSL/TLS seguro e atualizado seguindo as melhores
          práticas de segurança e monitoramento contínuo.
        </p>
      </div>

      {/* Progresso do Checklist */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Checklist de Segurança</h3>
          <span className="text-sm text-gray-600">
            {completedItems} de {checklist.length} completos
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
          <motion.div
            className="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(completedItems / checklist.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="grid gap-4">
          {checklist.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`border rounded-lg p-4 transition-all duration-300 ${getStatusColor(item.status)}`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getCategoryIcon(item.category)}
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {item.category}
                      </span>
                      <h4 className="text-lg font-medium text-gray-800">{item.item}</h4>
                    </div>
                    
                    <button
                      onClick={() => updateItemStatus(
                        item.id, 
                        item.status === 'completed' ? 'pending' : 'completed'
                      )}
                      className={`
                        p-2 rounded-lg transition-colors duration-200
                        ${item.status === 'completed'
                          ? 'bg-green-100 hover:bg-green-200'
                          : 'bg-gray-100 hover:bg-gray-200'
                        }
                      `}
                    >
                      {getStatusIcon(item.status)}
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Boas Práticas */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-800 text-center">
          Boas Práticas de Segurança
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {bestPractices.map((practice, index) => (
            <motion.div
              key={practice.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-xl p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-2xl">{practice.icon}</span>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">{practice.title}</h4>
                  <p className="text-sm text-gray-600">{practice.description}</p>
                </div>
              </div>
              
              <ul className="space-y-2">
                {practice.tips.map((tip, tipIndex) => (
                  <li key={tipIndex} className="flex items-start space-x-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Ferramentas Recomendadas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500"
      >
        <h3 className="text-lg font-semibold text-blue-800 mb-4">🛠️ Ferramentas Recomendadas</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          {securityTools.map((tool, index) => (
            <div key={index} className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-1">{tool.name}</h4>
              <p className="text-sm text-gray-600 mb-2">{tool.description}</p>
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Acessar →
              </a>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Cronograma de Manutenção */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-purple-50 rounded-xl p-6 border-l-4 border-purple-500"
      >
        <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Cronograma de Manutenção
        </h3>
        
        <div className="space-y-3 text-purple-700">
          <div className="flex items-center space-x-3">
            <span className="font-medium">Diário:</span>
            <span className="text-sm">Verificar logs de erro SSL</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="font-medium">Semanal:</span>
            <span className="text-sm">Executar testes de conectividade</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="font-medium">Mensal:</span>
            <span className="text-sm">Verificar datas de expiração de certificados</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="font-medium">Trimestral:</span>
            <span className="text-sm">Atualizar configurações de segurança</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="font-medium">Anual:</span>
            <span className="text-sm">Auditoria completa de segurança SSL</span>
          </div>
        </div>
      </motion.div>

      {/* Status de Conclusão */}
      {completedItems === checklist.length && (
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
              <h3 className="text-lg font-semibold">Parabéns! Você completou o TLS para Leigos!</h3>
              <p className="text-sm">
                Agora você conhece todo o processo de configuração SSL/TLS e 
                suas melhores práticas de segurança.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SecurityMaintenance; 