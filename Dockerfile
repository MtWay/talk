# 使用 Node.js 官方镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY server/package*.json ./server/

# 安装依赖
RUN cd server && npm install

# 复制源代码
COPY server/ ./server/

# 构建 TypeScript
RUN cd server && npm run build

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "server/dist/app.js"]
