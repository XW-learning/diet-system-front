// filepath: views/user/plan/PlanIndex.vue
<template>
    <div class="plan-page">
        <div class="status-bar-placeholder"></div>
        <header class="page-header">
            <h1 class="page-title">食谱计划</h1>
            <!-- AI Customization Top Right (When Plan is Active) -->
            <button v-if="planStore.activePlan" class="ai-compact-btn" @click="goToAI">
                <img src="@/assets/login/beaver.jpg" class="ai-mascot-small" />
                <span class="ai-text">定制食谱</span>
            </button>
        </header>

        <!-- AI Banner (When No Plan Active) -->
        <section class="banner-section" v-if="!planStore.activePlan">
            <div class="banner-card" @click="goToAI">
                <div class="banner-content">
                    <h2>16+8轻断食食谱</h2>
                    <div class="banner-meta">
                        <span><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg> 7天</span>
                        <span>📈 效果3-8斤</span>
                        <span>🔥 114640人使用过</span>
                    </div>
                    <div class="banner-tags">
                        <span class="btag">限时进食</span>
                        <span class="btag">不节食</span>
                        <span class="btag">代谢转换</span>
                    </div>
                </div>
                <div class="banner-img-box">
                    <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=300&q=80"
                        alt="diet" />
                </div>
            </div>
        </section>

        <!-- Active Plan Dashboard -->
        <div v-if="planStore.activePlan" class="active-plan-dashboard">
            <div class="date-selector">
                <div class="date-item" v-for="i in 5" :key="i">
                    <span class="date-num" :class="{ 'text-muted': i < 5 }">{{ 25 + i }}</span>
                    <div class="check-icon" v-if="i < 5">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor"
                            stroke-width="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                </div>
                <div class="date-item today active">
                    <span class="date-num">今</span>
                </div>
                <div class="date-item tomorrow">
                    <span class="date-num">2</span>
                </div>
            </div>

            <div class="dashboard-card">
                <div class="meal-tabs">
                    <div v-for="(meal, index) in mealTypes" :key="index" class="meal-tab-item"
                        :class="{ active: selectedMealIndex === index }" @click="selectedMealIndex = index">
                        <span class="m-icon">{{ meal.icon }}</span> {{ meal.name }}
                    </div>
                </div>

                <div class="calorie-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                    <div class="progress-text"><span class="fire">🔥</span> <strong>0</strong> <span class="muted">/302
                            千卡</span></div>
                </div>

                <div class="active-meal-content">
                    <div v-if="currentDisplayMeals.length === 0" class="empty-meal">暂无菜品</div>
                    <div v-for="(dish, dIndex) in currentDisplayMeals" :key="dIndex" class="active-dish-item">
                        <img :src="dish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80'"
                            class="dish-thumb" />
                        <div class="dish-detail">
                            <div class="name">{{ dish.name }}</div>
                            <div class="desc">{{ dish.amount || '1份' }} | {{ dish.weight }}克 | {{ dish.calories }} 千卡
                            </div>
                        </div>
                        <div class="add-icon">+</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Category Tabs -->
        <section class="category-section">
            <div class="tabs-container">
                <div v-for="cat in categories" :key="cat.id" class="tab-item"
                    :class="{ active: activeCategoryId === cat.id }" @click="activeCategoryId = cat.id">
                    {{ cat.name }} <span v-if="cat.id === 1" class="fire-emoji">🔥</span><span v-if="cat.id === 2"
                        class="bolt-emoji">⚡</span><span v-if="cat.id === 3" class="burger-emoji">🍔</span>
                </div>
            </div>
        </section>

        <main class="list-section">
            <PlanCard v-for="plan in currentPlans" :key="plan.id" :plan="plan" />
            <div v-if="currentPlans.length === 0" class="empty-state">暂无食谱</div>
        </main>

        <BottomNavBar />
        <Toast ref="toastRef" />
    </div>
</template>

<!-- <script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import PlanCard from '@/components/plan/PlanCard.vue'
import type { PlanItem } from '@/components/plan/PlanCard.vue'
import BottomNavBar from '@/components/home/BottomNavBar.vue';
import { usePlanStore } from '@/stores/plan';
import Toast from '@/components/Toast.vue';

const planStore = usePlanStore();
const router = useRouter();
const toastRef = ref<InstanceType<typeof Toast> | null>(null);

const mealTypes = [
    { name: '早餐', icon: '🍞' },
    { name: '午餐', icon: '🍔' },
    { name: '晚餐', icon: '🍲' },
    { name: '加餐', icon: '🍏' }
];
const selectedMealIndex = ref(0);

const currentDisplayMeals = computed(() => {
    if (!planStore.activePlan || !planStore.activePlan.meals) return [];
    return planStore.activePlan.meals[selectedMealIndex.value]?.dishes || [];
});

const categories = ref([
    { id: 1, name: '热门' },
    { id: 2, name: '极速瘦身' },
    { id: 3, name: '经典减肥' },
    { id: 4, name: '网红食谱' }
]);
const activeCategoryId = ref(1);

const allPlans = ref<PlanItem[]>([
    {
        id: 101,
        categoryId: 1,
        coverImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80',
        name: '16+8轻断食食谱',
        duration: 7,
        weightLoss: '3-8斤',
        usageCount: 114640,
        tags: ['限时进食', '不节食', '代谢转换']
    },
    {
        id: 102,
        categoryId: 1,
        coverImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
        name: '经典地中海食谱',
        duration: 7,
        weightLoss: '1-3斤',
        usageCount: 65260,
        tags: ['全球公认', '健康饮食', '慢食生活']
    },
    {
        id: 103,
        categoryId: 1,
        coverImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        name: '一只白减肥法食谱',
        duration: 7,
        weightLoss: '3-5斤',
        usageCount: 275880,
        tags: ['网红推荐', '无痛掉秤', '不饿肚子']
    },
    {
        id: 104,
        categoryId: 2,
        coverImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80',
        name: '韩国女团减肥食谱',
        duration: 14,
        weightLoss: '8-15斤',
        usageCount: 653970,
        tags: ['极速瘦身', '狠人专属', '严苛管理']
    }
]);

const currentPlans = computed(() => {
    return allPlans.value.filter(p => p.categoryId === activeCategoryId.value)
});

const goToAI = () => {
    // toastRef.value?.show('AI定制功能即将上线', 'info');
};
</script> -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { searchPlans } from '@/api/plan'
import PlanCard from '@/components/plan/PlanCard.vue'
import BottomNavBar from '@/components/home/BottomNavBar.vue';
import { usePlanStore } from '@/stores/plan';
import Toast from '@/components/Toast.vue';

const planStore = usePlanStore();
const router = useRouter();
const toastRef = ref<InstanceType<typeof Toast> | null>(null);

const mealTypes = [
    { name: '早餐', icon: '🍞' },
    { name: '午餐', icon: '🍔' },
    { name: '晚餐', icon: '🍲' },
    { name: '加餐', icon: '🍏' }
];
const selectedMealIndex = ref(0);

// 从 store 中获取当前正在进行的计划菜谱
const currentDisplayMeals = computed(() => {
    if (!planStore.activePlan || !planStore.activePlan.meals) return [];
    return planStore.activePlan.meals[selectedMealIndex.value]?.dishes || [];
});

// 分类 Tab (你可以写死，也可以如果后端有专门的接口再改成动态获取)
const categories = ref([
    { id: 1, name: '热门' },
    { id: 2, name: '极速瘦身' },
    { id: 3, name: '经典减肥' },
    { id: 4, name: '网红食谱' }
]);
const activeCategoryId = ref(1);

// 存放后端返回的所有真实计划数据
const allPlans = ref<any[]>([]);

// 自动计算当前选中的 Tab 对应的食谱列表
// ⭐ 修改 PlanIndex.vue 中的 computed 计算属性
const currentPlans = computed(() => {
    // 【关键修复2】将三等号 === 改为双等号 ==，或者强制转换类型
    // 这样无论后端返回的是数字 1 还是字符串 "1"，都能成功匹配上当前选中的 Tab
    return allPlans.value.filter(p => p.categoryId == activeCategoryId.value);
});

const loadPlans = async () => {
    try {
        const res = await searchPlans();

        console.log('后端响应数据:', res);

        // Axios 拦截器已剥离 Result 包装，res 直接就是 data 数组
        const dataList = Array.isArray(res) ? res : (res?.data || []);

        if (dataList.length > 0 || Array.isArray(res)) {
            allPlans.value = dataList.map((item: any) => ({
                ...item,
                tags: item.tagList || []
            }));

            console.log('赋值给 allPlans 的最终数据:', allPlans.value);
        } else {
            toastRef.value?.show('暂无食谱数据', 'error');
        }
    } catch (error) {
        console.error('获取食谱列表异常:', error);
        toastRef.value?.show('网络异常，请稍后重试', 'error');
    }
};

// 页面加载时触发请求
onMounted(() => {
    loadPlans();
});

const goToAI = () => {
    toastRef.value?.show('AI定制功能即将上线', 'success');
    // router.push('/ai-custom'); // 未来对接AI页面的路由
};
</script>

<style scoped>
.plan-page {
    min-height: 100vh;
    background-color: #FAFAFA;
    padding-bottom: 80px;
}

.status-bar-placeholder {
    height: env(safe-area-inset-top, 44px);
    background-color: #FAFAFA;
}

.page-header {
    position: sticky;
    top: 0;
    z-index: 100;
    padding: 44px 20px 10px 20px;
    background-color: #FAFAFA;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    box-sizing: border-box;
}

.page-title {
    font-size: 26px;
    font-weight: 900;
    color: #4A3A2F;
    margin: 0;
}

.ai-compact-btn {
    background: #FFF3E0;
    border: none;
    padding: 4px 12px 4px 6px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    box-shadow: 0 4px 12px rgba(255, 152, 0, 0.15);
    cursor: pointer;
    gap: 6px;
    transition: transform 0.2s;
}

.ai-compact-btn:active {
    transform: scale(0.95);
}

.ai-mascot-small {
    width: 24px;
    height: 24px;
    border-radius: 50%;
}

.ai-text {
    font-size: 13px;
    color: #E65100;
    font-weight: bold;
}

/* Banner AI */
.banner-section {
    width: 95%;
    margin: 0 auto 20px;
}

.banner-card {
    background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
    border-radius: 20px;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    box-shadow: 0 8px 24px rgba(76, 175, 80, 0.15);
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.banner-content {
    flex: 1;
    position: relative;
    z-index: 2;
}

.banner-content h2 {
    font-size: 22px;
    color: #2E7D32;
    margin: 0 0 8px 0;
    font-weight: 900;
}

.banner-meta {
    font-size: 11px;
    color: #4CAF50;
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
    font-weight: 500;
}

.banner-tags {
    display: flex;
    gap: 8px;
}

.btag {
    background: rgba(46, 125, 50, 0.15);
    color: #2E7D32;
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 12px;
    font-weight: bold;
}

.banner-img-box {
    position: absolute;
    right: -20px;
    bottom: -20px;
    width: 140px;
    height: 140px;
    border-radius: 50%;
    overflow: hidden;
    z-index: 1;
}

.banner-img-box img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* Category Tabs */
.category-section {
    padding: 0 0 16px 0;
}

.tabs-container {
    display: flex;
    overflow-x: auto;
    padding: 0 20px;
    gap: 12px;
    scrollbar-width: none;
    -ms-overflow-style: none;
    width: 99%;
}

.tabs-container::-webkit-scrollbar {
    display: none;
}

.tab-item {
    white-space: nowrap;
    padding: 8px 20px;
    background-color: #FFF;
    color: #9E9E9E;
    border-radius: 20px;
    font-size: 14px;
    font-weight: bold;
    border: 1px solid #EEEEEE;
    transition: all 0.3s ease;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.tab-item.active {
    color: #4A3A2F;
    border-color: #4A3A2F;
}

/* Active Plan Dashboard */
.active-plan-dashboard {
    background: linear-gradient(180deg, #F1F8E9 0%, #FAFAFA 100%);
    padding: 10px 20px;
    margin-bottom: 16px;
}

.date-selector {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}

.date-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.date-num {
    font-size: 18px;
    font-weight: bold;
    color: #4CAF50;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(76, 175, 80, 0.1);
    border-radius: 50%;
}

.date-num.text-muted {
    color: #BDBDBD;
    background: transparent;
}

.check-icon {
    width: 18px;
    height: 18px;
    background: #4CAF50;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.date-item.today .date-num {
    background: #FFF9C4;
    color: #F57F17;
}

.date-item.tomorrow .date-num {
    background: #E8F5E9;
    color: #2E7D32;
    border: 1px solid #4CAF50;
}

.dashboard-card {
    background: #fff;
    border-radius: 24px;
    padding: 20px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
}

.meal-tabs {
    display: flex;
    background: #F5F5F5;
    border-radius: 16px;
    padding: 4px;
    margin-bottom: 20px;
}

.meal-tab-item {
    flex: 1;
    text-align: center;
    padding: 10px 0;
    font-size: 14px;
    color: #9E9E9E;
    border-radius: 12px;
    transition: all 0.3s;
    font-weight: bold;
    cursor: pointer;
}

.meal-tab-item.active {
    background: #FFF;
    color: #FF9800;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.calorie-progress {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
}

.progress-bar {
    flex: 1;
    height: 8px;
    background: #FFF3E0;
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: #FFB74D;
    border-radius: 4px;
}

.progress-text {
    font-size: 14px;
    color: #FF9800;
}

.progress-text strong {
    font-size: 18px;
}

.progress-text .muted {
    color: #9E9E9E;
    font-size: 12px;
}

.active-meal-content {
    min-height: 100px;
}

.empty-meal {
    text-align: center;
    color: #bbb;
    font-size: 13px;
    padding: 20px 0;
}

.active-dish-item {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    background: #FAFAFA;
    padding: 12px;
    border-radius: 16px;
}

.active-dish-item:last-child {
    margin-bottom: 0;
}

.dish-thumb {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    object-fit: cover;
    margin-right: 12px;
}

.dish-detail {
    flex: 1;
}

.dish-detail .name {
    font-size: 16px;
    color: #333;
    font-weight: bold;
    margin-bottom: 6px;
}

.dish-detail .desc {
    font-size: 12px;
    color: #9E9E9E;
}

.add-icon {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #EEEEEE;
    color: #9E9E9E;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
}

/* List Section */
.list-section {
    padding: 0 20px;
}

.empty-state {
    text-align: center;
    color: #999;
    padding: 40px 0;
    font-size: 14px;
}
</style>