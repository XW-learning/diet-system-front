<template>
    <div class="main-layout">
        <router-view />

        <BottomNavBar />
    </div>
</template>

<script setup lang="ts">
import BottomNavBar from '@/views/user/home/components/BottomNavBar.vue'
</script>

<style scoped>
.main-layout {
    min-height: 100vh;
    /* 给底部留出空间，防止内容被导航栏遮挡 */
    padding-bottom: 70px;
    background-color: #FAFAFA;
}
</style>