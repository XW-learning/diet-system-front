// src/types/community.ts

/**
 * 社区模块 - TypeScript 类型定义
 * 对标后端 com.xw.vo / com.xw.dto
 */

// ==================== 动态 (Share) ====================

/** 分享动态展示对象 (对应 ShareVO.java) */
export interface ShareVO {
  id: number
  userId: number
  username: string
  avatar: string
  content: string
  privacy: number       // 0公开 1私密
  auditStatus: number   // 0待审核 1正常 2违规
  likeCount: number
  commentCount: number
  collectionCount: number
  shareCount: number
  createTime: string
  images: string[]
  /** 前端扩展：当前用户是否已点赞 */
  isLiked?: boolean
  /** 前端扩展：当前用户是否已收藏 */
  isCollected?: boolean
}

/** 发布/修改动态请求 (对应 ShareSaveDTO.java) */
export interface ShareSaveDTO {
  userId: number
  content: string
  privacy?: number       // 0公开 1私密，默认0
  images?: string[]
}

// ==================== 互动 (Interact) ====================

/** 点赞/收藏请求 (对应 InteractDTO.java) */
export interface InteractDTO {
  shareId: number
  authorId: number
}

/** 评论保存请求 (对应 CommentSaveDTO.java) */
export interface CommentSaveDTO {
  shareId: number
  authorId: number
  content: string
  parentId?: number       // 父评论ID（回复评论时传入）
  replyUserId?: number    // 被回复的用户ID
}

/** 评论展示对象 */
export interface CommentVO {
  id: number
  shareId: number
  userId: number
  username: string
  avatar: string
  content: string
  parentId: number | null
  replyUserId: number | null
  replyUsername?: string
  createTime: string
  replies?: CommentVO[]
}

// ==================== 消息 (Message) ====================

/** 消息通知展示对象 (对应 MessageVO.java) */
export interface MessageVO {
  id: number
  receiverId: number
  senderId: number
  senderName: string
  senderAvatar: string
  type: number           // 1点赞 2评论 3收藏 4系统通知
  sourceId: number       // 关联的动态ID
  content: string
  isRead: number         // 0未读 1已读
  createTime: string
}
