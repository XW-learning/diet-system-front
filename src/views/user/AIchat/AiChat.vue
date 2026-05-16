<template>
    <div class="chat-container">
        <header class="chat-header">
            <div class="back-btn" @click="goBack">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="#333" stroke-width="2" fill="none"
                    stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </div>
            <h1 class="header-title">AI 健康助手</h1>
            <div class="header-right">
                <button class="summary-trigger" @click="toggleSummaries">📋</button>
                <button class="clear-trigger" @click="clearMessages" title="清除聊天记录">🗑</button>
            </div>
        </header>

        <main class="chat-main" ref="messagesContainer">
            <div v-for="msg in messages" :key="msg.id"
                :class="['message-wrapper', msg.role === 'user' ? 'is-user' : 'is-ai']">
                <div class="avatar ai-avatar" v-if="msg.role === 'ai'">
                    🤖
                </div>

                <div class="message-bubble">
                    <span v-if="msg.role === 'user'">{{ msg.content }}</span>
                    <span v-else v-html="formatAIContent(msg.content)"></span>
                </div>

                <div class="avatar user-avatar" v-if="msg.role === 'user'">
                    <img src="@/assets/avatar.jpg" alt="User" class="avatar-img" />
                </div>
            </div>

            <div class="message-wrapper is-ai" v-if="isTyping">
                <div class="avatar ai-avatar">🤖</div>
                <div class="message-bubble typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            </div>
        </main>

        <footer class="chat-footer">
            <div class="input-wrapper">
                <input type="text" v-model="inputText" @keyup.enter="sendMessage" placeholder="问问AI关于减脂、饮食的建议..."
                    class="chat-input" :disabled="isTyping" />
                <button class="send-btn" :class="{ 'is-active': inputText.trim().length > 0 }" @click="sendMessage"
                    :disabled="isTyping || !inputText.trim()">
                    发送
                </button>
            </div>
        </footer>

        <SummaryDrawer :visible="showSummaries" :summaries="summaries" @close="showSummaries = false" />
    </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted, onActivated, watch } from 'vue';
import { useRouter } from 'vue-router';
import { streamChat, loadHistory, saveMessages, loadSummaries, clearHistory, type ChatSummaryVO } from '@/api/ai';
import SummaryDrawer from '@/components/aichat/SummaryDrawer.vue';

const router = useRouter();

interface Message {
    id: number;
    role: 'user' | 'ai';
    content: string;
}

// ── 消息数据 ──
let msgIdCounter = 0;
const nextMsgId = () => ++msgIdCounter;

// ── AI 内容排版美化 (修复样式穿透版) ──
function formatAIContent(text: string): string {
    if (!text) return '';

    let formatted = text
        // 1. 基础 HTML 字符转义 (防止 XSS)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // 2. 强制结构展开：针对 AI 把内容全挤在一行的情况，提前切断它们
    // 在 ### 标题前强制加换行
    formatted = formatted.replace(/([^\n<])(###)/g, '$1<br>$2');
    // 在 1. 2. 序号前强制换行 (规避小数误伤，如 1.5)
    formatted = formatted.replace(/([^\n<])(\d+\.)(?!\d)/g, '$1<br>$2');
    // 在 - 列表符前强制换行 (仅在 - 后面紧跟文字或加粗星号时断开)
    formatted = formatted.replace(/([^\n<])(-)(?=[\u4e00-\u9fa5A-Za-z]|\*)/g, '$1<br>$2');

    // 3. 规范化空格：确保处于行首的标记符后有空格，方便后续精确匹配
    formatted = formatted.replace(/(^|\n|<br>)\s*(\d+\.)(?=[^\s\d])/g, '$1$2 ');
    formatted = formatted.replace(/(^|\n|<br>)\s*(-)(?=[^\s])/g, '$1$2 ');

    // 4. 严格按顺序执行替换：【先】处理块级样式，【后】处理内联样式
    // 处理 ### 标题 (遇到 <br> 或行尾安全结束，绝不会吞噬 span)
    formatted = formatted.replace(/###\s*([^\n<]+)/g, '<br><br><span class="ai-section-title">▍ $1</span><br>');

    // 处理加粗 (**文本**)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<span class="ai-bold">$1</span>');

    // 处理数字序号 (限制在行首或换行后触发)
    formatted = formatted.replace(/(?:^|\n|<br>)\s*(\d+\.)\s/g, '<br><span class="ai-list-num">$1</span> ');

    // 处理子列表符 (限制在行首或换行后触发)
    formatted = formatted.replace(/(?:^|\n|<br>)\s*([*-])\s+/g, '<br><span class="ai-list-indent"></span><span class="ai-list-dot">•</span> ');

    // 5. 清理连续的冗余换行
    formatted = formatted.replace(/\n/g, '<br>');
    formatted = formatted.replace(/(<br>\s*){3,}/g, '<br><br>');
    formatted = formatted.replace(/^(<br>\s*)+/, '');

    return formatted;
}

const messages = ref<Message[]>([
    {
        id: nextMsgId(),
        role: 'ai',
        content: '你好！我是你的专属AI健康助手。关于卡路里计算、食谱推荐或是运动计划，随时都可以问我哦！'
    }
]);

const inputText = ref('');
const isTyping = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);
const isInitializing = ref(true);
    
let currentController: AbortController | null = null;

const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
    nextTick(() => {
        const container = messagesContainer.value;

        if (!container) return;

        // auto 模式直接赋值，最稳定
        if (behavior === 'auto') {
            container.scrollTop = container.scrollHeight;
        } else {
            container.scrollTo({
                top: container.scrollHeight,
                behavior
            });
        }
    });
};

// 自动监听消息变化滚动
watch(
    () => messages.value,
    () => {
        // 初始化阶段禁止自动滚动
        if (isInitializing.value) return;

        // AI 流式输出时使用 auto
        // 用户发送后使用 smooth
        scrollToBottom(isTyping.value ? 'auto' : 'smooth');
    },
    { deep: true }
);

// ── 持久化缓冲区 ──
let unsavedBuffer: { role: string; content: string; createTime: string }[] = [];
let saveTimer: ReturnType<typeof setInterval> | null = null;

const flushBuffer = () => {
    if (unsavedBuffer.length === 0) return;
    const batch = unsavedBuffer.splice(0);
    saveMessages(batch).catch(e => {
        console.error('[Chat] 入库失败:', e);
        unsavedBuffer.unshift(...batch);
    });
};

const addToBuffer = (role: string, content: string) => {
    unsavedBuffer.push({
        role,
        content,
        createTime: new Date().toISOString()
    });
    if (unsavedBuffer.length >= 20) {
        flushBuffer();
    }
};

// ── 摘要面板 ──
const showSummaries = ref(false);
const summaries = ref<ChatSummaryVO[]>([]);

const toggleSummaries = async () => {
    if (!showSummaries.value) {
        summaries.value = await loadSummaries();
        showSummaries.value = true;
    } else {
        showSummaries.value = false;
    }
};

const goBack = () => {
    router.back();
};

const clearMessages = () => {
    if (currentController) {
        currentController.abort();
        currentController = null;
    }
    isTyping.value = false;
    messages.value = [
        {
            id: 1,
            role: 'ai',
            content: '你好！我是你的专属AI健康助手。关于卡路里计算、食谱推荐或是运动计划，随时都可以问我哦！'
        }
    ];
    msgIdCounter = 1;
    unsavedBuffer = [];
    clearHistory().catch(e => console.error('[Chat] 清除后端历史失败:', e));
};

// ── 发送消息 ──
const sendMessage = async () => {
    const text = inputText.value.trim();
    if (!text || isTyping.value) return;

    if (currentController) {
        currentController.abort();
        currentController = null;
    }

    const userMsgId = nextMsgId();
    messages.value.push({
        id: userMsgId,
        role: 'user',
        content: text
    });
    inputText.value = '';

    isTyping.value = true;

    let aiMsgId: number | null = null;
    let aiFullContent = '';

    currentController = streamChat(text, {
        onChunk: (content: string) => {
            aiFullContent += content;
            if (aiMsgId === null) {
                isTyping.value = false;
                aiMsgId = nextMsgId();
                messages.value.push({ id: aiMsgId, role: 'ai', content });
            } else {
                const aiMsg = messages.value.find(m => m.id === aiMsgId);
                if (aiMsg) aiMsg.content += content;
            }
        },
        onDone: () => {
            isTyping.value = false;
            addToBuffer('user', text);
            addToBuffer('ai', aiFullContent);
            currentController = null;
        },
        onError: (err: Error) => {
            isTyping.value = false;
            if (aiMsgId != null) {
                const aiMsg = messages.value.find(m => m.id === aiMsgId);
                if (aiMsg && !aiMsg.content) {
                    aiMsg.content = '抱歉，AI 服务暂时不可用，请稍后重试。';
                }
            }
            addToBuffer('user', text);
            currentController = null;
        },
    });
};

// ── beforeunload 兜底 ──
const onBeforeUnload = () => {
    if (unsavedBuffer.length > 0) {
        navigator.sendBeacon(
            '/api/ai/chat/save',
            new Blob([JSON.stringify(unsavedBuffer)], { type: 'application/json' })
        );
    }
};

// ── 生命周期 ──
onMounted(async () => {
    try {
        const history = await loadHistory(50);

        if (history?.messages?.length) {
            messages.value = history.messages.map((m, i) => ({
                id: i + 1,
                role: m.role as 'user' | 'ai',
                content: m.content
            }));

            msgIdCounter = messages.value.length;
        }

        // 等待 Vue DOM 更新
        await nextTick();

        // 等待浏览器 layout + repaint 完成
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {

                // 直接滚到底部
                scrollToBottom('auto');

                // 初始化结束
                isInitializing.value = false;
            });
        });

    } catch (e) {
        console.error('[Chat] 加载历史失败:', e);
    }

    saveTimer = setInterval(flushBuffer, 30_000);
    window.addEventListener('beforeunload', onBeforeUnload);
});

onUnmounted(() => {
    if (saveTimer) clearInterval(saveTimer);
    flushBuffer();
    window.removeEventListener('beforeunload', onBeforeUnload);
});

onActivated(async () => {
    isInitializing.value = true;
    try {
        const history = await loadHistory(50);
        if (history?.messages?.length) {
            messages.value = history.messages.map((m, i) => ({
                id: i + 1,
                role: m.role as 'user' | 'ai',
                content: m.content
            }));
            msgIdCounter = messages.value.length;
        }

        await nextTick();
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                scrollToBottom('auto');
                isInitializing.value = false;
            });
        });
    } catch (e) {
        console.error('[Chat] 重新加载历史失败:', e);
        isInitializing.value = false;
    }
});
</script>

<style scoped>
/* 样式部分保持不变 */
.chat-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f5f7fa;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 90px;
    padding: 30px 16px 0px 16px;
    background-color: #ffffff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    z-index: 10;
}

.back-btn {
    padding: 8px 0;
    cursor: pointer;
    display: flex;
    align-items: center;
}

.header-title {
    font-size: 18px;
    font-weight: 600;
    color: #333333;
    margin: 0;
}

.header-right {
    display: flex;
    align-items: center;
}

.summary-trigger {
    width: 36px;
    height: 36px;
    border: none;
    background: #f0f2f5;
    border-radius: 50%;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
}

.summary-trigger:active {
    background: #e0e0e0;
}

.clear-trigger {
    width: 36px;
    height: 36px;
    border: none;
    background: #f0f2f5;
    border-radius: 50%;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
    margin-left: 8px;
}

.clear-trigger:active {
    background: #ffe0e0;
}

.chat-main {
    flex: 1;
    overflow-y: auto;
    padding: 20px 16px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    /* 平滑滚动方案 */
    scroll-behavior: smooth;
}

.chat-main::-webkit-scrollbar {
    display: none;
}

.message-wrapper {
    display: flex;
    align-items: flex-start;
    width: 100%;
}

.is-user {
    justify-content: flex-end;
}

.is-ai {
    justify-content: flex-start;
}

.avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    flex-shrink: 0;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.user-avatar {
    margin-left: 12px;
    background-color: #e6f7ff;
}

.ai-avatar {
    margin-right: 12px;
    background-color: #ffffff;
}

.message-bubble {
    max-width: 70%;
    padding: 12px 16px;
    border-radius: 16px;
    font-size: 15px;
    line-height: 1.6;
    word-wrap: break-word;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.is-user .message-bubble {
    background-color: #1890ff;
    color: #ffffff;
    border-top-right-radius: 4px;
}

.is-ai .message-bubble {
    background-color: #ffffff;
    color: #333333;
    border-top-left-radius: 4px;
    text-align: left;
    line-height: 1.7;
    letter-spacing: 0.5px;
}

:deep(.ai-bold) {
    font-weight: 600;
    color: #1a1a1a;
    padding: 0 2px;
}

:deep(.ai-section-title) {
    display: inline-block;
    font-size: 16px;
    font-weight: bold;
    color: #1890ff;
    margin-top: 6px;
    margin-bottom: 2px;
}

:deep(.ai-list-num) {
    display: inline-block;
    font-weight: 700;
    color: #1890ff;
    font-size: 15px;
    margin-top: 6px;
}

:deep(.ai-list-indent) {
    display: inline-block;
    width: 22px;
}

:deep(.ai-list-dot) {
    display: inline-block;
    color: #ff7a45;
    font-weight: bold;
    transform: scale(1.2);
    margin-right: 4px;
}

.typing-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 48px;
    box-sizing: border-box;
}

.typing-indicator span {
    display: inline-block;
    width: 6px;
    height: 6px;
    background-color: #999999;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) {
    animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
    animation-delay: -0.16s;
}

@keyframes bounce {

    0%,
    80%,
    100% {
        transform: scale(0);
    }

    40% {
        transform: scale(1);
    }
}

.chat-footer {
    background-color: #ffffff;
    box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.05);
    padding-bottom: env(safe-area-inset-bottom);
}

.input-wrapper {
    display: flex;
    align-items: center;
    padding: 12px 16px;
}

.chat-input {
    flex: 1;
    height: 42px;
    border: none;
    background-color: #f0f2f5;
    border-radius: 21px;
    padding: 0 16px;
    font-size: 15px;
    outline: none;
    transition: background-color 0.2s;
}

.chat-input:focus {
    background-color: #e6f7ff;
}

.chat-input:disabled {
    background-color: #e8e8e8;
    color: #999;
}

.send-btn {
    margin-left: 12px;
    height: 42px;
    padding: 0 20px;
    border: none;
    border-radius: 21px;
    background-color: #e0e0e0;
    color: #ffffff;
    font-size: 15px;
    font-weight: 500;
    transition: all 0.3s;
}

.send-btn.is-active {
    background-color: #1890ff;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(24, 144, 255, 0.3);
}
</style>