// src/utils/request.ts
import axios from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { showToast } from 'vant';
import router from '@/router'; // 🌟 引入刚刚写好的路由实例

// 1. 定义后端统一返回的数据结构
export interface Result<T = any> {
  code: number;
  msg: string;
  data: T;
}

// 2. 创建 Axios 实例（使用自定义类型以匹配响应拦截器的实际返回值）
const request = axios.create({
  baseURL: '/api', // 这里对应 vite.config.ts 里的 proxy 代理
  timeout: 10000,  // 超时时间 10 秒
}) as Omit<AxiosInstance, 'get' | 'post' | 'put' | 'delete' | 'patch'> & {
  get<T = any>(url: string, config?: any): Promise<T>;
  post<T = any>(url: string, data?: any, config?: any): Promise<T>;
  put<T = any>(url: string, data?: any, config?: any): Promise<T>;
  delete<T = any>(url: string, config?: any): Promise<T>;
  patch<T = any>(url: string, data?: any, config?: any): Promise<T>;
};

// 3. 请求拦截器：自动携带 Token（支持用户和管理员双Token）
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 🌟 终极修复：通过判断请求的 URL，决定使用哪个 Token
    const url = config.url || '';
    let token = null;

    // 假设你的管理员接口都是以 /admin/ 开头的
    if (url.startsWith('/admin')) {
      token = localStorage.getItem('admin_token');
    } else {
      // 其他的普通业务接口（如 /checkin, /user, /dish 等）
      token = localStorage.getItem('token');
    }

    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 4. 响应拦截器：全局错误处理与数据剥离
request.interceptors.response.use(
  (response: AxiosResponse<Result>) => {
    const { code, msg, data } = response.data;

    // 成功状态：直接返回核心 data
    if (code === 200) {
      return data;
    }

    // 🌟 核心修复 4：拦截后端 HTTP 200 但业务 code 是 401 的情况
    if (code === 401) {
      showToast('登录状态已失效，请重新登录');
      localStorage.removeItem('token');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('userInfo');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
      return Promise.reject(new Error(msg || '鉴权失败'));
    }

    // 其他业务错误
    showToast(msg || '操作失败');
    return Promise.reject(new Error(msg || 'Error'));
  },
  (error) => {
    const status = error.response?.status;
    // HTTP 状态码 401 处理 (后端刚才设置了 response.setStatus(401) 就会进这里)
    if (status === 401) {
      showToast('登录状态已失效，请重新登录');
      localStorage.removeItem('token');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('userInfo');
      setTimeout(() => {
        // 你可以通过当前路由来判断是去管理员登录还是用户登录
        if (window.location.pathname.includes('/admin')) {
          router.push('/admin/login');
        } else {
          router.push('/login');
        }
      }, 1500);
    } else {
      showToast('网络异常或服务器维护中');
    }
    return Promise.reject(error);
  }
);

export default request;