<template>
    <div class="dashboard-wrapper">
        <div class="notification-banner" v-if="user">
            <img class="banner-mascot" src="@/assets/beaver.png" alt="Mascot" />

            <div class="message-pill">
                <span class="msg-tag">【欢迎】</span>
                <div class="marquee-box">
                    <span class="marquee-text">欢迎回来，{{ user.username }}！坚持打卡，遇见更好的自己！</span>
                </div>
                <span class="msg-arrow">
                    <img src="@/assets/home/右箭头.png" class="arrow-icon" alt="箭头" />
                </span>
            </div>
        </div>

        <div class="core-card">
            <div class="card-header">
                <span class="title">饮食&运动 ></span>
                <div class="analysis-tag" @click="$emit('open-analysis')">📝 今日饮食分析</div>
            </div>

            <div class="calorie-formula">
                <div class="formula-item">
                    <span class="label">还可以吃(千卡)</span>
                    <span class="value highlight">{{ remainingCalories }}</span>
                </div>
                <span class="symbol">=</span>
                <div class="formula-item">
                    <span class="label">预算</span>
                    <span class="value">{{ summaryData.budgetCalorie }}</span>
                </div>
                <span class="symbol">-</span>
                <div class="formula-item">
                    <span class="label">饮食</span>
                    <span class="value">{{ summaryData.intakeCalorie }}</span>
                </div>
                <span class="symbol">+</span>
                <div class="formula-item">
                    <span class="label">运动</span>
                    <span class="value">{{ summaryData.burnCalorie }}</span>
                </div>
            </div>

            <div class="quick-actions">
                <div class="action-item" v-for="item in actions" :key="item.name" @click="handleActionClick(item)">
                    <div class="icon-circle" :style="{ backgroundColor: item.bgColor }">
                        <span class="emoji">{{ item.icon }}</span>
                    </div>
                    <span class="action-name">+ {{ item.name }}</span>
                </div>
            </div>

            <div class="photo-btn" @click="takePhoto">
                📷 拍照记饮食
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onActivated } from 'vue';
import { showToast } from 'vant';
import { getCheckInSummary } from '@/api/checkin';
import type { CheckInSummary } from '@/types/diet';
import type { UserVO } from '@/api/auth';
import { getUserIdFromToken } from '@/utils/jwt';


const emit = defineEmits(['open-action', 'open-analysis']);

const props = defineProps<{
    user: UserVO | null,
    refreshTick?: number // 🌟 接收刷新信号
}>();

const summaryData = ref<CheckInSummary>({
    remainCalorie: 0,
    budgetCalorie: 0,
    intakeCalorie: 0,
    burnCalorie: 0
});

/**
 * 剩余热量
 */
const remainingCalories = computed(() => {
    return summaryData.value.budgetCalorie
        - summaryData.value.intakeCalorie
        + summaryData.value.burnCalorie;
});

/**
 * 从JWT中解析用户ID
 */
const parseUserIdFromToken = (): string | null => {
    return getUserIdFromToken(localStorage.getItem('token'));
};

/**
 * 获取今日统计
 */
const fetchSummaryData = async () => {
    try {
        const currentUserId = props.user?.id || parseUserIdFromToken();

        if (!currentUserId) return;

        const date = new Date().toISOString().split('T')[0];

        const data = await getCheckInSummary(currentUserId, date);

        if (data) {
            summaryData.value = data;
            console.log('DietDashboard面板统计更新:', data);
        }

    } catch (error) {
        console.error('获取统计失败:', error);
    }
};

/**
 * 首次加载
 */
onMounted(() => {
    fetchSummaryData();
});

/**
 * ⭐ 页面重新激活时自动刷新
 */
onActivated(() => {
    fetchSummaryData();
});

/**
 * 监听用户变化
 */
watch(
    () => [props.user, props.refreshTick],
    () => {
        if (props.user?.id) {
            console.log('DietDashboard收到刷新信号，正在更新面板数据...');
            fetchSummaryData();
        }
    },
    { immediate: true }
);

const handleActionClick = (item: any) => {
    // 🌟 修改点：直接放行所有点击事件，将 type 交给父组件 Home 处理
    // 1-4 是饮食，5 是运动
    emit('open-action', item.type);
};

const takePhoto = () => {
    showToast('正在启动 AI 拍照识别...');
};

const actions = ref([
    { name: '早餐', icon: '🍞', bgColor: '#FFF3E0', type: 1 },
    { name: '午餐', icon: '🍔', bgColor: '#FFE0E0', type: 2 },
    { name: '晚餐', icon: '🍲', bgColor: '#E3F2FD', type: 3 },
    { name: '加餐', icon: '🍏', bgColor: '#E8F5E9', type: 4 },
    { name: '运动', icon: '🏋️', bgColor: '#F3E5F5', type: 5 },
]);
</script>

<style scoped>
/* 保持原有样式完全不动 */
.dashboard-wrapper {
    margin-top: 10px;
}

.notification-banner {
    display: flex;
    align-items: flex-end;
    margin-bottom: -15px;
    position: relative;
    z-index: 1;
    padding: 0 10px;
}

.banner-mascot {
    width: 60px;
    height: 60px;
    object-fit: contain;
    margin-right: -10px;
    z-index: 2;
}

.message-pill {
    flex: 1;
    height: 36px;
    background-color: rgba(255, 235, 180, 0.6);
    border-radius: 18px;
    display: flex;
    align-items: center;
    padding: 0 12px 0 20px;
    width: calc(100% - 80px);
}

.msg-tag {
    color: #D32F2F;
    font-size: 13px;
    font-weight: bold;
    white-space: nowrap;
}

.marquee-box {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    margin: 0 8px;
    position: relative;
}

.marquee-text {
    display: inline-block;
    font-size: 13px;
    color: #7D5A44;
    animation: scroll-left 8s linear infinite;
}

@keyframes scroll-left {
    0% {
        transform: translateX(100%);
    }

    100% {
        transform: translateX(-100%);
    }
}

.msg-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background-color: #FFFFFF;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.arrow-icon {
    width: 16px;
    height: 16px;
    object-fit: contain;
}

.core-card {
    background: #FFFFFF;
    border-radius: 24px;
    padding: 24px 20px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
    position: relative;
    z-index: 0;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.card-header .title {
    font-size: 18px;
    font-weight: bold;
    color: #333;
}

.analysis-tag {
    background: #E8F5E9;
    color: #4CAF50;
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 12px 12px 12px 0;
    font-weight: bold;
}

.calorie-formula {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30px;
}

.formula-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.formula-item .label {
    font-size: 12px;
    color: #999;
    margin-bottom: 4px;
}

.formula-item .value {
    font-size: 20px;
    font-weight: bold;
    color: #333;
}

.formula-item .value.highlight {
    font-size: 28px;
    color: #7D5A44;
}

.symbol {
    font-size: 18px;
    color: #CCC;
    margin-top: 15px;
}

.quick-actions {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;
}

.action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: transform 0.2s;
}

.action-item:active {
    transform: scale(0.95);
}

.icon-circle {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 6px;
}

.emoji {
    font-size: 20px;
}

.action-name {
    font-size: 12px;
    color: #666;
}

.photo-btn {
    width: 100%;
    height: 50px;
    border: 2px dashed #E0E0E0;
    border-radius: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: bold;
    color: #7D5A44;
    cursor: pointer;
    background-color: #FAFAFA;
    transition: all 0.2s;
}

.photo-btn:hover {
    background-color: #F5F5F5;
    border-color: #CCC;
}
</style>