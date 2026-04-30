<template>
    <div class="profile-page">
        <div class="nav-bar">
            <span class="back-icon" @click="$emit('close')">❮</span>
            <span class="nav-title">账号信息</span>
            <span class="placeholder"></span>
        </div>

        <div class="avatar-section">
            <div class="avatar-wrapper" @click="triggerFileUpload">
                <img class="avatar-img"
                    :src="(userInfo?.avatar && userInfo.avatar !== 'null') ? userInfo.avatar : defaultAvatar"
                    alt="User Avatar" />
                <div class="edit-badge">
                    <span class="edit-icon">✎</span>
                </div>
            </div>
            <input type="file" ref="fileInputRef" accept="image/*" style="display: none" @change="handleAvatarChange" />
        </div>

        <div class="info-card">
            <div class="info-row">
                <span class="label">昵称</span>
                <div class="value-box">
                    <input v-if="editState.field === 'username'" v-model="editState.tempValue" class="inline-input"
                        v-focus @blur="confirmEdit" @keyup.enter="confirmEdit" placeholder="请输入昵称" />
                    <template v-else>
                        <span class="value">{{ userInfo?.username || '加载中...' }}</span>
                        <span class="icon icon-edit" @click="startEdit('username', userInfo?.username)">✎</span>
                    </template>
                </div>
            </div>

            <div class="divider"></div>

            <div class="info-row">
                <span class="label">用户ID</span>
                <div class="value-box">
                    <span class="value">{{ userInfo?.id || '加载中...' }}</span>
                    <span class="icon icon-copy" @click="copyId">📄</span>
                </div>
            </div>

            <div class="divider"></div>

            <div class="info-row">
                <span class="label">性别</span>
                <div class="value-box">
                    <div v-if="editState.field === 'gender'" class="custom-dropdown-wrapper" tabindex="-1" v-focus
                        @blur="cancelEdit">
                        <div class="dropdown-display">
                            {{ getGenderText(editState.tempValue as number) }} <span class="arrow">▾</span>
                        </div>
                        <div class="dropdown-options">
                            <div class="dropdown-item" :class="{ active: editState.tempValue == 1 }"
                                @mousedown.prevent="confirmGender(1)">男</div>
                            <div class="dropdown-item" :class="{ active: editState.tempValue == 2 }"
                                @mousedown.prevent="confirmGender(2)">女</div>
                            <div class="dropdown-item" :class="{ active: editState.tempValue == 0 }"
                                @mousedown.prevent="confirmGender(0)">不想说</div>
                        </div>
                    </div>
                    <template v-else>
                        <span class="value">{{ getGenderText(userInfo?.gender) }}</span>
                        <span class="icon icon-edit" @click="startEdit('gender', userInfo?.gender || 0)">✎</span>
                    </template>
                </div>
            </div>

            <div class="divider"></div>

            <div class="info-row">
                <span class="label">年龄</span>
                <div class="value-box">
                    <input v-if="editState.field === 'age'" v-model="editState.tempValue" type="number"
                        class="inline-input num-input" v-focus @blur="confirmEdit" @keyup.enter="confirmEdit"
                        placeholder="请输入" />
                    <template v-else>
                        <span class="value">{{ userInfo?.age ? `${userInfo.age}岁` : '未设置' }}</span>
                        <span class="icon icon-edit" @click="startEdit('age', userInfo?.age)">✎</span>
                    </template>
                </div>
            </div>

            <div class="divider"></div>

            <div class="info-row">
                <span class="label">身高</span>
                <div class="value-box">
                    <input v-if="editState.field === 'height'" v-model="editState.tempValue" type="number"
                        class="inline-input num-input" v-focus @blur="confirmEdit" @keyup.enter="confirmEdit"
                        placeholder="请输入" />
                    <template v-else>
                        <span class="value">{{ userInfo?.height ? `${userInfo.height} cm` : '未设置' }}</span>
                        <span class="icon icon-edit" @click="startEdit('height', userInfo?.height)">✎</span>
                    </template>
                </div>
            </div>
        </div>

        <div class="info-card">
            <div class="info-row">
                <span class="label">手机号</span>
                <div class="value-box">
                    <input v-if="editState.field === 'phone'" v-model="editState.tempValue" type="tel" maxlength="11"
                        class="inline-input" v-focus @blur="confirmEdit" @keyup.enter="confirmEdit"
                        placeholder="请输入手机号" />
                    <template v-else>
                        <span v-if="userInfo?.phone" class="value">{{ userInfo.phone }}</span>
                        <span v-else class="action-text green" @click="startEdit('phone', '')">去绑定 ❯</span>
                        <span v-if="userInfo?.phone" class="icon icon-edit"
                            @click="startEdit('phone', userInfo.phone)">✎</span>
                    </template>
                </div>
            </div>

            <div class="divider"></div>
            <div class="info-row">
                <span class="label">微信</span>
                <span class="value">未绑定</span>
            </div>
            <div class="divider"></div>
            <div class="info-row">
                <span class="label">QQ</span>
                <span class="action-text green">去绑定 ❯</span>
            </div>
        </div>

        <div class="bottom-actions">
            <button class="switch-btn" @click="handleLogout">退出登录</button>
            <div class="delete-btn" @click="handleDeleteAccount">注销账户！谨慎操作</div>
        </div>

        <Toast ref="toastRef" />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Toast from '@/components/Toast.vue';
import { getUserInfoApi, updateUserInfoApi, logoutApi, uploadApi } from '@/api/auth';
import type { UserVO } from '@/api/auth';
import defaultAvatar from '@/assets/avatar.jpg';
import { getUserIdFromToken } from '@/utils/jwt';

// 🌟 注册 close 事件
const emit = defineEmits(['close']);
const router = useRouter();
const toastRef = ref<any>(null);
const userInfo = ref<UserVO | null>(null);

const vFocus = {
    mounted: (el: HTMLElement) => el.focus()
};

const editState = reactive({
    field: '',
    tempValue: '' as string | number
});

const parseUserIdFromToken = (): string | null => {
    return getUserIdFromToken(localStorage.getItem('token'));
};

const loadUserInfo = async () => {
    try {
        const userId = localStorage.getItem('userId') || parseUserIdFromToken();
        if (!userId) return router.push('/login');

        const data = await getUserInfoApi(userId);
        if (data) userInfo.value = data;
    } catch (error) {
        console.error('获取个人信息失败', error);
    }
};

const saveUserInfo = async (updateData: Partial<UserVO>) => {
    if (!userInfo.value?.id) return;
    try {
        const payload = { id: userInfo.value.id, ...updateData };
        await updateUserInfoApi(payload);
        toastRef.value.show('修改成功');
        await loadUserInfo();
    } catch (error) {
        toastRef.value.show('保存失败，请重试', 'error');
    }
};

const startEdit = (field: string, currentValue: any) => {
    editState.field = field;
    editState.tempValue = currentValue !== undefined && currentValue !== null ? String(currentValue) : '';
};

const cancelEdit = () => {
    editState.field = '';
};

const confirmEdit = async () => {
    const field = editState.field;
    if (!field) return;

    let valStr = String(editState.tempValue).trim();
    const originalValue = String((userInfo.value as any)?.[field] || '');

    if (valStr === originalValue) {
        cancelEdit();
        return;
    }

    let finalValue: string | number = valStr;

    if (field === 'username' && (!valStr || valStr.length > 20)) {
        toastRef.value.show('昵称格式错误', 'warning');
        return;
    }

    if (field === 'age') {
        const ageNum = parseInt(valStr, 10);
        if (isNaN(ageNum) || ageNum <= 0) return;
        finalValue = ageNum;
    }

    if (field === 'height') {
        const heightNum = parseFloat(valStr);
        if (isNaN(heightNum) || heightNum < 30 || heightNum > 300) {
            toastRef.value.show('请输入有效的身高 (30-300cm)', 'warning');
            return;
        }
        finalValue = heightNum;
    }

    if (field === 'gender') {
        finalValue = parseInt(valStr, 10);
    }

    await saveUserInfo({ [field]: finalValue });
    cancelEdit();
};

const confirmGender = async (val: number) => {
    editState.tempValue = val;
    await confirmEdit();
};

const getGenderText = (gender?: number) => {
    if (gender === 1) return '男';
    if (gender === 2) return '女';
    if (gender === 0) return '不想说';
    return '未设置';
};

const fileInputRef = ref<HTMLInputElement | null>(null);

const triggerFileUpload = () => {
    fileInputRef.value?.click();
};

const handleAvatarChange = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    target.value = '';

    if (!file.type.startsWith('image/')) {
        toastRef.value.show('请选择图片文件', 'warning');
        return;
    }

    toastRef.value.show('正在上传...', 'success', 3000);

    try {
        const formData = new FormData();
        formData.append('file', file);
        const avatarUrl = await uploadApi(formData);

        if (avatarUrl) {
            await saveUserInfo({ avatar: avatarUrl });
            toastRef.value.show('头像更新成功', 'success');
        }
    } catch (error) {
        toastRef.value.show('头像上传失败', 'error');
    }
};

const copyId = () => {
    if (userInfo.value?.id) {
        navigator.clipboard.writeText(userInfo.value.id.toString())
            .then(() => toastRef.value.show('ID 已复制'))
            .catch(() => toastRef.value.show('复制失败', 'error'));
    }
};

const handleLogout = async () => {
    try {
        await toastRef.value.confirmDialog({ title: '提示', message: '确定要退出登录吗？' });
        try { await logoutApi(); } catch (e) { console.warn('后端退出异常'); }

        // 1. 清除本地缓存
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userInfo');

        // 🌟 删掉这里的 emit('close'); ！！！
        // 让个人中心页面继续盖在首页上面

        // 2. 弹出提示
        toastRef.value.show('已安全退出');

        // 3. 延迟 1 秒让用户看清提示，然后直接跳转
        setTimeout(() => {
            // 方案 A：使用 vue-router 跳转（配合 Home.vue 的 onActivated 已经可以完美解决）
            // router.replace('/login');

            // 方案 B（强烈推荐）：直接使用原生跳转。这在真实项目中是退出登录的最佳实践，
            // 它可以强制刷新整个浏览器上下文，彻底清空 Pinia 和所有组件内存，防止数据泄露。
            window.location.href = '/login'; 
        }, 1000);
    } catch (error) { }
};

const handleDeleteAccount = () => {
    toastRef.value.confirmDialog({
        title: '危险操作',
        message: '注销账户将永久删除您的所有数据，确认继续？'
    }).then(() => {
        toastRef.value.show('请联系管理员注销');
    }).catch(() => { });
};

onMounted(() => {
    loadUserInfo();
});
</script>

<style scoped>
.profile-page {
    /* 🌟 改造成支持固定覆盖层的样式，确保它在主页上层能正确渲染 */
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow-y: auto;
    background-color: #FAFAFA;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    padding-top: max(44px, env(safe-area-inset-top));
    z-index: 2000;
}

/* 隐藏滚动条让视觉更干净 (可选) */
.profile-page::-webkit-scrollbar {
    display: none;
}

.nav-bar {
    width: 100%;
    max-width: 480px;
    height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    box-sizing: border-box;
}

.back-icon {
    font-size: 20px;
    color: #7D5A44;
    font-weight: bold;
    cursor: pointer;
}

.nav-title {
    font-size: 18px;
    font-weight: bold;
    color: #5d4037;
}

.placeholder {
    width: 20px;
}

.avatar-section {
    margin: 30px 0;
    display: flex;
    justify-content: center;
}

.avatar-wrapper {
    position: relative;
    width: 90px;
    height: 90px;
    cursor: pointer;
}

.avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.edit-badge {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 26px;
    height: 26px;
    background-color: #8D6E63;
    border-radius: 50%;
    border: 2px solid #FFF;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.edit-icon {
    color: #FFF;
    font-size: 12px;
}

.info-card {
    width: calc(100% - 40px);
    max-width: 440px;
    background: #FFFFFF;
    border-radius: 16px;
    padding: 0 20px;
    margin-bottom: 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
    box-sizing: border-box;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 64px;
}

.divider {
    height: 1px;
    background-color: #F5F5F5;
    width: 100%;
}

.label {
    font-size: 15px;
    color: #666666;
    font-weight: 500;
}

.value-box {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: flex-end;
    flex: 1;
}

.value {
    font-size: 15px;
    color: #333333;
    font-weight: 500;
}

.icon {
    font-size: 14px;
    color: #999;
    cursor: pointer;
    padding: 5px;
}

.inline-input {
    border: none;
    background: transparent;
    outline: none;
    font-size: 15px;
    color: #333;
    text-align: right;
    font-family: inherit;
    width: 100%;
    padding: 0;
    border-bottom: 1px solid #81C784;
}

.num-input {
    width: 60px;
}

.action-text {
    font-size: 14px;
    cursor: pointer;
}

.action-text.green {
    color: #81C784;
}

.custom-dropdown-wrapper {
    position: relative;
    outline: none;
    min-width: 90px;
}

.dropdown-display {
    font-size: 15px;
    color: #81C784;
    text-align: right;
    cursor: pointer;
    padding: 4px 0;
    border-bottom: 1px solid #81C784;
}

.dropdown-display .arrow {
    font-size: 12px;
    margin-left: 4px;
}

.dropdown-options {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 8px;
    background: #fdfaf5;
    border: 1px solid #e2d3c2;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(166, 124, 82, 0.12);
    overflow: hidden;
    z-index: 100;
    width: 100px;
}

.dropdown-item {
    padding: 12px 16px;
    font-size: 14px;
    color: #666;
    text-align: center;
    cursor: pointer;
    transition: background 0.2s;
    border-bottom: 1px solid #f4f0e6;
}

.dropdown-item:last-child {
    border-bottom: none;
}

.dropdown-item:hover,
.dropdown-item:active {
    background: #F5F5F5;
}

.dropdown-item.active {
    color: #81C784;
    font-weight: bold;
    background: #E8F7EE;
}

.bottom-actions {
    width: 100%;
    max-width: 480px;
    padding: 0 20px;
    margin-top: auto;
    margin-bottom: 40px;
    box-sizing: border-box;
}

.switch-btn {
    width: 100%;
    height: 50px;
    background-color: #81C784;
    color: white;
    border: none;
    border-radius: 25px;
    font-size: 16px;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(129, 199, 132, 0.4);
    margin-bottom: 20px;
    cursor: pointer;
    transition: transform 0.1s;
}

.switch-btn:active {
    transform: scale(0.98);
}

.delete-btn {
    text-align: center;
    font-size: 13px;
    color: #E57373;
    cursor: pointer;
}
</style>