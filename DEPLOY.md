# 部署指南

## 方案: Railway 全栈部署（推荐 ⭐）

Railway 提供免费额度，不需要信用卡，部署简单。

### 1. 准备工作

- 注册 [Railway](https://railway.app) 账号（用 GitHub 登录）
- 确保代码已推送到 GitHub

### 2. 部署后端服务

1. 访问 [railway.app](https://railway.app)
2. 点击 **"New Project"**
3. 选择 **"Deploy from GitHub repo"**
4. 选择你的仓库 `MtWay/talk`
5. 点击 **"Add Variables"** 添加环境变量：
   ```
   OPENAI_API_KEY=sk-3db040068eb3452aacf7a453327f2e80
   OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
   OPENAI_MODEL=qwen-turbo
   CORS_ORIGIN=*
   ```
6. 点击 **"Deploy"**
7. 等待部署完成（约 2-3 分钟）

### 3. 获取后端地址

部署完成后：
1. 点击服务名称
2. 在 **"Settings"** → **"Public Networking"** 中生成域名
3. 复制域名，例如：`https://talk-server-production.up.railway.app`
4. 后端 API 地址为：`https://talk-server-production.up.railway.app/api`

### 4. 部署前端服务

1. 在同一个 Railway 项目中，点击 **"Create Service"**
2. 选择 **"Empty Service"** → 改名为 `talk-client`
3. 点击 **"Settings"** → **"Source"**
4. 选择 **"GitHub Repo"** → 选择 `MtWay/talk`
5. 配置：
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s dist -l $PORT`
6. 添加环境变量：
   ```
   VITE_API_BASE_URL=https://talk-server-production.up.railway.app/api
   ```
7. 点击 **"Deploy"**

### 5. 生成前端域名

1. 点击前端服务
2. **"Settings"** → **"Public Networking"**
3. 点击 **"Generate Domain"**
4. 获得前端地址，例如：`https://talk-client-production.up.railway.app`

### 6. 完成！

- 前端: `https://talk-client-production.up.railway.app`
- 后端: `https://talk-server-production.up.railway.app/api`

手机可以直接访问前端地址使用！

---

## 备选方案

### 方案 2: Vercel + Railway 后端
- 前端部署到 Vercel（更快）
- 后端使用 Railway

### 方案 3: Cloudflare Tunnel（当前方案）
- 后端: `https://slight-gmc-encryption-yoga.trycloudflare.com/api`
- 前端: 需要单独部署

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
