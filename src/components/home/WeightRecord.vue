<template>
    <div class="widget-card widget-full">
        <div class="top-section">
            <div class="full-left">
                <div class="w-header">
                    <div class="w-icon" style="background: #E8F5E9; color: #4CAF50;">体</div>
                    <div class="w-title">体重记录</div>
                </div>
                <div class="w-main" style="margin-top: 15px;">
                    <span class="w-val">{{ currentWeight > 0 ? currentWeight.toFixed(1) : '--' }}</span>
                    <span class="w-unit">kg</span>
                </div>
                <div class="w-desc" style="color: #66BB6A; font-weight: 600;">
                    BMI {{ currentBmi > 0 ? currentBmi.toFixed(1) : '--' }} {{ bmiStatusText }}
                </div>
            </div>
            <div class="full-right">
                <button class="record-btn" @click="openRecordPopup">记录</button>
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
                        <span class="popup-title">记录体重</span>
                        <button class="close-btn" @click="closeRecordPopup">×</button>
                    </div>
                    <div class="popup-content">
                        <div class="record-section">
                            <!-- 分成两个按钮 -->
                            <div class="unit-buttons">
                                <button class="unit-btn" :class="{ active: currentUnit === 'kg' }"
                                    @click="currentUnit = 'kg'">千克(kg)</button>
                                <button class="unit-btn" :class="{ active: currentUnit === 'jin' }"
                                    @click="currentUnit = 'jin'">斤</button>
                            </div>

                            <div class="slider-value-display">
                                <span class="val">{{ displayWeight.toFixed(1) }}</span>
                                <span class="unit">{{ currentUnit === 'kg' ? 'kg' : '斤' }}</span>
                            </div>

                            <!-- 尺子滑动块容器 -->
                            <div class="ruler-container">
                                <input type="range" class="weight-slider" :min="currentUnit === 'kg' ? 30 : 60"
                                    :max="currentUnit === 'kg' ? 150 : 300" step="0.1" v-model.number="displayWeight">
                                <div class="ruler-marks"></div>
                            </div>
                        </div>
                    </div>
                    <div class="popup-footer">
                        <button class="confirm-btn" @click="confirmRecord" :disabled="isSubmitting">
                            {{ isSubmitting ? '保存中...' : '确认保存' }}
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
    records: any[];
    userId?: string;
}>();

const emit = defineEmits(['refresh']);

const toastRef = ref();

const currentWeight = computed(() => {
    return props.records && props.records.length > 0 ? props.records[0].weight : 0;
});

const currentBmi = computed(() => {
    return props.records && props.records.length > 0 ? props.records[0].bmi : 0;
});

const bmiStatusText = computed(() => {
    const val = currentBmi.value;
    if (!val || val === 0) return '无数据';
    if (val < 18.5) return '偏瘦';
    if (val < 24) return '正常';
    if (val < 28) return '偏胖';
    return '肥胖';
});

const weekData = computed(() => {
    const daysName = ['日', '一', '二', '三', '四', '五', '六'];
    const today = new Date();
    const result = [];
    const currentDay = today.getDay();
    const diffToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - diffToMonday);

    const baseWeight = 100;

    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);

        const dateStr = date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
        const isTodayDate = date.toDateString() === today.toDateString();

        const dayRecord = props.records.find(r => r.recordTime && r.recordTime.startsWith(dateStr));
        const isRecorded = !!dayRecord;

        const heightPercentage = isRecorded ? Math.max((dayRecord.weight / baseWeight) * 100, 30) : 0;

        result.push({
            day: daysName[date.getDay()],
            isRecorded,
            isToday: isTodayDate,
            heightPercentage: Math.min(heightPercentage, 100)
        });
    }
    return result;
});

const showRecordPopup = ref(false)
const tempWeightKg = ref(60.0)
const currentUnit = ref<'kg' | 'jin'>('kg')
const isSubmitting = ref(false);

const displayWeight = computed({
    get() { return currentUnit.value === 'kg' ? tempWeightKg.value : tempWeightKg.value * 2; },
    set(newVal: number) { tempWeightKg.value = currentUnit.value === 'kg' ? newVal : newVal / 2; }
});

const openRecordPopup = () => {
    tempWeightKg.value = currentWeight.value > 0 ? currentWeight.value : 60.0;
    showRecordPopup.value = true
    document.body.style.overflow = 'hidden'
};

const closeRecordPopup = () => {
    showRecordPopup.value = false
    document.body.style.overflow = ''
};

const confirmRecord = async () => {
    if (!props.userId) {
        toastRef.value?.show('请先登录', 'warning');
        return;
    }

    isSubmitting.value = true;
    try {
        const latestRecord = props.records && props.records.length > 0 ? props.records[0] : {};

        await saveBodyRecordApi({
            userId: props.userId,
            weight: tempWeightKg.value,
            height: latestRecord.height || 170.0,
            hip: latestRecord.hip || 0,
            chest: latestRecord.chest || 0
        });

        toastRef.value?.show('体重记录成功', 'success');
        closeRecordPopup();
        emit('refresh');
    } catch (error: any) {
        toastRef.value?.show(error.message || '记录失败', 'error');
    } finally {
        isSubmitting.value = false;
    }
};
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

.record-section {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* 新的单位按钮样式 */
.unit-buttons {
    display: flex;
    width: 100%;
    gap: 15px;
    margin-bottom: 15px;
}

.unit-btn {
    flex: 1;
    padding: 10px 0;
    font-size: 14px;
    color: #66BB6A;
    background: #FFFFFF;
    border: 1px solid #66BB6A;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
}

.unit-btn.active {
    background: #66BB6A;
    color: #FFFFFF;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(102, 187, 106, 0.3);
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
    margin-top: 40px;
}

.slider-value-display .unit {
    font-size: 16px;
    color: #666;
    margin-left: 4px;
    font-weight: bold;
}

/* 尺子滑动块样式 - 与 WaistRecord 保持完全一致的布局长度 */
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