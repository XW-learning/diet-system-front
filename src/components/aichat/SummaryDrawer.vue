<template>
  <Teleport to="body">
    <div class="drawer-overlay" v-if="visible" @click.self="close">
      <div class="drawer-panel" :class="{ 'is-active': visible }">
        <div class="drawer-header">
          <h2>历史摘要</h2>
          <span class="count-badge">最近{{ summaries.length }}次</span>
          <button class="close-btn" @click="close">✕</button>
        </div>
        <div class="drawer-body">
          <div v-if="summaries.length === 0" class="empty-state">
            📋 暂无历史摘要，继续聊天吧~
          </div>
          <div v-for="s in summaries" :key="s.id" class="summary-card">
            <div class="summary-time">{{ formatTime(s.createTime) }}</div>
            <div class="summary-text">{{ s.summary }}</div>
            <div class="summary-meta">覆盖 {{ s.messageCount }} 条消息</div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { type ChatSummaryVO } from '@/api/ai';

defineProps<{
  visible: boolean;
  summaries: ChatSummaryVO[];
}>();

const emit = defineEmits<{ close: [] }>();

const close = () => emit('close');

const formatTime = (time: string) => {
  const d = new Date(time);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}
.drawer-panel {
  width: 85vw;
  max-width: 360px;
  height: 100vh;
  background: #fff;
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.1);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}
.drawer-panel.is-active {
  transform: translateX(0);
}
.drawer-header {
  display: flex;
  align-items: center;
  padding: 44px 16px 16px 16px;
  border-bottom: 1px solid #f0f0f0;
}
.drawer-header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  flex: 1;
}
.count-badge {
  font-size: 12px;
  color: #999;
  margin-right: 12px;
}
.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}
.empty-state {
  text-align: center;
  color: #999;
  padding: 60px 0;
  font-size: 15px;
}
.summary-card {
  background: #f7f8fa;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 12px;
}
.summary-time {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}
.summary-text {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
}
.summary-meta {
  font-size: 12px;
  color: #bbb;
  margin-top: 8px;
}
</style>
