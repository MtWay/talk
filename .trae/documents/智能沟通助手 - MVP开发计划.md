## 项目概述
构建一个基于 Vue3 + Node.js 的智能沟通助手应用，帮助用户在不同场景下生成合适的回复内容。

## 技术栈
- **前端**: Vue3 + TypeScript + Vite + Pinia + Element Plus
- **后端**: Node.js + Express + TypeScript
- **AI服务**: OpenAI API / Claude API / 国产大模型

## 项目结构
```
talk/
├── client/          # 前端项目
│   ├── src/
│   │   ├── components/   # 组件
│   │   ├── views/        # 页面
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

## 开发阶段

### 阶段1: 项目初始化
1. 使用 Vite 创建 Vue3 + TypeScript 前端项目
2. 创建 Node.js + Express + TypeScript 后端项目
3. 配置 ESLint、Prettier、路径别名
4. 安装必要依赖

### 阶段2: 前端开发
1. 配置 Vue Router 和 Pinia
2. 创建主页面布局
3. 实现对话界面组件
4. 实现风格选择器
5. 创建 API 服务层

### 阶段3: 后端开发
1. 配置 Express 和中间件
2. 实现 AI 服务封装
3. 创建对话 API 接口
4. 实现风格模板配置

### 阶段4: 功能集成
1. 前后端联调
2. 实现对话历史记录
3. 添加加载状态和错误处理
4. UI优化

## 核心功能
1. **文字输入** - 用户输入想要回复的场景或内容
2. **AI生成** - 调用大模型生成合适回复
3. **风格选择** - 专业/友好/幽默/简洁/委婉等风格
4. **对话历史** - 本地存储历史记录

## 确认事项
- 使用 OpenAI API 作为 AI 服务（需要 API Key）
- 对话历史存储在浏览器本地
- 先实现文字版本，语音功能后续添加

确认后开始执行？