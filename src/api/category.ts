import request from '@/utils/request';
import type { Result } from '@/utils/request'; // 假设 Result 类型定义在此
import type { CategoryVO } from '@/types/dish';

/**
 * 获取所有菜品分类列表
 */
export function getCategoryList() {
  return request.get<Result<CategoryVO[]>>('/category/list');
}