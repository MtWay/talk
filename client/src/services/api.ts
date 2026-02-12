import axios from 'axios';
import type { ChatRequest, ChatResponse, StyleTemplate } from '@/types';

// 动态获取 API 地址
// 如果是通过 IP 访问，使用相同 IP 和端口 3000
// 如果是 localhost，使用 localhost:3000
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 获取当前页面 host
  const { hostname, protocol } = window.location;

  // 如果是 localhost 或 127.0.0.1，使用 localhost:3000
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3000/api';
  }

  // 否则使用相同的 host，端口改为 3000
  return `${protocol}//${hostname}:3000/api`;
};

const API_BASE_URL = getApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatApi = {
  async generateReply(request: ChatRequest): Promise<ChatResponse> {
    const response = await apiClient.post<ChatResponse>('/chat', request);
    return response.data;
  },
};

export const stylesApi = {
  async getStyles(): Promise<StyleTemplate[]> {
    const response = await apiClient.get<StyleTemplate[]>('/styles');
    return response.data;
  },
};

export default apiClient;
