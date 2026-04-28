<template>
    <div class="bottom-sheet-overlay" @click.self="$emit('close')">
        <div class="bottom-sheet-content">

            <div class="meal-selector" @click="showMealMenu = !showMealMenu">
                <span class="meal-icon">{{ currentMeal.icon }}</span>
                <span class="meal-name">{{ currentMeal.name }}</span>
                <span class="arrow-down">▾</span>
                <div class="dropdown-menu" v-if="showMealMenu">
                    <div class="dropdown-item" v-for="m in mealOptions" :key="m.type" @click.stop="selectMeal(m)">
                        <span>{{ m.name }}</span><span>{{ m.icon }}</span>
                    </div>
                </div>
            </div>

            <div class="dish-card">
                <div class="heart-box" @click="toggleFavorite">
                    <span v-if="!isFavorited" class="heart-icon">♡</span>
                    <span v-else class="heart-icon active">♥</span>
                </div>

                <div class="dish-img">🍲</div>
                <div class="dish-info-box">
                    <div class="d-name">{{ dish.name }}</div>
                    <div class="d-meta">
                        <span class="computed-cal">{{ computedCalorie }} 千卡</span> |
                        <span class="unit-text">{{ inputWeight || 0 }} 克</span>
                    </div>
                </div>
            </div>

            <div class="nutrient-bars">
                <div class="bar-track">
                    <div class="bar-fill green" :style="{ width: getBarWidth(computedCarb) }"></div>
                    <div class="bar-fill yellow" :style="{ width: getBarWidth(computedProtein) }"></div>
                    <div class="bar-fill purple" :style="{ width: getBarWidth(computedFat) }"></div>
                </div>
                <div class="nutrient-labels">
                    <span><span class="dot green"></span>碳水 {{ computedCarb }}g</span>
                    <span><span class="dot yellow"></span>蛋白质 {{ computedProtein }}g</span>
                    <span><span class="dot purple"></span>脂肪 {{ computedFat }}g</span>
                </div>
            </div>

            <div class="input-display">
                <div class="input-value-wrapper">
                    <span class="input-value">{{ inputWeight || '0' }}</span>
                    <div class="cursor-box">
                        <span class="cursor" v-show="cursorVisible">|</span>
                    </div>
                </div>
            </div>

            <div class="unit-tag">克</div>

            <div class="keyboard-grid">
                <div class="key" @click="pressKey('1')">1</div>
                <div class="key" @click="pressKey('2')">2</div>
                <div class="key" @click="pressKey('3')">3</div>
                <div class="key action-key" @click="pressKey('backspace')">
                    <span class="delete-icon">⌫</span>
                </div>

                <div class="key" @click="pressKey('4')">4</div>
                <div class="key" @click="pressKey('5')">5</div>
                <div class="key" @click="pressKey('6')">6</div>
                <div class="key action-key" @click="pressKey('clear')">清空</div>

                <div class="key" @click="pressKey('7')">7</div>
                <div class="key" @click="pressKey('8')">8</div>
                <div class="key" @click="pressKey('9')">9</div>
                <div class="key submit-key" @click="submitRecord">记录</div>

                <div class="key action-key">📏 滑尺</div>
                <div class="key" @click="pressKey('0')">0</div>
                <div class="key disabled-key">.</div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

// 🌟 辅助函数：获取本地 YYYY-MM-DD 格式日期
const getLocalDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const props = defineProps({ dish: { type: Object, required: true } });
const emit = defineEmits(['close', 'submit', 'refresh']);

// --- 状态逻辑 ---
const mealOptions = [
    { type: 1, name: '早餐', icon: '🍞' },
    { type: 2, name: '午餐', icon: '🍔' },
    { type: 3, name: '晚餐', icon: '🍲' },
    { type: 4, name: '加餐', icon: '🍏' }];
const currentMeal = ref(mealOptions[2]);
const showMealMenu = ref(false);
const isFavorited = ref(false); // 🌟 收藏状态
const inputWeight = ref('');
const cursorVisible = ref(true);
let cursorTimer: any = null;

const selectMeal = (meal: any) => { currentMeal.value = meal; showMealMenu.value = false; };
const toggleFavorite = () => { isFavorited.value = !isFavorited.value; }; // 切换收藏

// --- 计算属性 ---
const weightNum = computed(() => parseInt(inputWeight.value, 10) || 0);
const multiplier = computed(() => weightNum.value / (props.dish.refWeight || 100));

const computedCalorie = computed(() => Math.round(props.dish.calorie * multiplier.value));
const computedCarb = computed(() => (props.dish.carbohydrate * multiplier.value).toFixed(1));
const computedProtein = computed(() => (props.dish.protein * multiplier.value).toFixed(1));
const computedFat = computed(() => (props.dish.fat * multiplier.value).toFixed(1));

const getBarWidth = (valStr: string) => {
    const total = parseFloat(computedCarb.value) + parseFloat(computedProtein.value) + parseFloat(computedFat.value);
    if (total === 0) return '33.33%';
    return ((parseFloat(valStr) / total) * 100) + '%';
};

// --- 键盘交互 ---
const pressKey = (key: string) => {
    if (key === 'clear') { inputWeight.value = ''; return; }
    if (key === 'backspace') { inputWeight.value = inputWeight.value.slice(0, -1); return; }
    if (inputWeight.value === '0' && key === '0') return;
    if (inputWeight.value === '0' && key !== '0') { inputWeight.value = key; return; }
    if (inputWeight.value.length < 4) inputWeight.value += key;
};

const submitRecord = () => {
    if (weightNum.value <= 0) {
        return alert('请输入有效的重量');
    }

    // 🌟 修复：使用本地时间替代 ISO 时间
    const today = getLocalDate();

    const recordData = {
        dishId: props.dish.id,
        mealType: currentMeal.value.type,
        weight: weightNum.value,
        type: 2,
        remark: '',
        date: today
    };
    emit('submit', recordData);
};

onMounted(() => { cursorTimer = setInterval(() => { cursorVisible.value = !cursorVisible.value; }, 500); });
onUnmounted(() => clearInterval(cursorTimer));
</script>

<style scoped>
.bottom-sheet-overlay {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 480px;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    z-index: 2000;
    display: flex;
    align-items: flex-end;
}

.bottom-sheet-content {
    width: 100%;
    background: #FFF;
    border-radius: 24px 24px 0 0;
    padding: 20px;
    box-sizing: border-box;
}

/* 顶部选择 */
.meal-selector {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
    color: #5d4037;
    margin-bottom: 20px;
    cursor: pointer;
    position: relative;
}

.dropdown-menu {
    position: absolute;
    top: 30px;
    background: #FFF;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    width: 120px;
    z-index: 10;
}

.dropdown-item {
    padding: 12px 15px;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #F5F5F5;
}

/* 🌟 食物卡片：重构为文字信息居中 */
.dish-card {
    position: relative;
    display: flex;
    flex-direction: column;
    /* 垂直排列 */
    align-items: center;
    background: #FAFAFA;
    border-radius: 16px;
    padding: 20px 15px;
    margin-bottom: 20px;
}

.dish-img {
    width: 54px;
    height: 54px;
    background: #E8F5E9;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    margin-bottom: 12px;
}

.dish-info-box {
    text-align: center;
}

/* 文字居中 */
.d-name {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    margin-bottom: 6px;
}

.d-meta {
    font-size: 14px;
    color: #666;
}

.computed-cal {
    color: #5d4037;
    font-weight: bold;
}

/* 🌟 爱心收藏按钮：右上角固定 */
.heart-box {
    position: absolute;
    top: 15px;
    right: 15px;
    cursor: pointer;
    padding: 5px;
}

.heart-icon {
    font-size: 22px;
    color: #ccc;
}

.heart-icon.active {
    color: #FF5252;
}

/* 收藏后变红 */

/* 进度条 */
.bar-track {
    height: 8px;
    background: #EEE;
    border-radius: 4px;
    display: flex;
    overflow: hidden;
    margin-bottom: 10px;
}

.bar-fill {
    height: 100%;
    transition: width 0.3s ease;
}

.bar-fill.green {
    background: #66BB6A;
}

.bar-fill.yellow {
    background: #FFA726;
}

.bar-fill.purple {
    background: #AB47BC;
}

.nutrient-labels {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #666;
}

.dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-right: 4px;
}

/* 🌟 输入区修复：彻底对齐光标 */
.input-display {
    text-align: center;
    border-bottom: 2px solid #81C784;
    margin: 20px auto 10px;
    width: fit-content;
    min-width: 140px;
    padding-bottom: 5px;
}

.input-value-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    /* 垂直居中 */
    height: 54px;
}

.input-value {
    font-size: 48px;
    font-weight: bold;
    color: #66BB6A;
    line-height: 54px;
}

.cursor-box {
    width: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 4px;
}

.cursor {
    font-size: 42px;
    color: #66BB6A;
    font-weight: 200;
    line-height: 54px;
    animation: blink 1s step-end infinite;
}

@keyframes blink {
    50% {
        opacity: 0;
    }
}

.unit-tag {
    text-align: center;
    color: #81C784;
    font-weight: bold;
    margin-bottom: 20px;
}

/* 键盘 */
.keyboard-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(4, 56px);
    gap: 10px;
}

.key {
    background: #F8F8F8;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: bold;
    color: #5d4037;
    cursor: pointer;
}

.key:active {
    background: #EEE;
}

.action-key {
    font-size: 14px;
    font-weight: normal;
    color: #666;
}

.disabled-key {
    color: #DDD;
}

.submit-key {
    grid-column: 4;
    grid-row: 3 / 5;
    background: #66BB6A;
    color: #FFF;
    font-size: 18px;
}

.submit-key:active {
    background: #4CAF50;
}
</style>