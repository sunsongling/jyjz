<template>
	<view class="page">
		<view class="header">
			<view class="title">天意随机选</view>
			<view class="subtitle">小事纠结时，用抽签或转盘快速定下来。</view>
		</view>

		<view class="mode-tabs">
			<view class="mode-tab" :class="{ active: activeMode === 'draw' }" @click="activeMode = 'draw'">抽签</view>
			<view class="mode-tab" :class="{ active: activeMode === 'wheel' }" @click="activeMode = 'wheel'">转盘</view>
		</view>

		<view class="panel" v-if="activeMode === 'draw'">
			<view class="panel-title">抽签选项</view>
			<view class="panel-desc">可指定 2-10 个候选项，点击抽签后随机抽出一个。</view>

			<view class="option-row" v-for="(item, index) in drawOptions" :key="index">
				<input class="input" v-model="drawOptions[index]" maxlength="12" :placeholder="'选项 ' + (index + 1)" />
				<button class="remove-button" :disabled="drawOptions.length <= drawMin" @click="removeDrawOption(index)">删</button>
			</view>

			<view class="actions">
				<button class="secondary-button" :disabled="drawOptions.length >= drawMax" @click="addDrawOption">添加选项</button>
				<button class="secondary-button" @click="resetDrawOptions">重置默认</button>
			</view>

			<view class="trigger-row">
				<view class="trigger" :class="{ active: drawTrigger === 'tap' }" @click="drawTrigger = 'tap'">点击抽签</view>
				<view class="trigger" :class="{ active: drawTrigger === 'shake' }" @click="drawTrigger = 'shake'">摇一摇</view>
			</view>

			<view class="draw-stage" v-if="drawing || rollingText">
				<view class="stage-label">{{ drawing ? '抽签中...' : '上一次停在' }}</view>
				<view class="draw-strip" :class="{ active: drawing }">
					<view class="draw-stick" v-for="n in 5" :key="n"></view>
				</view>
				<view class="rolling-text" :class="{ rolling: drawing }">{{ rollingText }}</view>
			</view>

			<button class="primary-button" :disabled="drawing" @click="drawFromOptions">
				{{ drawing ? '正在抽签' : (drawTrigger === 'shake' ? '模拟摇一摇抽签' : '抽一签') }}
			</button>
			<view class="shake-tip" v-if="drawTrigger === 'shake'">真机进入本页后摇一摇也会触发抽签。</view>
		</view>

		<view class="panel" v-if="activeMode === 'wheel'">
			<view class="panel-title">自定义多选转盘</view>
			<view class="panel-desc">转盘支持 3-10 个选项，选项数量变化时背景会自动等分。</view>

			<view class="chips">
				<text class="chip" v-for="item in wheelOptions" :key="item">{{ item }}</text>
			</view>

			<button class="primary-button" @click="go('/pages/game/index')">打开转盘</button>
			<button class="secondary-button full" @click="go('/pages/game-settings/index')">设置转盘选项</button>
		</view>

		<view class="result-box" v-if="result">
			<view class="result-label">这次天意选择</view>
			<view class="result-text">{{ result }}</view>
			<view class="encourage">{{ encourage }}</view>
			<view class="result-actions">
				<button class="secondary-button" :disabled="drawing" @click="drawFromOptions">重新抽签</button>
				<button class="secondary-button" open-type="share">分享结果</button>
			</view>
		</view>

		<view class="nav-grid">
			<view class="nav-card" @click="go('/pages/presets/index')">
				<view class="nav-title">热门预设题库</view>
				<view class="nav-desc">干饭、出行、娱乐、职场、穿搭，一键开抽。</view>
			</view>
			<view class="nav-card" @click="go('/pages/history/index')">
				<view class="nav-title">历史记录</view>
				<view class="nav-desc">回看过去的纠结点和最终选择。</view>
			</view>
		</view>
	</view>
</template>

<script>
import store from '@/common/decision-store.js';

const DRAW_OPTIONS_KEY = 'jy_draw_options';
const WHEEL_OPTIONS_KEY = 'decision_card_options';
const DEFAULT_DRAW_OPTIONS = ['外卖', '做饭', '出门走走', '在家休息'];
const DEFAULT_WHEEL_OPTIONS = ['现在就做', '再想 10 分钟', '问问同事', '先休息一下', '写下利弊', '换个方案'];
const ENCOURAGES = [
	'就先这样定下吧，行动会带来新的答案。',
	'别担心，选择本身也是一种前进。',
	'给这个结果一个机会，也给自己少一点压力。'
];

export default {
	data() {
		return {
			activeMode: 'draw',
			drawOptions: DEFAULT_DRAW_OPTIONS.slice(),
			wheelOptions: DEFAULT_WHEEL_OPTIONS.slice(),
			drawMin: 2,
			drawMax: 10,
			drawTrigger: 'tap',
			lastShakeTime: 0,
			accelerometerStarted: false,
			drawing: false,
			rollingText: '',
			drawTimer: null,
			drawTimeout: null,
			result: '',
			encourage: ''
		};
	},
	onShow() {
		this.loadLocalOptions();
		this.startAccelerometer();
	},
	onHide() {
		this.stopAccelerometer();
		this.clearDrawTimer();
		if (this.drawing) {
			this.rollingText = '';
			this.drawing = false;
		}
	},
	onUnload() {
		this.stopAccelerometer();
		this.clearDrawTimer();
	},
	methods: {
		go(url) {
			uni.navigateTo({ url });
		},
		loadLocalOptions() {
			const savedDraw = uni.getStorageSync(DRAW_OPTIONS_KEY);
			const savedWheel = uni.getStorageSync(WHEEL_OPTIONS_KEY);
			if (Array.isArray(savedDraw) && savedDraw.length >= this.drawMin) {
				this.drawOptions = savedDraw.slice(0, this.drawMax);
			}
			if (Array.isArray(savedWheel) && savedWheel.length >= 3) {
				this.wheelOptions = savedWheel.slice(0, 10);
			}
		},
		normalizeDrawOptions() {
			return this.drawOptions.map(item => String(item || '').trim()).filter(Boolean).slice(0, this.drawMax);
		},
		addDrawOption() {
			if (this.drawOptions.length >= this.drawMax) {
				uni.showToast({ title: '最多 10 个选项', icon: 'none' });
				return;
			}
			this.drawOptions.push('');
		},
		removeDrawOption(index) {
			if (this.drawOptions.length <= this.drawMin) {
				uni.showToast({ title: '至少保留 2 个选项', icon: 'none' });
				return;
			}
			this.drawOptions.splice(index, 1);
		},
		resetDrawOptions() {
			this.drawOptions = DEFAULT_DRAW_OPTIONS.slice();
		},
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
		drawFromOptions() {
			if (this.drawing) return;
			const options = this.normalizeDrawOptions();
			if (options.length < this.drawMin) {
				uni.showToast({ title: '请至少填写两个选项', icon: 'none' });
				return;
			}
			this.drawOptions = options;
			uni.setStorageSync(DRAW_OPTIONS_KEY, options);
			const index = Math.floor(Math.random() * options.length);
			const finalResult = options[index];
			this.result = '';
			this.encourage = '';
			this.drawing = true;
			this.clearDrawTimer();
			this.rollingText = options[0];
			let tick = 0;
			this.drawTimer = setInterval(() => {
				this.rollingText = options[tick % options.length];
				tick++;
			}, 90);
			this.drawTimeout = setTimeout(() => {
				this.clearDrawTimer();
				this.rollingText = finalResult;
				this.result = finalResult;
				this.encourage = ENCOURAGES[Math.floor(Math.random() * ENCOURAGES.length)];
				this.drawing = false;
				store.vibrateIfEnabled();
				const record = store.addHistory({
					mode: 'random',
					title: '自定义抽签',
					options,
					result: this.result,
					encourage: this.encourage
				});
				uni.setStorageSync(store.KEYS.latestResult, record);
			}, 1300);
		},
		startAccelerometer() {
			if (this.accelerometerStarted) return;
			if (!uni.onAccelerometerChange || !uni.startAccelerometer) return;
			this.accelerometerStarted = true;
			uni.startAccelerometer({ interval: 'normal' });
			uni.onAccelerometerChange(this.handleAccelerometer);
		},
		stopAccelerometer() {
			if (!this.accelerometerStarted) return;
			if (uni.offAccelerometerChange) {
				uni.offAccelerometerChange(this.handleAccelerometer);
			}
			if (uni.stopAccelerometer) {
				uni.stopAccelerometer();
			}
			this.accelerometerStarted = false;
		},
		handleAccelerometer(res) {
			if (this.activeMode !== 'draw' || this.drawTrigger !== 'shake') return;
			const strength = Math.abs(res.x) + Math.abs(res.y) + Math.abs(res.z);
			const now = Date.now();
			if (strength < 2.7 || now - this.lastShakeTime < 1200) return;
			this.lastShakeTime = now;
			this.drawFromOptions();
		}
	},
	onShareAppMessage() {
		return {
			title: this.result ? `我用解忧抉择抽到了：${this.result}` : '解忧抉择，告别纠结',
			path: '/pages/index/index'
		};
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

.subtitle,
.panel-desc {
	margin-top: 14rpx;
	color: #706a64;
	font-size: 27rpx;
	line-height: 1.6;
}

.mode-tabs {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 14rpx;
	margin-top: 26rpx;
}

.mode-tab {
	height: 78rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 8rpx;
	background: #e8e1d7;
	color: #4d4742;
	font-size: 28rpx;
	font-weight: 700;
}

.mode-tab.active {
	background: #6f8f84;
	color: #fff;
}

.panel,
.result-box,
.nav-card {
	margin-top: 24rpx;
	padding: 28rpx;
	border-radius: 8rpx;
	background: #fff;
}

.panel-title,
.nav-title {
	font-size: 31rpx;
	font-weight: 700;
}

.option-row {
	display: flex;
	align-items: center;
	gap: 16rpx;
	margin-top: 16rpx;
}

.input {
	flex: 1;
	height: 82rpx;
	padding: 0 22rpx;
	border: 1rpx solid #ded8cf;
	border-radius: 8rpx;
	background: #fbfaf8;
	font-size: 29rpx;
	box-sizing: border-box;
}

.remove-button,
.primary-button,
.secondary-button {
	margin: 0;
	border: 0;
	border-radius: 8rpx;
}

.remove-button::after,
.primary-button::after,
.secondary-button::after {
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

.actions,
.trigger-row,
.result-actions,
.nav-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 16rpx;
	margin-top: 18rpx;
}

.trigger {
	height: 70rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 8rpx;
	background: #ece7de;
	color: #5f5953;
	font-size: 26rpx;
}

.trigger.active {
	background: #7b7292;
	color: #fff;
}

.draw-stage {
	margin-top: 20rpx;
	padding: 26rpx;
	border-radius: 8rpx;
	background: #f5f2ec;
	text-align: center;
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

.stage-label {
	color: #8b7e74;
	font-size: 24rpx;
}

.rolling-text {
	margin-top: 10rpx;
	color: #6f8f84;
	font-size: 42rpx;
	font-weight: 700;
	line-height: 1.25;
}

.rolling-text.rolling {
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

.primary-button {
	width: 100%;
	height: 84rpx;
	margin-top: 22rpx;
	background: #6f8f84;
	color: #fff;
	font-size: 30rpx;
}

.secondary-button {
	height: 76rpx;
	background: #ece7de;
	color: #3e3934;
	font-size: 26rpx;
}

.primary-button[disabled],
.secondary-button[disabled] {
	opacity: 0.55;
}

.secondary-button.full {
	width: 100%;
	margin-top: 16rpx;
}

.shake-tip {
	margin-top: 14rpx;
	color: #8b7e74;
	font-size: 24rpx;
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

.result-label {
	color: #8b7e74;
	font-size: 24rpx;
}

.result-text {
	margin-top: 10rpx;
	font-size: 42rpx;
	font-weight: 700;
	color: #6f8f84;
}

.encourage,
.nav-desc {
	margin-top: 12rpx;
	color: #706a64;
	font-size: 26rpx;
	line-height: 1.55;
}
</style>
