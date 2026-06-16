<template>
	<view class="page">
		<view class="title">热门预设题库</view>
		<view class="subtitle">不想输入时，选一个场景直接抽；也可以载入转盘继续转。</view>

		<view class="preset-card" v-for="item in presets" :key="item.id">
			<view class="preset-head">
				<view>
					<view class="preset-name">{{ item.name }}</view>
					<view class="preset-count">{{ item.options.length }} 个候选项</view>
				</view>
				<button class="draw-button" :disabled="!!drawingId" @click="drawPreset(item)">
					{{ drawingId === item.id ? '抽签中' : '直接抽签' }}
				</button>
			</view>

			<view class="chips">
				<text class="chip" v-for="option in item.options" :key="option" @click="chooseOption(item, option)">{{ option }}</text>
			</view>

			<view class="preset-result" v-if="(current && current.id === item.id) || drawingId === item.id">
				<view class="result-label">{{ drawingId === item.id ? '抽签中...' : '本次抽到' }}</view>
				<view class="draw-strip" :class="{ active: drawingId === item.id }" v-if="drawingId === item.id">
					<view class="draw-stick" v-for="n in 5" :key="n"></view>
				</view>
				<view class="result-text" :class="{ rolling: drawingId === item.id }">
					{{ drawingId === item.id ? rollingText : current.result }}
				</view>
				<view class="result-copy" v-if="current && current.encourage">{{ current.encourage }}</view>
			</view>

			<view class="card-actions">
				<button class="secondary-button" :disabled="!!drawingId" @click="drawPreset(item)">重新抽一次</button>
				<button class="secondary-button" :disabled="!!drawingId" @click="loadWheel(item)">载入转盘</button>
			</view>
		</view>
	</view>
</template>

<script>
import store from '@/common/decision-store.js';

const ENCOURAGES = [
	'就选它吧，别让小事继续占用心力。',
	'这个结果可以先试试，行动之后再微调。',
	'天意已经给出方向，今天就轻一点。'
];

export default {
	data() {
		return {
			presets: store.PRESETS,
			current: null,
			drawingId: '',
			rollingText: '',
			drawTimer: null,
			drawTimeout: null
		};
	},
	methods: {
		clearDrawTimer() {
			if (this.drawTimer) {
				clearInterval(this.drawTimer);
				this.drawTimer = null;
			}
			if (this.drawTimeout) {
				clearTimeout(this.drawTimeout);
				this.drawTimeout = null;
			}
		},
		makeResult(item, result) {
			const encourage = ENCOURAGES[Math.floor(Math.random() * ENCOURAGES.length)];
			store.vibrateIfEnabled();
			this.current = {
				id: item.id,
				name: item.name,
				result,
				encourage
			};
			const record = store.addHistory({
				mode: 'random',
				title: `预设题库：${item.name}`,
				options: item.options.slice(),
				result,
				encourage
			});
			uni.setStorageSync(store.KEYS.latestResult, record);
		},
		drawPreset(item) {
			if (this.drawingId) return;
			const result = item.options[Math.floor(Math.random() * item.options.length)];
			this.drawingId = item.id;
			this.current = {
				id: item.id,
				name: item.name,
				result: '',
				encourage: ''
			};
			this.clearDrawTimer();
			this.rollingText = item.options[0];
			let tick = 0;
			this.drawTimer = setInterval(() => {
				this.rollingText = item.options[tick % item.options.length];
				tick++;
			}, 90);
			this.drawTimeout = setTimeout(() => {
				this.clearDrawTimer();
				this.rollingText = result;
				this.drawingId = '';
				this.makeResult(item, result);
			}, 1300);
		},
		chooseOption(item, option) {
			if (this.drawingId) return;
			this.makeResult(item, option);
		},
		loadWheel(item) {
			if (this.drawingId) return;
			uni.setStorageSync(store.KEYS.options, item.options.slice());
			uni.showToast({ title: '已载入转盘', icon: 'success' });
			setTimeout(() => {
				uni.navigateTo({ url: '/pages/game/index' });
			}, 350);
		}
	},
	onShareAppMessage() {
		return {
			title: this.current ? `我用解忧抉择抽到了：${this.current.result}` : '解忧抉择热门题库',
			path: '/pages/presets/index'
		};
	},
	onUnload() {
		this.clearDrawTimer();
		this.drawingId = '';
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

.preset-card {
	margin-top: 22rpx;
	padding: 28rpx;
	border-radius: 8rpx;
	background: #fff;
}

.preset-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 20rpx;
}

.preset-name {
	font-size: 32rpx;
	font-weight: 700;
}

.preset-count {
	margin-top: 8rpx;
	color: #8b7e74;
	font-size: 24rpx;
}

.draw-button,
.secondary-button {
	margin: 0;
	border: 0;
	border-radius: 8rpx;
}

.draw-button::after,
.secondary-button::after {
	border: 0;
}

.draw-button {
	width: 156rpx;
	height: 70rpx;
	background: #6f8f84;
	color: #fff;
	font-size: 25rpx;
}

.chips {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-top: 20rpx;
}

.chip {
	padding: 10rpx 16rpx;
	border-radius: 8rpx;
	background: #ece7de;
	color: #5f5953;
	font-size: 24rpx;
}

.preset-result {
	margin-top: 22rpx;
	padding: 22rpx;
	border-radius: 8rpx;
	background: #f5f2ec;
}

.draw-strip {
	display: flex;
	justify-content: center;
	gap: 12rpx;
	height: 58rpx;
	margin-top: 14rpx;
}

.draw-stick {
	width: 18rpx;
	height: 54rpx;
	border-radius: 999rpx;
	background: linear-gradient(180deg, #e6c984, #9a645a);
	opacity: 0.72;
	transform-origin: bottom center;
}

.draw-strip.active .draw-stick {
	animation: drawStick 0.62s ease-in-out infinite;
}

.draw-strip.active .draw-stick:nth-child(2) {
	animation-delay: 0.08s;
}

.draw-strip.active .draw-stick:nth-child(3) {
	animation-delay: 0.16s;
}

.draw-strip.active .draw-stick:nth-child(4) {
	animation-delay: 0.24s;
}

.draw-strip.active .draw-stick:nth-child(5) {
	animation-delay: 0.32s;
}

.result-label {
	color: #8b7e74;
	font-size: 24rpx;
}

.result-text {
	margin-top: 8rpx;
	color: #6f8f84;
	font-size: 40rpx;
	font-weight: 700;
}

.result-text.rolling {
	animation: drawPulse 0.36s ease-in-out infinite alternate;
}

@keyframes drawPulse {
	from {
		transform: scale(0.96);
		opacity: 0.62;
	}
	to {
		transform: scale(1.04);
		opacity: 1;
	}
}

@keyframes drawStick {
	0%,
	100% {
		transform: translateY(6rpx) rotate(-5deg);
		opacity: 0.55;
	}
	50% {
		transform: translateY(-8rpx) rotate(5deg);
		opacity: 1;
	}
}

.result-copy {
	margin-top: 10rpx;
	color: #706a64;
	font-size: 26rpx;
	line-height: 1.55;
}

.card-actions {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 16rpx;
	margin-top: 22rpx;
}

.secondary-button {
	height: 74rpx;
	background: #ece7de;
	color: #3e3934;
	font-size: 26rpx;
}

.draw-button[disabled],
.secondary-button[disabled] {
	opacity: 0.55;
}
</style>
