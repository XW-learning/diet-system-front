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
            <div class="header-right"></div>
        </header>

        <main class="chat-main" ref="messagesContainer">
            <div v-for="msg in messages" :key="msg.id"
                :class="['message-wrapper', msg.role === 'user' ? 'is-user' : 'is-ai']">
                <div class="avatar ai-avatar" v-if="msg.role === 'ai'">
                    🤖
                </div>

                <div class="message-bubble">
                    {{ msg.content }}
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
    </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { streamChat } from '@/api/ai';

const router = useRouter();

interface Message {
    id: number;
    role: 'user' | 'ai';
    content: string;
}

let msgIdCounter = 0;
const nextMsgId = () => ++msgIdCounter;

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
let currentController: AbortController | null = null;

const scrollToBottom = async () => {
    await nextTick();
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
};

const goBack = () => {
    router.back();
};

const sendMessage = async () => {
    const text = inputText.value.trim();
    if (!text || isTyping.value) return;

    console.log('[Chat] 用户发送:', text);

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
    scrollToBottom();

    let aiMsgId: number | null = null;

    currentController = streamChat(text, {
        onChunk: (content: string) => {
            if (isTyping.value) {
                isTyping.value = false;
                aiMsgId = nextMsgId();
                messages.value.push({ id: aiMsgId, role: 'ai', content });
            } else {
                const aiMsg = messages.value.find(m => m.id === aiMsgId);
                if (aiMsg) aiMsg.content += content;
            }
            scrollToBottom();
        },
        onDone: () => {
            console.log('[Chat] AI回复完成');
            isTyping.value = false;
            currentController = null;
        },
        onError: (err: Error) => {
            console.error('[Chat] AI错误:', err);
            isTyping.value = false;
            if (aiMsgId != null) {
                const aiMsg = messages.value.find(m => m.id === aiMsgId);
                if (aiMsg && !aiMsg.content) {
                    aiMsg.content = '抱歉，AI 服务暂时不可用，请稍后重试。';
                }
            }
            currentController = null;
        },
    });
};

onMounted(() => {
    scrollToBottom();
});
</script>

<style scoped>
/* 容器采用 Flex 布局，铺满全屏 */
.chat-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f5f7fa;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* --- 1. 头部样式 --- */
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
    width: 24px;
    /* 占位，使标题居中 */
}

/* --- 2. 聊天区域样式 --- */
.chat-main {
    flex: 1;
    overflow-y: auto;
    padding: 20px 16px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

/* 隐藏滚动条但保留滚动功能 (适配移动端) */
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

/* 头像通用样式 */
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

/* 消息气泡样式 */
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
    /* 主题蓝，可根据你们的UI规范替换为主色调 */
    color: #ffffff;
    border-top-right-radius: 4px;
    /* 右上角直角，增强指向性 */
}

.is-ai .message-bubble {
    background-color: #ffffff;
    color: #333333;
    border-top-left-radius: 4px;
    text-align: left;
}

/* --- 3. 打字机动画样式 --- */
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

/* --- 4. 底部输入区样式 --- */
.chat-footer {
    background-color: #ffffff;
    box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.05);
    /* 适配刘海屏底部安全距离 */
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