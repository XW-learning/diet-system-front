// src/stores/plan.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePlanStore = defineStore('plan', () => {
    const activePlan = ref<any>(null);

    const setActivePlan = (plan: any) => {
        activePlan.value = plan;
    };

    // 新增：清除计划的方法
    const clearActivePlan = () => {
        activePlan.value = null;
    };

    return { activePlan, setActivePlan, clearActivePlan };
});