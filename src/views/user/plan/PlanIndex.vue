<template>
    <div class="plan-page">
        <div class="status-bar-placeholder"></div>

        <header class="page-header">
            <h1 class="page-title">食谱计划</h1>
            <button class="search-btn">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5"
                    stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
            </button>
        </header>

        <div v-if="planStore.activePlan" class="active-plan-dashboard">
            <div class="dashboard-header">
                <h3>今日食谱</h3>

                <div class="tag-wrapper">
                    <span class="plan-tag" @click="showPlanMenu = !showPlanMenu">
                        {{ planStore.activePlan.title }}
                        <svg class="dropdown-icon" :class="{ rotated: showPlanMenu }" viewBox="0 0 24 24" width="12"
                            height="12" fill="none" stroke="currentColor" stroke-width="3">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </span>

                    <div v-if="showPlanMenu" class="plan-dropdown-menu">
                        <div class="menu-item text-danger" @click="triggerCloseConfirm">
                            结束当前计划
                        </div>
                    </div>
                </div>
            </div>

            <div class="meal-tabs">
                <div v-for="(meal, index) in mealTypes" :key="index" class="meal-tab-item"
                    :class="{ active: selectedMealIndex === index }" @click="selectedMealIndex = index">
                    {{ meal }}
                </div>
            </div>

            <div class="active-meal-content">
                <div v-if="currentDisplayMeals.length === 0" class="empty-meal">
                    暂无菜品数据
                </div>
                <div v-for="(dish, dIndex) in currentDisplayMeals" :key="dIndex" class="active-dish-item">
                    <div class="dish-thumb">图</div>
                    <div class="dish-detail">
                        <div class="name">{{ dish.name }}</div>
                        <div class="desc">{{ dish.weight }} · {{ dish.calories }}千卡</div>
                    </div>
                </div>
            </div>
        </div>

        <section class="banner-section" :class="{ 'is-compact': planStore.activePlan }">
            <div class="banner-card">
                <div class="banner-content">
                    <h2>AI专属定制</h2>
                    <p>不知道怎么吃？让AI为你量身打造减脂食谱</p>
                    <button class="cta-btn">立即定制</button>
                </div>
                <div class="banner-mascot">✨</div>
            </div>
        </section>

        <section class="category-section">
            <div class="tabs-container">
                <div v-for="cat in categories" :key="cat.id" class="tab-item"
                    :class="{ active: activeCategoryId === cat.id }" @click="activeCategoryId = cat.id">
                    {{ cat.name }}
                </div>
            </div>
        </section>

        <main class="list-section">
            <PlanCard v-for="plan in currentPlans" :key="plan.id" :plan="plan" />

            <div v-if="currentPlans.length === 0" class="empty-state">
                暂无该分类下的计划~
            </div>
        </main>

        <BottomNavBar />
        <Toast ref="toastRef" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import PlanCard from '@/components/plan/PlanCard.vue'
import type { PlanItem } from '@/components/plan/PlanCard.vue'
import BottomNavBar from '@/components/home/BottomNavBar.vue';
import { usePlanStore } from '@/stores/plan';
import Toast from '@/components/Toast.vue';

const planStore = usePlanStore();

// --- 🌟 关闭计划与 Toast 相关逻辑 ---
const showPlanMenu = ref(false);
const toastRef = ref<InstanceType<typeof Toast> | null>(null);

// 触发确认弹窗 (使用 async/await 处理 Promise)
const triggerCloseConfirm = async () => {
    showPlanMenu.value = false; // 先收起下拉菜单

    if (!toastRef.value) return;

    try {
        // 调用 Toast 的 confirmDialog 模式，等待用户操作
        await toastRef.value.confirmDialog({
            title: '结束食谱计划',
            message: `确定要提前结束「${planStore.activePlan?.title}」吗？结束后的数据将无法恢复。`
        });

        // 如果代码走到这里，说明用户点击了“确认”（Promise resolve）
        executeClosePlan();

    } catch (error) {
        // 如果代码走到这里，说明用户点击了“取消”（Promise reject）
        console.log('用户取消了结束计划的操作');
    }
};

// 执行结束计划的底层逻辑
const executeClosePlan = () => {
    planStore.clearActivePlan(); // 调用 Store 清除计划
    selectedMealIndex.value = 0; // 重置 Tab

    // 弹出自动消失的成功提示
    if (toastRef.value) {
        toastRef.value.show('计划已结束', 'success');
    }
};
// -------------------------------------

// --- 今日食谱交互逻辑 ---
const mealTypes = ['早餐', '午餐', '晚餐', '加餐'];
const selectedMealIndex = ref(0);

const currentDisplayMeals = computed(() => {
    if (!planStore.activePlan || !planStore.activePlan.meals) return [];
    return planStore.activePlan.meals[selectedMealIndex.value]?.dishes || [];
});
// -----------------------

// Mock 分类数据
const categories = ref([
    { id: 1, name: '🔥 热门推荐' },
    { id: 2, name: '⚡ 极速瘦身' },
    { id: 3, name: '💪 增肌塑形' },
    { id: 4, name: '🥗 均衡营养' },
    { id: 5, name: '🧘‍♀️ 慢食生活' }
])

const activeCategoryId = ref(1)

// Mock 计划列表假数据
const allPlans = ref<PlanItem[]>([
    {
        id: 101,
        categoryId: 1,
        coverImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80',
        name: '21天极速轻断食计划',
        duration: 21,
        weightLoss: '3-5kg',
        usageCount: 125000,
        tags: ['限时进食', '全球公认', '脂肪燃烧']
    },
    {
        id: 102,
        categoryId: 1,
        coverImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
        name: '地中海健康抗炎食谱',
        duration: 14,
        weightLoss: '1-2kg',
        usageCount: 8600,
        tags: ['优质脂肪', '抗氧化', '易坚持']
    },
    {
        id: 103,
        categoryId: 2,
        coverImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        name: '7天突击碳水循环法',
        duration: 7,
        weightLoss: '2-3kg',
        usageCount: 43200,
        tags: ['突破平台期', '严格控制', '快速见效']
    }
])

// 计算属性：根据选中的 Tab 过滤数据
const currentPlans = computed(() => {
    return allPlans.value.filter(p => p.categoryId === activeCategoryId.value)
})
</script>

<style scoped>
/* 原有的基础样式保持不变 */
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
    top: 0px;
    z-index: 100;
    padding: 50px 20px 10px 20px;
    background-color: #FAFAFA;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    box-sizing: border-box;
}

.page-title {
    font-size: 22px;
    font-weight: 900;
    color: #333;
    margin: 0;
}

.search-btn {
    background: none;
    border: none;
    color: #333;
    padding: 8px;
    cursor: pointer;
}

/* 今日食谱面板样式 */
.active-plan-dashboard {
    background: #fff;
    margin: 0 20px 16px;
    padding: 16px;
    border-radius: 20px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.dashboard-header h3 {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin: 0;
}

/* 🌟 下拉菜单的容器与触发器 */
.tag-wrapper {
    position: relative;
}

.plan-tag {
    font-size: 12px;
    color: #4caf50;
    background: #e8f5e9;
    padding: 4px 10px;
    border-radius: 12px;
    font-weight: 500;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: background 0.2s;
}

.plan-tag:active {
    background: #c8e6c9;
}

.dropdown-icon {
    margin-left: 4px;
    transition: transform 0.3s;
}

.dropdown-icon.rotated {
    transform: rotate(180deg);
}

/* 🌟 弹出的下拉菜单 */
.plan-dropdown-menu {
    position: absolute;
    top: 32px;
    right: 0;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    padding: 8px;
    z-index: 10;
    min-width: 120px;
    animation: fadeInDown 0.2s ease-out;
}

.menu-item {
    padding: 10px 12px;
    font-size: 13px;
    text-align: center;
    border-radius: 8px;
    cursor: pointer;
}

.menu-item:active {
    background-color: #f5f5f5;
}

.text-danger {
    color: #f44336;
    font-weight: bold;
}

@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}



/* 餐食 Tab */
.meal-tabs {
    display: flex;
    background: #f5f6f8;
    border-radius: 10px;
    padding: 4px;
    margin-bottom: 16px;
}

.meal-tab-item {
    flex: 1;
    text-align: center;
    padding: 8px 0;
    font-size: 13px;
    color: #666;
    border-radius: 8px;
    transition: all 0.2s ease;
    cursor: pointer;
}

.meal-tab-item.active {
    background: #fff;
    color: #333;
    font-weight: bold;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

/* 菜品列表 */
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
    margin-bottom: 12px;
}

.active-dish-item:last-child {
    margin-bottom: 0;
}

.dish-thumb {
    width: 44px;
    height: 44px;
    background: #f0f0f0;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #ccc;
    margin-right: 12px;
    flex-shrink: 0;
}

.dish-detail {
    flex: 1;
}

.dish-detail .name {
    font-size: 14px;
    color: #333;
    font-weight: 500;
    margin-bottom: 4px;
}

.dish-detail .desc {
    font-size: 12px;
    color: #999;
}

/* Banner 折叠动画区 */
.banner-section {
    padding: 10px 20px 20px;
    transition: all 0.3s ease-in-out;
}

.banner-card {
    background: linear-gradient(135deg, #FFF3D9 0%, #FFE4B5 100%);
    border-radius: 24px;
    padding: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 10px 30px rgba(238, 203, 139, 0.3);
    transition: all 0.3s ease;
}

.banner-content h2 {
    margin: 0 0 6px 0;
    font-size: 20px;
    color: #8B5A2B;
    font-weight: 900;
}

.banner-content p {
    margin: 0 0 16px 0;
    font-size: 13px;
    color: #A06F3D;
    max-width: 180px;
    line-height: 1.4;
}

.cta-btn {
    background-color: #8B5A2B;
    color: #FFF;
    border: none;
    padding: 8px 20px;
    border-radius: 20px;
    font-weight: bold;
    font-size: 13px;
    box-shadow: 0 4px 12px rgba(139, 90, 43, 0.3);
}

.banner-mascot {
    font-size: 60px;
    transition: all 0.3s;
}

/* 🌟 当有计划时，Banner 的收缩态样式 */
.banner-section.is-compact {
    padding: 0 20px 16px;
}

.banner-section.is-compact .banner-card {
    padding: 12px 20px;
    border-radius: 16px;
}

.banner-section.is-compact p,
.banner-section.is-compact .cta-btn {
    display: none;
}

.banner-section.is-compact .banner-content h2 {
    margin: 0;
    font-size: 16px;
}

.banner-section.is-compact .banner-mascot {
    font-size: 24px;
}

/* 下方原样列表区 */
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
    padding: 8px 16px;
    background-color: #FFF;
    color: #666;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
    border: 1px solid #EFEFEF;
}

.tab-item.active {
    background-color: #333;
    color: #FFF;
    border-color: #333;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

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