<template>
    <div class="cart-overlay" @click.self="$emit('close')">
        <div class="cart-container">
            <div class="cart-header">
                <span class="title">已选运动 ({{ cart.length }})</span>
                <span class="clear-btn" @click="handleClear">🗑️ 清空</span>
            </div>

            <div class="cart-list">
                <div class="cart-item" v-for="item in cart" :key="item.exercise.id">
                    <div class="item-icon">🏃</div>

                    <div class="item-info">
                        <div class="item-name">{{ item.exercise.name }}</div>
                        <div class="item-cal">
                            消耗 {{ Math.round((item.exercise.caloriePerHalfHour / 30) * item.duration) }} 千卡
                        </div>
                    </div>

                    <div class="weight-control">
                        <div class="input-box">
                            <input type="number" :value="item.duration" @input="(e) => handleDurationInput(e, item)"
                                @blur="(e) => handleDurationBlur(e, item)" />
                            <span class="unit">分钟</span>
                        </div>
                        <div class="delete-icon" @click="$emit('remove', item.exercise.id)">✕</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface ExerciseItem { id: number; name: string; caloriePerHalfHour: number; }
interface CartItem { exercise: ExerciseItem; duration: number; }

const props = defineProps<{ cart: CartItem[] }>();
const emit = defineEmits(['close', 'update-duration', 'remove', 'clear']);

const handleDurationInput = (e: Event, item: CartItem) => {
    const val = parseInt((e.target as HTMLInputElement).value, 10);
    if (!isNaN(val) && val > 0) emit('update-duration', item.exercise.id, val);
};

const handleDurationBlur = (e: Event, item: CartItem) => {
    let val = parseInt((e.target as HTMLInputElement).value, 10);
    if (isNaN(val) || val <= 0) {
        val = 30; // 失去焦点不合法时，默认恢复30分钟
        (e.target as HTMLInputElement).value = String(val);
        emit('update-duration', item.exercise.id, val);
    }
};

const handleClear = () => {
    if (confirm('确定要清空已选运动吗？')) emit('clear');
};
</script>

<style scoped>
/* 这里的样式与 SelectedFoodCart.vue 的样式完全一致，直接把那个文件的 <style scoped> 里的内容复制过来即可 */
.cart-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 2000;
}

.cart-container {
    position: absolute;
    bottom: 105px;
    left: 15px;
    right: 15px;
    background-color: #FFFFFF;
    border-radius: 24px;
    max-height: 60vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    overflow: hidden;
}

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