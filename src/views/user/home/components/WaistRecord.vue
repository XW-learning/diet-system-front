<template>
    <div class="widget-card clickable" @click="openRecordPopup">
        <div class="w-header">
            <div class="w-icon" style="background: #FFF3E0;">📏</div>
            <div class="w-title">围度记录</div>
        </div>

        <div class="w-main" style="margin-top: 10px; display: flex; align-items: baseline;">
            <span class="w-label">腰围</span>
            <span class="w-val">{{ waistValueDisplay }}</span>
            <span class="w-unit" v-if="waistValueDisplay !== '--'">cm</span>
        </div>

        <Teleport to="body">
            <transition name="fade">
                <div class="overlay" v-if="showRecordPopup" @click="closeRecordPopup"></div>
            </transition>

            <transition name="slide-up">
                <div class="popup-container" v-if="showRecordPopup">
                    <div class="popup-header">
                        <span class="popup-title">记录围度</span>
                        <button class="close-btn" @click="closeRecordPopup">×</button>
                    </div>

                    <div class="popup-content">
                        <div class="tabs-container">
                            <div class="tab-item" :class="{ active: currentTab === 'chest' }"
                                @click="currentTab = 'chest'">胸围</div>
                            <div class="tab-item" :class="{ active: currentTab === 'waist' }"
                                @click="currentTab = 'waist'">腰围</div>
                            <div class="tab-item" :class="{ active: currentTab === 'hip' }" @click="currentTab = 'hip'">
                                臀围</div>
                        </div>

                        <div class="value-display">
                            <span class="val">{{ currentValue.toFixed(1) }}</span>
                            <span class="unit">cm</span>
                        </div>

                        <div class="ruler-container">
                            <input type="range" class="circumference-slider" min="40" max="150" step="0.1"
                                v-model.number="currentValue">
                            <div class="ruler-marks"></div>
                        </div>
                    </div>

                    <div class="popup-footer">
                        <button class="confirm-btn" @click="confirmRecord" :disabled="isSubmitting">
                            {{ isSubmitting ? '保存中...' : '保存当前项' }}
                        </button>
                    </div>
                </div>
            </transition>
        </Teleport>

        <Toast ref="toastRef" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Toast from '@/components/Toast.vue'; //
import { saveBodyRecordApi } from '@/api/body'; //

// 接收父组件传递的记录数据和用户ID
const props = defineProps<{
    record: any;
    userId?: string;
}>();

const emit = defineEmits(['refresh']);
const toastRef = ref();

// ================= 展示层逻辑 =================

/**
 * 修复 -- 问题：
 * 之前的逻辑 (props.record.waist) 在数值为 0 时会判定为假导致显示 --
 * 现在改为严格判断 null 和 undefined
 */
const waistValueDisplay = computed(() => {
    const val = props.record?.waist;
    if (val !== undefined && val !== null) {
        return Number(val).toFixed(1);
    }
    return '--';
});

// ================= 弹窗与表单逻辑 =================
const showRecordPopup = ref(false);
const isSubmitting = ref(false);
const currentTab = ref<'chest' | 'waist' | 'hip'>('waist');

// 分别记录三个维度的临时值
const chestValue = ref(85.0);
const waistValue = ref(65.0);
const hipValue = ref(90.0);

// 双向绑定的当前滑动条值
const currentValue = computed({
    get() {
        if (currentTab.value === 'chest') return chestValue.value;
        if (currentTab.value === 'waist') return waistValue.value;
        return hipValue.value;
    },
    set(val: number) {
        if (currentTab.value === 'chest') chestValue.value = val;
        if (currentTab.value === 'waist') waistValue.value = val;
        if (currentTab.value === 'hip') hipValue.value = val;
    }
});

const openRecordPopup = () => {
    // 每次打开弹窗，用历史数据初始化
    waistValue.value = props.record?.waist || 65.0;
    hipValue.value = props.record?.hip || 90.0;
    chestValue.value = props.record?.chest || 85.0;

    currentTab.value = 'waist';
    showRecordPopup.value = true;
    document.body.style.overflow = 'hidden';
};

const closeRecordPopup = () => {
    showRecordPopup.value = false;
    document.body.style.overflow = '';
};

// 发起 API 请求保存数据
const confirmRecord = async () => {
    
    if (!props.userId) {
        toastRef.value?.show('用户未登录', 'warning');
        return;
    }

    isSubmitting.value = true;
    try {
        const payload: any = {
            userId: props.userId,
            // 关键：保留当前记录中的旧数据，防止被 NULL 覆盖
            weight: props.record?.weight || 0,
            waist: props.record?.waist || 0,
            hip: props.record?.hip || 0,
            chest: props.record?.chest || 0
        };

        if (currentTab.value === 'waist') payload.waist = waistValue.value;
        if (currentTab.value === 'hip') payload.hip = hipValue.value;
        if (currentTab.value === 'chest') payload.chest = chestValue.value;

        await saveBodyRecordApi(payload); // 调用保存接口

        const tabNames: Record<string, string> = { chest: '胸围', waist: '腰围', hip: '臀围' };
        toastRef.value?.show(`${tabNames[currentTab.value]}保存成功`, 'success');

        // 延迟关闭弹窗，并通知 Home.vue 刷新页面数据
        setTimeout(() => {
            closeRecordPopup();
            emit('refresh');
        }, 600);

    } catch (error: any) {
        toastRef.value?.show(error.message || '保存失败', 'error');
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<style scoped>
@import '@/styles/widget-style.css';
/* */

/* “腰围”标签样式：葡萄紫淡色，字号与数字一致 */
.w-label {
    color: #e6d394;
    /* 淡葡萄紫色 */
    font-size: 16px;
    /* 与 w-val 字号保持一致 */
    font-weight: bold;
    margin-right: 6px;
}

.w-val {
    font-size: 24px;
}

.clickable {
    cursor: pointer;
    transition: transform 0.1s ease;
}

.clickable:active {
    transform: scale(0.97);
}

/* 弹窗及遮罩层样式 */
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

.tabs-container {
    display: flex;
    background: #F5F5F5;
    border-radius: 20px;
    padding: 4px;
    margin-bottom: 24px;
    width: 100%;
}

.tab-item {
    flex: 1;
    text-align: center;
    padding: 8px 0;
    font-size: 14px;
    color: #666;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s;
}

.tab-item.active {
    background: #FFFFFF;
    color: #FF9800;
    font-weight: bold;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.value-display {
    margin-bottom: 20px;
    display: flex;
    align-items: baseline;
}

.value-display .val {
    font-size: 48px;
    font-weight: bold;
    color: #FF9800;
    font-family: 'Courier New', Courier, monospace;
}

.value-display .unit {
    font-size: 16px;
    color: #666;
    margin-left: 4px;
    font-weight: bold;
}

.ruler-container {
    width: 100%;
    position: relative;
    padding: 20px 0;
}

.circumference-slider {
    -webkit-appearance: none;
    width: 100%;
    height: 40px;
    background: transparent;
    outline: none;
    position: relative;
    z-index: 2;
}

.circumference-slider::-webkit-slider-runnable-track {
    width: 100%;
    height: 8px;
    background: #FFF3E0;
    border-radius: 4px;
}

.circumference-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #fff;
    border: 4px solid #FF9800;
    cursor: pointer;
    margin-top: -10px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.ruler-marks {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 8px;
    margin-top: -4px;
    background-image: repeating-linear-gradient(90deg, transparent, transparent 9px, #ccc 9px, #ccc 10px);
    z-index: 1;
    opacity: 0.5;
    pointer-events: none;
}

.confirm-btn {
    width: 100%;
    background-color: #FF9800;
    color: white;
    border: none;
    padding: 16px;
    border-radius: 28px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
}

.confirm-btn:disabled {
    background-color: #FFE0B2;
    box-shadow: none;
    cursor: not-allowed;
}

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