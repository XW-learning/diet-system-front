// src/stores/user.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface UserInfo {
  id: string;
  phone: string;
  username: string;
  gender?: number;
  status?: number;
  avatar?: string;
  age?: number;
  email?: string;
}

export const useUserStore = defineStore('user', () => {
  // 🌟 改为从 localStorage 读取
  const token = ref<string | null>(localStorage.getItem('token'));
  const userInfo = ref<UserInfo | null>(JSON.parse(localStorage.getItem('userInfo') || 'null'));

  const setToken = (newToken: string) => {
    token.value = newToken;
    localStorage.setItem('token', newToken);
  };

  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info;
    // 🌟 将用户信息存入 localStorage
    localStorage.setItem('userInfo', JSON.stringify(info));
  };

  const clearUserData = () => {
    token.value = null;
    userInfo.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
  };

  return { token, userInfo, setToken, setUserInfo, clearUserData };
});