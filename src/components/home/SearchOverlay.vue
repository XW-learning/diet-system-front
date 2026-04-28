<template>
    <div class="search-overlay">
        <div class="search-header">
            <div class="search-input-wrapper">
                <span class="search-icon">🔍</span>
                <input ref="searchInput" type="text" v-model="keyword" placeholder="请输入食物名称" @keyup.enter="doSearch" />
                <div class="clear-icon" v-if="keyword" @click="clearInput">✕</div>
            </div>
            <span class="cancel-btn" @click="$emit('close')">取消</span>
        </div>

        <div class="search-content">
            <template v-if="!hasSearched">
                <div class="section" v-if="historyTags.length > 0">
                    <div class="section-header">
                        <span class="title">搜索历史</span>
                        <span class="clear-btn" @click="clearAllHistory">🗑️ 清除</span>
                    </div>
                    <div class="tags-container">
                        <span class="tag" v-for="h in historyTags" :key="h.id" @click="selectTag(h.keyword)">{{
                            h.keyword }}</span>
                    </div>
                </div>

                <div class="section">
                    <div class="section-header"><span class="title">热门搜索</span></div>
                    <div class="tags-container">
                        <span class="tag" v-for="item in hotTags" :key="item" @click="selectTag(item)">{{ item }}</span>
                    </div>
                </div>
            </template>

            <template v-else>
                <div class="section-header"><span class="title">搜索结果</span></div>
                <div class="result-list">
                    <template v-if="searchResults.length > 0">
                        <div class="result-item" v-for="dish in searchResults" :key="dish.id"
                            @click="openDishDetail(dish)">
                            <div class="dish-img-placeholder">🍲</div>
                            <div class="dish-info">
                                <div class="dish-name">{{ dish.name }}</div>
                                <div class="dish-meta">
                                    <span class="calorie-text">{{ dish.calorie }} 千卡</span>
                                </div>
                            </div>
                            <div class="arrow-right">›</div>
                        </div>
                    </template>
                    <div v-else class="no-data">没有找到相关食物哦~</div>
                </div>
            </template>
        </div>

        <DishDetailOverlay v-if="selectedDish" :dish="selectedDish" @close="handleAllSuccess"
            @refresh="$emit('refresh')" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import DishDetailOverlay from '@/components/home/DishDetailOverlay.vue';

const emit = defineEmits(['close', 'refresh']);

const keyword = ref('');
const hasSearched = ref(false);
const searchResults = ref<any[]>([]);
const historyTags = ref<any[]>([]);
const selectedDish = ref(null);
const searchInput = ref<HTMLInputElement | null>(null);

const hotTags = ['鸡蛋', '米饭', '香蕉', '馒头', '玉米', '面包', '牛奶', '苹果', '豆浆', '酸奶'];

const handleAllSuccess = () => {
    selectedDish.value = null;
    emit('refresh');
    emit('close');
};
const fetchHistory = async () => {
    try {
        const res = await fetch('/api/search/history/list', {
            headers: { 'token': localStorage.getItem('token') || '' }
        });
        const result = await res.json();
        if (result.code === 200) historyTags.value = result.data;
    } catch (e) { console.error(e); }
};

const doSearch = async () => {
    const query = keyword.value.trim();
    if (!query) { hasSearched.value = false; return; }
    try {
        const res = await fetch(`/api/dish/list?keyword=${encodeURIComponent(query)}`, {
            headers: { 'token': localStorage.getItem('token') || '' }
        });
        const result = await res.json();
        if (result.code === 200) {
            searchResults.value = result.data;
            hasSearched.value = true;
            fetchHistory(); // 刷新历史
        }
    } catch (e) { alert('请求失败'); }
};

const selectTag = (tag: string) => { keyword.value = tag; doSearch(); };
const clearInput = () => { keyword.value = ''; hasSearched.value = false; searchInput.value?.focus(); };
const openDishDetail = (dish: any) => { selectedDish.value = dish; };

const clearAllHistory = async () => {
    if (!confirm('清空记录？')) return;
    await fetch('/api/search/history/clear', { method: 'DELETE', headers: { 'token': localStorage.getItem('token') || '' } });
    historyTags.value = [];
};

onMounted(() => {
    fetchHistory();
    nextTick(() => searchInput.value?.focus());
});
</script>

<style scoped>
.search-overlay {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 480px;
    height: 100vh;
    background: #FFF;
    z-index: 999;
    display: flex;
    flex-direction: column;
    /* 🌟 核心修改：适配手机顶部状态栏/刘海屏 */
    /* env(...) 会自动读取手机安全距离，如果是普通浏览器会取 fallback 值（比如这里给了个默认的 10px 或直接不用 fallback） */
    padding-top: max(44px, env(safe-area-inset-top));

    /* 🌟 必须加 box-sizing，防止 padding 把原本 100vh 的高度撑爆导致页面出现多余滚动条 */
    box-sizing: border-box;
}

.search-overlay,
.home-page-root {
    background-color: #F8F4F0;
    /* 极浅米棕色 */
}

.search-header {
    display: flex;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid #f9f9f9;
}

.search-input-wrapper {
    flex: 1;
    height: 42px;
    border: 1.5px solid #4CAF50;
    border-radius: 21px;
    display: flex;
    align-items: center;
    padding: 0 15px;
}

.search-input-wrapper input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 15px;
    background: transparent;
    width: 100%;
    color: #7D5A44;
}

.search-input-wrapper input:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 30px white inset !important;
}

.clear-icon {
    width: 18px;
    height: 18px;
    background: #ccc;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    cursor: pointer;
}

.cancel-btn {
    font-size: 16px;
    color: #666;
    margin-left: 15px;
    cursor: pointer;
}

.search-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
}

.section {
    margin-bottom: 30px;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.section-header .title {
    font-size: 16px;
    font-weight: bold;
    color: #5d4037;
}

.tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.tag {
    /* 布局与显示 */
    display: inline-block;
    /* 确保标签在同一行排列 */
    padding: 6px 16px;
    margin-right: 8px;
    margin-bottom: 8px;

    /* 颜色方案 (深棕色系) */
    background-color: #EFEBE9;
    /* 浅米棕背景 */
    color: #8D6E63;
    /* 深棕色文字 */
    /* border: 1px solid rgba(141, 110, 99, 0.15); */
    /* 极细的深色描边，增加精致感 */

    /* 文字与形态 */
    font-size: 13px;
    font-weight: 500;
    /* 稍微加粗，提高清晰度 */
    border-radius: 20px;
    /* 圆润的胶囊形状 */

    /* 交互细节 */
    transition: all 0.2s ease;
    cursor: pointer;
    line-height: 1.4;
}

/* 悬停效果 (建议添加) */
.tag:hover {
    background-color: #E6E0DD;
    /* 稍微变深一点 */
    color: #6D4C41;
    /* 文字也变深 */
    border-color: rgba(141, 110, 99, 0.3);
}

.result-item {
    display: flex;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid #f5f5f5;
    cursor: pointer;
}

.dish-img-placeholder {
    width: 52px;
    height: 52px;
    background: #E8F7EE;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-right: 15px;
}

.dish-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.dish-name {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 5px;
}

.calorie-text {
    color: #7D5A44;
    font-weight: bold;
    font-size: 13px;
}

.arrow-right {
    font-size: 20px;
    color: #ddd;
}

.no-data {
    text-align: center;
    color: #999;
    margin-top: 50px;
}
</style>