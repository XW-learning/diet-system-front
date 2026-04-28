<template>
    <Teleport to="body">
        <Transition name="fade">
            <div v-if="visible && isConfirmMode" class="toast-overlay" @click.self="onCancel"></div>
        </Transition>

        <Transition name="toast-pop">
            <div v-if="visible" class="toast-wrapper">
                <div class="unified-content">

                    <div v-if="!isConfirmMode" class="icon-box" :class="type">
                        <span v-if="type === 'success'">✔</span>
                        <span v-if="type === 'error'">✖</span>
                        <span v-if="type === 'warning'">⚠</span>
                    </div>

                    <div class="confirm-title" v-if="title">{{ title }}</div>

                    <div class="confirm-message" :class="{ 'has-actions': isConfirmMode, 'no-title': !title }">
                        {{ message }}
                    </div>

                    <div v-if="isConfirmMode" class="confirm-actions">
                        <button class="btn cancel-btn" @click="onCancel">取消</button>
                        <button class="btn confirm-btn" @click="onConfirm">确认</button>
                    </div>

                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

type ToastType = 'success' | 'error' | 'warning' | 'confirm';

const visible = ref(false);
const message = ref('');
const title = ref('');
const type = ref<ToastType>('success');

// Promise 控制器
let resolvePromise: ((value: boolean) => void) | null = null;
let rejectPromise: ((reason?: any) => void) | null = null;

const isConfirmMode = computed(() => type.value === 'confirm');

/**
 * 🌟 模式 1：纯文字/图标 Toast (自动消失)
 */
const show = (msg: string, toastType: ToastType = 'success', duration = 1800) => {
    title.value = ''; // 普通提示不带标题
    message.value = msg;
    type.value = toastType;
    visible.value = true;

    return new Promise((resolve) => {
        setTimeout(() => {
            visible.value = false;
            resolve(true);
        }, duration);
    });
};

/**
 * 🌟 模式 2：需要交互的 Confirm 确认框
 */
const confirmDialog = (options: { title?: string; message: string }) => {
    title.value = options.title || '提示';
    message.value = options.message;
    type.value = 'confirm';
    visible.value = true;

    return new Promise((resolve, reject) => {
        resolvePromise = resolve;
        rejectPromise = reject;
    });
};

// 点击确认
const onConfirm = () => {
    visible.value = false;
    if (resolvePromise) resolvePromise(true);
};

// 点击取消
const onCancel = () => {
    visible.value = false;
    if (rejectPromise) rejectPromise(new Error('cancel'));
};

defineExpose({ show, confirmDialog });
</script>

<style scoped>
/* ================= 遮罩层 ================= */
.toast-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(2px);
    /* 微微的毛玻璃效果 */
    z-index: 9998;
}

/* ================= 统一外壳 ================= */
.toast-wrapper {
    position: fixed;
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
    background: #fdfaf5;
    /* 截图中的奶油白 */
    border-radius: 20px;
    /* 统一大圆角 */
    width: 80%;
    max-width: 320px;
    padding: 24px;
    box-shadow: 0 12px 30px rgba(166, 124, 82, 0.15);
    /* 柔和的棕色阴影 */
    text-align: center;
    box-sizing: border-box;
}

.unified-content {
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* ================= 图标 (普通 Toast 专属) ================= */
.icon-box {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    margin-bottom: 12px;
}

.icon-box.success {
    background: #E8F5E9;
    color: #4CAF50;
}

.icon-box.error {
    background: #FFEBEE;
    color: #F44336;
}

.icon-box.warning {
    background: #FFF3E0;
    color: #FF9800;
}

/* ================= 文本区 ================= */
.confirm-title {
    font-size: 18px;
    font-weight: bold;
    color: #5d4037;
    /* 深棕色标题 */
    margin-bottom: 12px;
}

.confirm-message {
    font-size: 15px;
    color: #666;
    /* 灰色正文 */
    line-height: 1.5;
}

/* 确认框模式下，正文与按钮之间留出间距 */
.confirm-message.has-actions {
    margin-bottom: 24px;
}

/* 如果连标题都没有（比如纯文字 Toast），正文颜色加深一点更好看 */
.confirm-message.no-title {
    color: #5d4037;
    font-weight: 500;
}

/* ================= 按钮区 ================= */
.confirm-actions {
    display: flex;
    width: 100%;
    gap: 15px;
    /* 按钮之间的间距 */
}

.btn {
    flex: 1;
    height: 44px;
    border: none;
    border-radius: 22px;
    /* 胶囊圆角 */
    font-size: 15px;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.1s, opacity 0.2s;
}

.btn:active {
    transform: scale(0.95);
}

.cancel-btn {
    background: #F5F5F5;
    color: #999;
}

.confirm-btn {
    background: #81C784;
    /* 你截图里清新的绿色 */
    color: white;
}

/* ================= 动画 ================= */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.toast-pop-enter-active {
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.2);
}

.toast-pop-leave-active {
    transition: all 0.3s ease;
}

.toast-pop-enter-from {
    opacity: 0;
    transform: translate(-50%, -30%) scale(0.85);
}

.toast-pop-leave-to {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
}
</style>