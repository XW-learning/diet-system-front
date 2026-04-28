<template>
    <div class="status-bar" :style="{ background: bgColor, color: textColor }">
        <div class="time">{{ currentTime }}</div>
        <div class="sys-icons">
            <span class="icon">📶</span>
            <span class="icon" style="font-size: 12px; font-weight: bold; margin-left: 2px;">5G</span>
            <span class="icon">🔋</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

// 允许父组件自定义背景色和文字颜色（默认是透明背景，深色文字）
withDefaults(defineProps<{
    bgColor?: string;
    textColor?: string;
}>(), {
    bgColor: 'transparent',
    textColor: '#333'
});

const currentTime = ref('00:00');

// 更新时间的逻辑
const updateTime = () => {
    const now = new Date();
    currentTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

let timeInterval: any;

onMounted(() => {
    updateTime(); // 组件挂载时立即获取一次时间
    // 每 60 秒更新一次时间
    timeInterval = setInterval(updateTime, 60000);
});

onUnmounted(() => {
    // 组件销毁时清除定时器，防止内存泄漏
    clearInterval(timeInterval);
});
</script>

<style scoped>
.status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    height: 44px;
    /* 模拟移动端安全高度 */
    font-size: 14px;
    font-weight: 600;
    padding-top: env(safe-area-inset-top);
    /* 适配刘海屏 */
    z-index: 99;
    flex-shrink: 0;
    /* 防止在 flex 布局中被挤压 */
}

.sys-icons {
    display: flex;
    align-items: center;
    gap: 6px;
}

.sys-icons .icon {
    font-size: 14px;
}
</style>