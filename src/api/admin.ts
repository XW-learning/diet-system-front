// src/api/admin.ts
import request from '@/utils/request';
import type { AdminVO, AdminLoginParams, UpdatePasswordParams } from '@/types/admin';

/**
 * 管理员登录
 */
export const adminLoginApi = (data: AdminLoginParams) => {
  return request.post<string>('/admin/login', data);
};

/**
 * 获取管理员信息
 */
export const getAdminInfoApi = (id: string) => {
  return request.get<AdminVO>('/admin/info', { params: { id } });
};

/**
 * 修改管理员密码
 */
export const updateAdminPasswordApi = (data: UpdatePasswordParams) => {
  return request.put('/admin/password', data);
};
