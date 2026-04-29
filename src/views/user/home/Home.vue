<template>
    <div class="home-page-root">
        <div class="home-main-layer" :class="{ 'is-pushed': isOverlayOpen }">
            <HomeHeader :user="userInfo" @open-search="isSearching = true" @open-profile="showProfile = true"
                @open-calendar="showCalendar = true" />

            <div class="scroll-content">
                <DietDashboard :user="userInfo" :refresh-tick="refreshTick" @open-action="handleOpenAction"
                    @open-analysis="showAnalysis = true" />
                <div class="health-widgets-grid">
                    <WeightRecord class="grid-col-full" :records="bodyRecords" :user-id="userInfo?.id"
                        @refresh="fetchBodyRecords" />
                    <WaterRecord :user-id="userInfo?.id" />
                    <WaistRecord :record="latestRecord" :user-id="userInfo?.id" @refresh="fetchBodyRecords" />
                    <PeriodRecord />
                    <BmiRecord :record="latestRecord" />
                </div>
            </div>

            <div class="page-dim-mask" v-if="isOverlayOpen" @click="closeAllOverlays"></div>
            <BottomNavBar />
        </div>

        <transition name="slide-page">
            <SearchOverlay v-if="isSearching" @close="isSearching = false" @refresh="triggerRefresh" />
        </transition>

        <transition name="slide-page">
            <DishSelectOverlay v-if="showDishSelect" :default-meal-type="selectedMealType"
                @close="showDishSelect = false" @refresh="triggerRefresh" />
        </transition>

        <transition name="slide-page">
            <ExerciseSelectOverlay v-if="showExerciseSelect" @close="showExerciseSelect = false"
                @refresh="triggerRefresh" />
        </transition>

        <transition name="slide-page">
            <DietAnalysisOverlay v-if="showAnalysis" @close="showAnalysis = false" />
        </transition>

        <transition name="slide-page">
            <Profile v-if="showProfile" @close="showProfile = false" />
        </transition>

        <transition name="slide-page">
            <CalendarIndex v-if="showCalendar" @close="showCalendar = false" />
        </transition>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onActivated } from 'vue';
import HomeHeader from '@/components/home/HomeHeader.vue';
import DietDashboard from '@/components/home/DietDashboard.vue';
import SearchOverlay from '@/components/home/SearchOverlay.vue';
import DishSelectOverlay from '@/components/home/DishSelectOverlay.vue';
import ExerciseSelectOverlay from '@/components/home/ExerciseSelectOverlay.vue';
import DietAnalysisOverlay from '@/components/home/DietAnalysisOverlay.vue';
import WaterRecord from '@/components/home/WaterRecord.vue';
import WeightRecord from '@/components/home/WeightRecord.vue';
import BmiRecord from '@/components/home/BmiRecord.vue';
import PeriodRecord from '@/components/home/PeriodRecord.vue';
import WaistRecord from '@/components/home/WaistRecord.vue';
import Profile from '@/views/user/profile/Profile.vue';
import CalendarIndex from '@/components/home/CalendarIndex.vue';
import BottomNavBar from '@/components/home/BottomNavBar.vue';

import { getUserInfoApi } from '@/api/auth';
import { getBodyRecordListApi } from '@/api/body';
import type { UserVO } from '@/api/auth';

// 状态控制
const isSearching = ref(false);
const showDishSelect = ref(false);
const showExerciseSelect = ref(false);
const showAnalysis = ref(false);
const showProfile = ref(false);
const showCalendar = ref(false); // 🌟 新增：控制日历显示

const userInfo = ref<UserVO | null>(null);
const selectedMealType = ref(2);
const bodyRecords = ref<any[]>([]);
const refreshTick = ref(0);

// 🌟 修改：将 showCalendar 纳入整体 Overlay 判断
const isOverlayOpen = computed(() => {
    return isSearching.value || showDishSelect.value || showExerciseSelect.value || showAnalysis.value || showProfile.value || showCalendar.value;
});

const latestRecord = computed(() => bodyRecords.value.length > 0 ? bodyRecords.value[0] : null);

const handleOpenAction = (type: number) => {
    if (type === 5) {
        showExerciseSelect.value = true;
    } else {
        selectedMealType.value = type;
        showDishSelect.value = true;
    }
};

const closeAllOverlays = () => {
    isSearching.value = false;
    showDishSelect.value = false;
    showExerciseSelect.value = false;
    showAnalysis.value = false;
    showProfile.value = false;
    showCalendar.value = false; // 🌟 新增
};

onActivated(() => {
    // 🌟 双保险：每次从缓存中被唤醒（比如重新登录回来），强行重置所有弹窗状态
    closeAllOverlays();
});

const triggerRefresh = () => { refreshTick.value++; };

const fetchBodyRecords = async () => {
    if (!userInfo.value?.id) return;
    try {
        const res: any = await getBodyRecordListApi();
        if (res) bodyRecords.value = res;
    } catch (error) { console.error('获取身材记录失败:', error); }
};

onMounted(async () => {
    const token = localStorage.getItem('token');
    if (token) {
        const userId = token.split('user_')[1];
        if (userId) {
            const data = await getUserInfoApi(userId);
            userInfo.value = data;
            await fetchBodyRecords();
        }
    }
});
</script>

<style scoped>
/* 原有样式全部保留，只需修改最底部的一段 */
.home-page-root {
    width: 100vw;
    height: 100vh;
    background-color: #000;
    overflow: hidden;
    position: relative;
}

.home-main-layer {
    width: 100%;
    height: 100%;
    background-color: #FFF9EA;
    position: relative;
    z-index: 1;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
}

.home-main-layer.is-pushed {
    transform: translateX(-30px);
}

.page-dim-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 1500;
    animation: fade-in 0.4s ease;
}

@keyframes fade-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.scroll-content {
    padding: calc(50px + max(44px, env(safe-area-inset-top))) 20px 100px 20px;
    height: 100%;
    overflow-y: auto;
    box-sizing: border-box;
}

.health-widgets-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-top: 15px;
}

.grid-col-full {
    grid-column: span 2;
}

.slide-page-enter-active,
.slide-page-leave-active {
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-page-enter-from,
.slide-page-leave-to {
    transform: translateX(100vw) !important;
}

/* 🌟 修改：确保把 calendar-container 也加进来强制覆盖 */
:deep(.search-overlay),
:deep(.dish-select-overlay),
:deep(.exercise-select-overlay),
:deep(.analysis-overlay),
:deep(.profile-page),
:deep(.calendar-container) {
    z-index: 2000 !important;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    transform: translateX(0);
}
</style>