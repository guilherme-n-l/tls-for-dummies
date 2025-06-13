import React from 'react';
import { Shield, Github, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const Header: React.FC = () => {
  return (
    <motion.header 
      className="bg-white/10 backdrop-blur-md border-b border-white/20"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg ssl-lock">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">TLS para Leigos</h1>
              <p className="text-sm text-blue-100">Ferramenta Educativa SSL/TLS</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/yourusername/tls-for-dummies"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-white hover:text-blue-200 transition-colors"
              title="Ver no GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="/docs"
              className="p-2 text-white hover:text-blue-200 transition-colors"
              title="Documentação"
            >
              <BookOpen className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header; 