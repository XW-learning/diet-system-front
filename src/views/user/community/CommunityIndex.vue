<template>
    <div class="community-page">
        <!-- 顶部安全区占位 -->
        <div class="status-bar-placeholder"></div>

            <!-- 顶部导航栏 -->
        <header class="community-header">
            <div class="header-tabs">
                <span class="tab-item" :class="{ active: activeTab === 'follow' }"
                    @click="switchTab('follow')">关注</span>
                <span class="tab-item" :class="{ active: activeTab === 'recommend' }"
                    @click="switchTab('recommend')">推荐</span>
                <span class="tab-item" :class="{ active: activeTab === 'latest' }"
                    @click="switchTab('latest')">最新</span>
            </div>
            <div class="search-icon">🔍</div>
        </header>

        <!-- 可滚动的主内容区 -->
        <main class="scroll-content">
            <!-- 热门话题区 -->
            <div class="topic-section">
                <div class="topic-scroll">
                    <div class="topic-tag" v-for="(topic, index) in topics" :key="index">
                        <span class="hash">#</span> {{ topic }}
                    </div>
                </div>
            </div>

            <!-- 动态列表 -->
            <div class="feed-list">
                <!-- 加载中 -->
                <div class="loading-state" v-if="loading">
                    <span>加载中...</span>
                </div>

                <!-- 错误提示 -->
                <div class="error-state" v-else-if="errorMsg">
                    <span>{{ errorMsg }}</span>
                </div>

                <!-- 关注占位 -->
                <div class="empty-state" v-else-if="activeTab === 'follow'">
                    <span>关注列表为空，去发现更多精彩内容吧~</span>
                </div>

                <template v-else>
                    <div class="post-card" v-for="post in posts" :key="post.id">
                        <!-- 发帖人信息 (已精修：头像、姓名统一严格左对齐) -->
                        <div class="post-header">
                            <img :src="(post.avatar && post.avatar !== 'null') ? post.avatar : defaultAvatar" class="avatar" alt="avatar" />
                            <div class="user-info">
                                <div class="username">{{ post.username }}</div>
                                <div class="time-meta">{{ formatRelativeTime(post.createTime) }}</div>
                            </div>
                            <div class="more-btn">⋮</div>
                        </div>

                        <!-- 动态正文 -->
                        <div class="post-content">
                            {{ post.content }}
                        </div>

                        <!-- 动态配图 (最多演示3张布局) -->
                        <div class="post-images"
                             :class="'img-count-' + Math.min(post.images.length, 3)"
                             v-if="post.images && post.images.length > 0">
                            <img v-for="(img, idx) in post.images.slice(0, 9)" :key="idx" :src="img" class="post-img" />
                        </div>

                        <!-- 互动数据区 -->
                        <div class="post-actions">
                            <div class="action-btn" @click="handleShare(post)">
                                <span class="icon">🔁</span> {{ post.shareCount }}
                            </div>
                            <div class="action-btn">
                                <span class="icon">💬</span> {{ post.commentCount }}
                            </div>
                            <div class="action-btn" :class="{ liked: post.isLiked }" @click="handleLike(post)">
                                <span class="icon">{{ post.isLiked ? '♥' : '♡' }}</span>
                                {{ post.likeCount }}
                            </div>
                        </div>
                    </div>
                </template>

                <div class="bottom-tips">- 到底啦，去发布一条动态吧 -</div>
            </div>
        </main>

        <!-- 悬浮发布按钮 -->
        <button class="fab-post-btn" @click="handlePost">
            <span class="fab-icon">✏️</span>
        </button>

        <!-- 引入全局底部导航栏 -->
        <BottomNavBar />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import BottomNavBar from '@/components/home/BottomNavBar.vue';
import { getShareList, toggleLike, incrementShareCount } from '@/api/community';
import type { ShareVO } from '@/types/community';
import defaultAvatar from '@/assets/avatar.jpg';

// 当前选中的 Tab
const activeTab = ref<'follow' | 'recommend' | 'latest'>('recommend');
const router = useRouter();

// 热门话题
const topics = ref(['减脂餐打卡', '我的16+8断食', '今天运动了吗', 'Kalu新手指南']);

// 动态列表 & 加载状态
const posts = ref<ShareVO[]>([]);
const loading = ref(false);
const errorMsg = ref('');

// 格式化相对时间
const formatRelativeTime = (dateStr: string): string => {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}天前`;
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
};

// 获取动态列表
const fetchPosts = async () => {
  loading.value = true;
  errorMsg.value = '';
  try {
    if (activeTab.value === 'latest') {
      const data = await getShareList();
      posts.value = (data || []).map(p => ({ ...p, isLiked: false, isCollected: false }));
    } else if (activeTab.value === 'recommend') {
      // TODO: 后端暂缺推荐接口，暂时复用大厅列表
      const data = await getShareList();
      posts.value = (data || []).map(p => ({ ...p, isLiked: false, isCollected: false }));
    } else {
      // TODO: 后端暂缺关注流接口
      posts.value = [];
    }
  } catch {
    errorMsg.value = '加载失败，请下拉重试';
  } finally {
    loading.value = false;
  }
};

// 切换Tab
const switchTab = (tab: 'follow' | 'recommend' | 'latest') => {
  activeTab.value = tab;
  fetchPosts();
};

// 点赞/取消点赞
const handleLike = async (post: ShareVO) => {
  try {
    await toggleLike({ shareId: post.id, authorId: post.userId });
    post.isLiked = !post.isLiked;
    post.likeCount += post.isLiked ? 1 : -1;
    if (post.likeCount < 0) post.likeCount = 0;
  } catch {
    // 静默失败
  }
};

// 分享/转发
const handleShare = async (post: ShareVO) => {
  try {
    await incrementShareCount(post.id);
    post.shareCount += 1;
  } catch {
    // 静默失败
  }
};

// 处理发布按钮点击
const handlePost = () => {
  router.push('/community/publish');
};

onMounted(() => {
  fetchPosts();
});
</script>

<style scoped>
.community-page {
    /* 🌟 修改：移除 min-height 和 position: relative，完全交由 App.vue 动画引擎接管尺寸和定位 */
    height: 100%;
    width: 100%;
    background-color: #FAFAFA;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    /* 防止外层滚动，只让内部的 .scroll-content 滚动 */
}

.status-bar-placeholder {
    height: env(safe-area-inset-top, 44px);
    background-color: #FAFAFA;
}

/* 顶部导航 */
.community-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 44px 20px 10px 20px;
    background-color: #FAFAFA;
    position: sticky;
    top: env(safe-area-inset-top, 44px);
    z-index: 100;
}

.header-tabs {
    display: flex;
    gap: 20px;
}

.tab-item {
    font-size: 16px;
    color: #999;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
}

.tab-item.active {
    font-size: 20px;
    color: #333;
    font-weight: bold;
}

.tab-item.active::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 16px;
    height: 4px;
    background-color: #81C784;
    border-radius: 2px;
}

.search-icon {
    font-size: 20px;
    color: #333;
    cursor: pointer;
}

/* 滚动区域：加大底部内边距，防止被 BottomNavBar 遮挡 */
.scroll-content {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 120px;
}

/* 话题区 */
.topic-section {
    padding: 10px 0 15px 20px;
}

.topic-scroll {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    scrollbar-width: none;
}

.topic-scroll::-webkit-scrollbar {
    display: none;
}

.topic-tag {
    background: #E8F5E9;
    color: #2E7D32;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: bold;
    white-space: nowrap;
}

.topic-tag .hash {
    color: #81C784;
    margin-right: 2px;
}

/* 动态列表区 */
.feed-list {
    padding: 0 15px;
}

.post-card {
    background: #FFFFFF;
    border-radius: 20px;
    padding: 20px;
    margin-bottom: 15px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
}

/* 严格控制左对齐的头部区域 */
.post-header {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 12px;
}

.avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 12px;
}

.user-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
}

.username {
    font-size: 15px;
    font-weight: bold;
    color: #333;
}

.time-meta {
    font-size: 11px;
    color: #999;
    margin-top: 2px;
}

.more-btn {
    color: #CCC;
    font-size: 20px;
    font-weight: bold;
    cursor: pointer;
    padding: 0 5px;
}

.post-content {
    font-size: 14px;
    color: #555;
    line-height: 1.6;
    margin-bottom: 12px;
    text-align: left;
}

/* 动态图片布局 */
.post-images {
    display: grid;
    gap: 8px;
    margin-bottom: 15px;
}

.post-images.img-count-1 {
    grid-template-columns: 1fr;
}

.post-images.img-count-2 {
    grid-template-columns: 1fr 1fr;
}

.post-images.img-count-3 {
    grid-template-columns: 1fr 1fr 1fr;
}

.post-img {
    width: 100%;
    height: 120px;
    object-fit: cover;
    border-radius: 12px;
}

.img-count-1 .post-img {
    height: 200px;
}

/* 互动区 */
.post-actions {
    display: flex;
    justify-content: space-between;
    padding-top: 15px;
    border-top: 1px solid #F5F5F5;
}

.action-btn {
    font-size: 13px;
    color: #999;
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    transition: color 0.2s;
}

.action-btn.liked {
    color: #FF5252;
}

.action-btn .icon {
    font-size: 16px;
}

.bottom-tips {
    text-align: center;
    color: #CCC;
    font-size: 12px;
    margin: 20px 0 20px;
}

/* 悬浮发布按钮：拔高 bottom 值，防止与底部导航栏重叠 */
.fab-post-btn {
    position: fixed;
    right: 20px;
    bottom: 110px;
    width: 54px;
    height: 54px;
    border-radius: 27px;
    background: linear-gradient(135deg, #81C784 0%, #4CAF50 100%);
    border: none;
    box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 100;
    transition: transform 0.2s;
}

.fab-post-btn:active {
    transform: scale(0.9);
}

.fab-icon {
    font-size: 24px;
    color: white;
}

/* 加载/错误/空状态 */
.loading-state,
.error-state,
.empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #999;
    font-size: 14px;
}

.error-state {
    color: #FF5252;
}
</style>