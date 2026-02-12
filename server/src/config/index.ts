import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    baseURL: process.env.OPENAI_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: process.env.OPENAI_MODEL || 'qwen-turbo',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
};

export const styleTemplates = [
  {
    id: 'professional',
    name: '专业正式',
    description: '适合工作场合，用词规范、礼貌',
    prompt: '使用专业、正式的语言风格，保持礼貌和尊重，适合商务沟通和工作场合',
  },
  {
    id: 'friendly',
    name: '亲切友好',
    description: '适合朋友交流，温暖自然',
    prompt: '使用亲切、友好的语言风格，像好朋友一样自然交流，温暖真诚',
  },
  {
    id: 'humorous',
    name: '幽默风趣',
    description: '轻松愉快，带有幽默感',
    prompt: '使用幽默、风趣的语言风格，适当加入轻松有趣的元素，让人会心一笑',
  },
  {
    id: 'concise',
    name: '简洁直接',
    description: '言简意赅，不拖泥带水',
    prompt: '使用简洁、直接的语言风格，直击要点，不绕弯子，高效传达信息',
  },
  {
    id: 'gentle',
    name: '委婉含蓄',
    description: '适合敏感话题，委婉表达',
    prompt: '使用委婉、含蓄的语言风格，考虑对方感受，柔和地表达观点或拒绝',
  },
  {
    id: 'encouraging',
    name: '鼓励支持',
    description: '积极向上，给予力量',
    prompt: '使用鼓励、支持的语言风格，积极向上，给予对方力量和信心',
  },
];
