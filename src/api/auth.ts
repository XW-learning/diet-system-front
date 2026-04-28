// src/api/auth.ts
import request from '@/utils/request';

/**
 * 1. 定义数据结构 (严格对应你的 OpenAPI 定义)
 */

// 登录请求对象
export interface LoginDTO {
  phone: string;
  password: string;
}

// 注册请求对象
export interface RegisterDTO {
  phone: string;
  password: string;
  username: string;
  captcha: string;
  agreement: boolean;
}

// 用户信息展示对象 (对应后端的 UserVO)
export interface UserVO {
  id: string;
  phone: string;
  username: string;
  avatar: string;
  gender: number;
  age: number;
  email: string;
  height: number;
  weight: number;
  bmi: number;
  targetWeight: number;
  goalType: string;
  categoryName?: string;
  waist?: number;
  hip?: number;
}

/**
 * 2. 认证模块接口 (路径: /auth/**)
 */

/**
 * 用户登录
 * URL: /api/auth/login
 * 返回值: Token 字符串
 */
export const loginApi = (data: LoginDTO) => {
  return request.post<string>('/auth/login', data);
};

export const logoutApi = () => {
  return request.post<string>('/auth/logout');
};

/**
 * 用户注册
 * URL: /api/auth/register
 */
export const registerApi = (data: RegisterDTO) => {
  return request.post<string>('/auth/register', data);
};

/**
 * 3. 用户管理模块接口 (路径: /user/**)
 */

/**
 * 获取用户信息 (全量聚合)
 * URL: /api/user/info
 * 说明: 必须携带 id 参数。如果报“用户不存在”，请检查传入的 id 是否在数据库中存在。
 */
export const getUserInfoApi = (id: string) => {
  return request.get<UserVO>('/user/info', {
    params: { id }
  });
};

/**
 * 修改用户基础信息
 * URL: /api/user/save
 */
export const updateUserInfoApi = (data: any) => {
  return request.post<string>('/user/save', data);
};

/**
 * 🌟 上传文件接口
 * 假设你的后端有一个统一处理文件上传的接口 /api/upload
 * 成功后返回图片的 URL 字符串
 */
export const uploadApi = (formData: FormData) => {
  // 🌟 核心修改：直接传 formData 即可！
  // 浏览器和 Axios 会自动识别它是 FormData，并自动加上带有 boundary 的 Content-Type
  return request.post<string>('/upload', formData);
};