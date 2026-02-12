export interface ChatRequest {
  input: string;
  context?: string[];
  style?: string;
  scenario?: string;
}

export interface ChatResponse {
  replies: string[];
  style: string;
  timestamp: number;
}

export interface StyleTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  style?: string;
  replies?: string[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}
