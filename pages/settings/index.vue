<template>
	<view class="page">
		<view class="title">个人设置</view>
		<view class="subtitle">不需要登录，不获取头像、昵称、手机号。所有内容都在本机。</view>

		<view class="panel">
			<view class="setting-row">
				<view>
					<view class="setting-name">抽签音效</view>
					<view class="setting-desc">预留音效开关，后续接入音频素材后生效。</view>
				</view>
				<switch :checked="settings.sound" @change="changeSwitch('sound', $event)" color="#6f8f84" />
			</view>
			<view class="setting-row">
				<view>
					<view class="setting-name">振动反馈</view>
					<view class="setting-desc">抽签或摇一摇时给一点轻反馈。</view>
				</view>
				<switch :checked="settings.vibrate" @change="changeSwitch('vibrate', $event)" color="#6f8f84" />
			</view>
		</view>

		<view class="panel">
			<view class="section-title">关于解忧抉择</view>
			<view class="about">解忧抉择是一款轻量决策工具：小事用随机选择减少内耗，大事用利弊分析帮助梳理。它不会强迫你做决定，只把犹豫摊开给你看。</view>
		</view>

		<view class="panel">
			<view class="section-title">反馈入口</view>
			<textarea class="textarea" v-model="feedback" maxlength="160" placeholder="写下你希望改进的地方，本版本仅保存在本机"></textarea>
			<button class="save-button" @click="saveFeedback">保存反馈</button>
		</view>

		<button class="danger-button" @click="clearLocal">清除本地缓存</button>
	</view>
</template>

<script>
import store from '@/common/decision-store.js';

export default {
	data() {
		return {
			settings: store.getSettings(),
			feedback: store.getFeedback()
		};
	},
	onShow() {
		this.settings = store.getSettings();
		this.feedback = store.getFeedback();
	},
	methods: {
		changeSwitch(key, event) {
			this.settings[key] = event.detail.value;
			store.saveSettings(this.settings);
		},
		saveFeedback() {
			if (!this.feedback.trim()) {
				uni.showToast({ title: '先写一点反馈吧', icon: 'none' });
				return;
			}
			store.saveFeedback(this.feedback);
			uni.showToast({ title: '已保存', icon: 'success' });
		},
		clearLocal() {
			uni.showModal({
				title: '清除本地缓存',
				content: '将清空历史记录、树洞笔记和转盘选项，不会影响小程序本身。',
				success: res => {
					if (!res.confirm) return;
					store.clearAllLocalData();
					uni.showToast({ title: '已清除', icon: 'success' });
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

.panel {
	margin-top: 24rpx;
	padding: 28rpx;
	border-radius: 8rpx;
	background: #fff;
}

.setting-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 24rpx;
	padding: 18rpx 0;
}

.setting-row + .setting-row {
	border-top: 1rpx solid #eee9e1;
}

.setting-name,
.section-title {
	font-size: 31rpx;
	font-weight: 700;
}

.setting-desc,
.about {
	margin-top: 10rpx;
	color: #706a64;
	font-size: 26rpx;
	line-height: 1.55;
}

.textarea {
	width: 100%;
	height: 150rpx;
	margin-top: 18rpx;
	padding: 18rpx;
	border: 1rpx solid #ded8cf;
	border-radius: 8rpx;
	background: #fbfaf8;
	font-size: 28rpx;
	box-sizing: border-box;
}

.save-button,
.danger-button {
	width: 100%;
	height: 84rpx;
	margin-top: 28rpx;
	border: 0;
	border-radius: 8rpx;
	color: #fff;
	font-size: 29rpx;
}

.save-button {
	background: #6f8f84;
}

.danger-button {
	background: #9a645a;
}

.save-button::after,
.danger-button::after {
	border: 0;
}
</style>
