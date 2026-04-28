<template>
    <div class="widget-card">
        <div class="w-header">
            <div class="w-icon" style="background: #E1F5FE;">💧</div>
            <div class="w-title">喝水</div>
        </div>

        <div class="w-main">
            <span class="w-val">{{ currentAmount }}</span>
            <span class="w-unit">/ {{ targetAmount }}ml</span>
        </div>

        <div class="w-action-btn" @click.stop="openRecordPopup">
            +
        </div>

        <Teleport to="body">
            <transition name="fade">
                <div class="overlay" v-if="showRecordPopup" @click="closeRecordPopup"></div>
            </transition>

            <transition name="slide-up">
                <div class="popup-container" v-if="showRecordPopup">
                    <div class="popup-header">
                        <span class="popup-title">记录饮水</span>
                        <button class="close-btn" @click="closeRecordPopup">×</button>
                    </div>

                    <div class="popup-content">
                        <div class="value-display">
                            <span class="val">{{ currentAddValue }}</span>
                            <span class="unit">ml</span>
                        </div>

                        <div class="ruler-container">
                            <input type="range" class="water-slider" min="10" max="1000" step="10"
                                v-model.number="currentAddValue">
                            <div class="ruler-marks"></div>
                        </div>
                    </div>

                    <div class="popup-footer">
                        <button class="confirm-btn" @click="confirmRecord" :disabled="isAdding">
                            {{ isAdding ? '保存中...' : '确认打卡' }}
                        </button>
                    </div>
                </div>
            </transition>
        </Teleport>

        <Toast ref="toastRef" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import Toast from '@/components/Toast.vue';
import { getTodayWaterRecordApi, addWaterApi } from '@/api/water';

const props = defineProps<{
    userId?: string;
}>();

const currentAmount = ref(0);
const targetAmount = ref(2000);
const toastRef = ref();

// 弹窗相关状态
const showRecordPopup = ref(false);
const isAdding = ref(false);
const currentAddValue = ref(200); // 默认每次打开推荐 200ml

/**
 * 获取今日饮水数据
 */
const fetchWaterData = async () => {
    if (!props.userId) return;
    try {
        const res: any = await getTodayWaterRecordApi(props.userId);
        const data = res.data || res;
        if (data) {
            currentAmount.value = data.currentAmount || 0;
            targetAmount.value = data.targetAmount || 2000;
        }
    } catch (error) {
        console.error('获取饮水记录失败', error);
    }
};

/**
 * 打开弹窗
 */
const openRecordPopup = () => {
    currentAddValue.value = 200; // 每次打开重置为一杯水的量
    showRecordPopup.value = true;
    document.body.style.overflow = 'hidden'; // 防止背景穿透滚动
};

/**
 * 关闭弹窗
 */
const closeRecordPopup = () => {
    showRecordPopup.value = false;
    document.body.style.overflow = '';
};

/**
 * 确认喝水打卡
 */
const confirmRecord = async () => {
    if (!props.userId) {
        toastRef.value?.show('用户未登录', 'warning');
        return;
    }

    if (isAdding.value) return;

    isAdding.value = true;
    try {
        await addWaterApi({
            userId: props.userId,
            addAmount: currentAddValue.value
        });

        toastRef.value?.show(`打卡成功 +${currentAddValue.value}ml`, 'success');

        // 前端乐观更新
        currentAmount.value += currentAddValue.value;

        // 延迟一点关闭弹窗，让用户看到点击效果
        setTimeout(() => {
            closeRecordPopup();
        }, 300);

    } catch (error: any) {
        toastRef.value?.show(error.message || '打卡失败', 'error');
    } finally {
        isAdding.value = false;
    }
};

onMounted(() => {
    fetchWaterData();
});

watch(() => props.userId, (newVal) => {
    if (newVal) fetchWaterData();
});
</script>

<style scoped>
@import '@/styles/widget-style.css';

/* 卡片内部样式 */
.w-action-btn {
    cursor: pointer;
    transition: transform 0.1s ease;
    user-select: none;
}

.w-action-btn:active {
    transform: scale(0.9);
}

.w-val {
    font-size: 28px;
    font-weight: bold;
    color: #0288D1;
    /* 深蓝色数值 */
}

.w-unit {
    color: #81D4FA;
    font-size: 14px;
    margin-left: 4px;
}

/* ================= 弹窗及遮罩层样式 ================= */
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    backdrop-filter: blur(2px);
}

.popup-container {
    position: fixed;
    bottom: 3%;
    left: 7%;
    width: 85%;
    background-color: #fff;
    border-radius: 24px;
    z-index: 1001;
    padding: 24px;
    box-sizing: border-box;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
}

.popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.popup-title {
    font-size: 18px;
    font-weight: bold;
    color: #333;
}

.close-btn {
    background: none;
    border: none;
    font-size: 24px;
    color: #999;
    cursor: pointer;
    padding: 0;
    line-height: 1;
}

.popup-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 30px;
}

.value-display {
    margin-bottom: 20px;
    display: flex;
    align-items: baseline;
}

.value-display .val {
    font-size: 48px;
    font-weight: bold;
    color: #29B6F6;
    /* 主题蓝 */
    font-family: 'Courier New', Courier, monospace;
}

.value-display .unit {
    font-size: 16px;
    color: #666;
    margin-left: 4px;
    font-weight: bold;
}

/* ================= 刻度条样式 (水蓝主题) ================= */
.ruler-container {
    width: 100%;
    position: relative;
    padding: 20px 0;
}

.water-slider {
    -webkit-appearance: none;
    width: 100%;
    height: 40px;
    background: transparent;
    outline: none;
    position: relative;
    z-index: 2;
}

.water-slider::-webkit-slider-runnable-track {
    width: 100%;
    height: 8px;
    background: #E1F5FE;
    /* 淡蓝色轨道 */
    border-radius: 4px;
}

.water-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #fff;
    border: 4px solid #29B6F6;
    /* 水蓝色手柄边框 */
    cursor: pointer;
    margin-top: -10px;
    box-shadow: 0 2px 6px rgba(41, 182, 246, 0.3);
}

.ruler-marks {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 8px;
    margin-top: -4px;
    /* 刻度线背景，利用渐变模拟尺子 */
    background-image: repeating-linear-gradient(90deg, transparent, transparent 9px, #ccc 9px, #ccc 10px);
    z-index: 1;
    opacity: 0.5;
    pointer-events: none;
}

/* ================= 确认按钮 ================= */
.confirm-btn {
    width: 100%;
    background-color: #29B6F6;
    color: white;
    border: none;
    padding: 16px;
    border-radius: 28px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(41, 182, 246, 0.4);
    transition: background-color 0.2s, box-shadow 0.2s;
}

.confirm-btn:disabled {
    background-color: #B3E5FC;
    box-shadow: none;
    cursor: not-allowed;
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

.slide-up-enter-active,
.slide-up-leave-active {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
    transform: translateY(100%);
}
</style>