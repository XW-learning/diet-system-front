<template>
    <div class="calendar-container">
        <div class="status-bar-placeholder"></div>

        <header class="nav-header">
            <button class="nav-icon-btn" @click="handleBack">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                    stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>

            <div class="nav-tabs">
                <div class="tab-item" :class="{ active: activeTab === 'fitness' }" @click="activeTab = 'fitness'">
                    健身日历
                </div>
                <div class="tab-item" :class="{ active: activeTab === 'fat-loss' }" @click="activeTab = 'fat-loss'">
                    减脂日历
                </div>
                <div class="tab-item" :class="{ active: activeTab === 'food' }" @click="activeTab = 'food'">
                    美食日历
                </div>
            </div>

            <button class="nav-icon-btn" @click="handleShare">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                    stroke-linejoin="round">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
            </button>
        </header>

        <div class="bg-decoration"></div>

        <main class="calendar-content">
            <transition name="fade" mode="out-in">
                <div v-if="activeTab === 'fat-loss'" class="calendar-card" key="fat-loss">
                    <div class="month-header">
                        <button class="arrow-btn" @click="prevMonth">❮</button>
                        <span class="month-title">{{ currentYear }}年 {{ currentMonth }}月</span>
                        <button class="arrow-btn" @click="nextMonth">❯</button>
                    </div>

                    <div class="weekdays">
                        <span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span>
                    </div>

                    <div class="days-grid">
                        <div v-for="(day, index) in calendarDays" :key="index" class="day-cell"
                            :class="{ 'other-month': !day.isCurrentMonth, 'is-today': day.fullDate === todayStr }">
                            <div class="day-num">{{ day.date }}</div>

                            <div class="day-data fat-loss-data" v-if="day.data && activeTab === 'fat-loss'">
                                <div v-if="day.data.intakeCalorie" class="capsule capsule-orange">
                                    摄入 {{ day.data.intakeCalorie }}
                                </div>
                                <div v-if="day.data.deficitCalorie" class="capsule capsule-green">
                                    缺口 {{ day.data.deficitCalorie }}
                                </div>
                                <div v-if="day.data.weight" class="capsule capsule-purple">
                                    {{ day.data.weight }}kg
                                </div>
                                <div v-if="day.data.hasWater" class="capsule capsule-blue">
                                    💧 已饮水
                                </div>
                                <div v-if="day.data.isPeriod" class="capsule capsule-red">
                                    🌸 经期日
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="legend-container">
                        <div class="legend-item"><span class="legend-dot dot-orange"></span>饮食摄入</div>
                        <div class="legend-item"><span class="legend-dot dot-green"></span>热量缺口</div>
                        <div class="legend-item"><span class="legend-dot dot-blue"></span>饮水</div>
                        <div class="legend-item"><span class="legend-dot dot-purple"></span>体重</div>
                        <div class="legend-item"><span class="legend-dot dot-red"></span>经期</div>
                    </div>
                </div>

                <div v-else-if="activeTab === 'fitness'" class="fitness-wrapper" key="fitness">
                    <div class="streak-banner">
                        <div class="streak-text">
                            <span class="fire-icon">🔥</span>
                            <span class="streak-title">连胜第 <span class="highlight">{{ continuousDays }}</span> 天</span>
                            <p class="streak-sub">保持活力，继续加油！</p>
                        </div>
                        <img :src="beaverImage" class="streak-mascot" alt="Mascot" />
                    </div>

                    <div class="stats-row">
                        <div class="stat-card">
                            <div class="stat-icon icon-purple">🏋️</div>
                            <div class="stat-val">{{ totalWorkoutDays }}<span class="unit">天</span></div>
                            <div class="stat-label">累计运动</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon icon-blue">⏱️</div>
                            <div class="stat-val">{{ totalDuration }}<span class="unit">分</span></div>
                            <div class="stat-label">累计时长</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon icon-orange">🔥</div>
                            <div class="stat-val">{{ totalBurnCalorie }}<span class="unit">千卡</span></div>
                            <div class="stat-label">累计消耗</div>
                        </div>
                    </div>

                    <div class="calendar-card">
                        <div class="month-header">
                            <button class="arrow-btn" @click="prevMonth">❮</button>
                            <span class="month-title">{{ currentYear }}年 {{ currentMonth }}月</span>
                            <button class="arrow-btn" @click="nextMonth">❯</button>
                        </div>
                        <div class="weekdays">
                            <span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span>
                        </div>
                        <div class="days-grid">
                            <div v-for="(day, index) in calendarDays" :key="index" class="day-cell"
                                :class="{ 'other-month': !day.isCurrentMonth, 'is-today': day.fullDate === todayStr }">
                                <div class="day-num">{{ day.date }}</div>
                                <div class="day-data fitness-data" v-if="day.data && activeTab === 'fitness'">
                                    <div class="capsule capsule-orange" v-if="day.data.calories">🔥 {{ day.data.calories
                                    }}</div>
                                    <div class="capsule capsule-gray" v-if="day.data.duration">⏱️ {{ day.data.duration
                                    }}m</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="top-list-card">
                        <h3 class="list-title">🏆 锻炼时间 Top 5</h3>
                        <div class="top-list">
                            <div v-for="(item, index) in top5Workouts" :key="index" class="list-item">
                                <div class="rank-badge" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
                                <div class="item-info">
                                    <div class="item-header">
                                        <span class="item-name">{{ item.name }}</span>
                                        <span class="item-time">{{ item.duration }} 分钟</span>
                                    </div>
                                    <div class="progress-bg">
                                        <div class="progress-fill"
                                            :style="{ width: top5Workouts.length ? (item.duration / top5Workouts[0].duration * 100) + '%' : '0%' }">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else-if="activeTab === 'food'" class="food-wrapper" key="food">
                    <div class="calendar-card">
                        <div class="month-header">
                            <button class="arrow-btn" @click="prevMonth">❮</button>
                            <span class="month-title">{{ currentYear }}年 {{ currentMonth }}月</span>
                            <button class="arrow-btn" @click="nextMonth">❯</button>
                        </div>
                        <div class="weekdays">
                            <span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span>
                        </div>
                        <div class="days-grid">
                            <div v-for="(day, index) in calendarDays" :key="index" class="day-cell" :class="{
                                'other-month': !day.isCurrentMonth,
                                'is-today': day.fullDate === todayStr,
                                'is-selected': day.fullDate === selectedFoodDate /* 选中态样式可自己加点高亮边框 */
                            }" @click="day.isCurrentMonth && day.fullDate && selectFoodDate(day.fullDate)">
                                <div class="day-num">{{ day.date }}</div>

                                <div v-if="day.data && activeTab === 'food'" class="food-emojis">
                                    <span v-if="day.data.meals?.includes('breakfast')">🥐</span>
                                    <span v-if="day.data.meals?.includes('lunch')">🍱</span>
                                    <span v-if="day.data.meals?.includes('dinner')">🥗</span>
                                    <span v-if="day.data.meals?.includes('snack')">🥨</span>
                                    <div v-if="day.data.isOver" class="warning-dot"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="nutrition-summary-card">
                        <div class="summary-header">
                            <div class="summary-title">{{ selectedFoodDate }} 营养摄入</div>
                            <div class="summary-total">{{ dailyNutrition.intakeCalorie || 0 }} <span class="unit">/ {{
                                dailyNutrition.budgetCalorie || 0 }} kcal</span></div>
                        </div>
                        <div class="macro-bars">
                            <div class="macro-item">
                                <div class="macro-info"><span>碳水化合物</span><span>{{ dailyNutrition.totalCarbohydrate || 0
                                }}g / {{ dailyNutrition.recommendCarbohydrate || 0 }}g</span></div>
                                <div class="macro-track">
                                    <div class="macro-fill fill-yellow"
                                        :style="{ width: getMacroPercent(dailyNutrition.totalCarbohydrate, dailyNutrition.recommendCarbohydrate) + '%' }">
                                    </div>
                                </div>
                            </div>
                            <div class="macro-item">
                                <div class="macro-info"><span>蛋白质</span><span>{{ dailyNutrition.totalProtein || 0 }}g /
                                        {{ dailyNutrition.recommendProtein || 0 }}g</span></div>
                                <div class="macro-track">
                                    <div class="macro-fill fill-pink"
                                        :style="{ width: getMacroPercent(dailyNutrition.totalProtein, dailyNutrition.recommendProtein) + '%' }">
                                    </div>
                                </div>
                            </div>
                            <div class="macro-item">
                                <div class="macro-info"><span>脂肪</span><span>{{ dailyNutrition.totalFat || 0 }}g / {{
                                    dailyNutrition.recommendFat || 0 }}g</span></div>
                                <div class="macro-track">
                                    <div class="macro-fill fill-blue"
                                        :style="{ width: getMacroPercent(dailyNutrition.totalFat, dailyNutrition.recommendFat) + '%' }">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="meals-list-card">
                        <h3 class="list-title">🍽️ 食谱明细</h3>

                        <div class="meal-timeline" v-if="dailyMeals && dailyMeals.length > 0">
                            <div class="meal-item" v-for="(meal, idx) in dailyMeals" :key="idx">
                                <div class="meal-icon" :class="getMealIconClass(meal.mealType)">
                                    {{ getMealEmoji(meal.mealType) }}
                                </div>
                                <div class="meal-content">
                                    <div class="meal-header">
                                        <span class="meal-name">{{ meal.dishName || '自定食物' }}</span>
                                        <span class="meal-cal">{{ meal.calorie }} kcal</span>
                                    </div>
                                    <div class="meal-desc">碳水 {{ meal.carbohydrate || 0 }}g | 蛋白 {{ meal.protein || 0
                                    }}g | 脂肪 {{ meal.fat || 0 }}g</div>
                                </div>
                            </div>
                        </div>

                        <div v-else style="text-align: center; color: #999; padding: 20px 0; font-size: 13px;">
                            当天还没有饮食记录哦，快去打卡吧~
                        </div>
                    </div>
                </div>
            </transition>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import beaverImage from '@/assets/beaver.png'
import { useUserStore } from '@/stores/user'
import {
    getFitnessCalendarApi,
    getFatLossCalendarApi,
    getFoodCalendarApi,     // 新增
    getDailyAnalysis,       // 新增
    getCheckInDetail        // 新增
} from '@/api/checkin'


const emit = defineEmits(['close'])
const activeTab = ref<'fitness' | 'fat-loss' | 'food'>('fitness')
const userStore = useUserStore()


const handleBack = () => { emit('close') }
const handleShare = () => { console.log('触发分享功能') }

// 使用真实的当前日期初始化
const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth() + 1)
const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

// 月份切换控制
const prevMonth = () => {
    if (currentMonth.value === 1) {
        currentMonth.value = 12
        currentYear.value--
    } else {
        currentMonth.value--
    }
}
const nextMonth = () => {
    if (currentMonth.value === 12) {
        currentMonth.value = 1
        currentYear.value++
    } else {
        currentMonth.value++
    }
}

// ---------------- 健身日历动态状态 ----------------
const continuousDays = ref(0)
const totalWorkoutDays = ref(0)
const totalDuration = ref(0)
const totalBurnCalorie = ref(0)
const top5Workouts = ref<{ name: string, duration: number }[]>([])
const fitnessData = ref<Record<string, any>>({})

// 动态拉取健身日历数据
// 动态拉取健身日历数据
const fetchFitnessData = async () => {
    console.log('--- 准备获取健身日历数据 ---')

    if (!userStore.userInfo?.id) {
        console.warn('❌ 请求中止：userStore.userInfo.id 为空！')
        return
    }

    try {
        const res = await getFitnessCalendarApi(userStore.userInfo.id, currentYear.value, currentMonth.value)
        console.log('✅ 接口请求成功返回:', res)

        // 🌟 核心修复：兼容 Axios 拦截器是否去壳
        // 如果 res 里直接有 continuousDays，说明拦截器已经把 data 剥离出来了
        // 如果 res 包含 code，说明拦截器没剥壳，就去拿 res.data
        const data = (res as any).code !== undefined ? (res as any).data : res;

        if (data) {
            continuousDays.value = data.continuousDays || 0
            totalWorkoutDays.value = data.totalWorkoutDays || 0
            totalDuration.value = data.totalDuration || 0
            totalBurnCalorie.value = data.totalBurnCalorie || 0
            top5Workouts.value = data.top5Workouts || []
            fitnessData.value = data.dailyData || {}
            console.log('✅ 数据已成功赋值给前端响应式变量:', fitnessData.value)
        } else {
            console.error('⚠️ 获取到的数据为空', res)
        }
    } catch (error) {
        console.error('❌ 获取健身日历失败:', error)
    }
}

// 当日期发生变化，或者切换到了健身Tab时触发接口调用
watch([currentYear, currentMonth, activeTab], () => {
    if (activeTab.value === 'fitness') fetchFitnessData()
    else if (activeTab.value === 'fat-loss') fetchFatLossData()
    else if (activeTab.value === 'food') {
        fetchFoodData()
        fetchDailyNutrition(selectedFoodDate.value) // 切换到美食页时，加载一下当前选中日期的详情
    }
})

// 组件挂载时拉取当前月的数据
onMounted(() => {
    if (activeTab.value === 'fitness') fetchFitnessData()
    else if (activeTab.value === 'fat-loss') fetchFatLossData()
    else if (activeTab.value === 'food') {
        fetchFoodData()
        fetchDailyNutrition(selectedFoodDate.value)
    }
})
// --------------------------------------------------

// 1. 减脂 Mock 数据 (尚未实现动态加载，保留原样)
const fatLossData = ref<Record<string, any>>({})

const fetchFatLossData = async () => {
    if (!userStore.userInfo?.id) return
    try {
        const res = await getFatLossCalendarApi(userStore.userInfo.id, currentYear.value, currentMonth.value)
        // 兼容脱壳逻辑
        const data = (res as any).code !== undefined ? (res as any).data : res
        if (data && data.dailyData) {
            fatLossData.value = data.dailyData
        } else {
            fatLossData.value = {}
        }
    } catch (error) {
        console.error('获取减脂日历失败:', error)
    }
}

// 3. 美食 Mock 数据 (尚未实现动态加载，保留原样)
const foodData = ref<Record<string, any>>({})
const selectedFoodDate = ref(todayStr) // 当前选中的查看日期，默认为今天
const dailyNutrition = ref<any>({})    // 当日营养总览数据
const dailyMeals = ref<any[]>([])      // 当日饮食流水账

// 1. 获取当月美食日历网格数据
const fetchFoodData = async () => {
    if (!userStore.userInfo?.id) return
    try {
        const res = await getFoodCalendarApi(userStore.userInfo.id, currentYear.value, currentMonth.value)
        const data = (res as any).code !== undefined ? (res as any).data : res
        if (data && data.dailyData) {
            foodData.value = data.dailyData
        } else {
            foodData.value = {}
        }
    } catch (error) {
        console.error('获取美食日历网格失败:', error)
    }
}

// 2. 获取单日底部详情数据（进度条 + 流水账）
const fetchDailyNutrition = async (date: string) => {
    if (!userStore.userInfo?.id) return
    try {
        // 查营养进度
        const analysisRes = await getDailyAnalysis(userStore.userInfo.id, date)
        dailyNutrition.value = ((analysisRes as any).code !== undefined ? (analysisRes as any).data : analysisRes) || {}

        // 查食谱流水账
        const detailRes = await getCheckInDetail(userStore.userInfo.id, date)
        const detailData = (detailRes as any).code !== undefined ? (detailRes as any).data : detailRes
        dailyMeals.value = detailData?.meals || []
    } catch (error) {
        console.error('获取单日饮食详情失败:', error)
    }
}

// 点击美食日历格子时触发
const selectFoodDate = (date: string) => {
    if (activeTab.value !== 'food') return
    selectedFoodDate.value = date
    fetchDailyNutrition(date)
}

// 辅助函数：计算进度条百分比（最高100%）
const getMacroPercent = (actual: number, recommend: number) => {
    if (!actual || !recommend || recommend === 0) return 0
    const pct = (actual / recommend) * 100
    return pct > 100 ? 100 : pct
}

// 辅助函数：根据餐次映射Emoji和颜色
const getMealEmoji = (type: number) => {
    switch (type) {
        case 1: return '🥐'; case 2: return '🍱'; case 3: return '🥗'; case 4: return '🥨'; default: return '🍽️';
    }
}
const getMealIconClass = (type: number) => {
    switch (type) {
        case 1: return 'icon-bg-yellow'; case 2: return 'icon-bg-blue'; case 3: return 'icon-bg-pink'; default: return 'icon-bg-yellow';
    }
}

const calendarDays = computed(() => {
    const year = currentYear.value;
    const month = currentMonth.value - 1;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    let currentDataSource: Record<string, any> = {};
    if (activeTab.value === 'fat-loss') currentDataSource = fatLossData.value;
    // 使用动态请求回来的 .value
    if (activeTab.value === 'fitness') currentDataSource = fitnessData.value;
    if (activeTab.value === 'food') currentDataSource = foodData;

    const days = [];

    for (let i = firstDay - 1; i >= 0; i--) {
        days.push({ date: daysInPrevMonth - i, isCurrentMonth: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
        days.push({
            date: i,
            fullDate: dateStr,
            isCurrentMonth: true,
            data: currentDataSource[dateStr]
        });
    }

    const totalCells = days.length > 35 ? 42 : 35;
    for (let i = 1; i <= totalCells - days.length; i++) {
        days.push({ date: i, isCurrentMonth: false });
    }

    return days;
});
</script>

<style scoped>
/* 容器及通用样式保持不变 */

header.nav-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background-color: #FFF3D9;
}

/* 1. 设置滚动容器 */
.calendar-container {
    scroll-timeline: --page-scroll block;
}

/* 2. 定义阴影动画 */
@keyframes show-shadow {
    from {
        box-shadow: 0 0 0 rgba(0, 0, 0, 0);
    }

    to {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
}

/* 3. 将动画绑定到滚动 */
header.nav-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background-color: #FFF3D9;

    /* 关键代码 */
    animation: show-shadow linear both;
    animation-timeline: --page-scroll;
    animation-range: 0px 50px;
    /* 滚动 0-50px 之间完成阴影切换 */
}

.calendar-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 2000;
    overflow-y: auto;
    background-color: #FFF3D9;
    font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif;
    padding-bottom: 40px;
    overflow-y: auto;
    /* 允许上下滑动 */
    overflow-x: hidden;
    /* 禁止左右滑动 */
}

.status-bar-placeholder {
    height: env(safe-area-inset-top, 44px);
    width: 100%;
}

.nav-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 50px 10px 10px 10px;
    position: relative;
    z-index: 10;
}

.nav-icon-btn {
    background: none;
    border: none;
    padding: 8px;
    color: #8B5A2B;
    cursor: pointer;
}

.nav-icon-btn svg {
    width: 24px;
    height: 24px;
}

.nav-tabs {
    display: flex;
    gap: 20px;
    align-items: center;
}

.tab-item {
    color: rgba(139, 90, 43, 0.5);
    font-size: 16px;
    transition: all 0.3s ease;
    cursor: pointer;
    padding: 4px 0;
}

.tab-item.active {
    color: #8B5A2B;
    font-weight: 600;
    font-size: 18px;
    position: relative;
}

.tab-item.active::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 16px;
    height: 3px;
    background-color: #8B5A2B;
    border-radius: 4px;
}

.bg-decoration {
    position: absolute;
    top: 8%;
    right: -5%;
    width: 150px;
    height: 150px;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23f7e5c3" stroke-width="2"><path d="M6 5v14M18 5v14M6 12h12M4 7h4v10H4zM16 7h4v10h-4z"/></svg>');
    background-size: cover;
    opacity: 0.6;
    z-index: 0;
    pointer-events: none;
    transform: rotate(15deg);
}

.calendar-content {
    position: relative;
    z-index: 10;
    padding: 16px;
}

/* 共享日历卡片样式 */
.calendar-card {
    background-color: #FFFFFF;
    border-radius: 24px;
    padding: 20px 14px;
    box-shadow: 0 12px 30px rgba(139, 90, 43, 0.06);
    margin-bottom: 16px;
}

.month-header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
}

.month-title {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    margin: 0 20px;
}

.arrow-btn {
    background: none;
    border: none;
    font-size: 14px;
    color: #A0A0A0;
    cursor: pointer;
    padding: 4px 10px;
}

.weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    font-size: 12px;
    color: #A0A0A0;
    margin-bottom: 12px;
}

.days-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    row-gap: 8px;
    column-gap: 2px;
}

.day-cell {
    min-height: 64px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 12px;
    padding: 4px 1px;
    transition: background-color 0.2s;
    position: relative;
}

.day-cell.is-today {
    background-color: #FFF9EA;
}

.day-num {
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin-bottom: 2px;
}

.other-month .day-num {
    color: #D3D3D3;
}

.day-data {
    display: flex;
    flex-direction: column;
    gap: 1px;
    /* 之前是 3px，改成 1px 节省空间 */
    width: 100%;
    align-items: center;
}

.capsule {
    font-size: 9px;
    line-height: 2;
    /* 新增：压低行高 */
    padding: 1px 3px;
    /* 将原本的 2px 4px 缩小，让盒子变得更扁 */
    border-radius: 3px;
    /* 圆角稍微调小更协调 */
    white-space: nowrap;
    transform: scale(0.85);
    /* 之前是 0.9，再缩小一点点防止 5 个胶囊堆叠撑破格子 */
    font-weight: 600;
}

.capsule-green {
    background-color: #E8F5E9;
    color: #4CAF50;
}

.capsule-purple {
    background-color: #F3E5F5;
    color: #9C27B0;
}

.capsule-orange {
    background-color: #FFF3E0;
    color: #FF9800;
}

.capsule-gray {
    background-color: #F5F5F5;
    color: #757575;
}

/* 3. 新增：饮水和经期的专属胶囊颜色 */
.capsule-blue {
    background-color: #E3F2FD;
    color: #2196F3;
}

.capsule-red {
    background-color: #FFEBEE;
    color: #F44336;
}

/* 减脂页专属 */
.legend-container {
    margin-top: 24px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
    padding-top: 16px;
    border-top: 1px dashed #F0F0F0;
}

.legend-item {
    display: flex;
    align-items: center;
    font-size: 11px;
    color: #666;
}

.legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 4px;
}

.dot-orange {
    background-color: #FFB74D;
}

.dot-green {
    background-color: #81C784;
}

.dot-blue {
    background-color: #64B5F6;
}

.dot-purple {
    background-color: #BA68C8;
}

.dot-red {
    background-color: #E57373;
}

/* 补充：小圆点容器及基础圆点样式 */
.status-dots {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    /* 两个圆点之间的间距 */
    margin-top: 2px;
    height: 8px;
    /* 占位高度，防止格子高度跳动 */
}

.dot {
    display: inline-block;
    width: 6px;
    /* 圆点宽度 */
    height: 6px;
    /* 圆点高度 */
    border-radius: 50%;
    /* 变成圆形 */
}

/* 健身页专属 */
.fitness-wrapper {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.streak-banner {
    background: linear-gradient(135deg, #FFF0F5 0%, #FFE4E1 100%);
    border-radius: 20px;
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 8px 20px rgba(255, 182, 193, 0.2);
}

.streak-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.streak-title {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    display: flex;
    align-items: center;
    gap: 4px;
}

.streak-title .highlight {
    color: #FF6B81;
    font-size: 24px;
    font-weight: 900;
}

.streak-sub {
    font-size: 12px;
    color: #888;
    margin: 0;
}

.streak-mascot {
    width: 60px;
    height: 60px;
    object-fit: contain;
}

.stats-row {
    display: flex;
    gap: 12px;
}

.stat-card {
    flex: 1;
    background: #fff;
    border-radius: 16px;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
}

.stat-icon {
    font-size: 22px;
    margin-bottom: 8px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.icon-purple {
    background: #F3E5F5;
}

.icon-blue {
    background: #E3F2FD;
}

.icon-orange {
    background: #FFF3E0;
}

.stat-val {
    font-size: 20px;
    font-weight: 900;
    color: #333;
    margin-bottom: 2px;
}

.stat-val .unit {
    font-size: 12px;
    font-weight: normal;
    color: #888;
    margin-left: 2px;
}

.stat-label {
    font-size: 11px;
    color: #999;
}

.top-list-card {
    background: #fff;
    border-radius: 24px;
    padding: 20px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.03);
    margin-top: 4px;
}

.list-title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin: 0 0 16px 0;
}

.list-item {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
}

.list-item:last-child {
    margin-bottom: 0;
}

.rank-badge {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    background: #F5F5F5;
    color: #999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
}

.rank-1 {
    background: #FFD700;
    color: #fff;
}

.rank-2 {
    background: #C0C0C0;
    color: #fff;
}

.rank-3 {
    background: #CD7F32;
    color: #fff;
}

.item-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.item-header {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: #333;
    font-weight: 500;
}

.item-time {
    color: #888;
    font-size: 12px;
}

.progress-bg {
    width: 100%;
    height: 6px;
    background: #F0F0F0;
    border-radius: 3px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #FFB6C1 0%, #FF6B81 100%);
    border-radius: 3px;
    transition: width 0.5s ease;
}

/* ================= 美食页专属 ================= */
.food-wrapper {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

/* 1. 营养总览卡片 */
.nutrition-summary-card {
    background: #fff;
    border-radius: 24px;
    padding: 20px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.03);
}

.summary-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 16px;
}

.summary-title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
}

.summary-total {
    font-size: 24px;
    font-weight: 900;
    color: #8B5A2B;
}

.summary-total .unit {
    font-size: 12px;
    font-weight: normal;
    color: #888;
}

.macro-bars {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.macro-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.macro-info {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #666;
}

.macro-track {
    width: 100%;
    height: 8px;
    background: #F5F5F5;
    border-radius: 4px;
    overflow: hidden;
}

.macro-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.5s ease;
}

.fill-yellow {
    background: #FFD54F;
}

.fill-pink {
    background: #F48FB1;
}

.fill-blue {
    background: #64B5F6;
}

/* 2. 日历格子里的 Emoji */
.food-emojis {
    font-size: 10px;
    display: flex;
    gap: 2px;
    margin-top: 4px;
}

.warning-dot {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 6px;
    height: 6px;
    background-color: #FF7043;
    border-radius: 50%;
    box-shadow: 0 0 4px rgba(255, 112, 67, 0.5);
}

/* 3. 今日食谱列表 */
.meals-list-card {
    background: #fff;
    border-radius: 24px;
    padding: 20px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.03);
}

.meal-timeline {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 16px;
    position: relative;
}

/* 左侧虚线连接 */
.meal-timeline::before {
    content: '';
    position: absolute;
    left: 19px;
    top: 20px;
    bottom: 20px;
    width: 2px;
    border-left: 2px dashed #F0F0F0;
    z-index: 0;
}

.meal-item {
    display: flex;
    gap: 12px;
    position: relative;
    z-index: 1;
}

.meal-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    background-color: #fff;
}

.icon-bg-yellow {
    border: 2px solid #FFF3E0;
}

.icon-bg-pink {
    border: 2px solid #FCE4EC;
}

.icon-bg-blue {
    border: 2px solid #E3F2FD;
}

.meal-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    padding-bottom: 12px;
    border-bottom: 1px solid #F9F9F9;
}

.meal-item:last-child .meal-content {
    border-bottom: none;
    padding-bottom: 0;
}

.meal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.meal-name {
    font-size: 14px;
    font-weight: bold;
    color: #333;
}

.meal-cal {
    font-size: 13px;
    font-weight: bold;
    color: #8B5A2B;
}

.meal-desc {
    font-size: 12px;
    color: #888;
    line-height: 1.4;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
    opacity: 0;
    transform: translateY(10px);
}

.fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

/* 经期红点角标 */
.period-badge {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 6px;
    height: 6px;
    background-color: #EF5350;
    /* 红色 */
    border-radius: 50%;
    box-shadow: 0 0 4px rgba(239, 83, 80, 0.4);
}
</style>