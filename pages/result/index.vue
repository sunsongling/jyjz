<template>
	<view class="page">
		<view class="card" v-if="record">
			<view class="label">{{ record.mode === 'rational' ? '理性参考结果' : '最终选择结果' }}</view>
			<view class="result">{{ record.result }}</view>
			<view class="encourage">{{ record.encourage || '选择已经完成，接下来把注意力交给行动。' }}</view>

			<view class="meta">
				<view>时间：{{ record.time }}</view>
				<view>来源：{{ record.title }}</view>
				<view v-if="record.options && record.options.length">选项：{{ record.options.join(' / ') }}</view>
			</view>

			<view class="actions">
				<button class="secondary-button" @click="again">重新选择</button>
				<button class="primary-button" open-type="share">分享结果</button>
			</view>
		</view>

		<view class="card" v-else>
			<view class="label">暂无结果</view>
			<view class="encourage">先完成一次抽签或分析，再回来查看结果。</view>
			<button class="primary-button single" @click="goHome">回到首页</button>
		</view>
	</view>
</template>

<script>
import store from '@/common/decision-store.js';

export default {
	data() {
		return {
			record: null
		};
	},
	onShow() {
		this.record = uni.getStorageSync(store.KEYS.latestResult) || null;
	},
	methods: {
		again() {
			if (this.record && this.record.mode === 'rational') {
				uni.navigateTo({ url: '/pages/rational/index' });
				return;
			}
			uni.navigateTo({ url: '/pages/random/index' });
		},
		goHome() {
			uni.reLaunch({ url: '/pages/index/index' });
		}
	},
	onShareAppMessage() {
		return {
			title: this.record ? `我用解忧抉择得到：${this.record.result}` : '解忧抉择，告别纠结',
			path: '/pages/index/index'
		};
	}
};
</script>

<style>
.page {
	min-height: 100vh;
	display: flex;
	align-items: center;
	padding: 42rpx 32rpx;
	background: #f5f2ec;
	color: #2d2a31;
	box-sizing: border-box;
}

.card {
	width: 100%;
	padding: 40rpx 32rpx;
	border-radius: 8rpx;
	background: #fff;
	box-sizing: border-box;
}

.label {
	color: #8b7e74;
	font-size: 26rpx;
}

.result {
	margin-top: 18rpx;
	color: #6f8f84;
	font-size: 54rpx;
	font-weight: 700;
	line-height: 1.25;
}

.encourage {
	margin-top: 18rpx;
	color: #4d4742;
	font-size: 29rpx;
	line-height: 1.65;
}

.meta {
	margin-top: 26rpx;
	padding: 20rpx;
	border-radius: 8rpx;
	background: #f5f2ec;
	color: #706a64;
	font-size: 25rpx;
	line-height: 1.7;
}

.actions {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 16rpx;
	margin-top: 28rpx;
}

.primary-button,
.secondary-button {
	height: 82rpx;
	border: 0;
	border-radius: 8rpx;
	font-size: 28rpx;
}

.primary-button::after,
.secondary-button::after {
	border: 0;
}

.primary-button {
	background: #6f8f84;
	color: #fff;
}

.primary-button.single {
	width: 100%;
	margin-top: 28rpx;
}

.secondary-button {
	background: #ece7de;
	color: #3e3934;
}
</style>
