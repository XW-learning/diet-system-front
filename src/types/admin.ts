// src/types/admin.ts

/**
 * 管理员信息
 */
export interface AdminVO {
  id: string; // 后端已改为String类型
  username: string;
  role: string;
  status: number; // 0-禁用, 1-正常
  createTime: string;
}

/**
 * 用户信息（管理后台视角）
 */
export interface AdminUserVO {
  id: string; // 后端已改为String类型
  phone: string;
  username: string;
  gender: number | null; // 0-女, 1-男, null-未设置
  status: number; // 0-禁用, 1-正常
  avatar?: string;
  age?: number | null;
  email?: string | null;
  categoryId?: string | null; // 使用string类型，与id保持一致
  categoryName?: string;
  createTime: string;
}

/**
 * 分页结果
 */
export interface PageResult<T> {
  records: T[];
  total: number;
  pageNum: number;
  pageSize: number;
  pages: number;
}

/**
 * 管理员登录参数
 */
export interface AdminLoginParams {
  username: string;
  password: string;
}

/**
 * 修改密码参数
 */
export interface UpdatePasswordParams {
  id: string; // 后端已改为String类型
  oldPassword: string;
  newPassword: string;
}

/**
 * 用户列表查询参数
 */
export interface UserListParams {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  status?: number | null;
}
