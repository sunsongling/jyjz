<template>
	<view class="page">
		<view class="brand">解忧抉择</view>
		<view class="title">告别纠结，一秒帮你做决定</view>
		<view class="copy">小事交给天意随机，大事交给理智分析。无需登录，不索取头像、昵称或手机号。</view>

		<view class="mode">
			<view class="mode-title">天意随机选</view>
			<view class="mode-copy">适合吃什么、去哪玩、买哪件、二选一和多选一。</view>
		</view>
		<view class="mode">
			<view class="mode-title">理智分析选</view>
			<view class="mode-copy">适合换工作、搬家、关系选择等需要慢慢想的事。</view>
		</view>

		<button class="primary-button" @click="start">开始解忧</button>
	</view>
</template>

<script>
import store from '@/common/decision-store.js';

export default {
	onLoad() {
		if (store.read(store.KEYS.introSeen, false)) {
			uni.reLaunch({ url: '/pages/index/index' });
		}
	},
	methods: {
		start() {
			store.write(store.KEYS.introSeen, true);
			uni.reLaunch({ url: '/pages/index/index' });
		}
	}
};
</script>

<style>
.page {
	min-height: 100vh;
	padding: 90rpx 42rpx 54rpx;
	background: #f5f2ec;
	color: #2d2a31;
	box-sizing: border-box;
}

.brand {
	color: #8b7e74;
	font-size: 28rpx;
}

.title {
	margin-top: 24rpx;
	font-size: 54rpx;
	font-weight: 700;
	line-height: 1.25;
}

.copy {
	margin-top: 22rpx;
	color: #706a64;
	font-size: 29rpx;
	line-height: 1.75;
}

.mode {
	margin-top: 28rpx;
	padding: 30rpx;
	border-radius: 8rpx;
	background: #fff;
}

.mode-title {
	font-size: 33rpx;
	font-weight: 700;
}

.mode-copy {
	margin-top: 12rpx;
	color: #706a64;
	font-size: 27rpx;
	line-height: 1.6;
}

.primary-button {
	width: 100%;
	height: 88rpx;
	margin-top: 42rpx;
	border: 0;
	border-radius: 8rpx;
	background: #6f8f84;
	color: #fff;
	font-size: 30rpx;
}

.primary-button::after {
	border: 0;
}
</style>
