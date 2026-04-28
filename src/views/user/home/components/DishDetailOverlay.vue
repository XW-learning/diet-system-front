<template>
    <div class="dish-detail-overlay">
        <div class="nav-header">
            <span class="back-btn" @click="$emit('close')">‹</span>
        </div>

        <div class="content-body">
            <div class="dish-title-area">
                <div class="dish-icon">🍲</div>
                <span class="dish-name">{{ dish.name }}</span>
            </div>

            <div class="macro-summary">
                <div class="macro-item">
                    <div class="macro-label"><span class="dot red"></span>热量</div>
                    <div class="macro-value">{{ dish.calorie }} <span class="unit">千卡/100g</span></div>
                </div>
                <div class="macro-item">
                    <div class="macro-label"><span class="dot green"></span>碳水</div>
                    <div class="macro-value">{{ dish.carbohydrate || 0 }} <span class="unit">克</span></div>
                </div>
                <div class="macro-item">
                    <div class="macro-label"><span class="dot yellow"></span>蛋白质</div>
                    <div class="macro-value">{{ dish.protein || 0 }} <span class="unit">克</span></div>
                </div>
                <div class="macro-item">
                    <div class="macro-label"><span class="dot purple"></span>脂肪</div>
                    <div class="macro-value">{{ dish.fat || 0 }} <span class="unit">克</span></div>
                </div>
            </div>

            <div class="nutrition-card">
                <div class="card-title">宏量营养素 (每100克)</div>
                <div class="card-header-row">
                    <span class="col-left">营养素</span>
                    <span class="col-right">含量</span>
                </div>

                <div class="nutrient-row highlight-red">
                    <span class="n-name">🔥 热量</span>
                    <span class="n-val">{{ dish.calorie }} 千卡</span>
                </div>
                <div class="nutrient-row">
                    <span class="n-name">🥑 总脂肪</span>
                    <span class="n-val">{{ dish.fat || 0 }} 克</span>
                </div>
                <div class="nutrient-row">
                    <span class="n-name">🍞 总碳水化合物</span>
                    <span class="n-val">{{ dish.carbohydrate || 0 }} 克</span>
                </div>
                <div class="nutrient-sub-row" v-if="dish.fiber">
                    <span class="n-name">膳食纤维</span>
                    <span class="n-val">{{ dish.fiber }} 克</span>
                </div>
                <div class="nutrient-row">
                    <span class="n-name">🍗 蛋白质</span>
                    <span class="n-val">{{ dish.protein || 0 }} 克</span>
                </div>
            </div>
        </div>

        <div class="bottom-bar">
            <button class="record-btn" @click="showRecordSheet = true">记饮食</button>
        </div>

        <RecordBottomSheet v-if="showRecordSheet" :dish="dish" @close="showRecordSheet = false"
            @submit="handleRecordSubmit" @refresh="$emit('refresh')" />

        <Toast ref="toastRef" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import RecordBottomSheet from './RecordBottomSheet.vue';
import Toast from '@/components/Toast.vue';
import { doMealCheckIn } from '@/api/checkin';

const props = defineProps({
    dish: { type: Object, required: true }
});

const emit = defineEmits(['close', 'refresh']);

const showRecordSheet = ref(false);
const toastRef = ref<any>(null);

/**
 * 打卡提交
 */
const handleRecordSubmit = async (recordData: any) => {
    try {
        let userId = localStorage.getItem('userId');

        if (!userId) {
            const token = localStorage.getItem('token');
            userId = token ? token.split('user_')[1] : null;
        }

        if (!userId) {
            toastRef.value.show('登录信息已过期，请重新登录');
            return;
        }

        const submitData = {
            ...recordData,
            userId: String(userId)
        };
        await doMealCheckIn(submitData);
        await toastRef.value.show('打卡成功');
        showRecordSheet.value = false;
        emit('refresh');
        emit('close');
    } catch (error) {
        console.error('打卡请求异常:', error);
    }
};
</script>

<style scoped>
/* 此处保留你之前的样式代码即可 */
.dish-detail-overlay {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 480px;
    height: 100vh;
    background: linear-gradient(180deg, #E8F7EE 0%, #F9F9F9 20%);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    /* 🌟 核心修改：适配手机顶部状态栏/刘海屏 */
    /* env(...) 会自动读取手机安全距离，如果是普通浏览器会取 fallback 值（比如这里给了个默认的 10px 或直接不用 fallback） */
    padding-top: max(44px, env(safe-area-inset-top));

    /* 🌟 必须加 box-sizing，防止 padding 把原本 100vh 的高度撑爆导致页面出现多余滚动条 */
    box-sizing: border-box;
}

.nav-header {
    height: 60px;
    display: flex;
    align-items: center;
    padding: 0 20px;
}

.back-btn {
    font-size: 36px;
    color: #5d4037;
    cursor: pointer;
}

.content-body {
    flex: 1;
    padding: 10px 20px;
    overflow-y: auto;
}

.dish-title-area {
    display: flex;
    align-items: center;
    margin-bottom: 30px;
}

.dish-icon {
    width: 50px;
    height: 50px;
    background: #FFF;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    margin-right: 15px;
}

.dish-name {
    font-size: 24px;
    font-weight: bold;
    color: #5d4037;
}

.macro-summary {
    display: flex;
    justify-content: space-between;
    background: #FFF;
    padding: 20px 15px;
    border-radius: 20px;
    margin-bottom: 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
}

.macro-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.macro-label {
    font-size: 11px;
    color: #999;
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}

.dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-right: 4px;
}

.dot.red {
    background: #FF7043;
}

.dot.green {
    background: #66BB6A;
}

.dot.yellow {
    background: #FFA726;
}

.dot.purple {
    background: #AB47BC;
}

.macro-value {
    font-size: 18px;
    font-weight: bold;
    color: #5d4037;
}

.unit {
    font-size: 11px;
    font-weight: normal;
    color: #999;
}

.nutrition-card {
    background: #FFF;
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
    margin-bottom: 100px;
}

.card-title {
    font-size: 18px;
    font-weight: bold;
    color: #5d4037;
    margin-bottom: 20px;
}

.card-header-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: #999;
    border-bottom: 1px solid #EEE;
    padding-bottom: 10px;
    margin-bottom: 10px;
}

.nutrient-row {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    font-size: 15px;
    color: #333;
}

.nutrient-sub-row {
    display: flex;
    justify-content: space-between;
    padding: 6px 0 12px 30px;
    font-size: 13px;
    color: #999;
}

.highlight-red {
    background: #FFF3E0;
    border-radius: 10px;
    padding: 12px 10px;
    color: #D84315;
    font-weight: bold;
    margin: 0 -10px;
}

.bottom-bar {
    padding: 20px;
    background: #FFF;
    border-top: 1px solid #F0F0F0;
}

.record-btn {
    width: 100%;
    height: 50px;
    background: #81C784;
    color: #FFF;
    font-size: 18px;
    font-weight: bold;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(129, 199, 132, 0.4);
}
</style>