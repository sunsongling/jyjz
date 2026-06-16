<template>
	<view class="page">
		<view class="header">
			<view>
				<view class="title">历史记录</view>
				<view class="subtitle">所有记录只保存在本机，用来复盘自己的纠结瞬间。</view>
			</view>
			<button class="clear-button" v-if="history.length" @click="clearAll">清空</button>
		</view>

		<view class="empty" v-if="!history.length">
			<view class="empty-title">还没有记录</view>
			<view class="empty-copy">完成一次抽签或理智分析后，会自动出现在这里。</view>
		</view>

		<view class="record" v-for="item in history" :key="item.id" @click="openResult(item)">
			<view class="record-head">
				<view class="tag">{{ item.mode === 'rational' ? '理智分析' : '天意随机' }}</view>
				<view class="time">{{ item.time }}</view>
			</view>
			<view class="record-title">{{ item.title }}</view>
			<view class="record-result">{{ item.result }}</view>
			<view class="record-options">{{ formatOptions(item.options) }}</view>
			<button class="delete-button" @click.stop="deleteOne(item.id)">删除</button>
		</view>
	</view>
</template>

<script>
import store from '@/common/decision-store.js';

export default {
	data() {
		return {
			history: []
		};
	},
	onShow() {
		this.load();
	},
	methods: {
		load() {
			this.history = store.getHistory();
		},
		formatOptions(options) {
			return Array.isArray(options) ? options.filter(Boolean).join(' / ') : '';
		},
		openResult(item) {
			uni.setStorageSync(store.KEYS.latestResult, item);
			uni.navigateTo({ url: '/pages/result/index' });
		},
		deleteOne(id) {
			store.deleteHistory(id);
			this.load();
		},
		clearAll() {
			uni.showModal({
				title: '清空历史记录',
				content: '清空后无法恢复，只会影响本机缓存。',
				success: res => {
					if (!res.confirm) return;
					store.clearHistory();
					this.load();
				}
			});
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

.header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 20rpx;
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

.clear-button,
.delete-button {
	margin: 0;
	border: 0;
	border-radius: 8rpx;
}

.clear-button::after,
.delete-button::after {
	border: 0;
}

.clear-button {
	width: 126rpx;
	height: 66rpx;
	background: #ece7de;
	color: #5f5953;
	font-size: 24rpx;
}

.empty,
.record {
	margin-top: 24rpx;
	padding: 28rpx;
	border-radius: 8rpx;
	background: #fff;
}

.empty-title {
	font-size: 32rpx;
	font-weight: 700;
}

.empty-copy {
	margin-top: 12rpx;
	color: #706a64;
	font-size: 27rpx;
	line-height: 1.6;
}

.record-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.tag {
	padding: 8rpx 14rpx;
	border-radius: 8rpx;
	background: #e6eee9;
	color: #56766a;
	font-size: 23rpx;
}

.time {
	color: #8b7e74;
	font-size: 23rpx;
}

.record-title {
	margin-top: 18rpx;
	font-size: 30rpx;
	font-weight: 700;
}

.record-result {
	margin-top: 12rpx;
	color: #6f8f84;
	font-size: 38rpx;
	font-weight: 700;
}

.record-options {
	margin-top: 12rpx;
	color: #706a64;
	font-size: 25rpx;
	line-height: 1.5;
}

.delete-button {
	height: 60rpx;
	margin-top: 18rpx;
	padding: 0 24rpx;
	background: #f1e8e3;
	color: #9a645a;
	font-size: 24rpx;
}
</style>
