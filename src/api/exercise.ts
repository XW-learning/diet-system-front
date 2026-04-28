import request from '@/utils/request';

// 获取运动分类列表
export function getExCategoryList() {
    return request.get('/exCategory/list');
}

// 获取运动项目列表
export function getExerciseList(params: { categoryId?: number; keyword?: string }) {
    return request.get('/exercise/list', { params });
}