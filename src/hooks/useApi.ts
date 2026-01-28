import { useAuth } from '@/contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://teste-back-catalogo-ener.exf0ty.easypanel.host';

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

  return { fetchWithAuth, API_URL };
};
