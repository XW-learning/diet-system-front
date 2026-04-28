<template>
    <div class="plan-card" @click="goToDetail(plan.id)">
        <div class="card-cover">
            <img :src="plan.coverImage" :alt="plan.name" class="cover-img" />
            <div class="usage-badge">
                🔥 {{ formatCount(plan.usageCount) }}人已使用
            </div>
        </div>

        <div class="card-body">
            <h3 class="plan-title">{{ plan.name }}</h3>

            <div class="plan-meta">
                <span class="meta-item">⏱️ {{ plan.duration }}天</span>
                <span class="meta-item">📉 预计减重 {{ plan.weightLoss }}</span>
            </div>

            <div class="plan-tags">
                <span v-for="(tag, index) in plan.tags" :key="index" class="tag">
                    {{ tag }}
                </span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
// 定义传入卡片的数据结构
export interface PlanItem {
    id: number;
    categoryId?: number; // 🌟 新增：分类ID，用于前端筛选（可选）
    coverImage: string;
    name: string;
    duration: number;
    weightLoss: string;
    usageCount: number;
    tags: string[];
}

const props = defineProps({
    plan: {
        type: Object,
        required: true
    }
});

const router = useRouter();
const goToDetail = (id: number | string) => {
    router.push({
        name: 'PlanDetail',
        params: { id }
    });
};
// 辅助函数：格式化人数 (如 12500 -> 1.2w)
const formatCount = (count: number) => {
    if (count >= 10000) {
        return (count / 10000).toFixed(1) + 'w'
    }
    return count.toString()
}
</script>

<style scoped>
.plan-card {
    cursor: pointer;
    background: #FFFFFF;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(139, 90, 43, 0.08);
    margin-bottom: 20px;
    transition: transform 0.2s ease;
}

.plan-card:active {
    transform: scale(0.98);
}

/* 封面图区域 */
.card-cover {
    position: relative;
    width: 100%;
    height: 160px;
    /* 控制卡片图片高度 */
}

.cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.usage-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(4px);
    color: #FF6B81;
    font-size: 11px;
    font-weight: bold;
    padding: 4px 10px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 底部信息区域 */
.card-body {
    padding: 16px;
}

.plan-title {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    margin: 0 0 8px 0;
}

.plan-meta {
    display: flex;
    gap: 16px;
    font-size: 13px;
    color: #666;
    margin-bottom: 12px;
}

.meta-item {
    display: flex;
    align-items: center;
}

/* 标签列表 */
.plan-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.tag {
    font-size: 11px;
    color: #8B5A2B;
    background-color: #FFF3D9;
    padding: 4px 10px;
    border-radius: 8px;
    font-weight: 500;
}
</style>