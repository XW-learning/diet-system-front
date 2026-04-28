// src/stores/admin.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { AdminVO } from '@/types/admin';
import { getAdminInfoApi } from '@/api/admin';

export const useAdminStore = defineStore('admin', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('admin_token'));
  const adminInfo = ref<AdminVO | null>(null);

  // Actions
  /**
   * 设置Token
   */
  const setToken = (newToken: string) => {
    token.value = newToken;
    localStorage.setItem('admin_token', newToken);
  };

  /**
   * 设置管理员信息
   */
  const setAdminInfo = (info: AdminVO) => {
    adminInfo.value = info;
  };

  /**
   * 获取管理员信息
   */
  const fetchAdminInfo = async (id: string) => {
    try {
      const data = await getAdminInfoApi(id);
      adminInfo.value = data;
      return data;
    } catch (error) {
      console.error('获取管理员信息失败:', error);
      throw error;
    }
  };

  /**
   * 清空管理员数据（退出登录）
   */
  const clearAdminData = () => {
    token.value = null;
    adminInfo.value = null;
    localStorage.removeItem('admin_token');
  };

  return {
    token,
    adminInfo,
    setToken,
    setAdminInfo,
    fetchAdminInfo,
    clearAdminData
  };
});
