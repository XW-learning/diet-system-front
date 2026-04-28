import request from '@/utils/request'

/**
 * 获取今日饮水记录
 * @param userId 用户ID
 */
export const getTodayWaterRecordApi = (userId: string | number) => {
    return request.get(`/water/today?userId=${userId}`)
}

/**
 * 增加饮水量 (喝水打卡)
 * @param data 包含 userId 和 addAmount (增加的饮水量，单位 ml)
 */
export const addWaterApi = (data: { userId: string | number; addAmount: number }) => {
    return request.post('/water/add', data)
}