<template>
    <div class="publish-page">
        <!-- 顶部安全区 -->
        <div class="status-bar-placeholder"></div>

        <!-- 顶部导航 -->
        <header class="publish-header">
            <span class="cancel-btn" @click="goBack">取消</span>
            <span class="title">发布动态</span>
            <button class="submit-btn" :class="{ 'is-active': canSubmit }" @click="handleSubmit" :disabled="loading">
                {{ loading ? '发布中...' : '发布' }}
            </button>
        </header>

        <!-- 编辑内容区 -->
        <main class="publish-body">
            <!-- 文本输入区 -->
            <div class="textarea-wrapper">
                <textarea v-model="content" class="content-input" placeholder="分享你的健康生活、减脂食谱或运动心得..." maxlength="500"
                    rows="6"></textarea>
                <div class="word-count" :class="{ 'is-full': content.length >= 500 }">
                    {{ content.length }} / 500
                </div>
            </div>

            <!-- 图片上传九宫格 (UI演示) -->
            <div class="image-grid">
                <!-- 模拟已选择的图片 -->
                <div class="img-item" v-for="(img, index) in selectedImages" :key="index">
                    <img :src="img" class="uploaded-img" />
                    <span class="delete-icon" @click="removeImage(index)">✕</span>
                </div>

                <!-- 上传按钮 (最多9张) -->
                <div class="upload-btn" v-if="selectedImages.length < 9" @click="triggerUpload">
                    <span class="plus-icon">＋</span>
                </div>
            </div>

            <!-- 扩展工具栏 -->
            <div class="tools-section">
                <div class="tool-item">
                    <div class="tool-left">
                        <span class="icon hash">#</span> 参与话题
                    </div>
                    <div class="tool-right">
                        <span class="selected-topic" v-if="selectedTopic">{{ selectedTopic }}</span>
                        <span class="arrow">❯</span>
                    </div>
                </div>

                <div class="tool-item">
                    <div class="tool-left">
                        <span class="icon location">📍</span> 所在位置
                    </div>
                    <div class="tool-right">
                        <span class="arrow">❯</span>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { saveShare, uploadImage } from '@/api/community';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

// 表单状态
const content = ref('');
const selectedImages = ref<string[]>([]);
const selectedTopic = ref('');
const loading = ref(false);

// 按钮是否可点击
const canSubmit = computed(() => {
  return content.value.trim().length > 0 || selectedImages.value.length > 0;
});

// 返回上一页
const goBack = () => {
  if (content.value || selectedImages.value.length > 0) {
    // 简化处理：直接返回（实际可加 Dialog 确认）
  }
  router.back();
};

// 触发图片选择
const triggerUpload = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true;
  input.onchange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const files = target.files;
    if (!files || files.length === 0) return;

    const maxSlots = 9 - selectedImages.value.length;
    const filesToUpload = Array.from(files).slice(0, maxSlots);

    for (const file of filesToUpload) {
      try {
        const url = await uploadImage(file);
        selectedImages.value.push(url);
      } catch {
        showToast('图片上传失败，请重试');
      }
    }
  };
  input.click();
};

// 删除图片
const removeImage = (index: number) => {
  selectedImages.value.splice(index, 1);
};

// 提交发布
const handleSubmit = async () => {
  if (!canSubmit.value || loading.value) return;

  if (!userStore.userInfo?.id) {
    showToast('请先登录');
    return;
  }

  loading.value = true;
  try {
    await saveShare({
      userId: Number(userStore.userInfo.id),
      content: content.value,
      privacy: 0,
      images: selectedImages.value.length > 0 ? selectedImages.value : undefined
    });
    showToast('发布成功');
    router.back();
  } catch {
    showToast('发布失败，请重试');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.publish-page {
    position: absolute;
    /* 适配 App.vue 的深度动画体系 */
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #FFFFFF;
    /* 编辑器用纯白背景更清爽 */
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 10;
}

.status-bar-placeholder {
    height: env(safe-area-inset-top, 44px);
    background-color: #FFFFFF;
}

/* 顶部导航 */
.publish-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 44px 20px 10px 20px;
    background-color: #FFFFFF;
    border-bottom: 1px solid #F5F5F5;
}

.cancel-btn {
    font-size: 16px;
    color: #666;
    cursor: pointer;
    padding: 5px 0;
}

.title {
    font-size: 17px;
    font-weight: bold;
    color: #333;
}

.submit-btn {
    background-color: #E8F5E9;
    color: #A5D6A7;
    border: none;
    border-radius: 16px;
    padding: 6px 16px;
    font-size: 14px;
    font-weight: bold;
    transition: all 0.3s;
}

.submit-btn.is-active {
    background-color: #81C784;
    color: #FFFFFF;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(129, 199, 132, 0.4);
}

.submit-btn.is-active:active {
    transform: scale(0.95);
}

/* 主内容区 */
.publish-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
}

/* 文本输入 */
.textarea-wrapper {
    position: relative;
    margin-bottom: 20px;
}

.content-input {
    width: 100%;
    border: none;
    outline: none;
    resize: none;
    font-size: 16px;
    color: #333;
    line-height: 1.6;
    background: transparent;
    font-family: inherit;
}

.content-input::placeholder {
    color: #CCC;
}

.word-count {
    text-align: right;
    font-size: 12px;
    color: #CCC;
    margin-top: 5px;
}

.word-count.is-full {
    color: #FF5252;
}

/* 图片九宫格 */
.image-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 30px;
}

.img-item {
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 12px;
}

.uploaded-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
}

.delete-icon {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 20px;
    height: 20px;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    cursor: pointer;
}

.upload-btn {
    width: 100%;
    aspect-ratio: 1 / 1;
    background-color: #FAFAFA;
    border: 1px dashed #E0E0E0;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s;
}

.upload-btn:active {
    background-color: #F0F0F0;
}

.plus-icon {
    font-size: 32px;
    color: #CCC;
    font-weight: 300;
}

/* 工具栏 */
.tools-section {
    border-top: 1px solid #F5F5F5;
    padding-top: 10px;
}

.tool-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid #FAFAFA;
    cursor: pointer;
}

.tool-left {
    display: flex;
    align-items: center;
    font-size: 15px;
    color: #333;
}

.tool-left .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    margin-right: 10px;
    font-size: 13px;
    color: #FFF;
}

.icon.hash {
    background-color: #FFB74D;
}

.icon.location {
    background-color: #64B5F6;
    font-size: 12px;
}

.tool-right {
    display: flex;
    align-items: center;
    color: #999;
}

.selected-topic {
    font-size: 13px;
    color: #81C784;
    background: #E8F5E9;
    padding: 2px 10px;
    border-radius: 10px;
    margin-right: 8px;
}

.arrow {
    font-size: 14px;
    color: #CCC;
}
</style>