# 智能沟通助手

一个基于 Vue3 + Node.js 的智能对话辅助应用，帮助用户在不同场景下生成合适的回复内容。

## 功能特性

- 🤖 **AI 智能回复** - 基于大语言模型生成合适的回复建议
- 🎨 **多种风格** - 支持专业正式、亲切友好、幽默风趣、简洁直接、委婉含蓄、鼓励支持等多种风格
- 💬 **对话界面** - 清晰直观的聊天式交互界面
- 📋 **一键复制** - 点击回复选项即可复制到剪贴板
- ⚡ **实时响应** - 快速生成多个回复选项供选择

## 技术栈

### 前端
- Vue 3 + TypeScript
- Vite
- Pinia (状态管理)
- Vue Router
- Element Plus (UI组件库)
- Axios

### 后端
- Node.js + Express
- TypeScript
- OpenAI API
- CORS

## 项目结构

```
talk/
├── client/          # 前端项目
│   ├── src/
│   │   ├── views/        # 页面组件
│   │   ├── stores/       # Pinia状态管理
│   │   ├── services/     # API服务
│   │   └── types/        # 类型定义
│   └── package.json
├── server/          # 后端项目
│   ├── src/
│   │   ├── routes/       # 路由
│   │   ├── services/     # 业务服务
│   │   ├── types/        # 类型定义
│   │   └── config/       # 配置文件
│   └── package.json
└── README.md
```

## 快速开始

### 1. 克隆项目

```bash
cd talk
```

### 2. 配置环境变量

后端配置：
```bash
cd server
cp .env.example .env
# 编辑 .env 文件，填入你的 OpenAI API Key
```

### 3. 安装依赖

```bash
# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install
```

### 4. 启动服务

```bash
# 启动后端服务 (端口 3000)
cd server
npm run dev

# 启动前端服务 (端口 5173)
cd client
npm run dev
```

### 5. 访问应用

打开浏览器访问 http://localhost:5173

## 使用说明

1. **输入内容** - 在输入框中输入对方说的话或描述场景
2. **选择风格** - 从顶部下拉菜单选择想要的回复风格
3. **获取建议** - 点击发送，AI 会生成 2-3 个回复选项
4. **复制使用** - 点击任意回复选项即可复制到剪贴板

## API 配置

本项目默认使用 OpenAI API，你也可以配置其他兼容 OpenAI API 格式的大模型服务：

```env
OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-3.5-turbo
```

支持的其他服务：
- Azure OpenAI
- 文心一言
- 通义千问
- 智谱 AI
- 本地部署的模型（如 Ollama）

## 开发计划

- [x] 基础对话功能
- [x] 多种风格选择
- [x] 对话历史记录
- [ ] 语音输入（录音）
- [ ] 语音输出（朗读）
- [ ] 对话导出
- [ ] 用户偏好设置

## 许可证

MIT
