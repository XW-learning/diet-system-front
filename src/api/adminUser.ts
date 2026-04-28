// src/api/adminUser.ts
import request from '@/utils/request';
import type { AdminUserVO, PageResult, UserListParams } from '@/types/admin';

/**
 * 获取用户列表（分页+搜索）
 */
export const getUserListApi = (params: UserListParams) => {
  return request.get<PageResult<AdminUserVO>>('/admin/user/list', { params });
};

/**
 * 查看用户详情
 */
export const getUserDetailApi = (userId: string) => {
  return request.get<AdminUserVO>('/admin/user/detail', { params: { userId } });
};

/**
 * 禁用/启用用户
 */
export const updateUserStatusApi = (userId: string, status: number) => {
  return request.put('/admin/user/status', null, { 
    params: { userId, status } 
  });
};

/**
 * 删除用户
 */
export const deleteUserApi = (userId: string) => {
  return request.delete('/admin/user/delete', { 
    params: { userId } 
  });
};
