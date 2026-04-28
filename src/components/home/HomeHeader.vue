<template>
    <div class="home-header">
        <img class="avatar" @click="$emit('open-profile')"
            :src="(user?.avatar && user.avatar !== 'null') ? user.avatar : defaultAvatar" alt="Avatar" />

        <div class="search-bar" @click="$emit('open-search')">
            <input type="text" placeholder="查询食物热量" readonly />
            <span class="search-icon">🔍</span>
        </div>

        <div class="action-icons">
            <div class="icon-btn" @click="$emit('open-calendar')">📅</div>
            <div class="icon-btn">📊</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { UserVO } from '@/api/auth';
import defaultAvatar from '@/assets/avatar.jpg';

defineProps<{
    user: UserVO | null
}>();

// 🌟 修改：注册 open-calendar 事件
defineEmits(['open-search', 'open-profile', 'open-calendar']);
</script>

<style scoped>
/* 你的原有样式完全不变 */
.home-header {
    position: fixed;
    top: 0;
    height: calc(60px + max(44px, env(safe-area-inset-top)));
    padding: max(44px, env(safe-area-inset-top)) 20px 0 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 99%;
    max-width: 480px;
    background-color: #FFF9EA;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    z-index: 100;
    position: -webkit-sticky;
}

.avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: #fff;
    object-fit: cover;
    cursor: pointer;
}

.search-bar {
    flex: 1;
    height: 36px;
    background-color: #FFFFFF;
    border-radius: 18px;
    margin: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px 0 16px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    cursor: pointer;
}

.search-bar input {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    font-size: 13px;
    color: #333;
    pointer-events: none;
}

.search-bar input::placeholder {
    color: #ccc;
}

.search-icon {
    font-size: 14px;
    color: #999;
}

.action-icons {
    display: flex;
    gap: 12px;
}

.icon-btn {
    width: 32px;
    height: 32px;
    background-color: #F0E6D2;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #7D5A44;
}
</style>