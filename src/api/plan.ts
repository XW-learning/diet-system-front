// filepath: src/api/plan.ts
import request from '@/utils/request'

/**
 * 获取推荐方案列表
 */
export const getRecommendPlan = () => {
    return request.get('/plan/recommend')
}

/**
 * 更换方案（随机刷新）
 */
export const refreshPlan = () => {
    return request.post('/plan/refresh')
}

/**
 * 获取方案详情（含菜谱）
 * @param planId 方案ID
 */
export const getPlanDetail = (planId: number | string) => {
    return request.get('/plan/detail', { params: { planId } })
}

/**
 * 收藏或取消收藏方案
 * @param data { planId: number, action: number(1收藏 0取消) }
 */
export const favoritePlan = (data: { planId: number | string, action: number }) => {
    return request.post('/plan/favorite', data)
}

/**
 * 获取收藏列表
 */
export const getFavoritePlans = () => {
    return request.get('/plan/favorites')
}

/**
 * 搜索饮食方案 (获取分类列表)
 * @param params { categoryId?: number, keyword?: string, ... }
 */
export const searchPlans = (params?: any) => {
    return request.get('/plan/search', { params })
}

/**
 * 获取我的专属定制方案列表
 */
export const getCustomPlans = () => {
    return request.get('/plan/custom/list')
}

// 注意：如果你后端后续补上了"设置为我的食谱计划"的专门接口，可以在这里继续添加，例如：
// export const activatePlan = (data: { planId: number | string }) => {
//     return request.post('/plan/user/activate', data)
// }

/**
 * 设置为我的食谱计划
 * @param planId 方案ID
 */
export const activatePlan = (planId: number | string) => {
    return request.post('/plan/activate', { planId })
}

/**
 * 获取当前激活的食谱计划
 */
export const getActivePlan = () => {
    return request.get('/plan/active')
}