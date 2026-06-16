<template>
	<view class="page">
		<view class="header">
			<view class="title">转盘选项设置</view>
			<view class="subtitle">添加或删除选项后，转盘背景会按数量重新等分。</view>
		</view>

		<view class="summary">
			<view class="summary-number">{{ options.length }}</view>
			<view class="summary-text">当前选项数</view>
		</view>

		<view class="option-list">
			<view class="option-row" v-for="(item, index) in options" :key="index">
				<input class="option-input" v-model="options[index]" maxlength="12" :placeholder="'选项 ' + (index + 1)" />
				<button class="remove-button" :disabled="options.length <= minOptions" @click="removeOption(index)">删</button>
			</view>
		</view>

		<view class="actions">
			<button class="secondary-button" :disabled="options.length >= maxOptions" @click="addOption">添加选项</button>
			<button class="secondary-button" @click="resetOptions">重置默认</button>
		</view>

		<button class="primary-button" @click="saveOptions">保存并返回转盘</button>
	</view>
</template>

<script>
const STORAGE_KEY = "decision_card_options";
const DEFAULT_OPTIONS = ["现在就做", "再想 10 分钟", "问问同事", "先休息一下", "写下利弊", "换个方案"];

export default {
	data() {
		return {
			minOptions: 3,
			maxOptions: 10,
			options: DEFAULT_OPTIONS.slice()
		};
	},
	onLoad() {
		const saved = uni.getStorageSync(STORAGE_KEY);
		if (Array.isArray(saved) && saved.length >= this.minOptions) {
			this.options = saved.slice(0, this.maxOptions);
		}
	},
	methods: {
		normalizeOptions() {
			return this.options
				.map(item => String(item || "").trim())
				.filter(Boolean)
				.slice(0, this.maxOptions);
		},
		addOption() {
			if (this.options.length >= this.maxOptions) {
				uni.showToast({ title: "最多 10 个选项", icon: "none" });
				return;
			}
			this.options.push("");
		},
		removeOption(index) {
			if (this.options.length <= this.minOptions) {
				uni.showToast({ title: "至少保留 3 个选项", icon: "none" });
				return;
			}
			this.options.splice(index, 1);
		},
		resetOptions() {
			this.options = DEFAULT_OPTIONS.slice();
		},
		saveOptions() {
			const next = this.normalizeOptions();
			if (next.length < this.minOptions) {
				uni.showToast({ title: "请至少填写 3 个有效选项", icon: "none" });
				return;
			}
			this.options = next;
			uni.setStorageSync(STORAGE_KEY, next);
			uni.showToast({ title: "已保存", icon: "success" });
			setTimeout(() => {
				uni.navigateBack();
			}, 350);
		}
	}
};
</script>

<style>
.page {
	min-height: 100vh;
	padding: 42rpx 32rpx;
	background: #f5f2ec;
	color: #2d2a31;
	box-sizing: border-box;
}

.title {
	font-size: 44rpx;
	font-weight: 700;
}

.subtitle {
	margin-top: 14rpx;
	color: #706a64;
	font-size: 27rpx;
	line-height: 1.6;
}

.summary {
	display: flex;
	align-items: center;
	gap: 20rpx;
	margin-top: 24rpx;
	padding: 28rpx;
	border-radius: 8rpx;
	background: #fff;
}

.summary-number {
	width: 78rpx;
	height: 78rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 8rpx;
	background: #6f8f84;
	color: #fff;
	font-size: 36rpx;
	font-weight: 700;
}

.summary-text {
	color: #706a64;
	font-size: 27rpx;
}

.option-list {
	margin-top: 20rpx;
}

.option-row {
	display: flex;
	align-items: center;
	gap: 16rpx;
	margin-bottom: 16rpx;
}

.option-input {
	flex: 1;
	height: 82rpx;
	padding: 0 22rpx;
	border: 1rpx solid #ded8cf;
	border-radius: 8rpx;
	background: #fff;
	color: #201c31;
	font-size: 28rpx;
	box-sizing: border-box;
}

.remove-button,
.secondary-button,
.primary-button {
	margin: 0;
	border: 0;
	border-radius: 8rpx;
}

.remove-button::after,
.secondary-button::after,
.primary-button::after {
	border: 0;
}

.remove-button {
	width: 84rpx;
	height: 82rpx;
	background: #f1e8e3;
	color: #9a645a;
	font-size: 26rpx;
}

.remove-button[disabled],
.secondary-button[disabled] {
	opacity: 0.45;
}

.actions {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 16rpx;
	margin-top: 8rpx;
}

.secondary-button {
	height: 78rpx;
	background: #ece7de;
	color: #3e3934;
	font-size: 26rpx;
}

.primary-button {
	width: 100%;
	height: 86rpx;
	margin-top: 26rpx;
	background: #6f8f84;
	color: #fff;
	font-size: 30rpx;
}
</style>
