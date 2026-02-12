<template>
  <div class="home-container">
    <el-container class="chat-layout">
      <el-header class="chat-header">
        <div class="header-content">
          <h1 class="app-title">
            <el-icon><ChatDotRound /></el-icon>
            <span class="title-text">智能沟通助手</span>
          </h1>
          <div class="header-actions">
            <el-button
              type="success"
              :icon="Microphone"
              @click="$router.push('/realtime')"
            >
              实时对话
            </el-button>
            <el-select
              v-model="chatStore.currentStyle"
              placeholder="选择风格"
              class="style-select"
              @change="handleStyleChange"
            >
              <el-option
                v-for="style in chatStore.styles"
                :key="style.id"
                :label="style.name"
                :value="style.id"
              >
                <div class="style-option">
                  <span class="style-name">{{ style.name }}</span>
                  <span class="style-desc">{{ style.description }}</span>
                </div>
              </el-option>
            </el-select>
            <el-button
              type="danger"
              plain
              :icon="Delete"
              class="clear-btn"
              @click="handleClear"
            >
              清空
            </el-button>
          </div>
        </div>
      </el-header>

      <el-main class="chat-main">
        <div class="messages-container" ref="messagesContainer">
          <div v-if="chatStore.messages.length === 0" class="empty-state">
            <el-icon class="empty-icon"><ChatLineRound /></el-icon>
            <h3>开始你的对话</h3>
            <p>输入对方说的话，AI 会帮你生成合适的回复</p>
            <div class="quick-tips">
              <el-tag
                v-for="tip in quickTips"
                :key="tip"
                class="tip-tag"
                effect="plain"
                @click="inputText = tip"
              >
                {{ tip }}
              </el-tag>
            </div>
          </div>

          <template v-else>
            <div
              v-for="message in chatStore.messages"
              :key="message.id"
              :class="['message-wrapper', message.role]"
            >
              <div class="message-content">
                <div class="message-header">
                  <el-avatar
                    :size="32"
                    :icon="message.role === 'user' ? User : ChatDotRound"
                    :class="message.role"
                  />
                  <span class="message-role">
                    {{ message.role === 'user' ? '对方说' : 'AI建议' }}
                  </span>
                  <span v-if="message.style" class="message-style">
                    <el-tag size="small" effect="plain">{{ message.style }}</el-tag>
                  </span>
                </div>

                <div class="message-body">
                  <template v-if="message.role === 'assistant' && message.replies">
                    <div
                      v-for="(reply, index) in message.replies"
                      :key="index"
                      class="reply-option"
                      @click="copyToClipboard(reply)"
                    >
                      <div class="reply-number">{{ index + 1 }}</div>
                      <div class="reply-text">{{ reply }}</div>
                      <el-icon class="copy-icon"><CopyDocument /></el-icon>
                    </div>
                  </template>
                  <template v-else>
                    {{ message.content }}
                  </template>
                </div>

                <div class="message-time">
                  {{ formatTime(message.timestamp) }}
                </div>
              </div>
            </div>
          </template>

          <div v-if="chatStore.loading" class="loading-indicator">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>AI 正在思考...</span>
          </div>
        </div>
      </el-main>

      <el-footer class="chat-footer">
        <div class="input-area">
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="3"
            placeholder="输入对方说的话，按 Enter 发送，Shift + Enter 换行..."
            resize="none"
            @keydown.enter.prevent="handleEnter"
          />
          <div class="input-actions">
            <el-button
              type="primary"
              size="large"
              :icon="Promotion"
              :loading="chatStore.loading"
              :disabled="!inputText.trim()"
              class="send-btn"
              @click="handleSend"
            >
              发送
            </el-button>
          </div>
        </div>
      </el-footer>
    </el-container>

    <el-alert
      v-if="chatStore.error"
      :title="chatStore.error"
      type="error"
      closable
      class="error-alert"
      @close="chatStore.error = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import { useChatStore } from '@/stores/chat';
import {
  ChatDotRound,
  ChatLineRound,
  User,
  Delete,
  Promotion,
  CopyDocument,
  Loading,
  Microphone,
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const chatStore = useChatStore();
const inputText = ref('');
const messagesContainer = ref<HTMLElement>();

const quickTips = [
  '帮我拒绝一个聚会邀请',
  '我想向老板请假',
  '回复朋友的好消息',
  '委婉地表达不同意见',
];

onMounted(() => {
  chatStore.loadStyles();
});

watch(
  () => chatStore.messages.length,
  () => {
    nextTick(() => {
      scrollToBottom();
    });
  }
);

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

function handleEnter(e: KeyboardEvent) {
  if (!e.shiftKey) {
    handleSend();
  }
}

async function handleSend() {
  if (!inputText.value.trim() || chatStore.loading) return;

  const text = inputText.value;
  inputText.value = '';
  await chatStore.sendMessage(text);
}

function handleStyleChange() {
  ElMessage.success(`已切换到「${chatStore.currentStyleName}」风格`);
}

async function handleClear() {
  try {
    await ElMessageBox.confirm('确定要清空所有对话记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    chatStore.clearMessages();
    ElMessage.success('对话已清空');
  } catch {
    // 用户取消
  }
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    ElMessage.success('已复制到剪贴板');
  } catch {
    ElMessage.error('复制失败');
  }
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<style scoped>
.home-container {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 12px;
  box-sizing: border-box;
}

.chat-layout {
  height: 100%;
  max-width: 900px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chat-header {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0 16px;
  height: auto;
  min-height: 56px;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  min-height: 56px;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 0;
}

.app-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.style-select {
  width: 130px;
}

:deep(.style-select .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.2);
  border: none;
}

:deep(.style-select .el-input__inner) {
  color: white;
}

:deep(.style-select .el-input__icon) {
  color: white;
}

.style-option {
  display: flex;
  flex-direction: column;
  padding: 4px 0;
}

.style-name {
  font-weight: 500;
}

.style-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.clear-btn {
  padding: 8px 12px;
}

.chat-main {
  padding: 0;
  background: #f5f7fa;
  overflow: hidden;
  flex: 1;
  min-height: 0;
}

.messages-container {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
  box-sizing: border-box;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  text-align: center;
  padding: 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #c0c4cc;
}

.empty-state h3 {
  margin: 0 0 8px;
  color: #606266;
  font-size: 16px;
}

.empty-state p {
  margin: 0 0 16px;
  font-size: 13px;
}

.quick-tips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  max-width: 100%;
}

.tip-tag {
  cursor: pointer;
  transition: all 0.3s;
  font-size: 12px;
}

.tip-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.message-wrapper {
  margin-bottom: 16px;
  display: flex;
}

.message-wrapper.user {
  justify-content: flex-start;
}

.message-wrapper.assistant {
  justify-content: flex-end;
}

.message-content {
  max-width: 90%;
  background: white;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.message-wrapper.assistant .message-content {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border: 1px solid #667eea20;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.message-header .el-avatar {
  background: #667eea;
}

.message-header .el-avatar.user {
  background: #909399;
}

.message-role {
  font-weight: 500;
  color: #303133;
  font-size: 13px;
}

.message-style {
  margin-left: auto;
}

.message-body {
  color: #606266;
  line-height: 1.6;
  font-size: 14px;
}

.reply-option {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  margin-bottom: 8px;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid transparent;
}

.reply-option:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.reply-number {
  width: 22px;
  height: 22px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.reply-text {
  flex: 1;
  line-height: 1.5;
  font-size: 13px;
}

.copy-icon {
  color: #909399;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 14px;
}

.reply-option:hover .copy-icon {
  opacity: 1;
}

.message-time {
  margin-top: 6px;
  font-size: 11px;
  color: #c0c4cc;
  text-align: right;
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  color: #909399;
  font-size: 13px;
}

.chat-footer {
  background: white;
  padding: 12px 16px;
  border-top: 1px solid #e4e7ed;
  flex-shrink: 0;
  height: auto;
}

.input-area {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.input-area .el-textarea {
  flex: 1;
}

.input-actions {
  display: flex;
  gap: 8px;
}

.send-btn {
  padding: 12px 20px;
  height: auto;
}

.error-alert {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  max-width: 90%;
  width: 400px;
}

:deep(.el-textarea__inner) {
  border-radius: 8px;
  resize: none;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

:deep(.el-button--primary:hover) {
  opacity: 0.9;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .home-container {
    padding: 0;
  }

  .chat-layout {
    border-radius: 0;
    max-width: 100%;
  }

  .app-title .title-text {
    display: none;
  }

  .header-content {
    padding: 4px 0;
  }

  .style-select {
    width: 110px;
  }

  .clear-btn .el-button__text,
  .send-btn .el-button__text {
    display: none;
  }

  .message-content {
    max-width: 95%;
  }

  .messages-container {
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .chat-header {
    padding: 0 12px;
  }

  .header-actions {
    gap: 6px;
  }

  .style-select {
    width: 100px;
  }

  .chat-footer {
    padding: 10px 12px;
  }

  .input-area {
    gap: 8px;
  }

  .send-btn {
    padding: 10px 14px;
  }
}

/* 小屏幕但不太小的设备 */
@media (min-width: 481px) and (max-width: 768px) {
  .clear-btn .el-button__text,
  .send-btn .el-button__text {
    display: inline;
  }
}
</style>
