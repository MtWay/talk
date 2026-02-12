import express from 'express';
import cors from 'cors';
import { config } from './config';
import chatRouter from './routes/chat';
import stylesRouter from './routes/styles';

const app = express();

// 允许所有来源访问（开发环境）
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());

app.use('/api/chat', chatRouter);
app.use('/api/styles', stylesRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 监听所有网络接口
const port = typeof config.port === 'string' ? parseInt(config.port, 10) : config.port;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`📍 Local:   http://localhost:${port}/api`);
  console.log(`📍 Network: http://0.0.0.0:${port}/api`);
});
