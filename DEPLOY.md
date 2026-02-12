# 部署指南

## 方案: Render 全栈部署

### 1. 准备工作

- 注册 [Render](https://render.com) 账号（免费）
- 将代码推送到 GitHub/GitLab

### 2. 部署步骤

#### 后端部署

1. 在 Render Dashboard 点击 "New +" → "Web Service"
2. 连接你的 Git 仓库
3. 配置如下:
   - **Name**: talk-server
   - **Runtime**: Node
   - **Build Command**: `cd server && npm install && npm run build`
   - **Start Command**: `cd server && npm start`
4. 添加环境变量:
   - `OPENAI_API_KEY`: 你的阿里通义千问 API Key
   - `OPENAI_BASE_URL`: `https://dashscope.aliyuncs.com/compatible-mode/v1`
   - `OPENAI_MODEL`: `qwen-turbo`
   - `CORS_ORIGIN`: `*` (或你的前端域名)
5. 点击 "Create Web Service"

#### 前端部署

1. 在 Render Dashboard 点击 "New +" → "Static Site"
2. 连接同一个 Git 仓库
3. 配置如下:
   - **Name**: talk-client
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/dist`
4. 添加环境变量:
   - `VITE_API_BASE_URL`: `https://talk-server-xxxxx.onrender.com/api` (你的后端地址)
5. 点击 "Create Static Site"

### 3. 访问应用

- 前端: `https://talk-client-xxxxx.onrender.com`
- 后端: `https://talk-server-xxxxx.onrender.com/api`

### 4. 注意事项

- Render 免费版有休眠机制，首次访问可能需要等待 30 秒唤醒
- 确保后端先部署完成，再部署前端
- 前端环境变量需要在构建时设置

---

## 备选方案: Railway

Railway 部署步骤类似，也支持 `render.yaml` 配置文件一键部署。

1. 注册 [Railway](https://railway.app)
2. 导入 Git 仓库
3. 自动识别 `render.yaml` 配置
4. 添加环境变量
5. 部署完成

---

## 本地开发

```bash
# 启动后端
cd server
npm install
npm run dev

# 启动前端
cd client
npm install
npm run dev
```

访问: http://localhost:5173
