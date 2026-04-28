/**
 * 菜品分类信息
 */
export interface CategoryVO {
  id: number;
  name: string;
  sortOrder?: number;
}

/**
 * 菜品详情信息
 */
export interface DishVO {
  id: number;
  name: string;
  categoryId: number;
  description?: string;
  calorie: number;
  protein: number;
  fat: number;
  carbohydrate: number;
  fiber?: number;
  refWeight: number; // 参考重量
  weightUnit: string; // 单位 (如: 克/毫升)
  cookMethod?: string;
}