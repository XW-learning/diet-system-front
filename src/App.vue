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
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router'

const router = useRouter()
const transitionName = ref('')

// 🌟 定义底部 Tab 的空间顺序，用于判断左右滑动方向
const tabsOrder = ['/home', '/plan', '/calendar', '/profile']

// 🌟 核心逻辑：监控路由变化，动态决定滑动动画
router.afterEach((to, from) => {
  const toDepth = to.meta.depth || 1
  const fromDepth = from.meta.depth || 1

  if (toDepth === fromDepth && toDepth === 1) {
    // 1. 平级切换（一级页面之间）
    const toIndex = tabsOrder.indexOf(to.path);
    const fromIndex = tabsOrder.indexOf(from.path);

    // 确保两个页面都在我们的 tab 列表中，且不是原地刷新
    if (toIndex !== -1 && fromIndex !== -1 && toIndex !== fromIndex) {
      // 往右侧 Tab 切（如首页 -> 食谱）：新页面从右边滑入
      // 往左侧 Tab 切（如食谱 -> 首页）：新页面从左边滑入
      transitionName.value = toIndex > fromIndex ? 'tab-slide-left' : 'tab-slide-right';
    } else {
      transitionName.value = '';
    }
  } else if (toDepth > fromDepth) {
    // 2. 前进（进入二级页面）：开启左滑变暗覆盖动画
    transitionName.value = 'slide-left'
  } else if (toDepth < fromDepth) {
    // 3. 后退（返回一级页面）：开启右滑恢复动画
    transitionName.value = 'slide-right'
  }
})

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
  /* 🌟 修复1：将底色从 #000 改为与页面一致的 #FAFAFA 浅色，避免透明时发黑 */
  background-color: #FAFAFA;
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
  /* 🌟 修复2：禁止父级容器滚动 */
  overflow: hidden;
}

/* 🌟 修复3：强制所有的路由页面容器独立占满屏幕，并独立管理自己的滚动条。
   这样无论动画怎么做绝对定位，页面都不会丢失原有的滚动位置和高度。 */
.router-container>* {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #FAFAFA;
  -webkit-overflow-scrolling: touch;
  /* 保证移动端滑动顺滑 */
}

/* ==================== 动画定义 ==================== */

/* 动画激活时的基础样式 */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.4s cubic-bezier(0.3, 0.1, 0.3, 1);
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

/* ================= 情况 A：进入二级页面 (前进) ================= */
/* 🌟 核心修复：把 z-index 写在 active 阶段，确保整个动画期间层级锁定 */
.slide-left-enter-active {
  z-index: 2;
  /* 新页面(二级)从右边滑入，必须全程在最上层 */
}

.slide-left-leave-active {
  z-index: 1;
  /* 老页面(一级)向左滑走并变暗，必须全程在底层 */
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(-30%);
  opacity: 0.5;
  /* 主页变暗 */
}

/* ================= 情况 B：返回一级页面 (后退) ================= */
.slide-right-enter-active {
  z-index: 1;
  /* 老页面(一级)从左侧恢复，必须全程在底层 */
}

.slide-right-leave-active {
  z-index: 2;
  /* 新页面(二级)向右滑出，必须全程在最上层 */
}

.slide-right-enter-from {
  transform: translateX(-30%);
  opacity: 0.5;
}

.slide-right-enter-to {
  transform: translateX(0);
  opacity: 1;
}

.slide-right-leave-to {
  transform: translateX(100%);
}

/* ================= 情况 C：一级页面之间 (微距平移 + 渐隐渐现) ================= */
.tab-slide-left-enter-active,
.tab-slide-left-leave-active,
.tab-slide-right-enter-active,
.tab-slide-right-leave-active {
  /* 🌟 核心改进：
     1. transition 监听所有属性 (all) 以包含 opacity
     2. 增加时间到 0.4s 保证动画看清
     3. 引入 cubic-bezier(0.1, 0.9, 0.2, 1) 实现类似“一脚急刹车”的从快到慢极速缓动效果 
  */
  transition: all 0.4s cubic-bezier(0.1, 0.9, 0.2, 1);
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1;
}

/* ---------- 往右侧 Tab 切 (如 首页 -> 食谱)：画面整体向左滑动 ---------- */
/* 新页面从右边 10% 的位置，由透明变实体进入 */
.tab-slide-left-enter-from {
  transform: translateX(10%);
  opacity: 0;
}

.tab-slide-left-enter-to {
  transform: translateX(0);
  opacity: 1;
}

/* 老页面向左边退去，移动 10% 并逐渐消失 */
.tab-slide-left-leave-from {
  transform: translateX(0);
  opacity: 1;
}

.tab-slide-left-leave-to {
  transform: translateX(-10%);
  opacity: 0;
}


/* ---------- 往左侧 Tab 切 (如 食谱 -> 首页)：画面整体向右滑动 ---------- */
/* 新页面从左边 10% 的位置，由透明变实体进入 */
.tab-slide-right-enter-from {
  transform: translateX(-10%);
  opacity: 0;
}

.tab-slide-right-enter-to {
  transform: translateX(0);
  opacity: 1;
}

/* 老页面向右边退去，移动 10% 并逐渐消失 */
.tab-slide-right-leave-from {
  transform: translateX(0);
  opacity: 1;
}

.tab-slide-right-leave-to {
  transform: translateX(10%);
  opacity: 0;
}
</style>