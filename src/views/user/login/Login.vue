<template>
    <div class="login-page-wrapper">
        <div class="login-content">
            <div class="close-icon" @click="handleClose">✕</div>

            <div class="header">
                <img class="mascot" src="@/assets/login/beaver.jpg" alt="Mascot" />
                <span class="title">Kalu-Kalu ~</span>
                <span class="subtitle">为了你的信息储存，请登录账号哦~</span>
            </div>

            <div class="form-box">
                <div class="input-group">
                    <input id="phone" name="phone" class="custom-input" v-model="formData.phone" type="tel"
                        placeholder="请输入手机号 ~" maxlength="11" />
                </div>

                <div class="input-group" v-if="isLoginMode">
                    <input id="password" name="password" class="custom-input" v-model="formData.password"
                        type="password" placeholder="请输入密码 ~" />
                </div>

                <div v-if="!isLoginMode" class="register-fields">
                    <div class="input-group">
                        <input id="reg_username" name="username" class="custom-input" v-model="formData.username"
                            type="text" placeholder="请输入用户名" />
                    </div>
                    <div class="input-group">
                        <input id="reg_password" name="password" class="custom-input" v-model="formData.password"
                            type="password" placeholder="请设置不少于6位密码" />
                    </div>
                    <div class="input-group flex-row">
                        <input id="captcha" name="captcha" class="custom-input flex-1" v-model="formData.captcha"
                            type="text" placeholder="验证码(123456)" />
                        <span class="get-code-btn" @click="getCaptcha">获取验证码</span>
                    </div>
                </div>

                <div class="action-row">
                    <div class="remember-box" v-if="isLoginMode" @click="toggleRemember">
                        <div class="custom-radio" :class="{ active: isRemember }"></div>
                        <span class="remember-text">记住密码</span>
                    </div>
                    <div v-else></div>
                    <span class="switch-mode" @click="toggleMode">
                        {{ isLoginMode ? '没有账号？去注册' : '已有账号？去登录' }}
                    </span>
                </div>

                <button class="submit-btn" :class="canSubmit ? 'btn-active' : 'btn-disabled'" :disabled="isLoading"
                    @click="handleSubmit">
                    {{ isLoading ? '登录中...' : (isLoginMode ? '登录' : '注册') }}
                </button>
            </div>

            <div class="third-party" v-if="isLoginMode">
                <div class="icon-circle"><img src="@/assets/login/QQ.png" class="tp-icon" /></div>
                <div class="icon-circle"><img src="@/assets/login/wechat.png" class="tp-icon" /></div>
            </div>

            <div class="agreement-box" :class="{ 'shake-animation': isShaking }" @click="toggleAgree">
                <div class="custom-radio" :class="{ active: formData.agreement }"></div>
                <span class="agreement-text">
                    已阅并同意<span class="link">《用户协议》</span>和<span class="link">《隐私政策》</span>
                </span>
            </div>
        </div>

        <Toast ref="toastRef" />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { loginApi, registerApi } from '@/api/auth';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import Toast from '@/components/Toast.vue';

const router = useRouter();
const userStore = useUserStore();
const toastRef = ref<InstanceType<typeof Toast> | null>(null);

const isLoginMode = ref(true);
const isRemember = ref(false);
const isLoading = ref(false);
const isShaking = ref(false);


const formData = reactive({
    phone: '',
    password: '',
    username: '',
    captcha: '',
    agreement: false
});

onMounted(() => {
    const savedPhone = localStorage.getItem('saved_phone');
    if (savedPhone) {
        formData.phone = savedPhone;
        isRemember.value = true;
    }
});

const isPhoneValid = computed(() => /^1[3-9]\d{9}$/.test(formData.phone));
const isPasswordValid = computed(() => formData.password.length >= 6);

const canSubmit = computed(() => {
    const baseValid = isPhoneValid.value && isPasswordValid.value;
    return isLoginMode.value ? baseValid : (baseValid && formData.username.trim() !== '' && formData.captcha !== '');
});

const toggleMode = () => {
    isLoginMode.value = !isLoginMode.value;
    formData.password = '';
};

const toggleAgree = () => formData.agreement = !formData.agreement;
const toggleRemember = () => isRemember.value = !isRemember.value;
const getCaptcha = () => {
    if (toastRef.value) {
        toastRef.value.show('验证码已发送（演示环境请填写 123456）', 'success');
    }
};
const handleClose = () => {
    if (toastRef.value) {
        toastRef.value.show('点击了关闭', 'warning');
    }
};

const handleSubmit = async () => {
    if (!formData.agreement) {
        if (toastRef.value) {
            toastRef.value.show('请先勾选并同意用户协议', 'warning');
        }
        isShaking.value = true;
        setTimeout(() => isShaking.value = false, 500);
        return;
    }

    if (!isPhoneValid.value) {
        if (toastRef.value) {
            toastRef.value.show('请输入正确的11位手机号', 'error');
        }
        return;
    }
    
    if (!isPasswordValid.value) {
        if (toastRef.value) {
            toastRef.value.show('密码长度必须大于6位', 'error');
        }
        return;
    }

    isLoading.value = true;

    try {
        if (isLoginMode.value) {
            // 1. 发起登录请求
            const res = await loginApi({
                phone: formData.phone,
                password: formData.password
            });

            // 注意：根据你 axios 拦截器的写法，res 可能直接就是 token 字符串，
            // 也可能是完整的 { code: 200, msg: "...", data: "..." } 对象。
            // 兼容写法：提取真正的 token 字符串
            const tokenStr = typeof res === 'string' ? res : (res as any).data;

            // 2. 保存 Token
            userStore.setToken(tokenStr);

            // 🌟 3. 核心：解析 Token 截取用户 ID
            // tokenStr 格式假设为: "eyJhbGciOi...J9.user_2042071018258526210"
            let extractedId = '';
            if (tokenStr && tokenStr.includes('.user_')) {
                // 用 '.user_' 把字符串切成两半，取后面那一半就是 ID
                extractedId = tokenStr.split('.user_')[1];
            } else {
                // 容错处理，万一 token 格式变了
                console.warn('Token 格式不符合预期，未能提取到 ID');
            }

            // 🌟 4. 把截取到的 ID 存进 UserInfo
            userStore.setUserInfo({
                id: extractedId, // 存入真实解析出来的 ID (例如: "2042071018258526210")
                phone: formData.phone,
                username: '用户' + extractedId.slice(-4) // 暂时给个默认用户名，取 ID 后4位
            });

            // 记住手机号逻辑
            if (isRemember.value) {
                localStorage.setItem('saved_phone', formData.phone);
            } else {
                localStorage.removeItem('saved_phone');
            }

            if (toastRef.value) {
                await toastRef.value.show('登录成功', 'success');
            }
            // 强制跳转到首页，使用 replace 避免返回到登录页
            await router.replace('/home');
        } else {
            await registerApi({
                phone: formData.phone,
                password: formData.password,
                username: formData.username,
                captcha: formData.captcha,
                agreement: formData.agreement
            });
            if (toastRef.value) {
                await toastRef.value.show('注册成功，请登录', 'success');
            }
            isLoginMode.value = true;
        }
    } catch (error: any) {
        console.error('业务处理异常:', error);
        if (toastRef.value) {
            toastRef.value.show(error.message || '操作失败，请重试', 'error');
        }
    } finally {
        isLoading.value = false;
    }
};
</script>

<style scoped>
/* 原有样式保持不变 */
.login-page-wrapper {
    width: 100vw;
    min-height: 100vh;
    background: linear-gradient(180deg, #E8F7EE 0%, #F5FBF7 100%);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    overflow-x: hidden;
}

.login-content {
    width: 100%;
    max-width: 480px;
    padding: 40px 24px;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    box-sizing: border-box;
    position: relative;
}

.close-icon {
    position: absolute;
    top: 40px;
    right: 24px;
    font-size: 24px;
    color: #7D5A44;
    cursor: pointer;
}

.header {
    margin-top: 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.mascot {
    width: 120px;
    height: auto;
    margin-bottom: 12px;
}

.title {
    font-size: 22px;
    color: #7D5A44;
    font-weight: bold;
    margin-bottom: 8px;
}

.subtitle {
    font-size: 14px;
    color: #7D5A44;
    margin-bottom: 40px;
}

/* 核心修复 1: 给输入框增加相对定位和高 z-index，防止被不可见元素遮挡导致无法点击 */
.custom-input {
    width: 100%;
    height: 54px;
    background: #ffffff;
    border-radius: 14px;
    border: none;
    padding: 0 20px;
    font-size: 16px;
    box-sizing: border-box;
    margin-bottom: 16px;
    outline: none;
    position: relative;
    z-index: 10;
    color: #7D5A44;
}

.flex-row {
    display: flex;
    align-items: center;
}

.flex-1 {
    flex: 1;
    margin-bottom: 0;
}

.get-code-btn {
    color: var(--primary-green, #4fc08d);
    font-weight: 600;
    margin-left: 12px;
    cursor: pointer;
    position: relative;
    z-index: 10;
}

.action-row {
    display: flex;
    justify-content: space-between;
    margin: 10px 0 30px;
}

.remember-box {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.remember-text {
    font-size: 14px;
    color: #7D5A44;
    margin-left: 8px;
}

.switch-mode {
    color: var(--primary-green, #4fc08d);
    font-weight: 600;
    cursor: pointer;
    font-size: 14px;
}

/* 核心修复 2: 按钮基础样式不变，颜色交由下面的动态类控制 */
.submit-btn {
    width: 100%;
    height: 54px;
    color: white;
    border: none;
    border-radius: 27px;
    font-size: 18px;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(200, 230, 201, 0.3);
    transition: all 0.3s;
}

/* 按钮不满足条件时的浅绿色状态 */
.btn-disabled {
    background: #C8E6C9;
    /* 浅绿色 */
    cursor: not-allowed;
    opacity: 0.8;
}

/* 按钮满足条件后的正常绿色状态 */
.btn-active {
    background: var(--primary-green, #4fc08d);
    /* 正常主题绿 */
    cursor: pointer;
}

.btn-active:active {
    transform: scale(0.98);
    /* 增加一点点击反馈 */
}

.third-party {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin-top: 50px;
}

.icon-circle {
    width: 48px;
    height: 48px;
    background: #E8F5E9;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.tp-icon {
    width: 26px;
    height: 26px;
}

.agreement-box {
    margin-top: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 20px;
    cursor: pointer;
    transition: transform 0.1s;
    /* 为震动动画打底 */
}

.custom-radio {
    width: 18px;
    height: 18px;
    border: 2px solid #ccc;
    border-radius: 50%;
    margin-right: 8px;
}

.custom-radio.active {
    background: var(--primary-green, #4fc08d);
    border-color: var(--primary-green, #4fc08d);
}

.agreement-text {
    font-size: 13px;
    color: #999;
}

.link {
    color: #7D5A44;
    text-decoration: underline;
}

/* 核心修复 3: 定义水平晃动动画 */
.shake-animation {
    animation: shake-horizontal 0.4s cubic-bezier(.36, .07, .19, .97) both;
    color: #ff4d4f;
    /* 晃动时可以让文字稍微变红警告一下 */
}

@keyframes shake-horizontal {

    0%,
    100% {
        transform: translateX(0);
    }

    20%,
    60% {
        transform: translateX(-6px);
    }

    40%,
    80% {
        transform: translateX(6px);
    }
}
</style>