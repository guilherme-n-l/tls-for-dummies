# TLS para Leigos 🔐

Uma ferramenta educativa e interativa para aprender SSL/TLS através de uma experiência hands-on completa.

## 📚 Sobre o Projeto

**TLS para Leigos** é uma aplicação web que ensina como configurar duas aplicações para se comunicarem usando SSL/TLS de forma segura. A ferramenta guia você através de 5 etapas essenciais:

1. **🛡️ Gerar Certificados** - Criação de CA e certificados para servidor e cliente
2. **⚙️ Configurar o Servidor** - Setup de aplicação servidora com HTTPS
3. **👥 Configurar o Cliente** - Configuração de clientes SSL seguros
4. **🔍 Testar a Conexão** - Validação do handshake SSL e conectividade
5. **✅ Manutenção e Segurança** - Boas práticas e monitoramento contínuo

## 🚀 Funcionalidades

- ✨ Interface interativa e educativa
- 🎯 Simulação de geração de certificados OpenSSL
- 📊 Visualização de detalhes do handshake TLS
- 💻 Exemplos de código em múltiplas linguagens
- 🔧 Checklist de segurança interativo
- 📱 Design responsivo e moderno
- 🎨 Animações suaves com Framer Motion

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** com TypeScript
- **Tailwind CSS** para estilização
- **Framer Motion** para animações
- **Lucide React** para ícones
- **React Syntax Highlighter** para código
- **Axios** para requisições HTTP

### Backend
- **Node.js** com Express
- **CORS** para cross-origin requests
- **Helmet** para segurança
- APIs simuladas para demonstração SSL/TLS

## 📦 Instalação

### Pré-requisitos
- Node.js 16+ 
- npm ou yarn

### 1. Clone o repositório
```bash
git clone https://github.com/yourusername/tls-for-dummies.git
cd tls-for-dummies
```

### 2. Instale as dependências
```bash
# Instalar dependências de todos os projetos
npm run install-all

# Ou instalar separadamente:
npm install                    # Dependências raiz
cd server && npm install       # Dependências do backend
cd ../client && npm install    # Dependências do frontend
```

### 3. Execute o projeto
```bash
# Executar frontend e backend simultaneamente
npm run dev

# Ou executar separadamente:
npm run server   # Backend na porta 5000
npm run client   # Frontend na porta 3000
```

### 4. Acesse a aplicação
Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🎯 Como Usar

1. **Inicie na Etapa 1** - Clique em "Gerar Certificados" para começar
2. **Siga as Etapas** - Navegue sequencialmente pelas 5 etapas
3. **Interaja com o Conteúdo** - Clique nos botões para simular ações
4. **Aprenda com Exemplos** - Copie códigos e comandos mostrados
5. **Complete o Checklist** - Marque itens de segurança como concluídos

## 📖 Estrutura do Projeto

```
tls-for-dummies/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   │   ├── Header.tsx
│   │   │   ├── StepNavigation.tsx
│   │   │   ├── CertificateGeneration.tsx
│   │   │   ├── ServerConfiguration.tsx
│   │   │   ├── ClientConfiguration.tsx
│   │   │   ├── ConnectionTest.tsx
│   │   │   └── SecurityMaintenance.tsx
│   │   ├── App.tsx         # Componente principal
│   │   ├── index.tsx       # Ponto de entrada
│   │   └── index.css       # Estilos globais
│   ├── public/             # Arquivos públicos
│   └── package.json        # Dependências frontend
├── server/                 # Backend Node.js
│   ├── index.js            # Servidor Express
│   └── package.json        # Dependências backend
├── package.json            # Scripts principais
└── README.md               # Este arquivo
```

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Executar frontend + backend
npm run server       # Executar apenas backend
npm run client       # Executar apenas frontend  
npm run build        # Build do frontend
npm run install-all  # Instalar todas dependências
```

## 🎨 Conceitos Aprendidos

Após completar todas as etapas, você terá aprendido:

- **PKI (Public Key Infrastructure)** - Como funcionam CAs e certificados
- **Criptografia Assimétrica** - Chaves públicas/privadas e assinaturas
- **Protocolo TLS** - Handshake, cipher suites e versões
- **Configuração HTTPS** - Server e client SSL setup
- **Validação de Certificados** - Chain of trust e verificações
- **Mutual TLS** - Autenticação bidirecional
- **Boas Práticas SSL** - Segurança e manutenção

## 🔐 Funcionalidades de Segurança

A aplicação demonstra:

- ✅ Geração segura de certificados
- ✅ Configuração adequada de cipher suites  
- ✅ Validação de cadeia de certificados
- ✅ Verificação de hostname/CN
- ✅ Perfect Forward Secrecy
- ✅ HSTS (HTTP Strict Transport Security)
- ✅ Monitoramento e logs de segurança

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Reconhecimentos

- [OpenSSL](https://www.openssl.org/) - Biblioteca de criptografia
- [Let's Encrypt](https://letsencrypt.org/) - Certificados SSL gratuitos
- [Mozilla SSL Configuration](https://ssl-config.mozilla.org/) - Configurações seguras
- [SSL Labs](https://www.ssllabs.com/) - Ferramentas de teste SSL

## 🐛 Reportar Problemas

Encontrou um bug? [Abra uma issue](https://github.com/yourusername/tls-for-dummies/issues/new)

## 📧 Contato

- **Autor**: Seu Nome
- **Email**: seu.email@example.com
- **LinkedIn**: [Seu LinkedIn](https://linkedin.com/in/seuperfil)

---

⭐ **Gostou do projeto? Não esqueça de dar uma estrela!** ⭐ 