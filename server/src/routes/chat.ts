import { Router } from 'express';
import { aiService } from '../services/aiService';
import type { ChatRequest } from '../types';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { input, context, style, scenario }: ChatRequest = req.body;

    if (!input || input.trim() === '') {
      return res.status(400).json({ error: '输入内容不能为空' });
    }

    const response = await aiService.generateReply({
      input: input.trim(),
      context,
      style,
      scenario,
    });

    res.json(response);
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : '服务器内部错误',
    });
  }
});

export default router;
