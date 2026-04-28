<template>
    <div class="plan-detail-container">
        <div class="header">
            <img src="@/assets/home/右箭头.png" class="back-icon" @click="goBack" alt="back" />
            <h2>{{ planTitle }}</h2>
            <div class="placeholder-box"></div>
        </div>

        <div class="overview-panel">
            <div class="calorie-circle">
                <span class="num">{{ totalDailyCalories }}</span>
                <span class="unit">千卡 / 天</span>
            </div>
            <div class="macros-row">
                <div class="macro-item">
                    <span class="macro-label">碳水</span>
                    <span class="macro-value">145g</span>
                </div>
                <div class="macro-item">
                    <span class="macro-label">蛋白质</span>
                    <span class="macro-value">90g</span>
                </div>
                <div class="macro-item">
                    <span class="macro-label">脂肪</span>
                    <span class="macro-value">45g</span>
                </div>
            </div>
        </div>

        <div class="day-selector">
            <div v-for="day in 5" :key="day" class="day-tab" :class="{ active: currentDay === day }"
                @click="switchDay(day)">
                第{{ day }}天
            </div>
        </div>

        <div class="meals-list">
            <div v-for="(meal, index) in currentDayMeals" :key="index" class="meal-card">
                <div class="meal-header">
                    <h3>{{ meal.name }}</h3>
                    <span class="meal-cals">{{ meal.totalCalories }} 千卡</span>
                </div>

                <div class="dish-list">
                    <div v-for="(dish, dIndex) in meal.dishes" :key="dIndex" class="dish-item">
                        <div class="dish-img-placeholder">
                            <span class="img-text">图</span>
                        </div>
                        <div class="dish-info">
                            <div class="dish-name">{{ dish.name }}</div>
                            <div class="dish-weight">{{ dish.weight }}</div>
                        </div>
                        <div class="dish-cal">{{ dish.calories }} 千卡</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="bottom-action">
            <button class="start-btn" @click="startPlan">将此食谱设为我的计划</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePlanStore } from '@/stores/plan';
import { useRouter, useRoute } from 'vue-router';

const planStore = usePlanStore();
const router = useRouter();

const route = useRoute();

const planTitle = ref('7天减脂冲刺计划'); // 后续可从路由参数或接口获取
const currentDay = ref(1);
const totalDailyCalories = ref(1450);

const goBack = () => {
    router.back();
};

const switchDay = (day: number) => {
    currentDay.value = day;
};

// Mock: 基础的一天食谱数据
const baseMeals = [
    {
        name: '早餐',
        totalCalories: 350,
        dishes: [
            { name: '紫薯（蒸）', weight: '150g', calories: 153 },
            { name: '水煮蛋', weight: '1个 (50g)', calories: 78 },
            { name: '脱脂纯牛奶', weight: '1杯 (200ml)', calories: 66 }
        ]
    },
    {
        name: '午餐',
        totalCalories: 600,
        dishes: [
            { name: '糙米饭', weight: '1碗 (150g)', calories: 170 },
            { name: '香煎鸡胸肉', weight: '150g', calories: 199 },
            { name: '清炒西蓝花', weight: '200g', calories: 60 }
        ]
    },
    {
        name: '加餐',
        totalCalories: 100,
        dishes: [
            { name: '苹果', weight: '1个 (150g)', calories: 80 }
        ]
    },
    {
        name: '晚餐',
        totalCalories: 400,
        dishes: [
            { name: '清蒸鲈鱼', weight: '150g', calories: 158 },
            { name: '蒜蓉菠菜', weight: '200g', calories: 50 },
            { name: '玉米半根', weight: '100g', calories: 112 }
        ]
    }
];

// 计算属性：根据当前天数返回对应的食谱。因为需求说1-5天一样，这里直接返回 baseMeals
const currentDayMeals = computed(() => {
    // 后期这里可以改成： return allDaysData.value[currentDay.value]
    return baseMeals;
});

const startPlan = () => {
    // 将当前页面的数据（包括标题、三餐列表）存入 Store
    planStore.setActivePlan({
        id: route.params.id,
        title: planTitle.value,
        meals: baseMeals // 这里使用我们之前定义的 baseMeals
    });

    // 提示并跳转回主页
    console.log('计划已激活');
    router.push('/plan');
};
</script>

<style scoped>
.plan-detail-container {
    background-color: #f7f8fa;
    min-height: 100vh;
    padding-bottom: 90px;
    /* 给底部悬浮按钮留出空间 */
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

/* 顶部导航 */
.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 44px 16px 12px 16px;
    background-color: #fff;
    position: sticky;
    top: 0;
    z-index: 10;
}

.back-icon {
    width: 24px;
    height: 24px;
    transform: rotate(180deg);
    /* 旋转变成左箭头 */
    cursor: pointer;
}

.header h2 {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0;
}

.placeholder-box {
    width: 24px;
}

/* 营养总览面板 */
.overview-panel {
    background-color: #fff;
    margin: 12px 16px;
    border-radius: 16px;
    padding: 20px 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
    text-align: center;
}

.calorie-circle {
    margin-bottom: 16px;
}

.calorie-circle .num {
    font-size: 32px;
    font-weight: bold;
    color: #4caf50;
    /* 主题绿 */
}

.calorie-circle .unit {
    font-size: 12px;
    color: #999;
    margin-left: 4px;
}

.macros-row {
    display: flex;
    justify-content: space-around;
    border-top: 1px dashed #eee;
    padding-top: 16px;
}

.macro-item {
    display: flex;
    flex-direction: column;
}

.macro-label {
    font-size: 12px;
    color: #999;
    margin-bottom: 4px;
}

.macro-value {
    font-size: 14px;
    font-weight: 600;
    color: #333;
}

/* 天数切换导航 */
.day-selector {
    display: flex;
    overflow-x: auto;
    padding: 0 16px 12px;
    /* 隐藏滚动条 */
    scrollbar-width: none;
}

.day-selector::-webkit-scrollbar {
    display: none;
}

.day-tab {
    flex-shrink: 0;
    padding: 6px 16px;
    margin-right: 12px;
    border-radius: 20px;
    background-color: #e8eaed;
    color: #666;
    font-size: 14px;
    transition: all 0.3s ease;
    cursor: pointer;
}

.day-tab.active {
    background-color: #4caf50;
    color: #fff;
    font-weight: bold;
    box-shadow: 0 2px 6px rgba(76, 175, 80, 0.3);
}

/* 菜品列表 */
.meals-list {
    padding: 0 16px;
}

.meal-card {
    background-color: #fff;
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.meal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.meal-header h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    color: #333;
}

.meal-cals {
    font-size: 13px;
    color: #ff9800;
    /* 橙色高亮热量 */
    background-color: #fff3e0;
    padding: 2px 8px;
    border-radius: 12px;
}

/* 单个菜品样式 */
.dish-item {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
}

.dish-item:last-child {
    margin-bottom: 0;
}

.dish-img-placeholder {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    background-color: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
}

.img-text {
    font-size: 12px;
    color: #ccc;
}

.dish-info {
    flex: 1;
}

.dish-name {
    font-size: 15px;
    color: #333;
    margin-bottom: 4px;
    font-weight: 500;
}

.dish-weight {
    font-size: 13px;
    color: #999;
}

.dish-cal {
    font-size: 14px;
    color: #666;
    font-weight: 500;
}

/* 底部按钮 */
.bottom-action {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 12px 24px 24px;
    /* 适配全面屏底部 */
    background: linear-gradient(to top, rgba(255, 255, 255, 1) 80%, rgba(255, 255, 255, 0));
    display: flex;
    justify-content: center;
}

.start-btn {
    width: 100%;
    max-width: 400px;
    padding: 14px 0;
    background-color: #4caf50;
    color: #fff;
    border: none;
    border-radius: 28px;
    font-size: 16px;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.start-btn:active {
    transform: scale(0.98);
}
</style>