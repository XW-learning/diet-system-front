<template>
  <div class="admin-login-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="system-title">健康饮食管理系统</h1>
        <p class="system-subtitle">管理员后台</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入管理员账号"
            prefix-icon="User"
            size="large"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div v-if="errorMsg" class="error-message">
        {{ errorMsg }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { adminLoginApi } from '@/api/admin';
import { useAdminStore } from '@/stores/admin';
import { getAdminIdFromToken } from '@/utils/jwt';

const router = useRouter();
const adminStore = useAdminStore();

// 表单引用
const loginFormRef = ref<FormInstance>();

// 加载状态
const loading = ref(false);

// 错误信息
const errorMsg = ref('');

// 表单数据
const loginForm = reactive({
  username: '',
  password: ''
});

// 表单验证规则
const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入管理员账号', trigger: 'blur' },
    { min: 3, max: 20, message: '账号长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
};

/**
 * 处理登录
 */
const handleLogin = async () => {
  if (!loginFormRef.value) return;

  try {
    // 表单验证
    await loginFormRef.value.validate();

    loading.value = true;
    errorMsg.value = '';

    // 调用登录接口
    const token = await adminLoginApi(loginForm);

    // 保存Token到Store和localStorage
    adminStore.setToken(token);

    // 获取管理员信息（从JWT中解析adminId）
    const adminId = getAdminIdFromToken(token);
    if (adminId) {
      await adminStore.fetchAdminInfo(adminId);
    }

    ElMessage.success('登录成功');

    // 跳转到管理后台首页
    setTimeout(() => {
      router.push('/admin/dashboard');
    }, 500);
  } catch (error: any) {
    errorMsg.value = error.message || '登录失败，请检查账号和密码';
    ElMessage.error(errorMsg.value);
  } finally {
    loading.value = false;
  }
};

</script>

<style scoped>
.admin-login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 420px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.system-title {
  font-size: 24px;
  color: #303133;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.system-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.login-form {
  margin-top: 20px;
}

.login-button {
  width: 100%;
  font-size: 16px;
  font-weight: 500;
}

.error-message {
  margin-top: 16px;
  padding: 12px;
  background-color: #fef0f0;
  border: 1px solid #fde2e2;
  border-radius: 4px;
  color: #f56c6c;
  font-size: 14px;
  text-align: center;
}
</style>
