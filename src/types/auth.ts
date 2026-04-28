// src/types/auth.ts

export interface UserInfoVO {
    id: number;
    username: string;
    phone: string;
    avatar?: string; // 头像可选
    gender?: number; // 0未知 1男 2女
    createTime: string;
}