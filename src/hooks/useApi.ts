import { useAuth } from '@/contexts/AuthContext';

const API_URL = (import.meta.env.VITE_API_URL || 'https://teste-back-catalogo-ener.exf0ty.easypanel.host').replace(/\/$/, '');

export const useApi = () => {
  const { token, logout } = useAuth();

  const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      logout();
      throw new Error('Sessão expirada');
    }

    return response;
  };

  const uploadFile = async (file: File): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (response.status === 401) {
      logout();
      throw new Error('Sessão expirada');
    }

    if (!response.ok) {
      throw new Error('Erro ao fazer upload');
    }

    return response.json();
  };

  return { fetchWithAuth, uploadFile, API_URL };
};
