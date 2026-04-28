<template>
    <div class="dish-select-overlay">
        <div class="search-header">
            <div class="back-btn" @click="$emit('close')">❮</div>
            <div class="search-box">
                <span class="search-icon">🔍</span>
                <input v-model="keyword" placeholder="搜索运动，如：跑步" @input="handleSearch" />
            </div>
        </div>

        <div class="content-body">
            <div class="sidebar">
                <div v-for="cat in categories" :key="cat.id" class="cat-item"
                    :class="{ active: currentCategoryId === cat.id }" @click="currentCategoryId = cat.id">
                    {{ cat.name }}
                </div>
            </div>

            <div class="dish-list">
                <div class="dish-card" v-for="ex in exercises" :key="ex.id">
                    <div class="dish-info">
                        <div class="dish-name">{{ ex.name }}</div>
                        <div class="dish-cal">
                            消耗 <span class="highlight">{{ ex.caloriePerHalfHour || ex.calorie }}</span> 千卡 / 半小时
                        </div>
                    </div>
                    <div class="add-btn" @click="addToCart(ex, $event)">+</div>
                </div>

                <div v-if="loading" class="empty-state">加载中...</div>
                <div v-else-if="exercises.length === 0" class="empty-state">没有找到相关运动~</div>
            </div>
        </div>

        <div class="bottom-cart-bar-v2" :class="{ 'is-active': showCart, 'cart-bump': cartIsBumping }">
            <div class="cart-content-wrapper" @click="handleCartClick">
                <div class="cart-summary-left" ref="cartTargetRef">
                    <div class="food-count">已选 <span class="count-num">{{ cart.length }}</span> 项运动</div>
                    <div class="total-cal-v2">共消耗 <span class="cal-num-v2">{{ totalCalorie }}</span> 千卡</div>
                </div>

                <div class="submit-btn-v2" :class="{ disabled: cart.length === 0 }" @click.stop="submitCheckIn">
                    去打卡
                </div>
            </div>
        </div>

        <SelectedExerciseCart v-if="showCart" :cart="cart" @close="showCart = false" @update-duration="updateDuration"
            @remove="removeFromCart" @clear="clearCart" />

        <transition-group @before-enter="beforeEnter" @enter="enter" @after-enter="afterEnter" :css="false">
            <div v-for="item in flyingItems" :key="item.id" class="flying-ball" :data-id="item.id">
                <div class="flying-y">
                    <div class="inner-ball"></div>
                </div>
            </div>
        </transition-group>

        <Toast ref="toastRef" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
// 引入运动相关的接口
import { getExCategoryList, getExerciseList } from '@/api/exercise';
import { doExerciseCheckIn } from '@/api/checkin';
import SelectedExerciseCart from './SelectedExerciseCart.vue';
import Toast from '@/components/Toast.vue';

const emit = defineEmits(['close', 'refresh']);
const router = useRouter();

// --- 状态定义 ---
const keyword = ref('');
const categories = ref<any[]>([]);
const currentCategoryId = ref<number | undefined>(undefined);
const exercises = ref<any[]>([]);
const loading = ref(false);
const showCart = ref(false);
const toastRef = ref<any>(null);

// 动画相关状态
const cartTargetRef = ref<HTMLElement | null>(null);
const cartIsBumping = ref(false);
const flyingItems = ref<{ id: number, startX: number, startY: number }[]>([]);
let nextBallId = 0;

interface CartItem { exercise: any; duration: number; }
const cart = ref<CartItem[]>([]);

/** ================= 数据获取 ================= */
const loadCategories = async () => {
    try {
        const res = await getExCategoryList();
        const listData = res.data || res;
        if (Array.isArray(listData)) {
            categories.value = listData;
            if (categories.value.length > 0) {
                currentCategoryId.value = categories.value[0].id;
            }
        }
    } catch (err) {
        toastRef.value?.show('加载运动分类失败');
    }
};

const fetchExercises = async () => {
    loading.value = true;
    try {
        const requestData: any = {};
        if (keyword.value) {
            requestData.keyword = keyword.value;
        } else if (currentCategoryId.value !== undefined) {
            requestData.categoryId = currentCategoryId.value;
        }
        const res = await getExerciseList(requestData);
        const listData = res.data || res;
        if (Array.isArray(listData)) {
            exercises.value = listData;
        }
    } catch (err) {
        toastRef.value?.show('查询运动失败');
    } finally {
        loading.value = false;
    }
};

watch([currentCategoryId, keyword], ([, newKeyword], [, oldKeyword]) => {
    if (newKeyword && !oldKeyword) currentCategoryId.value = undefined;
    if (!newKeyword && oldKeyword && categories.value.length > 0) currentCategoryId.value = categories.value[0].id;
    fetchExercises();
});

onMounted(() => { loadCategories(); });

/** ================= 购物车与动画交互 ================= */
const handleCartClick = () => { if (cart.value.length > 0) showCart.value = !showCart.value; };

const addToCart = (exercise: any, event: MouseEvent) => {
    // 默认添加 30 分钟
    const defaultDuration = 30;
    const existing = cart.value.find(item => item.exercise.id === exercise.id);
    if (existing) {
        existing.duration += defaultDuration;
    } else {
        cart.value.push({ exercise, duration: defaultDuration });
    }

    // 获取点击坐标，触发抛物线动画
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    flyingItems.value.push({
        id: nextBallId++,
        startX: rect.left + rect.width / 2,
        startY: rect.top + rect.height / 2
    });
};

// 🌟 动画生命周期 Hooks (与饮食页面保持一致)
const beforeEnter = (el: any) => {
    const id = Number(el.dataset.id);
    const item = flyingItems.value.find(i => i.id === id);
    if (!item) return;

    el.style.left = `${item.startX}px`;
    el.style.top = `${item.startY}px`;
    el.style.transform = `translate(0, 0)`;

    const flyingY = el.querySelector('.flying-y');
    if (flyingY) { flyingY.style.transform = `translate(0, 0)`; flyingY.style.transition = 'none'; }

    const inner = el.querySelector('.inner-ball');
    if (inner) inner.className = 'inner-ball';
};

const enter = (el: any, done: any) => {
    el.offsetHeight; // 强制重绘
    const cartRect = cartTargetRef.value?.getBoundingClientRect();
    const endX = cartRect ? cartRect.left + 50 : 50;
    const endY = cartRect ? cartRect.top + 20 : window.innerHeight - 50;

    const dropX = endX - parseFloat(el.style.left);
    const dropY = endY - parseFloat(el.style.top);

    // 1. X 轴平移 (0.5秒)
    el.style.transition = 'transform 0.5s linear';
    el.style.transform = `translate(${dropX}px, 0)`;

    // 2. Y 轴贝塞尔下落 (0.5秒)
    const flyingY = el.querySelector('.flying-y');
    if (flyingY) {
        flyingY.style.transition = 'transform 0.5s cubic-bezier(0.3, -0.2, 0.7, 1)';
        flyingY.style.transform = `translate(0, ${dropY}px)`;
    }

    // 3. 飞行途中的缩放动画
    const inner = el.querySelector('.inner-ball');
    if (inner) inner.classList.add('flying-active');

    // 4. 等待飞入完成
    setTimeout(() => {
        // 购物车 Q 弹反馈
        cartIsBumping.value = true;
        setTimeout(() => { cartIsBumping.value = false; }, 300);

        // 触发雾气消散动画
        if (inner) {
            inner.classList.remove('flying-active');
            inner.classList.add('mist-out');
        }

        // 等待雾气散开 (0.3s) 后清理节点
        setTimeout(done, 300);
    }, 500);
};

const afterEnter = (el: any) => {
    const id = Number(el.dataset.id);
    flyingItems.value = flyingItems.value.filter(i => i.id !== id);
};

const totalCalorie = computed(() => {
    return cart.value.reduce((sum, item) => {
        // 适配运动热量：(每半小时消耗 / 30) * 运动时长
        const calPerHalfHour = item.exercise.caloriePerHalfHour || item.exercise.calorie || 0;
        const cal = (calPerHalfHour / 30) * item.duration;
        return sum + Math.round(cal);
    }, 0);
});

const updateDuration = (exerciseId: number, newDuration: number) => {
    const item = cart.value.find(i => i.exercise.id === exerciseId);
    if (item) item.duration = newDuration;
};

const removeFromCart = (exerciseId: number) => {
    cart.value = cart.value.filter(i => i.exercise.id !== exerciseId);
    if (cart.value.length === 0) showCart.value = false;
};

const clearCart = () => { cart.value = []; showCart.value = false; };
const handleSearch = () => { };

/** ================= 打卡提交 ================= */
const submitCheckIn = async () => {
    if (cart.value.length === 0) {
        toastRef.value?.show('请先选择运动');
        return;
    }

    let userId = localStorage.getItem('userId');
    if (!userId) {
        const token = localStorage.getItem('token');
        userId = token ? token.split('user_')[1] : null;
    }
    if (!userId) {
        toastRef.value?.show('登录已过期');
        return;
    }

    const dateObj = new Date();
    const date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

    try {
        // 使用 Promise.all 并发提交购物车里的多个运动项目
        const promises = cart.value.map(item => {
            const data = {
                userId: String(userId),
                exerciseId: item.exercise.id, // 🌟 使用专用的 exerciseId
                duration: item.duration,      // 🌟 使用专用的 duration
                date: date
                // 如果后端需要你直接传计算好的热量，可以取消下面这行的注释：
                // burnCalorie: Math.round(((item.exercise.caloriePerHalfHour || item.exercise.calorie || 0) / 30) * item.duration)
            };
            return doExerciseCheckIn(data);
        });

        // 等待所有运动打卡请求完成
        await Promise.all(promises);

        await toastRef.value?.show('运动打卡成功！');

        emit('refresh');
        emit('close');
        router.push('/home');
    } catch (error) {
        console.error('运动打卡失败', error);
        toastRef.value?.show('打卡失败，请重试');
    }
};
</script>

<style scoped>
.dish-select-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: #FFF9EA;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    padding-top: max(44px, env(safe-area-inset-top));
    box-sizing: border-box;
}

.search-header {
    display: flex;
    align-items: center;
    padding: 15px;
    background: linear-gradient(135deg, #FFF9EA 0%, #FFF5E6 100%);
    border-bottom: 1px solid #FFE4B5;
    border-radius: 0 0 16px 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    z-index: 2;
}

.back-btn {
    font-size: 20px;
    color: #7D5A44;
    cursor: pointer;
    margin-right: 12px;
    display: inline-block;
    transition: all 0.3s ease;
    line-height: 1;
    padding-top: 2px;
}

.back-btn:hover {
    transform: translateX(-3px);
    color: #66BB6A;
}

.search-box {
    flex: 1;
    display: flex;
    align-items: center;
    background: #F5F5F5;
    border-radius: 18px;
    padding: 6px 15px;
}

.search-box input {
    border: none;
    background: transparent;
    outline: none;
    margin-left: 8px;
    width: 100%;
    font-size: 14px;
}

.content-body {
    flex: 1;
    display: flex;
    overflow: hidden;
}

.sidebar {
    width: 85px;
    background: #F8F8F8;
    overflow-y: auto;
}

.cat-item {
    padding: 15px 0;
    text-align: center;
    font-size: 14px;
    color: #666;
    cursor: pointer;
    position: relative;
}

.cat-item.active {
    background: #FFF9EA;
    color: #66BB6A;
    font-weight: bold;
}

.cat-item.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 20%;
    height: 60%;
    width: 4px;
    background: #66BB6A;
    border-radius: 0 4px 4px 0;
}

.dish-list {
    flex: 1;
    background: #FFF9EA;
    padding: 15px;
    overflow-y: auto;
    padding-bottom: 80px;
}

.dish-card {
    background: #FFF;
    border-radius: 16px;
    padding: 15px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.dish-name {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin-bottom: 4px;
}

.dish-cal {
    font-size: 12px;
    color: #999;
}

.dish-cal .highlight {
    color: #E53935;
    font-weight: bold;
    font-size: 14px;
}

.add-btn {
    width: 32px;
    height: 32px;
    background: #66BB6A;
    color: #FFF;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: bold;
    cursor: pointer;
}

.add-btn:active {
    transform: scale(0.9);
}

.empty-state {
    text-align: center;
    color: #999;
    margin-top: 50px;
}

/* 🌟 底部购物车栏样式 */
.bottom-cart-bar-v2 {
    position: absolute;
    bottom: 20px;
    left: 15px;
    right: 15px;
    height: 72px;
    background: #FFFFFF;
    border-radius: 36px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    z-index: 2001;
    display: flex;
    align-items: center;
    overflow: hidden;
    border: 2px solid transparent;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.bottom-cart-bar-v2.is-active {
    box-shadow: 0 -8px 24px rgba(102, 187, 106, 0.25);
    border-color: #66BB6A;
    transform: scale(1.02) translateY(-2px);
}

.cart-content-wrapper {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px 0 25px;
    height: 100%;
}

.cart-summary-left {
    display: flex;
    flex-direction: column;
    justify-content: center;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.food-count {
    font-size: 13px;
    color: #666;
    margin-bottom: 2px;
}

.count-num {
    font-weight: bold;
    color: #333;
}

.total-cal-v2 {
    font-size: 15px;
    color: #333;
    font-weight: 500;
}

.cal-num-v2 {
    font-size: 20px;
    font-weight: bold;
    color: #E53935;
    margin-left: 2px;
}

.submit-btn-v2 {
    background: #66BB6A;
    color: #FFF;
    height: 52px;
    min-width: 100px;
    padding: 0 25px;
    border-radius: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.submit-btn-v2:active {
    transform: scale(0.96);
    background: #57A95B;
}

.submit-btn-v2.disabled {
    background: #E0E0E0;
    color: #9E9E9E;
    cursor: not-allowed;
}

.submit-btn-v2.disabled:active {
    transform: none;
}

.bottom-cart-bar-v2.cart-bump {
    transform: scale(0.96) translateY(2px);
    box-shadow: 0 0 20px rgba(102, 187, 106, 0.3);
    border-color: #66BB6A;
}

.bottom-cart-bar-v2.cart-bump .cart-summary-left {
    transform: scale(1.1);
    transform-origin: left center;
}

.bottom-cart-bar-v2.cart-bump .cal-num-v2 {
    color: #4CAF50;
    transition: color 0.2s ease;
}

/* ================= 🌟 飞入与雾化消散特效 ================= */
.flying-ball {
    position: fixed;
    z-index: 9999;
    pointer-events: none;
    width: 24px;
    height: 24px;
    margin-left: -12px;
    margin-top: -12px;
}

.flying-y {
    width: 100%;
    height: 100%;
}

/* 最内层：实体绿球，不包含+号 */
.inner-ball {
    width: 100%;
    height: 100%;
    background: #66BB6A;
    border-radius: 50%;
    box-shadow: 0 4px 10px rgba(102, 187, 106, 0.4);
}

/* 特效 A：飞行途中的收缩与膨胀 */
.inner-ball.flying-active {
    animation: flight-scale 0.5s ease-in-out forwards;
}

@keyframes flight-scale {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(0.707);
    }

    /* 飞到中间时面积缩小 50% */
    100% {
        transform: scale(0.8);
    }

    /* 到达终点时体积恢复为 80% */
}

/* 特效 B：到达终点后如雾气般消散 */
.inner-ball.mist-out {
    animation: mist-fade 0.3s ease-out forwards;
}

@keyframes mist-fade {
    0% {
        transform: scale(0.8);
        opacity: 1;
        filter: blur(0px);
        background: #66BB6A;
    }

    100% {
        transform: scale(2.5);
        opacity: 0;
        filter: blur(8px);
        background: rgba(102, 187, 106, 0.1);
    }
}
</style>