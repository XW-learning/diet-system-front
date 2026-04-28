import request from '@/utils/request';
import type { Result } from '@/utils/request';
import type { DishVO } from '@/types/dish';

/**
 * 根据关键词和分类 ID 搜索菜品
 * @param params { keyword?: 搜索词, categoryId?: 分类ID }
 */
export function getDishList(params: { keyword?: string; categoryId?: number }) {
  return request.get<Result<DishVO[]>>('/dish/list', { params });
}