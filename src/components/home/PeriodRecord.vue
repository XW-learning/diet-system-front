<template>
    <div class="widget-card" @click="openPopup">
        <div class="w-header">
            <div class="w-icon" style="background: #FCE4EC;">🌸</div>
            <div class="w-title">生理期</div>
        </div>
        <!-- 🌟 动态显示当前所处阶段：姨妈期/排卵期/黄体期/卵泡期 -->
        <div class="w-desc">{{ currentPhaseStatus.title }}</div>
        <div class="w-main" style="margin-top: 0;">
            <span class="w-val" :style="{
                color: currentPhaseStatus.color,
                fontSize: currentPhaseStatus.valSize,
                fontWeight: currentPhaseStatus.bold ? 'bold' : 'normal'
            }">
                {{ currentPhaseStatus.val }}
            </span>
        </div>
    </div>

    <Teleport to="body">
        <transition name="fade">
            <div v-if="showPopup" class="overlay" @click="closePopup"></div>
        </transition>

        <transition name="slide-up">
            <div v-if="showPopup" class="bottom-sheet">
                <div class="sheet-header">
                    <span class="cancel-btn" @click="closePopup">取消</span>
                    <span class="sheet-title">记录生理期</span>
                    <span class="save-btn" @click="handleSave">保存</span>
                </div>

                <div class="sheet-content">
                    <div class="calendar-header">
                        <button class="arrow-btn" @click="prevMonth">❮</button>
                        <span class="month-title">{{ currentYear }}年 {{ currentMonth }}月</span>
                        <button class="arrow-btn" @click="nextMonth">❯</button>
                    </div>

                    <div class="calendar-swipe-zone" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
                        <div class="weekdays">
                            <span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span>
                        </div>

                        <div class="days-grid-wrapper">
                            <transition :name="slideDirection">
                                <div class="days-grid" :key="currentYear + '-' + currentMonth">
                                    <div v-for="empty in emptyDays" :key="'empty-' + empty" class="day-cell empty">
                                    </div>

                                    <div v-for="day in daysInMonth" :key="day" class="day-cell" :class="[
                                        { 'is-today': isToday(day), 'is-selected': isSelected(day) },
                                        getCycleClass(day)
                                    ]" @click="selectDate(day)">
                                        <span class="day-num">{{ day }}</span>
                                        <span v-if="isToday(day)" class="today-dot">今</span>
                                    </div>

                                    <div v-for="empty in trailingEmptyDays" :key="'trailing-' + empty"
                                        class="day-cell empty"></div>
                                </div>
                            </transition>
                        </div>
                    </div>

                    <div class="cycle-legend">
                        <div class="legend-item"><span class="dot period-dot"></span>预测/已记经期</div>
                        <!-- 🌟 统一文案，将“易孕期”改为“排卵期” -->
                        <div class="legend-item"><span class="dot fertile-dot"></span>排卵期</div>
                        <div class="legend-item"><span class="dot ovulation-dot"></span>排卵日</div>
                    </div>

                    <div class="period-toggle-box">
                        <div class="toggle-info">
                            <span class="toggle-icon">🩸</span>
                            <span class="toggle-text">{{ selectedDateStr }} 是否为经期？</span>
                        </div>
                        <div class="custom-radio" :class="{ active: isPeriod === 1 }" @click="togglePeriod">
                            <div class="radio-inner" v-if="isPeriod === 1">✓</div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { showToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { saveBodyRecordApi, getPeriodRecordListApi } from '@/api/body'

const userStore = useUserStore()
const showPopup = ref(false)

const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth() + 1)
const selectedDate = ref(now.getDate())
const selectedMonth = ref(now.getMonth() + 1)
const selectedYear = ref(now.getFullYear())

const isPeriod = ref<0 | 1>(0)
const touchStartX = ref(0)
const touchEndX = ref(0)
const slideDirection = ref('slide-left')

const savedPeriodRecords = ref<any[]>([])

const formatDateStr = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const parseDateString = (val: any) => {
    if (!val) return new Date();
    let str = val;
    if (Array.isArray(val)) {
        str = `${val[0]}-${String(val[1]).padStart(2, '0')}-${String(val[2]).padStart(2, '0')}`;
    } else if (typeof val === 'string' && val.includes('T')) {
        str = val.split('T')[0];
    }
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
}

const selectedDateStr = computed(() => {
    return `${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}-${String(selectedDate.value).padStart(2, '0')}`
})

const fetchRecords = async () => {
    try {
        const res = await getPeriodRecordListApi();
        const data = (res as any).code !== undefined ? (res as any).data : res;
        if (data) {
            savedPeriodRecords.value = data;
        }
    } catch (error) {
        console.error('获取历史经期失败:', error);
    }
}

onMounted(() => {
    fetchRecords()
})

const isSavedPeriodDate = (dateStr: string) => {
    for (const record of savedPeriodRecords.value) {
        if (!record.periodStartDate) continue;
        const start = parseDateString(record.periodStartDate).getTime();

        let end;
        if (record.periodEndDate) {
            end = parseDateString(record.periodEndDate).getTime();
        } else {
            const d = parseDateString(record.periodStartDate);
            d.setDate(d.getDate() + 4);
            end = d.getTime();
        }

        const [y, m, d] = dateStr.split('-').map(Number);
        const time = new Date(y, m - 1, d).getTime();
        if (time >= start && time <= end) return true;
    }
    return false;
};

const currentPeriodDay = computed(() => {
    if (!savedPeriodRecords.value || savedPeriodRecords.value.length === 0) return null;
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    for (const record of savedPeriodRecords.value) {
        if (!record.periodStartDate) continue;
        const start = parseDateString(record.periodStartDate);

        let end;
        if (record.periodEndDate) {
            end = parseDateString(record.periodEndDate);
        } else {
            end = new Date(start);
            end.setDate(end.getDate() + 4);
        }

        if (today.getTime() >= start.getTime() && today.getTime() <= end.getTime()) {
            const diffTime = today.getTime() - start.getTime();
            return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        }
    }
    return null;
});

// 🌟 新增计算属性：判断当前所处的生理周期阶段
const currentPhaseStatus = computed(() => {
    if (!savedPeriodRecords.value || savedPeriodRecords.value.length === 0) {
        return { title: '快捷记录', val: '点击记录', color: '#EC407A', valSize: '16px', bold: false };
    }

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayStr = formatDateStr(today);
    const data = globalCycleData.value;

    // 1. 经期
    if (currentPeriodDay.value) {
        return { title: '姨妈期', val: `第 ${currentPeriodDay.value} 天`, color: '#E91E63', valSize: '18px', bold: true };
    }

    // 2. 排卵日
    if (data.ovulation.has(todayStr)) {
        return { title: '排卵日', val: '受孕高峰', color: '#6A1B9A', valSize: '16px', bold: true };
    }

    // 3. 排卵期
    if (data.fertile.has(todayStr)) {
        return { title: '排卵期', val: '易孕阶段', color: '#8E24AA', valSize: '16px', bold: true };
    }

    // 4. 黄体期 / 卵泡期推算
    const validRecords = savedPeriodRecords.value
        .filter(r => r.periodStartDate)
        .map(r => parseDateString(r.periodStartDate))
        .sort((a, b) => b.getTime() - a.getTime());

    if (validRecords.length > 0) {
        const latestStart = validRecords[0];
        const ovuDate = new Date(latestStart);
        ovuDate.setDate(ovuDate.getDate() + 13); // 排卵日

        const nextPeriodDate = new Date(latestStart);
        nextPeriodDate.setDate(nextPeriodDate.getDate() + 28); // 预计下次经期

        if (today.getTime() > ovuDate.getTime() && today.getTime() < nextPeriodDate.getTime()) {
            return { title: '黄体期', val: '注意休息', color: '#F57C00', valSize: '16px', bold: true };
        } else if (today.getTime() < ovuDate.getTime()) {
            return { title: '卵泡期', val: '状态极佳', color: '#4CAF50', valSize: '16px', bold: true };
        }
    }

    return { title: '周期记录', val: '暂无预测', color: '#EC407A', valSize: '16px', bold: false };
});


const globalCycleData = computed(() => {
    const actualPeriods = new Set<string>();
    const predictedPeriods = new Set<string>();
    const fertile = new Set<string>();
    const ovulation = new Set<string>();

    if (!savedPeriodRecords.value) return { actualPeriods, predictedPeriods, fertile, ovulation };

    const validRecords = savedPeriodRecords.value
        .filter(r => r.periodStartDate)
        .map(r => {
            const start = parseDateString(r.periodStartDate);
            let end;
            if (r.periodEndDate) {
                end = parseDateString(r.periodEndDate);
            } else {
                end = new Date(start);
                end.setDate(end.getDate() + 4);
            }
            return { start, end };
        })
        .sort((a, b) => b.start.getTime() - a.start.getTime());

    validRecords.forEach(record => {
        let cursor = new Date(record.start);
        while (cursor <= record.end) {
            actualPeriods.add(formatDateStr(cursor));
            cursor.setDate(cursor.getDate() + 1);
        }
    });

    if (validRecords.length > 0) {
        const latestStart = validRecords[0].start;

        const ovu = new Date(latestStart);
        ovu.setDate(ovu.getDate() + 13);
        ovulation.add(formatDateStr(ovu));

        for (let i = -5; i <= 4; i++) {
            const f = new Date(ovu);
            f.setDate(f.getDate() + i);
            fertile.add(formatDateStr(f));
        }

        const nextP = new Date(latestStart);
        nextP.setDate(nextP.getDate() + 28);
        for (let i = 0; i < 5; i++) {
            const p = new Date(nextP);
            p.setDate(p.getDate() + i);
            predictedPeriods.add(formatDateStr(p));
        }
    }

    if (isPeriod.value === 1) {
        const cellDateStr = selectedDateStr.value;
        if (!actualPeriods.has(cellDateStr) && !predictedPeriods.has(cellDateStr)) {
            const manualStart = new Date(selectedYear.value, selectedMonth.value - 1, selectedDate.value);

            for (let i = 0; i < 5; i++) {
                const p = new Date(manualStart);
                p.setDate(p.getDate() + i);
                actualPeriods.add(formatDateStr(p));
            }

            const ovu = new Date(manualStart);
            ovu.setDate(ovu.getDate() + 13);
            ovulation.add(formatDateStr(ovu));

            for (let i = -5; i <= 4; i++) {
                const f = new Date(ovu);
                f.setDate(f.getDate() + i);
                fertile.add(formatDateStr(f));
            }
        }
    }

    return { actualPeriods, predictedPeriods, fertile, ovulation };
});

const getCycleClass = (day: number) => {
    const cellDateStr = `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    const isPeriodDay = globalCycleData.value.actualPeriods.has(cellDateStr) || globalCycleData.value.predictedPeriods.has(cellDateStr);

    let isOvuDay = false;
    let isFertile = false;

    if (!isPeriodDay) {
        isOvuDay = globalCycleData.value.ovulation.has(cellDateStr);
        isFertile = !isOvuDay && globalCycleData.value.fertile.has(cellDateStr);
    }

    return {
        'is-period-day': isPeriodDay,
        'is-fertile-window': isFertile,
        'is-ovulation-day': isOvuDay
    }
}

const emptyDays = computed(() => new Date(currentYear.value, currentMonth.value - 1, 1).getDay())
const daysInMonth = computed(() => new Date(currentYear.value, currentMonth.value, 0).getDate())

const prevMonth = () => {
    slideDirection.value = 'slide-right'
    if (currentMonth.value === 1) { currentMonth.value = 12; currentYear.value-- }
    else { currentMonth.value-- }
}
const nextMonth = () => {
    slideDirection.value = 'slide-left'
    if (currentMonth.value === 12) { currentMonth.value = 1; currentYear.value++ }
    else { currentMonth.value++ }
}

const handleTouchStart = (e: TouchEvent) => { touchStartX.value = e.changedTouches[0].clientX }
const handleTouchEnd = (e: TouchEvent) => {
    touchEndX.value = e.changedTouches[0].clientX
    const swipeDistance = touchEndX.value - touchStartX.value
    if (swipeDistance > 50) prevMonth()
    else if (swipeDistance < -50) nextMonth()
}

const selectDate = (day: number) => {
    selectedDate.value = day
    selectedMonth.value = currentMonth.value
    selectedYear.value = currentYear.value

    const cellDateStr = `${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    if (isSavedPeriodDate(cellDateStr)) {
        isPeriod.value = 1
    } else {
        isPeriod.value = 0
    }
}

const isToday = (day: number) => day === now.getDate() && currentMonth.value === now.getMonth() + 1 && currentYear.value === now.getFullYear()
const isSelected = (day: number) => day === selectedDate.value && currentMonth.value === selectedMonth.value && currentYear.value === selectedYear.value
const togglePeriod = () => { isPeriod.value = isPeriod.value === 1 ? 0 : 1 }
const trailingEmptyDays = computed(() => 42 - emptyDays.value - daysInMonth.value)
const openPopup = async () => {
    showPopup.value = true
    currentYear.value = now.getFullYear()
    currentMonth.value = now.getMonth() + 1
    await fetchRecords()
    selectDate(now.getDate())
}

const closePopup = () => { showPopup.value = false }

const handleSave = async () => {
    if (!userStore.userInfo?.id) return showToast('请先登录')
    try {
        let start = null
        let end = null

        if (isPeriod.value === 1) {
            const cellDateStrSafe = selectedDateStr.value;
            if (isSavedPeriodDate(cellDateStrSafe)) {
                showToast('该日期已在姨妈期记录中');
                closePopup();
                return;
            }

            start = cellDateStrSafe;
            end = null
        }

        await saveBodyRecordApi({
            userId: userStore.userInfo.id,
            periodStartDate: start,
            periodEndDate: end,
            isPeriodUpdate: true,
            recordTime: selectedDateStr.value + " 00:00:00"
        })

        showToast({ type: 'success', message: '生理期记录成功！' })
        await fetchRecords()
        closePopup()
    } catch (error) {
        showToast('记录失败，请重试')
    }
}
</script>

<style scoped>
@import '@/styles/widget-style.css';

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.4);
    z-index: 2000;
}

.bottom-sheet {
    position: fixed;
    bottom: 3%;
    left: 5%;
    width: 90vw;
    background: #ffffff;
    border-radius: 24px;
    z-index: 2001;
    padding-bottom: env(safe-area-inset-bottom, 20px);
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
}

.sheet-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #f5f5f5;
}

.cancel-btn {
    font-size: 15px;
    color: #999;
    cursor: pointer;
}

.sheet-title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
}

.save-btn {
    font-size: 15px;
    color: #EC407A;
    font-weight: bold;
    cursor: pointer;
}

.sheet-content {
    padding: 20px;
}

.calendar-header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 16px;
}

.month-title {
    font-size: 16px;
    font-weight: bold;
    margin: 0 20px;
    color: #333;
}

.arrow-btn {
    background: #FCE4EC;
    color: #EC407A;
    border: none;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    cursor: pointer;
}

.calendar-swipe-zone {
    overflow: hidden;
    position: relative;
    touch-action: pan-y;
}

.weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    font-size: 13px;
    color: #999;
    margin-bottom: 12px;
}

.days-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    row-gap: 12px;
    width: 100%;
}

.day-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 40px;
    position: relative;
    cursor: pointer;
}

.day-num {
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 15px;
    color: #333;
    transition: all 0.3s;
}

.today-dot {
    font-size: 10px;
    color: #EC407A;
    position: absolute;
    bottom: -8px;
    font-weight: bold;
}

.day-cell.is-period-day .day-num {
    background-color: #FCE4EC;
    color: #E91E63;
}

.day-cell.is-fertile-window .day-num {
    background-color: #F3E5F5;
    color: #8E24AA;
}

.day-cell.is-ovulation-day .day-num {
    background-color: #6A1B9A;
    color: #FFFFFF;
    box-shadow: 0 4px 10px rgba(106, 27, 154, 0.4);
    font-weight: bold;
}

.day-cell.is-selected .day-num {
    border: 2px solid #EC407A;
    box-sizing: border-box;
}

.day-cell.is-selected:not(.is-period-day):not(.is-fertile-window):not(.is-ovulation-day) .day-num {
    background-color: #EC407A;
    color: #fff;
    border: none;
}

.cycle-legend {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-bottom: 20px;
    font-size: 12px;
    color: #666;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 4px;
}

.dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.period-dot {
    background-color: #E91E63;
}

.fertile-dot {
    background-color: #CE93D8;
}

.ovulation-dot {
    background-color: #6A1B9A;
}

.period-toggle-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #FFF5F8;
    padding: 16px;
    border-radius: 16px;
    cursor: pointer;
}

.toggle-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.toggle-text {
    font-size: 15px;
    color: #333;
    font-weight: 500;
}

.custom-radio {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid #ccc;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.days-grid-wrapper {
    position: relative;
    height: 300px;
    width: 100%;
    margin-bottom: 16px;
    overflow: hidden;
}

.custom-radio.active {
    border-color: #EC407A;
    background: #EC407A;
}

.radio-inner {
    color: #fff;
    font-size: 14px;
    font-weight: bold;
}

.slide-left-leave-active,
.slide-right-leave-active {
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
}

.slide-left-enter-active,
.slide-right-enter-active {
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-left-enter-from {
    opacity: 0;
    transform: translateX(30px);
}

.slide-left-leave-to {
    opacity: 0;
    transform: translateX(-30px);
}

.slide-right-enter-from {
    opacity: 0;
    transform: translateX(-30px);
}

.slide-right-leave-to {
    opacity: 0;
    transform: translateX(30px);
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
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
    transform: translateY(100%);
}
</style>