// 假设放在 src/stores/app.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  // 记录当天的日期字符串，例如 '2026-04-16'
  const currentDate = ref(new Date().toDateString());

  // 触发新的一天
  const triggerNewDay = () => {
    currentDate.value = new Date().toDateString();
  };

  return { currentDate, triggerNewDay };
});