import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { chatApi, stylesApi } from '@/services/api';
import type { Message, StyleTemplate, ChatRequest } from '@/types';

export const useChatStore = defineStore('chat', () => {
  const messages = ref<Message[]>([]);
  const styles = ref<StyleTemplate[]>([]);
  const currentStyle = ref<string>('friendly');
  const loading = ref(false);
  const error = ref<string | null>(null);

  const currentStyleName = computed(() => {
    const style = styles.value.find(s => s.id === currentStyle.value);
    return style?.name || '亲切友好';
  });

  async function loadStyles() {
    try {
      styles.value = await stylesApi.getStyles();
    } catch (err) {
      console.error('加载风格模板失败:', err);
    }
  }

  async function sendMessage(input: string, scenario?: string) {
    if (!input.trim()) return;

    loading.value = true;
    error.value = null;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    messages.value.push(userMessage);

    try {
      const context = messages.value
        .slice(-6)
        .map(m => `${m.role === 'user' ? '用户' : '助手'}: ${m.content}`);

      const request: ChatRequest = {
        input: input.trim(),
        context,
        style: currentStyle.value,
        scenario,
      };

      const response = await chatApi.generateReply(request);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.replies.join('\n\n'),
        timestamp: response.timestamp,
        style: response.style,
        replies: response.replies,
      };

      messages.value.push(assistantMessage);
    } catch (err) {
      error.value = err instanceof Error ? err.message : '发送消息失败';
      console.error('发送消息失败:', err);
    } finally {
      loading.value = false;
    }
  }

  function setStyle(styleId: string) {
    currentStyle.value = styleId;
  }

  function clearMessages() {
    messages.value = [];
  }

  return {
    messages,
    styles,
    currentStyle,
    loading,
    error,
    currentStyleName,
    loadStyles,
    sendMessage,
    setStyle,
    clearMessages,
  };
});
