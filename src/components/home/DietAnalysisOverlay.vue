<template>
    <div class="analysis-overlay">
        <div class="header">
            <div class="back-btn" @click="$emit('close')">❮</div>
            <div class="title">今日饮食分析</div>
            <div class="placeholder"></div>
        </div>

        <div class="scroll-content" v-if="!loading && analysisData">

            <div class="analysis-card">
                <div class="card-title">🔥 热量摄入 (千卡)</div>
                <div ref="calorieChartRef" class="echarts-container calorie-chart"></div>
                <div class="calorie-summary">
                    <div class="sum-item">
                        <span class="dot" style="background: #E0E0E0;"></span>
                        <span class="label">预算: {{ analysisData.budgetCalorie }}</span>
                    </div>
                    <div class="sum-item">
                        <span class="dot" style="background: #FFCA28;"></span>
                        <span class="label">运动: {{ analysisData.burnCalorie }}</span>
                    </div>
                </div>
            </div>

            <div class="analysis-card">
                <div class="card-title">🥑 营养素摄入 (克)</div>

                <div class="macro-item">
                    <div class="macro-header">
                        <span class="macro-name">🍚 碳水化合物</span>
                        <span class="macro-val">{{ analysisData.totalCarbohydrate }} / {{
                            analysisData.recommendCarbohydrate }}g</span>
                    </div>
                    <div class="progress-bg">
                        <div class="progress-bar carb-bar"
                            :style="{ width: getPercent(analysisData.totalCarbohydrate, analysisData.recommendCarbohydrate) + '%' }">
                        </div>
                    </div>
                </div>

                <div class="macro-item">
                    <div class="macro-header">
                        <span class="macro-name">🥩 蛋白质</span>
                        <span class="macro-val">{{ analysisData.totalProtein }} / {{ analysisData.recommendProtein
                        }}g</span>
                    </div>
                    <div class="progress-bg">
                        <div class="progress-bar protein-bar"
                            :style="{ width: getPercent(analysisData.totalProtein, analysisData.recommendProtein) + '%' }">
                        </div>
                    </div>
                </div>

                <div class="macro-item">
                    <div class="macro-header">
                        <span class="macro-name">🧈 脂肪</span>
                        <span class="macro-val">{{ analysisData.totalFat }} / {{ analysisData.recommendFat }}g</span>
                    </div>
                    <div class="progress-bg">
                        <div class="progress-bar fat-bar"
                            :style="{ width: getPercent(analysisData.totalFat, analysisData.recommendFat) + '%' }">
                        </div>
                    </div>
                </div>
            </div>

            <div class="analysis-card">
                <div class="card-title">🍽️ 三餐分布 (千卡)</div>
                <div ref="mealChartRef" class="echarts-container meal-chart"></div>
            </div>

            <div class="analysis-card ai-card">
                <div class="card-title">✨ AI 饮食点评</div>
                <div class="ai-content">
                    <div class="loading-ai" v-if="aiLoading">河狸正在为您生成点评... 🦫</div>
                    <div class="ai-text" v-else>
                        {{ aiFeedback || "今天蛋白质摄入很棒，继续保持！不过脂肪稍微有一点点超标啦，明天晚餐可以尝试更清淡的做法哦~" }}
                    </div>
                </div>
                <div class="ai-btn" @click="getAiFeedback">获取最新点评</div>
            </div>

            <div style="height: 40px;"></div>
        </div>

        <div class="loading-state" v-if="loading">数据加载中...</div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, markRaw, nextTick, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import { getDailyAnalysis } from '@/api/checkin';
import type { CheckInAnalysisVO } from '@/api/checkin';

const emit = defineEmits(['close']);
const loading = ref(true);
const analysisData = ref<CheckInAnalysisVO | null>(null);


// AI 点评相关预留
const aiLoading = ref(false);
const aiFeedback = ref('');

// ECharts Refs
const calorieChartRef = ref<HTMLElement | null>(null);
const mealChartRef = ref<HTMLElement | null>(null);
let calorieChartInstance: any = null;
let mealChartInstance: any = null;

const getPercent = (actual: number, recommend: number) => {
    if (!recommend || recommend === 0) return 0;
    let p = (actual / recommend) * 100;
    return p > 100 ? 100 : p;
};

// 🌟 修复后的加载数据方法
const loadData = async () => {
    try {
        let userId = localStorage.getItem('userId');
        if (!userId) {
            const token = localStorage.getItem('token');
            userId = token ? token.split('user_')[1] : null;
        }

        const date = new Date().toISOString().split('T')[0];
        const res = await getDailyAnalysis(String(userId), date);

        analysisData.value = res.data || res;

        // 🌟 关键修复：必须先取消 loading 状态
        loading.value = false;

        // 🌟 关键修复：等待 DOM 渲染 v-if 完成后，再初始化图表
        await nextTick();

        if (analysisData.value) {
            initCalorieChart();
            initMealChart();
        }
    } catch (error) {
        loading.value = false;
        console.error("加载分析数据失败", error);
    }
};

const initCalorieChart = () => {
    if (!calorieChartRef.value || !analysisData.value) return;
    calorieChartInstance = markRaw(echarts.init(calorieChartRef.value));

    const intake = analysisData.value.intakeCalorie;
    const budget = analysisData.value.budgetCalorie;

    const option = {
        title: {
            text: '{val|' + intake + '}\n{name|摄入}',
            top: 'center',
            left: 'center',
            textStyle: {
                rich: {
                    val: { fontSize: 28, fontWeight: 'bold', color: '#333', padding: [0, 0, 5, 0] },
                    name: { fontSize: 13, color: '#999' }
                }
            }
        },
        series: [
            {
                type: 'pie',
                radius: ['65%', '85%'],
                avoidLabelOverlap: false,
                label: { show: false },
                data: [
                    { value: intake, name: '已摄入', itemStyle: { color: '#66BB6A', borderRadius: 10 } },
                    { value: budget > intake ? budget - intake : 0, name: '剩余', itemStyle: { color: '#F5F5F5' } }
                ]
            }
        ]
    };
    calorieChartInstance.setOption(option);
};

const initMealChart = () => {
    if (!mealChartRef.value || !analysisData.value) return;
    mealChartInstance = markRaw(echarts.init(mealChartRef.value));

    const d = analysisData.value;
    const option = {
        grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
        xAxis: {
            type: 'category',
            data: ['早餐', '午餐', '晚餐', '加餐'],
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#666', fontSize: 13 }
        },
        yAxis: {
            type: 'value',
            splitLine: { lineStyle: { type: 'dashed', color: '#EAEAEA' } }
        },
        series: [
            {
                data: [d.breakfastCalorie, d.lunchCalorie, d.dinnerCalorie, d.snackCalorie],
                type: 'bar',
                barWidth: '40%',
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#81C784' },
                        { offset: 1, color: '#66BB6A' }
                    ]),
                    borderRadius: [8, 8, 0, 0]
                },
                label: { show: true, position: 'top', color: '#66BB6A', fontWeight: 'bold' }
            }
        ]
    };
    mealChartInstance.setOption(option);
};

const getAiFeedback = () => {
    aiLoading.value = true;
    setTimeout(() => {
        aiFeedback.value = "这是 AI 给出的真实点评内容！营养搭配非常均衡，建议多补充水分！";
        aiLoading.value = false;
    }, 1500);
};

window.addEventListener('resize', () => {
    calorieChartInstance?.resize();
    mealChartInstance?.resize();
});

onMounted(() => {
    loadData();
});

onUnmounted(() => {
    calorieChartInstance?.dispose();
    mealChartInstance?.dispose();
});
</script>

<style scoped>
.analysis-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: #F8F9FA;
    z-index: 1000;
    display: flex;
    flex-direction: column;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 44px 20px 15px;
    /* 调整头部间距 */
    background: #FFFFFF;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
    z-index: 10;
}

.back-btn {
    font-size: 20px;
    color: #333;
    cursor: pointer;
    font-weight: bold;
    width: 30px;
}

.title {
    font-size: 17px;
    font-weight: bold;
    color: #333;
}

.placeholder {
    width: 30px;
}

.scroll-content {
    flex: 1;
    overflow-y: auto;
    padding: 15px;
}

.analysis-card {
    background: #FFFFFF;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 15px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.card-title {
    font-size: 15px;
    font-weight: bold;
    color: #333;
    margin-bottom: 15px;
}

/* 图表容器 */
.echarts-container {
    width: 100%;
}

.calorie-chart {
    height: 200px;
}

.meal-chart {
    height: 220px;
}

.calorie-summary {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: -10px;
}

.sum-item {
    display: flex;
    align-items: center;
    gap: 6px;
}

.sum-item .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
}

.sum-item .label {
    font-size: 13px;
    color: #666;
}

/* 进度条样式 */
.macro-item {
    margin-bottom: 15px;
}

.macro-item:last-child {
    margin-bottom: 0;
}

.macro-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
}

.macro-name {
    font-size: 14px;
    color: #333;
    font-weight: 500;
}

.macro-val {
    font-size: 13px;
    color: #999;
}

.progress-bg {
    width: 100%;
    height: 12px;
    background: #F0F0F0;
    border-radius: 6px;
    overflow: hidden;
}

.progress-bar {
    height: 100%;
    border-radius: 6px;
    transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.carb-bar {
    background: linear-gradient(90deg, #FFB74D, #FFA726);
}

.protein-bar {
    background: linear-gradient(90deg, #4FC3F7, #29B6F6);
}

.fat-bar {
    background: linear-gradient(90deg, #E57373, #EF5350);
}

/* AI 卡片样式 */
.ai-card {
    background: linear-gradient(135deg, #FFF9EA 0%, #FFFFFF 100%);
    border: 1px solid #FFE4B5;
}

.ai-content {
    background: #FFFFFF;
    border-radius: 12px;
    padding: 15px;
    font-size: 14px;
    color: #555;
    line-height: 1.6;
    margin-bottom: 15px;
}

.loading-ai {
    color: #66BB6A;
    font-weight: bold;
    text-align: center;
}

.ai-btn {
    background: #66BB6A;
    color: #FFF;
    text-align: center;
    padding: 12px;
    border-radius: 25px;
    font-weight: bold;
    font-size: 15px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(102, 187, 106, 0.3);
}

.ai-btn:active {
    transform: scale(0.98);
}

.loading-state {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #999;
}
</style>