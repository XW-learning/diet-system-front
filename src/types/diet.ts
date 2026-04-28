// src/types/diet.ts

/**
 * 1. 打卡热量看板视图对象
 * 严格对应后端 OpenAPI 接口中的 CheckInSummaryVO
 */
export interface CheckInSummary {
  remainCalorie: number;  // 还可以吃 (剩余额度) = 预算 - 饮食 + 运动
  budgetCalorie: number;  // 今日预算热量
  intakeCalorie: number;  // 今日饮食摄入总热量
  burnCalorie: number;    // 今日运动消耗总热量
}

/**
 * 2. 菜品详情及营养成分视图对象 
 * 对应后端接口返回的 DishVO，用于菜品详情展示页 (DishDetailOverlay)
 */
export interface DishVO {
  id: number;
  name: string;
  description?: string;
  calorie: number;
  cookMethod?: string;
  protein: number;      // 蛋白质(g)
  fat: number;          // 脂肪(g)
  carbohydrate: number; // 碳水化合物(g)
  fiber?: number;       // 膳食纤维(g)
}

/**
 * 3. 单次饮食记录详情对象
 * 对应后端接口返回的 MealVO
 */
export interface MealVO {
  mealType: number;     // 1早餐 2午餐 3晚餐 4加餐
  dishId: number;
  dishName: string;
  description?: string;
  calorie: number;
  cookMethod?: string;
}