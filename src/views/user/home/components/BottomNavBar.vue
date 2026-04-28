<template>
    <div class="nav-container">
        <div class="main-pill">
            <div class="nav-item" :class="{ active: isPage('/home') }" @click="router.push('/home')">
                <div class="icon-box">
                    <el-icon>
                        <House />
                    </el-icon>
                </div>
                <span class="label">首页</span>
            </div>

            <div class="nav-item" :class="{ active: isPage('/plan') }" @click="router.push('/plan')">
                <div class="icon-box">
                    <el-icon>
                        <Food />
                    </el-icon>
                </div>
                <span class="label">菜谱</span>
            </div>

            <div class="nav-item" :class="{ active: isPage('/community') }" @click="router.push('/community')">
                <div class="icon-box">
                    <el-icon>
                        <ChatDotRound />
                    </el-icon>
                </div>
                <span class="label">社区</span>
            </div>
        </div>

        <div class="ai-pill" :class="{ active: isPage('/ai') }" @click="router.push('/ai')">
            <div class="ai-inner">
                <el-icon>
                    <Opportunity />
                </el-icon>
                <span class="ai-label">AI</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const isPage = (path: string) => {
    if (path === '/home') return route.path === '/home' || route.path === '/';
    return route.path === path;
};
</script>

<style scoped>
.nav-container {
    position: fixed;
    bottom: 15px;
    /* 距离底部距离 */
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    max-width: 420px;
    display: flex;
    align-items: center;
    gap: 12px;
    /* 两个 div 之间的间距 */
    /* 🌟 关键修改：降低 z-index，让弹窗能盖住它 */
    z-index: 1000;
    pointer-events: none;
    /* 防止容器拦截点击，但子元素会重新开启 */
}

/* 左侧主导航 */
.main-pill {
    pointer-events: auto;
    /* 开启点击 */
    flex: 1;
    height: 68px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 40px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 0 12px;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.4);
}

/* 右侧 AI 按钮 */
.ai-pill {
    pointer-events: auto;
    /* 开启点击 */
    width: 68px;
    height: 68px;
    background: #4CAF50;
    /* 纯色，或渐变 */
    background: linear-gradient(145deg, #66BB6A, #43A047);
    border-radius: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 12px 25px rgba(76, 175, 80, 0.3);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.ai-pill:active {
    transform: scale(0.9);
}

.ai-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: white;
}

.ai-inner .el-icon {
    font-size: 26px;
}

.ai-label {
    font-size: 10px;
    font-weight: 800;
    margin-top: 2px;
}

/* 单个导航项 */
.nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    color: #94A3B8;
    transition: all 0.3s ease;
    cursor: pointer;
}

.icon-box {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    transition: all 0.3s ease;
}

.nav-item .el-icon {
    font-size: 22px;
}

.label {
    font-size: 11px;
    font-weight: 600;
    margin-top: 4px;
}

/* 激活状态 */
.nav-item.active {
    color: #2D3748;
}

.nav-item.active .icon-box {
    background: rgba(76, 175, 80, 0.15);
    color: #4CAF50;
    transform: translateY(-2px);
}

.nav-item.active .label {
    color: #4CAF50;
}
</style>