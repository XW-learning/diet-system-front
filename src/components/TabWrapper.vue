<template>
    <div class="tab-page-container">
        <main class="page-content">
            <slot />
        </main>

        <BottomNavBar />
    </div>
</template>

<script setup lang="ts">
import BottomNavBar from '@/components/home/BottomNavBar.vue'
</script>

<style scoped>
.tab-page-container {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #FAFAFA;
}

.page-content {
    flex: 1;
    overflow-y: auto;
    /* 留出底部导航栏的高度，防止内容被遮挡 */
    padding-bottom: 70px;
}
</style>