const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface CertificateData {
  created: boolean;
  ca: any;
  server: any;
  client: any;
  steps: Array<{
    step: number;
    command: string;
    description: string;
    executed?: boolean;
  }>;
}

interface ServerConfig {
  configured: boolean;
  port: number;
  status: 'stopped' | 'configured' | 'running';
}

interface ClientConfig {
  configured: boolean;
  connectionTested: boolean;
  lastTest: any;
}

interface ConnectionTestResult {
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
    authorized: boolean;
    expiresIn: string;
  };
  performance: {
    handshakeTime: string;
    totalTime: string;
  };
  responseStatus: number;
  responseData: any;
}

interface SecurityChecklistItem {
  id: number;
  category: string;
  item: string;
  status: 'pending' | 'completed';
  description: string;
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Certificados
  async getCertificateStatus(): Promise<ApiResponse<CertificateData>> {
    return this.makeRequest<CertificateData>('/api/certificates/status');
  }

  async generateCertificate(type: 'ca' | 'server' | 'client'): Promise<ApiResponse<CertificateData>> {
    return this.makeRequest<CertificateData>('/api/certificates/generate', {
      method: 'POST',
      body: JSON.stringify({ type })
    });
  }

  async downloadCACertificate(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/certificates/download/ca`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ca-cert.pem';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erro ao baixar certificado CA:', error);
    }
  }

  async getInstallInstructions(): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/certificates/install-instructions');
  }

  // Servidor
  async getServerStatus(): Promise<ApiResponse<ServerConfig>> {
    return this.makeRequest<ServerConfig>('/api/server/status');
  }

  async configureServer(port: number = 8443): Promise<ApiResponse<ServerConfig>> {
    return this.makeRequest<ServerConfig>('/api/server/configure', {
      method: 'POST',
      body: JSON.stringify({ port })
    });
  }

  async startServer(): Promise<ApiResponse<ServerConfig & { url?: string }>> {
    return this.makeRequest<ServerConfig & { url?: string }>('/api/server/start', {
      method: 'POST'
    });
  }

  async stopServer(): Promise<ApiResponse<ServerConfig>> {
    return this.makeRequest<ServerConfig>('/api/server/stop', {
      method: 'POST'
    });
  }

  // Cliente
  async getClientStatus(): Promise<ApiResponse<ClientConfig>> {
    return this.makeRequest<ClientConfig>('/api/client/status');
  }

  async configureClient(): Promise<ApiResponse<ClientConfig>> {
    return this.makeRequest<ClientConfig>('/api/client/configure', {
      method: 'POST'
    });
  }

  // Teste de Conexão
  async testConnection(): Promise<ApiResponse<{ result: ConnectionTestResult }>> {
    return this.makeRequest<{ result: ConnectionTestResult }>('/api/connection/test', {
      method: 'POST'
    });
  }

  // Segurança
  async getSecurityChecklist(): Promise<ApiResponse<SecurityChecklistItem[]>> {
    return this.makeRequest<SecurityChecklistItem[]>('/api/security/checklist');
  }

  async updateChecklistItem(
    id: number, 
    status: 'pending' | 'completed'
  ): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/api/security/checklist/${id}`, {
      method: 'POST',
      body: JSON.stringify({ status })
    });
  }

  // Utilitários
  getCurrentUrl(): string {
    return window.location.origin;
  }

  getHttpsUrl(port: number = 8443): string {
    return `https://localhost:${port}`;
  }

  isCurrentlySecure(): boolean {
    return window.location.protocol === 'https:';
  }

  async checkServerHealth(url: string): Promise<boolean> {
    try {
      const response = await fetch(`${url}/api/secure-test`, {
        method: 'GET',
        mode: 'cors'
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
export type { 
  CertificateData, 
  ServerConfig, 
  ClientConfig, 
  ConnectionTestResult, 
  SecurityChecklistItem,
  ApiResponse 
}; 