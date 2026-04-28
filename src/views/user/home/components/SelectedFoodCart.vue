<template>
    <div class="cart-component-wrapper">

        <transition name="fade">
            <div class="cart-overlay" v-if="visible" @click.self="$emit('close')"></div>
        </transition>

        <transition name="slide-up">
            <div class="cart-container" v-if="visible">
                <div class="cart-header">
                    <span class="title">已选食物 ({{ cart.length }})</span>
                    <span class="clear-btn" @click="handleClear">
                        🗑️ 清空
                    </span>
                </div>

                <div class="cart-list">
                    <div class="cart-item" v-for="item in cart" :key="item.dish.id">
                        <div class="item-icon">🍲</div>
                        <div class="item-info">
                            <div class="item-name">{{ item.dish.name }}</div>
                            <div class="item-cal">
                                {{ Math.round((item.dish.calorie * item.weight) / item.dish.refWeight) }} 千卡
                            </div>
                        </div>
                        <div class="weight-control">
                            <div class="input-box">
                                <input type="number" :value="item.weight" @input="(e) => handleWeightInput(e, item)"
                                    @blur="(e) => handleWeightBlur(e, item)" />
                                <span class="unit">克</span>
                            </div>
                            <div class="delete-icon" @click="$emit('remove', item.dish.id)">
                                ✕
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import type { DishVO } from '@/types/dish';

interface CartItem {
    dish: DishVO;
    weight: number;
}

const props = defineProps<{
    visible: boolean; // 新增：接收父组件的状态来控制动画
    cart: CartItem[]
}>();

const emit = defineEmits(['close', 'update-weight', 'remove', 'clear']);

const handleWeightInput = (e: Event, item: CartItem) => {
    const target = e.target as HTMLInputElement;
    let val = parseInt(target.value, 10);
    if (!isNaN(val) && val > 0) {
        emit('update-weight', item.dish.id, val);
    }
};

const handleWeightBlur = (e: Event, item: CartItem) => {
    const target = e.target as HTMLInputElement;
    let val = parseInt(target.value, 10);
    if (isNaN(val) || val <= 0) {
        val = item.dish.refWeight || 100;
        target.value = String(val);
        emit('update-weight', item.dish.id, val);
    }
};

const handleClear = () => {
    if (confirm('确定要清空已选食物吗？')) {
        emit('clear');
    }
};
</script>

<style scoped>
/* 半透明背景遮罩 */
.cart-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 1999;
    /* 低于底部导航栏 (2001) */
}

/* 购物车面板 */
.cart-container {
    position: absolute;
    bottom: 105px;
    /* 紧贴在底栏上方 */
    left: 15px;
    right: 15px;
    background-color: #FFFFFF;
    border-radius: 24px;
    max-height: 60vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    z-index: 2000;
    /* 低于底部导航栏 (2001)，使得收起时能“藏到”底栏后面 */
    transform-origin: bottom center;
    /* 动画变换的基点设在底部 */
}

/* ================= 动画特效区域 ================= */

/* 1. 遮罩层淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* 2. 列表从下往上弹出/缩回的动画 */
.slide-up-enter-active,
.slide-up-leave-active {
    /* 使用贝塞尔曲线让动画更 Q 弹灵动 */
    transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-up-leave-active {
    /* 收回时稍微快一点，不拖泥带水 */
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
    opacity: 0;
    /* Y轴下移 60px 并且稍微缩小，刚好“藏”进底部的 bottom-cart-bar-v2 里面 */
    transform: translateY(60px) scale(0.85);
}

/* ================= 内部 UI 样式（保持不变） ================= */
.cart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 20px;
    background-color: #FAFAFA;
    border-bottom: 1px solid #F0F0F0;
}

.cart-header .title {
    font-size: 15px;
    font-weight: bold;
    color: #333;
}

.clear-btn {
    font-size: 13px;
    color: #999;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
}

.cart-list {
    padding: 10px 20px 20px;
    overflow-y: auto;
    flex: 1;
}

.cart-item {
    display: flex;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid #F5F5F5;
}

.cart-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
}

.item-icon {
    width: 44px;
    height: 44px;
    background: #F5F5F5;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    margin-right: 12px;
}

.item-info {
    flex: 1;
}

.item-name {
    font-size: 15px;
    font-weight: bold;
    color: #333;
    margin-bottom: 4px;
}

.item-cal {
    font-size: 13px;
    color: #E53935;
    font-weight: bold;
}

.weight-control {
    display: flex;
    align-items: center;
    gap: 12px;
}

.input-box {
    display: flex;
    align-items: center;
    background: #F8F8F8;
    border-radius: 8px;
    padding: 4px 8px;
    border: 1px solid #EAEAEA;
    transition: border-color 0.3s;
}

.input-box:focus-within {
    border-color: #66BB6A;
    background: #FFFFFF;
}

.input-box input {
    width: 40px;
    border: none;
    background: transparent;
    outline: none;
    text-align: center;
    font-size: 15px;
    font-weight: bold;
    color: #333;
    -moz-appearance: textfield;
}

.input-box input::-webkit-outer-spin-button,
.input-box input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.input-box .unit {
    font-size: 12px;
    color: #666;
    margin-left: 2px;
}

.delete-icon {
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 12px;
    background: #F5F5F5;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s;
}

.delete-icon:hover {
    background: #FFEBEE;
    color: #E53935;
}
</style>