<template>
  <div class="dashboard-container">
    <h2 class="page-title">数据概览</h2>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #e3f2fd;">
              <el-icon :size="32" color="#2196f3"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalUsers }}</div>
              <div class="stat-label">总用户数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #e8f5e9;">
              <el-icon :size="32" color="#4caf50"><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.activeUsers }}</div>
              <div class="stat-label">活跃用户</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #ffebee;">
              <el-icon :size="32" color="#f44336"><CircleClose /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.disabledUsers }}</div>
              <div class="stat-label">禁用用户</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #fff3e0;">
              <el-icon :size="32" color="#ff9800"><UserFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.todayNew }}</div>
              <div class="stat-label">今日新增</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-card shadow="hover" class="quick-actions-card">
      <template #header>
        <div class="card-header">
          <span>快捷操作</span>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :xs="12" :sm="8" :md="6">
          <div class="action-item" @click="goToUserList">
            <el-icon :size="40" color="#409eff"><User /></el-icon>
            <div class="action-text">用户管理</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="6">
          <div class="action-item" @click="goToProfile">
            <el-icon :size="40" color="#67c23a"><Setting /></el-icon>
            <div class="action-text">个人设置</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { User, CircleCheck, CircleClose, UserFilled, Setting } from '@element-plus/icons-vue';
import { getUserListApi } from '@/api/adminUser';

const router = useRouter();

// 统计数据
const stats = ref({
  totalUsers: 0,
  activeUsers: 0,
  disabledUsers: 0,
  todayNew: 0
});

/**
 * 获取统计数据
 */
const fetchStats = async () => {
  try {
    // 获取所有用户数据来计算统计信息
    const data = await getUserListApi({ pageNum: 1, pageSize: 1000 });
    
    console.log('=== Dashboard 原始响应数据 ===', data);
    console.log('=== total 字段 ===', data.total);
    console.log('=== records 数组长度 ===', data.records?.length);
    console.log('=== 第一条记录 ===', data.records?.[0]);
    
    // 优先使用 total 字段，如果为 0 则使用 records 的实际长度
    stats.value.totalUsers = data.total || data.records?.length || 0;
    
    // 计算活跃用户和禁用用户数量
    const records = data.records || [];
    stats.value.activeUsers = records.filter(user => user.status === 1).length;
    stats.value.disabledUsers = records.filter(user => user.status === 0).length;
    
    // 计算今日新增用户
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    stats.value.todayNew = records.filter(user => {
      if (!user.createTime) return false;
      const createDate = new Date(user.createTime);
      return createDate >= today;
    }).length;
    
    console.log('=== 最终统计结果 ===', stats.value);
  } catch (error) {
    console.error('获取统计数据失败:', error);
  }
};

/**
 * 跳转到用户列表
 */
const goToUserList = () => {
  router.push('/admin/user/list');
};

/**
 * 跳转到个人设置
 */
const goToProfile = () => {
  router.push('/admin/profile');
};

onMounted(() => {
  fetchStats();
});
</script>

<style scoped>
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  color: #303133;
  margin: 0 0 24px 0;
  font-weight: 600;
}

.stats-cards {
  margin-bottom: 24px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.quick-actions-card {
  margin-bottom: 20px;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #f5f7fa;
}

.action-item:hover {
  background-color: #ecf5ff;
  transform: translateY(-2px);
}

.action-text {
  margin-top: 12px;
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}
</style>
