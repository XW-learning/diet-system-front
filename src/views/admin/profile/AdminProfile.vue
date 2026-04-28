<template>
  <div class="profile-container">
    <h2 class="page-title">个人设置</h2>

    <!-- 个人信息卡片 -->
    <el-card shadow="hover" class="info-card">
      <template #header>
        <div class="card-header">
          <el-icon><User /></el-icon>
          <span>管理员信息</span>
        </div>
      </template>

      <el-descriptions :column="1" border>
        <el-descriptions-item label="管理员ID">
          {{ adminStore.adminInfo?.id || '-' }}
        </el-descriptions-item>
        
        <el-descriptions-item label="用户名">
          {{ adminStore.adminInfo?.username || '-' }}
        </el-descriptions-item>
        
        <el-descriptions-item label="角色">
          <el-tag type="primary">
            {{ adminStore.adminInfo?.role || '管理员' }}
          </el-tag>
        </el-descriptions-item>
        
        <el-descriptions-item label="状态">
          <el-tag :type="adminStore.adminInfo?.status === 1 ? 'success' : 'danger'">
            {{ adminStore.adminInfo?.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        
        <el-descriptions-item label="创建时间">
          {{ formatDate(adminStore.adminInfo?.createTime) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 修改密码卡片 -->
    <el-card shadow="hover" class="password-card">
      <template #header>
        <div class="card-header">
          <el-icon><Lock /></el-icon>
          <span>修改密码</span>
        </div>
      </template>

      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
        class="password-form"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入原密码"
            show-password
            style="width: 400px"
          />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码（6-20位）"
            show-password
            style="width: 400px"
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
            style="width: 400px"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleUpdatePassword">
            确认修改
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';
import { useAdminStore } from '@/stores/admin';
import { updateAdminPasswordApi } from '@/api/admin';

const adminStore = useAdminStore();

// 表单引用
const passwordFormRef = ref<FormInstance>();

// 加载状态
const loading = ref(false);

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 自定义验证器：确认密码
const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'));
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

// 表单验证规则
const passwordRules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
    {
      validator: (_rule: any, value: string, callback: any) => {
        if (value === passwordForm.oldPassword) {
          callback(new Error('新密码不能与原密码相同'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
};

/**
 * 修改密码
 */
const handleUpdatePassword = async () => {
  if (!passwordFormRef.value) return;

  try {
    // 表单验证
    await passwordFormRef.value.validate();

    loading.value = true;

    const adminId = adminStore.adminInfo?.id;
    if (!adminId) {
      ElMessage.error('管理员信息不存在');
      return;
    }

    await updateAdminPasswordApi({
      id: adminId,
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    });

    ElMessage.success('密码修改成功，请重新登录');

    // 清空表单
    handleReset();

    // 延迟退出登录
    setTimeout(() => {
      adminStore.clearAdminData();
      window.location.href = '/admin/login';
    }, 1500);
  } catch (error: any) {
    console.error('修改密码失败:', error);
    if (error.message) {
      ElMessage.error(error.message);
    }
  } finally {
    loading.value = false;
  }
};

/**
 * 重置表单
 */
const handleReset = () => {
  passwordForm.oldPassword = '';
  passwordForm.newPassword = '';
  passwordForm.confirmPassword = '';
  
  if (passwordFormRef.value) {
    passwordFormRef.value.clearValidate();
  }
};

/**
 * 格式化日期
 */
const formatDate = (dateStr?: string) => {
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

onMounted(async () => {
  console.log('=== AdminProfile onMounted ===');
  console.log('adminStore.token:', adminStore.token);
  console.log('adminStore.adminInfo:', adminStore.adminInfo);
  
  // 如果store中没有管理员信息,尝试获取
  if (!adminStore.adminInfo && adminStore.token) {
    const adminId = extractAdminId(adminStore.token);
    console.log('提取的 adminId:', adminId);
    
    if (adminId) {
      try {
        console.log('开始获取管理员信息...');
        await adminStore.fetchAdminInfo(adminId);
        console.log('获取成功，adminInfo:', adminStore.adminInfo);
      } catch (error) {
        console.error('获取管理员信息失败:', error);
        ElMessage.error('获取管理员信息失败');
      }
    } else {
      console.error('无法从 token 中提取 adminId');
    }
  } else {
    console.log('已有 adminInfo 或没有 token');
  }
});

/**
 * 从Token中提取管理员ID
 */
const extractAdminId = (token: string): string | null => {
  try {
    // Token 格式: "admin_token_1"
    if (token.startsWith('admin_token_')) {
      const id = token.replace('admin_token_', '');
      return id || null;
    }
    return null;
  } catch {
    return null;
  }
};
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  color: #303133;
  margin: 0 0 24px 0;
  font-weight: 600;
}

.info-card {
  margin-bottom: 24px;
}

.password-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.password-form {
  padding: 20px 0;
}
</style>
