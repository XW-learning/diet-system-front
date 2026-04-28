<template>
    <div class="widget-card widget-full">
        <div class="top-section">
            <div class="full-left">
                <div class="w-header">
                    <div class="w-icon" style="background: #E8F5E9; color: #4CAF50;">⚖️</div>
                    <div class="w-title">体重记录</div>
                </div>
                <div class="w-main" style="margin-top: 15px;">
                    <span class="w-val">{{ currentWeight > 0 ? currentWeight.toFixed(1) : '--' }}</span>
                    <span class="w-unit">公斤</span>
                </div>
                <div class="w-desc" style="color: #66BB6A; font-weight: 600;">
                    BMI {{ currentBmi > 0 ? currentBmi.toFixed(1) : '--' }} {{ bmiStatusText }}
                </div>
            </div>
            <div class="full-right">
                <button class="record-btn" @click="openRecordPopup">记体重</button>
            </div>
        </div>

        <div class="weekly-record-container">
            <div class="day-column" v-for="(item, index) in weekData" :key="index">
                <div class="bar-wrapper">
                    <div class="bar" :class="{ 'is-recorded': item.isRecorded }"
                        :style="{ height: item.isRecorded ? item.heightPercentage + '%' : '0%' }">
                    </div>
                </div>
                <div class="day-text" :class="{ 'is-today': item.isToday }">{{ item.day }}</div>
            </div>
        </div>

        <Teleport to="body">
            <transition name="fade">
                <div class="overlay" v-if="showRecordPopup" @click="closeRecordPopup"></div>
            </transition>

            <transition name="slide-up">
                <div class="popup-container" v-if="showRecordPopup">
                    <div class="popup-header">
                        <span class="popup-title">身材打卡</span>
                        <button class="close-btn" @click="closeRecordPopup">×</button>
                    </div>

                    <div class="popup-content">
                        <div class="record-section">
                            <div class="unit-switch">
                                <div class="switch-item" :class="{ active: currentUnit === 'kg' }"
                                    @click="currentUnit = 'kg'">公斤 (kg)</div>
                                <div class="switch-item" :class="{ active: currentUnit === 'jin' }"
                                    @click="currentUnit = 'jin'">斤</div>
                            </div>

                            <div class="slider-value-display">
                                <span class="val">{{ displayWeight.toFixed(1) }}</span>
                                <span class="unit">{{ currentUnit === 'kg' ? 'kg' : '斤' }}</span>
                            </div>

                            <div class="ruler-container">
                                <input type="range" class="weight-slider" :min="currentUnit === 'kg' ? 30 : 60"
                                    :max="currentUnit === 'kg' ? 150 : 300" step="0.1" v-model.number="displayWeight">
                                <div class="ruler-marks"></div>
                            </div>
                        </div>
                    </div>

                    <div class="popup-footer">
                        <button class="confirm-btn" @click="confirmRecord" :disabled="isSubmitting">
                            {{ isSubmitting ? '打卡中...' : '打卡' }}
                        </button>
                    </div>
                </div>
            </transition>
        </Teleport>

        <Toast ref="toastRef" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { saveBodyRecordApi } from '@/api/body';
import Toast from '@/components/Toast.vue';

const props = defineProps<{
    records: any[]; // 🌟 由 Home.vue 传进来的身材记录列表
    userId?: string;
}>();

const emit = defineEmits(['refresh']);
const toastRef = ref();

// === 提取最新数据 (数组第一项) ===
const currentWeight = computed(() => {
    return props.records && props.records.length > 0 ? props.records[0].weight : 0;
});
// 打印最新数据
const currentBmi = computed(() => {
    return props.records && props.records.length > 0 ? props.records[0].bmi : 0;
});
const bmiStatusText = computed(() => {
    const val = currentBmi.value;
    if (!val || val === 0) return '暂无数据';
    if (val < 18.5) return '偏瘦';
    if (val < 24) return '正常';
    if (val < 28) return '偏胖';
    return '肥胖';
});

// === 🌟 核心：动态计算本周打卡记录与柱状图高度 ===
const weekData = computed(() => {
    const daysName = ['日', '一', '二', '三', '四', '五', '六'];
    const today = new Date();
    const result = [];

    // 获取本周一
    const currentDay = today.getDay();
    const diffToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - diffToMonday);

    // 假设柱状图最大显示比例的基准体重为 100kg (可根据实际需求调整)
    const baseWeight = 100;

    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        // 格式化为 YYYY-MM-DD
        const dateStr = date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
        const isTodayDate = date.toDateString() === today.toDateString();

        // 查找该日期对应的记录
        const dayRecord = props.records.find(r => r.recordTime && r.recordTime.startsWith(dateStr));

        const isRecorded = !!dayRecord;
        // 计算高度百分比：(当天体重 / 基准) * 100，最低给个 30% 保证视觉效果
        const heightPercentage = isRecorded ? Math.max((dayRecord.weight / baseWeight) * 100, 30) : 0;

        result.push({
            day: daysName[date.getDay()],
            isRecorded,
            isToday: isTodayDate,
            heightPercentage: Math.min(heightPercentage, 100) // 不超过 100%
        });
    }
    return result;
});

// === 弹窗与打卡逻辑 ===
const showRecordPopup = ref(false)
const tempWeightKg = ref(60.0)
const currentUnit = ref<'kg' | 'jin'>('kg')
const isSubmitting = ref(false);

const displayWeight = computed({
    get() { return currentUnit.value === 'kg' ? tempWeightKg.value : tempWeightKg.value * 2; },
    set(newVal: number) { tempWeightKg.value = currentUnit.value === 'kg' ? newVal : newVal / 2; }
})

const openRecordPopup = () => {
    tempWeightKg.value = currentWeight.value > 0 ? currentWeight.value : 60.0;
    showRecordPopup.value = true
    document.body.style.overflow = 'hidden'
}

const closeRecordPopup = () => {
    showRecordPopup.value = false
    document.body.style.overflow = ''
}

const confirmRecord = async () => {
    if (!props.userId) {
        toastRef.value?.show('用户未登录', 'warning');
        return;
    }
    isSubmitting.value = true;
    try {
        // 🌟 1. 提取当前最新的完整记录
        const latestRecord = props.records && props.records.length > 0 ? props.records[0] : {};

        // 🌟 2. 构建全量 payload
        await saveBodyRecordApi({
            userId: props.userId,
            weight: tempWeightKg.value,             // 使用用户刚刚滑动选择的新体重
            height: latestRecord.height || 170.0,   // 保留原有身高

            // 关键修复：把之前的围度数据带上，防止被覆盖成空！
            waist: latestRecord.waist || 0,
            hip: latestRecord.hip || 0,
            chest: latestRecord.chest || 0
        });

        toastRef.value?.show('打卡成功', 'success');
        closeRecordPopup();
        emit('refresh'); // 触发 Home.vue 刷新数据
    } catch (error: any) {
        toastRef.value?.show(error.message || '保存失败', 'error');
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<style scoped>
@import '@/styles/widget-style.css';

.widget-full {
    flex-direction: column;
    align-items: stretch;
    height: auto;
    padding: 20px 16px;
    background: linear-gradient(135deg, #FFFFFF 0%, #F0FFF0 100%);
}

.top-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.full-right .record-btn {
    background: #66BB6A;
    color: #fff;
    border: none;
    padding: 10px 18px;
    border-radius: 24px;
    font-weight: bold;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(102, 187, 106, 0.3);
    cursor: pointer;
}

.weekly-record-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px dashed rgba(102, 187, 106, 0.2);
    width: 100%;
}

.day-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    flex: 1;
}

.bar-wrapper {
    height: 32px;
    width: 8px;
    background-color: #E8F5E9;
    border-radius: 10px;
    display: flex;
    align-items: flex-end;
    overflow: hidden;
}

.bar {
    width: 100%;
    border-radius: 10px;
    transition: height 0.4s ease-out;
    height: 0%;
}

.bar.is-recorded {
    background-color: #66BB6A;
    height: 100%;
}

.day-text {
    font-size: 12px;
    color: #9E9E9E;
    font-weight: 500;
}

.day-text.is-today {
    color: #4CAF50;
    font-weight: bold;
}

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
    margin-bottom: 20px;
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

.unit-switch {
    display: flex;
    background: #F5F5F5;
    border-radius: 20px;
    padding: 4px;
    margin-bottom: 15px;
}

.switch-item {
    padding: 6px 16px;
    font-size: 14px;
    color: #666;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s;
}

.switch-item.active {
    background: #FFFFFF;
    color: #66BB6A;
    font-weight: bold;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.slider-value-display {
    margin-bottom: 15px;
    display: flex;
    align-items: baseline;
}

.slider-value-display .val {
    font-size: 48px;
    font-weight: bold;
    color: #66BB6A;
    font-family: 'Courier New', Courier, monospace;
}

.slider-value-display .unit {
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

.weight-slider {
    -webkit-appearance: none;
    width: 100%;
    height: 40px;
    background: transparent;
    outline: none;
    position: relative;
    z-index: 2;
}

.weight-slider::-webkit-slider-runnable-track {
    width: 100%;
    height: 8px;
    background: #E8F5E9;
    border-radius: 4px;
}

.weight-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #fff;
    border: 4px solid #66BB6A;
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
    background-color: #66BB6A;
    color: white;
    border: none;
    padding: 16px;
    border-radius: 28px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(102, 187, 106, 0.4);
}

.confirm-btn:disabled {
    background-color: #9E9E9E;
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