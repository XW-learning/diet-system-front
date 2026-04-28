<template>
  <div id="app-root">
    <StatusBar class="global-status-bar" />

    <div class="router-container">
      <router-view v-slot="{ Component }">
        <transition :name="transitionName">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import StatusBar from '@/components/StatusBar.vue';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router'

const route = useRoute()
const transitionName = ref('')

// 🌟 核心逻辑：监控路由变化，动态决定是否开启滑动动画
watch(
  () => route.meta.depth,
  (toDepth: any, fromDepth: any) => {
    const to = toDepth || 1
    const from = fromDepth || 1

    if (to === from) {
      // 1. 平级切换（depth 相同）：取消动画，BottomNavBar 保持不动
      transitionName.value = ''
    } else if (to > from) {
      // 2. 前进（进入二级页面）：开启左滑变暗动画
      transitionName.value = 'slide-left'
    } else {
      // 3. 后退（返回一级页面）：开启右滑恢复动画
      transitionName.value = 'slide-right'
    }
  }
)

// 午夜自动刷新逻辑
const scheduleMidnightRefresh = () => {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const msUntilMidnight = tomorrow.getTime() - now.getTime();
  setTimeout(() => { window.location.reload(); }, msUntilMidnight);
};

onMounted(() => { scheduleMidnightRefresh(); });
</script>

<style>
@import './assets/main.css';

#app-root {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #000;
  /* 页面滑走后露出的底色 */
}

.global-status-bar {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 44px !important;
  z-index: 999999 !important;
  background: transparent !important;
  pointer-events: none !important;
}

.router-container {
  flex: 1;
  height: 100vh;
  position: relative;
  overflow-y: auto;
  
}

/* ==================== 动画定义 ==================== */

/* 动画激活时的基础样式 */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.4s cubic-bezier(0.3, 0.1, 0.3, 1);
  position: absolute;
  /* 必须绝对定位，否则页面会上下跳动 */
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

/* 情况 A：进入二级页面 (前进) */
.slide-left-enter-from {
  transform: translateX(100%);
  /* 新页面从右侧外面准备进入 */
  z-index: 2;
}

.slide-left-leave-to {
  transform: translateX(-30%);
  /* 主页(含导航栏)向左微移 */
  opacity: 0.5;
  /* 主页变暗 */
  z-index: 1;
}

/* 情况 B：返回一级页面 (后退) */
.slide-right-enter-from {
  transform: translateX(-30%);
  /* 主页从左侧微移位置开始 */
  opacity: 0.5;
  /* 从半透明开始恢复 */
  z-index: 1;
}

.slide-right-enter-to {
  transform: translateX(0);
  opacity: 1;
}

.slide-right-leave-to {
  transform: translateX(100%);
  /* 二级页面向右滑出 */
  z-index: 2;
}
</style>