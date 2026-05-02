// filepath: components/plan/PlanDetail.vue
<template>
    <div class="plan-detail-page">
        <!-- Status bar and header overlay -->
        <div class="top-header" :class="{ 'scrolled': isScrolled }">
            <div class="back-btn" @click="goBack">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5"
                    stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </div>
            <div class="header-title" v-if="isScrolled">{{ planInfo.name || '16+8轻断食食谱' }}</div>
            <div class="placeholder-box" v-if="isScrolled"></div>
        </div>

        <div class="cover-section">
            <img :src="planInfo.coverImage || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80'"
                class="cover-img" />
            <div class="meta-overlay">
                <div class="plan-title-large">{{ planInfo.name || '16+8轻断食食谱' }}</div>
                <div class="stats-row">
                    <span>🕒 {{ planInfo.duration || 7 }}天</span>
                    <span>📉 效果{{ planInfo.weightLoss || '3-8斤' }}</span>
                    <span>🔥 {{ planInfo.usageCount || 114640 }}人使用过</span>
                </div>
                <div class="tags">
                    <span class="tag" v-for="tag in (planInfo.tagList || ['限时进食', '不节食', '代谢转换'])" :key="tag">{{ tag
                        }}</span>
                </div>
            </div>
        </div>

        <div class="day-selector-wrapper">
            <div class="day-tabs">
                <div class="tab" v-for="day in (planInfo.duration || 7)" :key="day"
                    :class="{ active: currentDay === day }" @click="currentDay = day">
                    第{{ day }}天
                </div>
            </div>
        </div>

        <!-- Meals list grouped by meal type -->
        <div class="meals-list">
            <div class="meal-card" v-for="meal in groupedMeals" :key="meal.type">
                <div class="meal-header">
                    <div class="m-title"><span class="m-icon">{{ meal.icon }}</span> {{ meal.name }}</div>
                    <div class="m-cal">🔥 {{ meal.totalCalories }} 千卡 <span class="arrow-right">➔</span></div>
                </div>
                <div class="m-macros">
                    <span class="macro carb"><span class="mdot carb-dot"></span>碳水 {{ meal.carbs }}g</span>
                    <span class="macro pro"><span class="mdot pro-dot"></span>蛋白质 {{ meal.protein }}g</span>
                    <span class="macro fat"><span class="mdot fat-dot"></span>脂肪 {{ meal.fat }}g</span>
                </div>
                <div class="dish-item" v-for="dish in meal.dishes" :key="dish.id">
                    <img :src="dish.image" class="d-img" />
                    <div class="d-info">
                        <div class="d-name">{{ dish.name }}</div>
                        <div class="d-desc">{{ dish.amount }} | {{ dish.weight }}克 | {{ dish.calories }} 千卡</div>
                    </div>
                    <div class="d-action">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <polyline points="1 20 1 14 7 14"></polyline>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        <div class="bottom-bar">
            <div class="donut-chart-container">
                <div class="donut-chart">
                    <div class="d-val">{{ totalDailyCals }}<br><span class="d-unit">千卡</span></div>
                </div>
                <div class="donut-legend">
                    <div class="l-item"><span class="dot carb-dot"></span> 碳水化合物 {{ totalCarbs }}克 50%</div>
                    <div class="l-item"><span class="dot pro-dot"></span> 蛋白质 {{ totalProtein }}克 25%</div>
                    <div class="l-item"><span class="dot fat-dot"></span> 脂肪 {{ totalFat }}克 25%</div>
                </div>
            </div>
            <button class="set-plan-btn" @click="startPlan">设置为我的食谱计划</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { usePlanStore } from '@/stores/plan';
import { useRouter, useRoute } from 'vue-router';

const planStore = usePlanStore();
const router = useRouter();
const route = useRoute();

const planInfo = ref<any>({});
const currentDay = ref(1);
const isScrolled = ref(false);

const handleScroll = () => {
    isScrolled.value = window.scrollY > 50;
};

onMounted(() => {
    window.addEventListener('scroll', handleScroll);
});
onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
});

const goBack = () => {
    router.back();
};

// Mock grouped meals based on prototype 3
const groupedMeals = computed(() => [
    {
        type: 1, name: '早餐', icon: '🍞', totalCalories: 350, carbs: 40, protein: 15, fat: 10,
        dishes: [
            { id: 1, name: '蒸红薯', image: 'https://images.unsplash.com/photo-1596450514735-e152bbdc32ce?auto=format&fit=crop&w=100&q=80', amount: '1个(小)', weight: 200, calories: 132 },
            { id: 2, name: '煮鸡蛋', image: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?auto=format&fit=crop&w=100&q=80', amount: '1个(中)', weight: 60, calories: 86 },
            { id: 3, name: '杂粮豆浆', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=100&q=80', amount: '1中杯', weight: 200, calories: 84 }
        ]
    },
    {
        type: 2, name: '午餐', icon: '🍲', totalCalories: 450, carbs: 55, protein: 25, fat: 12,
        dishes: [
            { id: 4, name: '蔬菜沙拉', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=100&q=80', amount: '1大份', weight: 300, calories: 120 },
            { id: 5, name: '鸡胸肉', image: 'https://images.unsplash.com/photo-1532550907401-8500c28f0225?auto=format&fit=crop&w=100&q=80', amount: '1块', weight: 150, calories: 165 },
            { id: 6, name: '糙米饭', image: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&w=100&q=80', amount: '1小碗', weight: 100, calories: 110 }
        ]
    },
    {
        type: 3, name: '晚餐', icon: '🥗', totalCalories: 350, carbs: 30, protein: 20, fat: 10,
        dishes: [
            { id: 7, name: '大拌菜', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80', amount: '1大份', weight: 250, calories: 80 },
            { id: 8, name: '西红柿', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=100&q=80', amount: '1个(中)', weight: 150, calories: 30 },
            { id: 9, name: '紫菜蛋花汤', image: 'https://images.unsplash.com/photo-1548943487-a2e4d43b4850?auto=format&fit=crop&w=100&q=80', amount: '1小碗', weight: 200, calories: 45 }
        ]
    },
    {
        type: 4, name: '加餐', icon: '🍏', totalCalories: 200, carbs: 20, protein: 5, fat: 5,
        dishes: [
            { id: 10, name: '酸奶', image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=100&q=80', amount: '1小杯', weight: 150, calories: 110 },
            { id: 11, name: '草莓', image: 'https://images.unsplash.com/photo-1518635017498-87f514b751ba?auto=format&fit=crop&w=100&q=80', amount: '10颗', weight: 150, calories: 48 }
        ]
    }
]);

const totalDailyCals = computed(() => groupedMeals.value.reduce((sum, m) => sum + m.totalCalories, 0));
const totalCarbs = computed(() => groupedMeals.value.reduce((sum, m) => sum + m.carbs, 0));
const totalProtein = computed(() => groupedMeals.value.reduce((sum, m) => sum + m.protein, 0));
const totalFat = computed(() => groupedMeals.value.reduce((sum, m) => sum + m.fat, 0));

const startPlan = () => {
    planStore.setActivePlan({
        id: route.params.id,
        title: planInfo.value.name || '16+8轻断食食谱',
        meals: groupedMeals.value
    });
    router.push('/plan');
};
</script>

<style scoped>
.plan-detail-page {
    background-color: #FAFAFA;
    min-height: 100vh;
    padding-bottom: 120px;
    font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif;
}

.top-header {
    position: fixed;
    top: 37px;
    left: 0;
    width: 100%;
    height: calc(50px + env(safe-area-inset-top));
    padding-top: env(safe-area-inset-top);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 16px;
    padding-right: 16px;
    z-index: 100;
    transition: background 0.3s;
    box-sizing: border-box;
}

.top-header.scrolled {
    background: #FFF;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.back-btn {
    width: 36px;
    height: 36px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #333;
    cursor: pointer;
}

.top-header.scrolled .back-btn {
    background: transparent;
}

.header-title {
    font-size: 18px;
    font-weight: bold;
    color: #333;
}

.placeholder-box {
    width: 36px;
}

.cover-section {
    position: relative;
    width: 100%;
    height: 320px;
}

.cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.meta-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 60px 20px 20px;
    background: linear-gradient(to top, rgba(232, 245, 233, 1) 10%, rgba(232, 245, 233, 0.8) 50%, transparent 100%);
    box-sizing: border-box;
}

.plan-title-large {
    font-size: 28px;
    font-weight: 900;
    color: #2E7D32;
    margin-bottom: 12px;
}

.stats-row {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: #4CAF50;
    margin-bottom: 12px;
    font-weight: bold;
}

.tags {
    display: flex;
    gap: 8px;
}

.tag {
    background: rgba(46, 125, 50, 0.6);
    color: #FFF;
    font-size: 11px;
    padding: 4px 12px;
    border-radius: 12px;
    font-weight: bold;
}

.day-selector-wrapper {
    background: #E8F5E9;
    padding: 10px 20px 20px;
}

.day-tabs {
    display: flex;
    overflow-x: auto;
    gap: 12px;
    scrollbar-width: none;
}

.day-tabs::-webkit-scrollbar {
    display: none;
}

.day-tabs .tab {
    white-space: nowrap;
    padding: 8px 24px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: bold;
    color: #4CAF50;
    background: #FFF;
    border: 1px solid #C8E6C9;
    cursor: pointer;
    transition: all 0.3s;
}

.day-tabs .tab.active {
    background: #4CAF50;
    color: #FFF;
    border-color: #4CAF50;
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.meals-list {
    padding: 20px;
    margin-top: -20px;
    background: #FAFAFA;
    border-radius: 24px 24px 0 0;
    position: relative;
}

.meal-card {
    background: #FFF;
    border-radius: 20px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

.meal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.m-title {
    font-size: 18px;
    font-weight: 900;
    color: #333;
}

.m-icon {
    margin-right: 4px;
}

.m-cal {
    font-size: 14px;
    font-weight: bold;
    color: #E65100;
}

.arrow-right {
    font-size: 12px;
    color: #FF9800;
    margin-left: 4px;
}

.m-macros {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
}

.macro {
    font-size: 12px;
    color: #757575;
    display: flex;
    align-items: center;
}

.mdot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-right: 4px;
}

.carb-dot {
    background: #FFCA28;
}

.pro-dot {
    background: #66BB6A;
}

.fat-dot {
    background: #AB47BC;
}

.dish-item {
    display: flex;
    align-items: center;
    padding: 12px;
    background: #FAFAFA;
    border-radius: 16px;
    margin-bottom: 12px;
}

.dish-item:last-child {
    margin-bottom: 0;
}

.d-img {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    object-fit: cover;
    margin-right: 12px;
}

.d-info {
    flex: 1;
}

.d-name {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin-bottom: 4px;
}

.d-desc {
    font-size: 12px;
    color: #9E9E9E;
}

.d-action {
    width: 32px;
    height: 32px;
    background: #FFF;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4CAF50;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    cursor: pointer;
}

.bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: #FFF;
    padding: 16px 20px 24px;
    box-sizing: border-box;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
    border-radius: 24px 24px 0 0;
    z-index: 100;
}

.donut-chart-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

.donut-chart {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    border: 8px solid #E8F5E9;
    border-top-color: #FFCA28;
    border-right-color: #66BB6A;
    border-bottom-color: #AB47BC;
    display: flex;
    align-items: center;
    justify-content: center;
}

.donut-text {
    transform: rotate(-45deg);
    text-align: center;
}

.d-val {
    font-size: 18px;
    font-weight: 900;
    color: #333;
    line-height: 1.1;
}

.d-unit {
    font-size: 10px;
    color: #9E9E9E;
}

.donut-legend {
    flex: 1;
    margin-left: 20px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.l-item {
    font-size: 12px;
    color: #757575;
    display: flex;
    align-items: center;
}

.dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 8px;
}

.set-plan-btn {
    width: 100%;
    background: #66BB6A;
    color: #FFF;
    border: none;
    padding: 16px;
    border-radius: 28px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(102, 187, 106, 0.4);
    transition: transform 0.2s;
}

.set-plan-btn:active {
    transform: scale(0.98);
}
</style>