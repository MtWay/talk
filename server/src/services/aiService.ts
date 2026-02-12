import OpenAI from 'openai';
import { config, styleTemplates } from '../config';
import type { ChatRequest, ChatResponse } from '../types';

class AIService {
  private client: OpenAI;
  private isMockMode: boolean;

  constructor() {
    this.isMockMode = !config.openai.apiKey || config.openai.apiKey === 'your_api_key_here';
    
    this.client = new OpenAI({
      apiKey: config.openai.apiKey,
      baseURL: config.openai.baseURL,
    });
  }

  async generateReply(request: ChatRequest): Promise<ChatResponse> {
    const { input, style = 'friendly' } = request;

    const styleTemplate = styleTemplates.find(s => s.id === style) || styleTemplates[1];

    // 如果没有配置 API Key，使用模拟模式
    if (this.isMockMode) {
      return this.generateMockReply(input, styleTemplate);
    }

    return this.generateAIReply(request, styleTemplate);
  }

  private generateMockReply(input: string, styleTemplate: typeof styleTemplates[0]): ChatResponse {
    // 模拟回复，根据风格生成不同的示例
    const mockReplies: Record<string, string[]> = {
      professional: [
        `感谢您的来信。关于您提到的"${input}"，我需要进一步了解情况后再给您详细回复。请稍等片刻。`,
        `收到您的消息了。关于"${input}"，我会在工作时间内尽快处理并回复您。`,
        `您好，我已记录您关于"${input}"的需求，稍后会有专人与您联系沟通具体事宜。`,
      ],
      friendly: [
        `哈哈，${input} 我也正想跟你说呢！咱们想到一块儿去了~`,
        `收到啦！${input} 我觉得挺好的，你觉得呢？`,
        `嗯嗯，${input} 我懂你的意思，就这么办吧！`,
      ],
      humorous: [
        `${input}？你这是要考验我的智商吗😄 让我想想怎么接这个梗...`,
        `哇，${input} 这个问题有点意思，我得先笑一会儿再回答你🤣`,
        `${input} 哈哈，你这是在给我出难题啊，不过我喜欢这个挑战！`,
      ],
      concise: [
        `收到，关于"${input}"，同意。`,
        `"${input}"已阅，稍后回复。`,
        `明白，就按"${input}"说的办。`,
      ],
      gentle: [
        `谢谢你的分享。关于"${input}"，我觉得可能还需要再考虑一下，你觉得呢？`,
        `我理解你的想法。不过"${input}"这件事，或许我们可以换个角度想想？`,
        `嗯，${input} 我明白你的意思。只是目前可能不太方便，希望你能理解。`,
      ],
      encouraging: [
        `${input} 你说得太对了！我相信你一定能做到的，加油！💪`,
        `听到你说"${input}"，我觉得你真的很棒！继续保持这个状态！`,
        `${input} 这个想法很好！我支持你，相信会有好结果的！`,
      ],
    };

    const replies = mockReplies[styleTemplate.id] || mockReplies.friendly;

    return {
      replies,
      style: styleTemplate.name,
      timestamp: Date.now(),
    };
  }

  private async generateAIReply(request: ChatRequest, styleTemplate: typeof styleTemplates[0]): Promise<ChatResponse> {
    const { input, context = [], scenario } = request;

    const systemPrompt = `你是一个智能沟通助手，帮助用户生成合适的回复内容。

当前选择的风格：${styleTemplate.name}
风格描述：${styleTemplate.prompt}
${scenario ? `对话场景：${scenario}` : ''}

要求：
1. 严格按照选定的风格生成回复
2. 回复要自然、得体，符合中文表达习惯
3. 提供2-3个不同的回复选项，让用户有选择空间
4. 每个回复选项前标注序号（1. 2. 3.）
5. 回复要贴合用户的实际情况和语境`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
    ];

    if (context.length > 0) {
      messages.push({
        role: 'user',
        content: `历史对话上下文：\n${context.join('\n')}`,
      });
    }

    messages.push({
      role: 'user',
      content: `请帮我回复以下内容，对方说："${input}"`,
    });

    try {
      const completion = await this.client.chat.completions.create({
        model: config.openai.model,
        messages,
        temperature: 0.8,
        max_tokens: 800,
      });

      const content = completion.choices[0]?.message?.content || '';
      const replies = this.parseReplies(content);

      return {
        replies,
        style: styleTemplate.name,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('生成回复失败，请检查API配置');
    }
  }

  private parseReplies(content: string): string[] {
    const lines = content.split('\n').filter(line => line.trim());
    const replies: string[] = [];

    for (const line of lines) {
      const match = line.match(/^\d+[.、.\s]+(.+)$/);
      if (match) {
        replies.push(match[1].trim());
      }
    }

    if (replies.length === 0) {
      const paragraphs = content.split('\n\n').filter(p => p.trim());
      return paragraphs.slice(0, 3).map(p => p.trim());
    }

    return replies.slice(0, 3);
  }
}

export const aiService = new AIService();
