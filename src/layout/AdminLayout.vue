<template>
  <el-container class="admin-layout">
    <!-- 左侧侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="admin-aside">
      <div class="logo-area">
        <img v-if="!isCollapse" src="@/assets/avatar.jpg" alt="Logo" class="logo-img" />
        <span v-if="!isCollapse" class="logo-text">健康饮食管理</span>
        <img v-else src="@/assets/avatar.jpg" alt="Logo" class="logo-icon" />
      </div>

      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="true"
        router
        class="admin-menu"
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>数据概览</template>
        </el-menu-item>

        <el-menu-item index="/admin/user/list">
          <el-icon><User /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>

        <el-menu-item index="/admin/profile">
          <el-icon><Setting /></el-icon>
          <template #title>个人设置</template>
        </el-menu-item>
      </el-menu>

      <div class="logout-area">
        <el-button
          type="danger"
          :icon="SwitchButton"
          :block="!isCollapse"
          size="small"
          @click="handleLogout"
        >
          {{ isCollapse ? '' : '退出登录' }}
        </el-button>
      </div>
    </el-aside>

    <!-- 右侧主内容区 -->
    <el-container class="main-container">
      <!-- 顶部Header -->
      <el-header class="admin-header">
        <div class="header-left">
          <el-icon
            class="collapse-icon"
            @click="toggleCollapse"
          >
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="36" icon="UserFilled" />
              <span class="username">{{ adminStore.adminInfo?.username || '管理员' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人信息
                </el-dropdown-item>
                <el-dropdown-item command="password">
                  <el-icon><Lock /></el-icon>
                  修改密码
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="admin-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';
import {
  DataAnalysis,
  User,
  Setting,
  SwitchButton,
  Fold,
  Expand,
  ArrowDown,
  Lock
} from '@element-plus/icons-vue';
import { useAdminStore } from '@/stores/admin';

const router = useRouter();
const route = useRoute();
const adminStore = useAdminStore();

// 侧边栏折叠状态
const isCollapse = ref(false);

// 当前激活的菜单
const activeMenu = computed(() => route.path);

// 面包屑导航
const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title);
  return matched.slice(1).map(item => ({
    path: item.path,
    title: item.meta.title as string
  }));
});

/**
 * 切换侧边栏折叠状态
 */
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
};

/**
 * 处理下拉菜单命令
 */
const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/admin/profile');
      break;
    case 'password':
      // 可以在这里打开修改密码对话框
      ElMessage.info('修改密码功能开发中');
      break;
    case 'logout':
      handleLogout();
      break;
  }
};

/**
 * 退出登录
 */
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    // 清空管理员数据
    adminStore.clearAdminData();

    ElMessage.success('已退出登录');

    // 跳转到登录页
    router.push('/admin/login');
  } catch {
    // 用户取消
  }
};
</script>

<style scoped>
.admin-layout {
  width: 100vw;
  height: 100vh;
}

/* 侧边栏样式 */
.admin-aside {
  background-color: #304156;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.logo-area {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b3a4d;
  color: white;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
}

.logo-img {
  height: 32px;
  margin-right: 8px;
}

.logo-icon {
  height: 32px;
}

.logo-text {
  color: #fff;
}

.admin-menu {
  flex: 1;
  border-right: none;
  background-color: #304156;
  overflow-y: auto;
}

.admin-menu :deep(.el-menu-item) {
  color: #bfcbd9;
}

.admin-menu :deep(.el-menu-item:hover),
.admin-menu :deep(.el-menu-item.is-active) {
  background-color: #263445 !important;
  color: #409eff !important;
}

.logout-area {
  padding: 16px;
  border-top: 1px solid #1f2d3d;
}

/* 主容器样式 */
.main-container {
  display: flex;
  flex-direction: column;
}

/* Header样式 */
.admin-header {
  height: 60px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-icon {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
  transition: color 0.3s;
}

.collapse-icon:hover {
  color: #409eff;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.username {
  font-size: 14px;
  color: #606266;
}

/* 主内容区样式 */
.admin-main {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
