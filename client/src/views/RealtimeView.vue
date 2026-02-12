<template>
  <div class="realtime-container">
    <el-container class="realtime-layout">
      <el-header class="realtime-header">
        <div class="header-content">
          <div class="header-left">
            <el-button
              type="primary"
              text
              :icon="ArrowLeft"
              @click="$router.push('/')"
            >
              返回
            </el-button>
            <h1 class="app-title">
              <el-icon><Microphone /></el-icon>
              实时对话助手
            </h1>
          </div>
          <div class="header-actions">
            <el-select
              v-model="currentStyle"
              placeholder="风格"
              class="style-select"
              size="small"
            >
              <el-option
                v-for="style in styleOptions"
                :key="style.id"
                :label="style.name"
                :value="style.id"
              />
            </el-select>
            <el-button
              type="primary"
              :icon="Setting"
              circle
              size="small"
              @click="showSettings = true"
            />
          </div>
        </div>
      </el-header>

      <el-main class="realtime-main">
        <!-- 麦克风检测提示 -->
        <el-alert
          v-if="micCheckStatus === 'error'"
          :title="micCheckMessage"
          type="error"
          :closable="false"
          show-icon
          class="mic-alert"
        />
        <el-alert
          v-else-if="micCheckStatus === 'checking'"
          title="正在检测麦克风..."
          type="info"
          :closable="false"
          show-icon
          class="mic-alert"
        />

        <!-- 录音可视化区域 -->
        <div class="visualizer-section">
          <div class="recording-status" :class="{ active: isRecording }">
            <div class="pulse-ring"></div>
            <div class="pulse-ring"></div>
            <div class="pulse-ring"></div>
            <el-icon class="mic-icon" :size="48"><Microphone /></el-icon>
          </div>
          <canvas ref="visualizerCanvas" class="visualizer-canvas"></canvas>
          <div class="status-text">
            {{ statusText }}
          </div>
        </div>

        <!-- 对话内容区域 -->
        <div class="conversation-section">
          <!-- 对方说的话 -->
          <div v-if="lastTranscript" class="transcript-box">
            <div class="box-header">
              <el-icon><User /></el-icon>
              <span>对方说</span>
            </div>
            <div class="box-content">{{ lastTranscript }}</div>
          </div>

          <!-- AI 回复建议 -->
          <div v-if="aiReplies.length > 0" class="replies-box">
            <div class="box-header">
              <el-icon><ChatDotRound /></el-icon>
              <span>建议回复</span>
              <el-tag size="small" effect="plain" class="style-tag">
                {{ currentStyleName }}
              </el-tag>
            </div>
            <div class="replies-list">
              <div
                v-for="(reply, index) in aiReplies"
                :key="index"
                class="reply-item"
                @click="speakReply(reply)"
              >
                <div class="reply-number">{{ index + 1 }}</div>
                <div class="reply-text">{{ reply }}</div>
                <el-icon class="speak-icon"><VideoPlay /></el-icon>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="!lastTranscript && !isRecording" class="empty-tip">
            <el-icon :size="64"><Headset /></el-icon>
            <p>点击开始录音，对方说的话会实时识别并生成回复建议</p>
            <el-button type="primary" size="large" @click="startRecording">
              <el-icon><Microphone /></el-icon>
              开始录音
            </el-button>
          </div>
        </div>
      </el-main>

      <el-footer class="realtime-footer">
        <div class="control-bar">
          <el-button
            v-if="!isRecording"
            type="primary"
            size="large"
            class="control-btn"
            @click="startRecording"
          >
            <el-icon><Microphone /></el-icon>
            开始录音
          </el-button>
          <el-button
            v-else
            type="danger"
            size="large"
            class="control-btn"
            @click="stopRecording"
          >
            <el-icon><CircleClose /></el-icon>
            停止录音
          </el-button>

          <el-button
            type="info"
            size="large"
            class="control-btn"
            :disabled="!lastTranscript"
            @click="clearConversation"
          >
            <el-icon><Delete /></el-icon>
            清空
          </el-button>
        </div>

        <div class="settings-hint">
          <el-icon><InfoFilled /></el-icon>
          <span>建议佩戴耳机使用，回复会通过语音播放</span>
        </div>
      </el-footer>
    </el-container>

    <!-- 设置对话框 -->
    <el-dialog
      v-model="showSettings"
      title="设置"
      width="400px"
    >
      <el-form label-position="top">
        <el-form-item label="语音识别语言">
          <el-select v-model="recognitionLang" style="width: 100%">
            <el-option label="中文（简体）" value="zh-CN" />
            <el-option label="中文（繁体）" value="zh-TW" />
            <el-option label="英语" value="en-US" />
          </el-select>
        </el-form-item>

        <el-form-item label="语音播放速度">
          <el-slider v-model="speechRate" :min="0.5" :max="2" :step="0.1" show-stops />
        </el-form-item>

        <el-form-item label="自动播放回复">
          <el-switch v-model="autoSpeak" />
        </el-form-item>

        <el-form-item label="降噪级别">
          <el-radio-group v-model="noiseLevel">
            <el-radio-button label="low">低</el-radio-button>
            <el-radio-button label="medium">中</el-radio-button>
            <el-radio-button label="high">高</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import {
  Microphone,
  ArrowLeft,
  Setting,
  User,
  ChatDotRound,
  VideoPlay,
  Headset,
  CircleClose,
  Delete,
  InfoFilled,
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { chatApi } from '@/services/api';

// 状态
const isRecording = ref(false);
const lastTranscript = ref('');
const aiReplies = ref<string[]>([]);
const currentStyle = ref('friendly');
const micCheckStatus = ref<'idle' | 'checking' | 'ok' | 'error'>('idle');
const micCheckMessage = ref('');
const showSettings = ref(false);
const visualizerCanvas = ref<HTMLCanvasElement>();

// 设置
const recognitionLang = ref('zh-CN');
const speechRate = ref(1.2);
const autoSpeak = ref(true);
const noiseLevel = ref('medium');

// Web Speech API - 使用 any 类型避免类型检查问题
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let recognition: any = null;
let audioContext: AudioContext | null = null;
let mediaStream: MediaStream | null = null;
let analyser: AnalyserNode | null = null;
let animationId: number | null = null;

// 风格选项
const styleOptions = [
  { id: 'professional', name: '专业正式' },
  { id: 'friendly', name: '亲切友好' },
  { id: 'humorous', name: '幽默风趣' },
  { id: 'concise', name: '简洁直接' },
  { id: 'gentle', name: '委婉含蓄' },
  { id: 'encouraging', name: '鼓励支持' },
];

const currentStyleName = computed(() => {
  return styleOptions.find(s => s.id === currentStyle.value)?.name || '亲切友好';
});

const statusText = computed(() => {
  if (isRecording.value) {
    return '正在聆听对方说话...';
  }
  if (lastTranscript.value) {
    return '点击播放按钮听取回复建议';
  }
  return '准备就绪';
});

// 初始化语音识别
function initSpeechRecognition() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    ElMessage.error('您的浏览器不支持语音识别，请使用 Chrome 浏览器');
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return null;
  }
  const recog = new SpeechRecognition();

  recog.continuous = true;
  recog.interimResults = true;
  recog.lang = recognitionLang.value;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recog.onresult = (event: any) => {
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      }
    }

    if (finalTranscript) {
      lastTranscript.value = finalTranscript;
      generateReply(finalTranscript);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recog.onerror = (event: any) => {
    console.error('语音识别错误:', event.error);
    if (event.error === 'not-allowed') {
      ElMessage.error('请允许使用麦克风权限');
      stopRecording();
    }
  };

  recog.onend = () => {
    if (isRecording.value) {
      // 如果还在录音状态，自动重启识别
      recog.start();
    }
  };

  return recog;
}

// 检测浏览器环境
function getBrowserInfo(): { name: string; isSupported: boolean; issues: string[] } {
  const ua = navigator.userAgent;
  const issues: string[] = [];
  let name = '未知浏览器';

  // 识别浏览器
  if (ua.includes('Chrome')) {
    name = 'Chrome';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    name = 'Safari';
  } else if (ua.includes('Firefox')) {
    name = 'Firefox';
  } else if (ua.includes('Edge')) {
    name = 'Edge';
  } else if (ua.includes('WeChat') || ua.includes('MicroMessenger')) {
    name = '微信内置浏览器';
    issues.push('微信内置浏览器限制较多，建议使用系统浏览器');
  }

  // 检查是否 HTTPS
  if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    issues.push('当前使用 HTTP 连接，现代浏览器要求 HTTPS 才能访问麦克风');
  }

  // 检查 getUserMedia 支持
  if (!navigator.mediaDevices) {
    issues.push('浏览器不支持 mediaDevices API');
  } else if (!navigator.mediaDevices.getUserMedia) {
    issues.push('浏览器不支持 getUserMedia API');
  }

  // 检查是否 iOS
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  if (isIOS) {
    issues.push('iOS 设备必须在 Safari 浏览器中使用，且需要 HTTPS');
  }

  return {
    name,
    isSupported: issues.length === 0,
    issues
  };
}

// 检查麦克风权限和设备
async function checkMicrophonePermission(): Promise<{ granted: boolean; error?: string }> {
  // 先检查浏览器环境
  const browserInfo = getBrowserInfo();
  console.log('浏览器信息:', browserInfo);

  if (!browserInfo.isSupported) {
    return {
      granted: false,
      error: `${browserInfo.name} 不支持录音功能。${browserInfo.issues.join('；')}`
    };
  }

  try {
    // 尝试获取麦克风权限
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
    return { granted: true };
  } catch (err) {
    const error = err as Error;
    console.error('麦克风权限检查失败:', error.name, error.message);

    switch (error.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return { granted: false, error: '麦克风权限被拒绝，请在浏览器设置中允许访问麦克风' };
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return { granted: false, error: '未找到麦克风设备，请检查设备是否连接' };
      case 'NotReadableError':
      case 'TrackStartError':
        return { granted: false, error: '麦克风被其他应用占用，请关闭其他使用麦克风的应用' };
      default:
        return { granted: false, error: `无法访问麦克风: ${error.message}` };
    }
  }
}

// 开始录音
async function startRecording() {
  // 先检查权限
  const permission = await checkMicrophonePermission();
  if (!permission.granted) {
    ElMessage.error(permission.error || '无法访问麦克风');
    return;
  }

  try {
    // 请求麦克风权限
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      }
    });

    // 初始化音频可视化
    initAudioVisualizer();

    // 初始化语音识别
    recognition = initSpeechRecognition();
    if (recognition) {
      recognition.start();
      isRecording.value = true;
      ElMessage.success('开始录音');
    } else {
      ElMessage.error('语音识别初始化失败，请使用 Chrome 浏览器');
      stopRecording();
    }
  } catch (error) {
    console.error('启动录音失败:', error);
    const err = error as Error;
    ElMessage.error(`启动录音失败: ${err.message}`);
  }
}

// 停止录音
function stopRecording() {
  isRecording.value = false;

  if (recognition) {
    recognition.stop();
    recognition = null;
  }

  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }

  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }

  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  ElMessage.info('已停止录音');
}

// 初始化音频可视化
function initAudioVisualizer() {
  if (!visualizerCanvas.value || !mediaStream) return;

  audioContext = new AudioContext();
  analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaStreamSource(mediaStream);
  source.connect(analyser);

  analyser.fftSize = 256;

  const canvas = visualizerCanvas.value;
  const ctx = canvas.getContext('2d')!;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    if (!analyser || !canvas) return;

    animationId = requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = 'rgba(102, 126, 234, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const value = dataArray[i] ?? 0;
      barHeight = (value / 255) * canvas.height * 0.8;

      const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');

      ctx.fillStyle = gradient;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  }

  draw();
}

// 生成回复
async function generateReply(text: string) {
  try {
    const response = await chatApi.generateReply({
      input: text,
      style: currentStyle.value,
    });

    aiReplies.value = response.replies;

    // 自动播放第一个回复
    if (autoSpeak.value && response.replies.length > 0) {
      const firstReply = response.replies[0];
      if (firstReply) {
        setTimeout(() => {
          speakReply(firstReply);
        }, 500);
      }
    }
  } catch (error) {
    console.error('生成回复失败:', error);
    ElMessage.error('生成回复失败');
  }
}

// 语音播放回复
function speakReply(text: string) {
  if (!('speechSynthesis' in window)) {
    ElMessage.error('您的浏览器不支持语音合成');
    return;
  }

  // 取消之前的播放
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = speechRate.value;
  utterance.pitch = 1;

  // 尝试使用更好的中文语音
  const voices = window.speechSynthesis.getVoices();
  const chineseVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('CN'));
  if (chineseVoice) {
    utterance.voice = chineseVoice;
  }

  utterance.onstart = () => {
    ElMessage.info('正在播放回复建议...');
  };

  utterance.onerror = (event) => {
    console.error('语音播放错误:', event);
    ElMessage.error('语音播放失败');
  };

  window.speechSynthesis.speak(utterance);
}

// 清空对话
function clearConversation() {
  lastTranscript.value = '';
  aiReplies.value = [];
  ElMessage.success('已清空');
}

// 监听语言变化
watch(recognitionLang, (newLang) => {
  if (recognition) {
    recognition.lang = newLang;
  }
});

onMounted(async () => {
  // 预加载语音列表
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
  }

  // 设置 canvas 大小
  if (visualizerCanvas.value) {
    const canvas = visualizerCanvas.value;
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
  }

  // 检测麦克风
  micCheckStatus.value = 'checking';
  const result = await checkMicrophonePermission();
  if (result.granted) {
    micCheckStatus.value = 'ok';
  } else {
    micCheckStatus.value = 'error';
    micCheckMessage.value = result.error || '无法访问麦克风';
  }
});

onUnmounted(() => {
  stopRecording();
  window.speechSynthesis.cancel();
});
</script>

<style scoped>
.realtime-container {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 12px;
  box-sizing: border-box;
}

.realtime-layout {
  height: 100%;
  max-width: 600px;
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.realtime-header {
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
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.style-select {
  width: 120px;
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

.realtime-main {
  padding: 20px;
  background: #f5f7fa;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.mic-alert {
  margin-bottom: 0;
  flex-shrink: 0;
}

/* 可视化区域 */
.visualizer-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.recording-status {
  position: relative;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulse-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transform: scale(0.8);
}

.recording-status.active .pulse-ring {
  animation: pulse 2s ease-out infinite;
}

.recording-status.active .pulse-ring:nth-child(2) {
  animation-delay: 0.5s;
}

.recording-status.active .pulse-ring:nth-child(3) {
  animation-delay: 1s;
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.mic-icon {
  color: #667eea;
  z-index: 1;
}

.recording-status.active .mic-icon {
  color: #f56c6c;
}

.visualizer-canvas {
  width: 100%;
  height: 60px;
  border-radius: 8px;
}

.status-text {
  font-size: 14px;
  color: #909399;
  text-align: center;
}

/* 对话区域 */
.conversation-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.transcript-box,
.replies-box {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.box-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 500;
  color: #303133;
}

.box-content {
  color: #606266;
  line-height: 1.6;
  font-size: 15px;
}

.style-tag {
  margin-left: auto;
}

.replies-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reply-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.reply-item:hover {
  border-color: #667eea;
  background: #f0f2ff;
}

.reply-number {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.reply-text {
  flex: 1;
  line-height: 1.5;
  color: #303133;
}

.speak-icon {
  color: #909399;
  opacity: 0;
  transition: opacity 0.3s;
}

.reply-item:hover .speak-icon {
  opacity: 1;
  color: #667eea;
}

/* 空状态 */
.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #909399;
  gap: 16px;
}

.empty-tip p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
}

/* 底部控制栏 */
.realtime-footer {
  background: white;
  padding: 16px 20px;
  border-top: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.control-bar {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 12px;
}

.control-btn {
  padding: 12px 24px;
  font-size: 15px;
}

.settings-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: #909399;
}

/* 响应式 */
@media (max-width: 480px) {
  .realtime-container {
    padding: 0;
  }

  .realtime-layout {
    border-radius: 0;
    max-width: 100%;
  }

  .realtime-main {
    padding: 16px;
  }

  .visualizer-section {
    padding: 20px;
  }

  .recording-status {
    width: 80px;
    height: 80px;
  }

  .control-btn {
    padding: 10px 20px;
    font-size: 14px;
  }
}
</style>
