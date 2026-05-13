// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  // ==================== 基础重定向 ====================
  {
    path: '/',
    redirect: '/home'
  },

  // ==================== 一级页面 (Depth: 1) ====================
  // 这些页面内部会使用 <TabWrapper> 包含 BottomNavBar
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/user/home/Home.vue'),
    meta: { requiresAuth: true, depth: 1 }
  },
  {
    path: '/plan',
    name: 'Plan',
    component: () => import('@/views/user/plan/PlanIndex.vue'),
    meta: { requiresAuth: true, depth: 1 }
  },
  {
    path: '/community',
    name: 'community',
    component: () => import('@/views/user/community/CommunityIndex.vue'),
    meta: { requiresAuth: true, depth: 1 }
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('@/components/home/CalendarIndex.vue'),
    meta: { requiresAuth: true, depth: 1 }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/user/profile/Profile.vue'),
    meta: { requiresAuth: true, depth: 1 }
  },

  // ==================== 二级页面 (Depth: 2) ====================
  // 进入这些页面时，一级页面（含导航栏）会整体左移并变暗
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/user/login/Login.vue'),
    meta: { depth: 2 }
  },
  {
    path: '/ai',
    name: 'AiChat',
    component: () => import('@/views/user/AIchat/AiChat.vue'),
    // depth: 2 确保从右侧滑入，且底部不会有 Navbar 挡住聊天输入框
    meta: { requiresAuth: true, depth: 2, title: 'AI健康助手' }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/components/home/SearchOverlay.vue'),
    meta: { requiresAuth: true, depth: 2 }
  },
  {
    path: '/plan/detail/:id',
    name: 'PlanDetail',
    component: () => import('@/components/plan/PlanDetail.vue'),
    meta: { requiresAuth: true, depth: 2, title: '计划详情' }
  },
  {
    path: '/community/publish',
    name: 'CommunityPublish',
    component: () => import('@/components/community/CommunityPublish.vue'),
    // 🌟 depth: 2 是关键，触发从右侧滑入的动画
    meta: { requiresAuth: true, depth: 2, title: '发布动态' }
  },

  // ==================== 管理员路由 (保持嵌套结构) ====================
  // 管理员后台通常不需要用户端的滑动动效，保持原样即可
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/views/admin/login/AdminLogin.vue'),
    meta: { title: '管理员登录' }
  },
  {
    path: '/admin',
    component: () => import('@/layout/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/dashboard/Dashboard.vue'),
        meta: { title: '数据概览' }
      },
      {
        path: 'user/list',
        name: 'UserList',
        component: () => import('@/views/admin/user/UserList.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'user/detail/:id',
        name: 'UserDetail',
        component: () => import('@/views/admin/user/UserDetail.vue'),
        meta: { title: '用户详情' }
      },
      {
        path: 'profile',
        name: 'AdminProfile',
        component: () => import('@/views/admin/profile/AdminProfile.vue'),
        meta: { title: '个人设置' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局路由守卫
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  const adminToken = localStorage.getItem('admin_token')

  // 1. 管理员路由处理
  if (to.path.startsWith('/admin')) {
    if (to.path === '/admin/login') {
      adminToken ? next('/admin/dashboard') : next()
    } else {
      !adminToken ? next('/admin/login') : next()
    }
  }
  // 2. 普通用户路由处理
  else {
    if (to.meta.requiresAuth && !token) {
      next('/login')
    } else if (to.path === '/login' && token) {
      next('/home')
    } else {
      next()
    }
  }
})

export default router