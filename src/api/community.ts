// src/api/community.ts
import request from '@/utils/request'
import type {
  ShareVO,
  ShareSaveDTO,
  InteractDTO,
  CommentSaveDTO,
  CommentVO,
  MessageVO
} from '@/types/community'

// ==================== 动态模块 (/share) ====================

/** 31. 获取大厅分享列表（最新公开动态） */
export const getShareList = () => {
  return request.get<ShareVO[]>('/share/list')
}

/** 33. 获取我的分享列表 */
export const getMyShares = () => {
  return request.get<ShareVO[]>('/share/my')
}

// TODO: 后端暂缺 GET /share/detail 端点 — 详情页展示需要
// export const getShareDetail = (id: number) => {
//   return request.get<ShareVO>('/share/detail', { params: { id } })
// }

// TODO: 后端暂缺 GET /share/comments 端点 — 评论列表展示需要
// export const getShareComments = (shareId: number) => {
//   return request.get<CommentVO[]>('/share/comments', { params: { shareId } })
// }

/** 29. 发布/修改分享 */
export const saveShare = (data: ShareSaveDTO) => {
  return request.post<string>('/share/save', data)
}

/** 30. 删除分享 */
export const deleteShare = (id: number) => {
  return request.delete<string>('/share/delete', { params: { id } })
}

// ==================== 互动模块 (/interact) ====================

/** 37. 点赞/取消点赞 */
export const toggleLike = (data: InteractDTO) => {
  return request.post<string>('/interact/like', data)
}

/** 38. 收藏/取消收藏 */
export const toggleCollect = (data: InteractDTO) => {
  return request.post<string>('/interact/collect', data)
}

/** 39. 发布评论/回复 */
export const addComment = (data: CommentSaveDTO) => {
  return request.post<string>('/interact/comment', data)
}

/** 40. 增加动态分享/转发数 */
export const incrementShareCount = (shareId: number) => {
  return request.post<string>('/interact/share/count', null, { params: { shareId } })
}

// TODO: 后端暂缺 GET /interact/status 端点 — 批量查询当前用户互动状态需要
// export const getInteractStatus = (shareIds: number[]) => {
//   return request.get<Record<number, { liked: boolean; collected: boolean }>>('/interact/status', {
//     params: { shareIds: shareIds.join(',') }
//   })
// }

// ==================== 消息模块 (/message) ====================

/** 34. 获取未读消息数量（用于红点/角标提示） */
export const getUnreadCount = () => {
  return request.get<number>('/message/unread/count')
}

/** 35. 获取消息列表 */
export const getMessageList = () => {
  return request.get<MessageVO[]>('/message/list')
}

/** 36. 标记消息为已读 */
export const markRead = (id: number) => {
  return request.put<string>('/message/read', null, { params: { id } })
}

// ==================== 文件上传 ====================

/** 上传图片文件，返回图片访问URL */
export const uploadImage = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<string>('/upload', formData)
}
