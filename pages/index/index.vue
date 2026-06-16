<template>
	<view class="page">
		<view class="hero">
			<view class="kicker">解忧抉择</view>
			<view class="title">告别纠结，一秒帮你做决定</view>
			<view class="subtitle">小事交给天意，大事留给理智。全程免登录，本地保存。</view>
		</view>

		<view class="mode-grid">
			<view class="mode-card random" @click="go('/pages/random/index')">
				<view class="mode-name">天意随机选</view>
				<view class="mode-desc">吃什么、去哪玩、二选一和多选一</view>
				<view class="mode-action">开始抽签</view>
			</view>
			<view class="mode-card rational" @click="go('/pages/rational/index')">
				<view class="mode-name">理智分析选</view>
				<view class="mode-desc">利弊清单、权重打分、理性建议</view>
				<view class="mode-action">开始分析</view>
			</view>
		</view>

		<view class="quote-box">
			<view class="section-title">今日解忧</view>
			<view class="quote">{{ quote }}</view>
			<button class="text-button" @click="refreshQuote">换一句</button>
		</view>

		<view class="quick-grid">
			<view class="quick-item" @click="go('/pages/presets/index')">热门题库</view>
			<view class="quick-item" @click="go('/pages/history/index')">历史记录</view>
			<view class="quick-item" @click="go('/pages/healing/index')">治愈专区</view>
			<view class="quick-item" @click="go('/pages/settings/index')">个人设置</view>
		</view>

		<view class="intro-mask" v-if="showIntro">
			<view class="intro-card">
				<view class="intro-title">两种方式，少一点内耗</view>
				<view class="intro-copy">“天意随机选”适合小事快速决定；“理智分析选”适合大事梳理利弊。不会索取头像、昵称或手机号。</view>
				<button class="primary-button" @click="confirmIntro">知道了</button>
			</view>
		</view>
	</view>
</template>

<script>
import store from '@/common/decision-store.js';

export default {
	data() {
		return {
			quote: store.QUOTES[0],
			showIntro: false
		};
	},
	onLoad() {
		this.refreshQuote();
		this.showIntro = !store.read(store.KEYS.introSeen, false);
	},
	methods: {
		go(url) {
			uni.navigateTo({ url });
		},
		refreshQuote() {
			this.quote = store.QUOTES[Math.floor(Math.random() * store.QUOTES.length)];
		},
		confirmIntro() {
			store.write(store.KEYS.introSeen, true);
			this.showIntro = false;
		}
	}
};
</script>

<style>
.page {
	min-height: 100vh;
	padding: 48rpx 32rpx 40rpx;
	background: #f5f2ec;
	color: #2b2a32;
	box-sizing: border-box;
}

.hero {
	padding: 20rpx 0 28rpx;
}

.kicker {
	color: #8b7e74;
	font-size: 26rpx;
}

.title {
	margin-top: 14rpx;
	font-size: 48rpx;
	font-weight: 700;
	line-height: 1.24;
}

.subtitle {
	margin-top: 16rpx;
	color: #706a64;
	font-size: 27rpx;
	line-height: 1.7;
}

.mode-grid {
	display: grid;
	grid-template-columns: 1fr;
	gap: 20rpx;
}

.mode-card {
	min-height: 214rpx;
	padding: 30rpx;
	border-radius: 8rpx;
	color: #fff;
	box-sizing: border-box;
}

.mode-card.random {
	background: #6f8f84;
}

.mode-card.rational {
	background: #7b7292;
}

.mode-name {
	font-size: 36rpx;
	font-weight: 700;
}

.mode-desc {
	margin-top: 14rpx;
	font-size: 26rpx;
	line-height: 1.5;
	opacity: 0.86;
}

.mode-action {
	margin-top: 22rpx;
	font-size: 27rpx;
	font-weight: 700;
}

.quote-box {
	margin-top: 26rpx;
	padding: 28rpx;
	border-radius: 8rpx;
	background: #fff;
}

.section-title {
	color: #8b7e74;
	font-size: 24rpx;
}

.quote {
	margin-top: 14rpx;
	font-size: 31rpx;
	line-height: 1.55;
}

.text-button,
.primary-button {
	margin: 0;
	border: 0;
	border-radius: 8rpx;
}

.text-button::after,
.primary-button::after {
	border: 0;
}

.text-button {
	margin-top: 16rpx;
	padding: 0;
	background: transparent;
	color: #6f8f84;
	font-size: 26rpx;
	text-align: left;
	line-height: 1.4;
}

.quick-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 18rpx;
	margin-top: 22rpx;
}

.quick-item {
	height: 92rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 8rpx;
	background: #e8e1d7;
	color: #3e3934;
	font-size: 28rpx;
	font-weight: 600;
}

.intro-mask {
	position: fixed;
	inset: 0;
	z-index: 20;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40rpx;
	background: rgba(43, 42, 50, 0.38);
	box-sizing: border-box;
}

.intro-card {
	width: 100%;
	padding: 36rpx;
	border-radius: 8rpx;
	background: #fff;
}

.intro-title {
	font-size: 34rpx;
	font-weight: 700;
}

.intro-copy {
	margin-top: 18rpx;
	color: #706a64;
	font-size: 27rpx;
	line-height: 1.7;
}

.primary-button {
	width: 100%;
	height: 82rpx;
	margin-top: 28rpx;
	background: #6f8f84;
	color: #fff;
	font-size: 29rpx;
}
</style>
