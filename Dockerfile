FROM node:20-alpine
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/app.js"]
