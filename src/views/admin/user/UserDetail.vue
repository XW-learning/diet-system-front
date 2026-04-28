<template>
  <div class="user-detail-container">
    <div class="page-header">
      <el-button :icon="ArrowLeft" @click="goBack">返回列表</el-button>
      <h2 class="page-title">用户详情</h2>
    </div>

    <el-card v-loading="loading" shadow="hover" class="detail-card">
      <!-- 基本信息 -->
      <div class="info-section">
        <div class="section-header">
          <el-icon><User /></el-icon>
          <span>基本信息</span>
        </div>
        
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户ID">
            {{ userInfo.id }}
          </el-descriptions-item>
          
          <el-descriptions-item label="用户名">
            {{ userInfo.username }}
          </el-descriptions-item>
          
          <el-descriptions-item label="手机号">
            {{ userInfo.phone }}
          </el-descriptions-item>
          
          <el-descriptions-item label="邮箱">
            {{ userInfo.email || '-' }}
          </el-descriptions-item>
          
          <el-descriptions-item label="性别">
            <span v-if="userInfo.gender === 1">♂ 男</span>
            <span v-else-if="userInfo.gender === 0">♀ 女</span>
            <span v-else>-</span>
          </el-descriptions-item>
          
          <el-descriptions-item label="年龄">
            {{ userInfo.age || '-' }}
          </el-descriptions-item>
          
          <el-descriptions-item label="状态">
            <el-tag :type="userInfo.status === 1 ? 'success' : 'danger'">
              {{ userInfo.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          
          <el-descriptions-item label="注册时间">
            {{ formatDate(userInfo.createTime) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 饮食偏好 -->
      <div class="info-section">
        <div class="section-header">
          <el-icon><Food /></el-icon>
          <span>饮食偏好</span>
        </div>
        
        <el-descriptions :column="2" border>
          <el-descriptions-item label="分类ID">
            {{ userInfo.categoryId || '-' }}
          </el-descriptions-item>
          
          <el-descriptions-item label="分类名称">
            <el-tag v-if="userInfo.categoryName" type="primary">
              {{ userInfo.categoryName }}
            </el-tag>
            <span v-else>-</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </el-button>
        
        <el-button
          v-if="userInfo.status === 1"
          type="warning"
          @click="handleToggleStatus(0)"
        >
          <el-icon><CircleClose /></el-icon>
          禁用用户
        </el-button>
        
        <el-button
          v-else
          type="success"
          @click="handleToggleStatus(1)"
        >
          <el-icon><CircleCheck /></el-icon>
          启用用户
        </el-button>
        
        <el-button type="danger" @click="handleDelete">
          <el-icon><Delete /></el-icon>
          删除用户
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  ArrowLeft,
  User,
  Food,
  CircleClose,
  CircleCheck,
  Delete
} from '@element-plus/icons-vue';
import { getUserDetailApi, updateUserStatusApi, deleteUserApi } from '@/api/adminUser';
import type { AdminUserVO } from '@/types/admin';

const router = useRouter();
const route = useRoute();

// 加载状态
const loading = ref(false);

// 用户信息
const userInfo = ref<AdminUserVO>({
  id: '', // 后端ID为String类型
  phone: '',
  username: '',
  gender: 0,
  status: 1,
  createTime: ''
});

/**
 * 获取用户详情
 */
const fetchUserDetail = async () => {
  // 从路由参数获取ID（Vue Router的params默认是string类型）
  const userId = route.params.id as string;
  
  if (!userId) {
    ElMessage.error('用户ID无效');
    goBack();
    return;
  }

  console.log('查询用户ID:', userId);

  try {
    loading.value = true;
    const data = await getUserDetailApi(userId);
    userInfo.value = data;
  } catch (error) {
    console.error('获取用户详情失败:', error);
    ElMessage.error('获取用户详情失败');
  } finally {
    loading.value = false;
  }
};

/**
 * 返回列表
 */
const goBack = () => {
  router.back();
};

/**
 * 切换用户状态
 */
const handleToggleStatus = async (status: number) => {
  const actionText = status === 1 ? '启用' : '禁用';
  
  try {
    await ElMessageBox.confirm(
      `确定要${actionText}该用户吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    await updateUserStatusApi(userInfo.value.id, status);
    
    ElMessage.success(`${actionText}成功`);
    
    // 刷新详情
    fetchUserDetail();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error(`${actionText}用户失败:`, error);
      ElMessage.error(`${actionText}失败`);
    }
  }
};

/**
 * 删除用户
 */
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除该用户，是否继续？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    );

    await deleteUserApi(userInfo.value.id);
    
    ElMessage.success('删除成功');
    
    // 返回列表
    setTimeout(() => {
      goBack();
    }, 500);
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

/**
 * 格式化日期
 */
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

onMounted(() => {
  fetchUserDetail();
});
</script>

<style scoped>
.user-detail-container {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  color: #303133;
  margin: 0;
  font-weight: 600;
}

.detail-card {
  margin-bottom: 20px;
}

.info-section {
  margin-bottom: 32px;
}

.info-section:last-of-type {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}
</style>
