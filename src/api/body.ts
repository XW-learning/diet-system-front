import request from '@/utils/request'

/**
 * 保存身材记录 (打卡)
 */
// ✅ 在参数类型中补充 chest?: number
export const saveBodyRecordApi = (data: {
    userId: number | string,
    weight?: number,
    height?: number,
    waist?: number,
    hip?: number,
    chest?: number,
    // 🌟 换成和后端一致的字段
    periodStartDate?: string | null,
    periodEndDate?: string | null,
    isPeriodUpdate?: boolean,
    recordTime?: string
}) => {
    return request.post('/body/save', data)
}

/**
 * 获取身材记录列表
 */
export const getBodyRecordListApi = () => {
    return request.get('/body/list')
}

export const getPeriodRecordListApi = () => {
    return request.get('/body/periodList')
}