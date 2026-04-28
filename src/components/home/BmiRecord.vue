<template>
    <div class="widget-card">
        <div class="w-header">
            <div class="w-icon" style="background: #F3E5F5;">📊</div>
            <div class="w-title">BMI 状态</div>
        </div>
        <div class="w-desc" :style="{ color: bmiStatus.color, fontWeight: 'bold' }">
            {{ bmiStatus.text }}
        </div>
        <div class="w-main" style="margin-top: 0;">
            <span class="w-val">{{ bmiValue }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ record: any }>();

const bmiValue = computed(() => {
    return (props.record && props.record.bmi) ? props.record.bmi.toFixed(1) : '--';
});

const bmiStatus = computed(() => {
    const val = props.record?.bmi;
    if (!val || val === 0) return { text: '暂无记录', color: '#999' };

    // 根据国家卫健委标准判断
    if (val < 18.5) return { text: '偏瘦', color: '#2196F3' };       // 蓝色
    if (val < 24) return { text: '理想身材', color: '#8E24AA' };    // 紫色
    if (val < 28) return { text: '偏胖', color: '#FF9800' };       // 橙色
    return { text: '肥胖', color: '#F44336' };                     // 红色
});
</script>

<style scoped>
@import '@/styles/widget-style.css';
</style>