<template>
  <div class="user-list-container">
    <h2 class="page-title">用户管理</h2>

    <!-- 搜索筛选区 -->
    <el-card shadow="hover" class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="搜索">
          <el-input
            v-model="searchForm.keyword"
            placeholder="手机号/用户名"
            clearable
            style="width: 240px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option label="全部" :value="null" />
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="hover" class="table-card">
      <el-table
        v-loading="loading"
        :data="userList"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="用户ID" width="180" align="center">
          <template #default="{ row }">
            {{ row.id || 'ID缺失' }}
          </template>
        </el-table-column>

        <el-table-column prop="phone" label="手机号" width="130">
          <template #default="{ row }">
            {{ maskPhone(row.phone) }}
          </template>
        </el-table-column>

        <el-table-column prop="username" label="用户名" min-width="120" />

        <el-table-column prop="gender" label="性别" width="80" align="center">
          <template #default="{ row }">
            <span v-if="row.gender === 1">♂ 男</span>
            <span v-else-if="row.gender === 0">♀ 女</span>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column prop="age" label="年龄" width="80" align="center">
          <template #default="{ row }">
            {{ row.age || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="categoryId" label="饮食分类ID" width="120" align="center">
          <template #default="{ row }">
            {{ row.categoryId ?? '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="categoryName" label="饮食分类" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.categoryName" size="small">
              {{ row.categoryName }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="注册时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="240" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              :disabled="!row.id"
              @click="handleViewDetail(row.id)"
            >
              详情
            </el-button>
            
            <el-button
              v-if="row.status === 1"
              type="warning"
              size="small"
              link
              :disabled="!row.id"
              @click="handleToggleStatus(row.id, 0)"
            >
              禁用
            </el-button>
            <el-button
              v-else
              type="success"
              size="small"
              link
              :disabled="!row.id"
              @click="handleToggleStatus(row.id, 1)"
            >
              启用
            </el-button>

            <el-button
              type="danger"
              size="small"
              link
              :disabled="!row.id"
              @click="handleDelete(row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Refresh } from '@element-plus/icons-vue';
import { getUserListApi, updateUserStatusApi, deleteUserApi } from '@/api/adminUser';
import type { AdminUserVO, UserListParams } from '@/types/admin';

const router = useRouter();

// 加载状态
const loading = ref(false);

// 用户列表
const userList = ref<AdminUserVO[]>([]);

// 搜索表单
const searchForm = reactive<UserListParams>({
  keyword: '',
  status: null
});

// 分页信息
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
});

/**
 * 获取用户列表
 */
const fetchUserList = async () => {
  try {
    loading.value = true;
    
    const params: UserListParams = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      status: searchForm.status
    };

    const data = await getUserListApi(params);
    
    userList.value = data.records || [];
    pagination.total = data.total || 0;
  } catch (error) {
    console.error('获取用户列表失败:', error);
    ElMessage.error('获取用户列表失败');
    userList.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

/**
 * 搜索
 */
const handleSearch = () => {
  pagination.pageNum = 1; // 重置到第一页
  fetchUserList();
};

/**
 * 重置
 */
const handleReset = () => {
  searchForm.keyword = '';
  searchForm.status = null;
  pagination.pageNum = 1;
  fetchUserList();
};

/**
 * 页码改变
 */
const handlePageChange = (page: number) => {
  pagination.pageNum = page;
  fetchUserList();
};

/**
 * 每页条数改变
 */
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.pageNum = 1;
  fetchUserList();
};

/**
 * 查看详情
 */
const handleViewDetail = (userId: string) => {
  router.push(`/admin/user/detail/${userId}`);
};

/**
 * 切换用户状态（禁用/启用）
 */
const handleToggleStatus = async (userId: string, status: number) => {
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

    await updateUserStatusApi(userId, status);
    
    ElMessage.success(`${actionText}成功`);
    
    // 刷新列表
    fetchUserList();
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
const handleDelete = async (userId: string) => {
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

    await deleteUserApi(userId);
    
    ElMessage.success('删除成功');
    
    // 刷新列表
    fetchUserList();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

/**
 * 手机号脱敏
 */
const maskPhone = (phone: string) => {
  if (!phone || phone.length < 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

/**
 * 格式化日期
 */
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

onMounted(() => {
  fetchUserList();
});
</script>

<style scoped>
.user-list-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  color: #303133;
  margin: 0 0 24px 0;
  font-weight: 600;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  margin: 0;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
