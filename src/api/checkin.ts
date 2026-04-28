// src/api/checkin.ts
import request from '@/utils/request';
import type { CheckInSummary } from '@/types/diet';

/**
 * 1. 定义饮食打卡提交的数据结构 (严格对应后端 MealCheckInDTO)
 *
 */
export interface MealCheckInDTO {
  userId: string;      // 🌟 必须包含用户 ID，否则后端报 400
  dishId: number;      // 菜品 ID
  mealType: number;    // 餐次类型 (1早餐 2午餐 3晚餐 4加餐)
  weight: number;      // 记录的重量（克）
  type: number;        // 记录类型（如 2 代表自定义记录）
  date: string;        // 打卡日期 (格式: YYYY-MM-DD)
  remark?: string;     // 备注（可选）
}

export interface ExerciseCheckInDTO {
    userId?: string;
    exerciseId: number;
    duration: number; // 运动时长(分钟)
    date: string;
}

// 🌟 新增：饮食分析数据结构
export interface CheckInAnalysisVO {
    budgetCalorie: number;
    intakeCalorie: number;
    burnCalorie: number;
    remainCalorie: number;
    
    totalCarbohydrate: number;
    totalProtein: number;
    totalFat: number;
    
    recommendCarbohydrate: number;
    recommendProtein: number;
    recommendFat: number;
    
    breakfastCalorie: number;
    lunchCalorie: number;
    dinnerCalorie: number;
    snackCalorie: number;
}

/**
 * 2. 获取今日/某日热量看板数据
 * URL: /api/checkin/summary
 * @param userId 用户 ID
 * @param date 日期 (格式: yyyy-MM-dd)
 */
export function getCheckInSummary(userId: number | string, date: string) {
  return request.get<CheckInSummary>('/checkin/summary', {
    params: { userId, date }
  });
}

/**
 * 3. 提交饮食记录
 * URL: /api/checkin/meal
 * @param data 饮食打卡数据
 */
export function doMealCheckIn(data: MealCheckInDTO) {
  // 请求拦截器已自动添加 token 请求头，无需手动设置
  return request.post<string>('/checkin/meal', data);
}

// 🌟 新增：2.1 批量饮食打卡
export function doMealCheckInBatch(data: MealCheckInDTO[]) {
    return request.post('/checkin/meal/batch', data);
}

export function doExerciseCheckIn(data: ExerciseCheckInDTO) {
    return request.post('/checkin/exercise', data);
}

// 🌟 新增：获取今日饮食详细分析
export function getDailyAnalysis(userId: string | number, date: string) {
    return request.get('/checkin/analysis', { params: { userId, date } });
}

// 🌟 新增：获取健身日历月度聚合数据
export function getFitnessCalendarApi(userId: number | string, year: number, month: number) {
  return request.get('/checkin/fitness/month', {
    params: { userId, year, month }
  })
}

/**
 * 获取减脂日历数据
 */
export const getFatLossCalendarApi = (userId: number | string, year: number, month: number) => {
  return request.get(`/checkin/fatLoss/month?userId=${userId}&year=${year}&month=${month}`)
} 

// 获取美食日历专属聚合数据
export const getFoodCalendarApi = (userId: number | string, year: number, month: number) => {
  return request.get('/checkin/food/month', {
    params: { userId, year, month }
  })
}

// 获取某日打卡明细详情 (含饮食流水账)
export const getCheckInDetail = (userId: number | string, date: string) => {
  return request.get('/checkin/detail', {
    params: { userId, date }
  })
}