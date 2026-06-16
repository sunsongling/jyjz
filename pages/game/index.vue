<template>
	<view class="decision-page">
		<view class="fallback-stage">
			<view class="fallback-wheel-wrap">
				<view class="wheel-disc">
					<canvas
						canvas-id="wheelCanvas"
						id="wheelCanvas"
						class="wheel-canvas"
						:width="canvasSize"
						:height="canvasSize"
						:style="wheelCanvasStyle"
						@tap="spinFallback"
					></canvas>
				</view>
			</view>
		</view>

		<view class="top-panel">
			<view>
				<view class="app-title">迷茫抽卡</view>
				<view class="app-subtitle">把选项交给转盘，先迈出一步</view>
			</view>
			<button class="icon-button" @click="openSettings">设置</button>
		</view>

		<view class="bottom-panel">
			<view class="result-card" v-if="currentResult">
				<view class="result-label">这次抽到</view>
				<view class="result-text">{{ currentResult }}</view>
			</view>
			<view class="hint-card" v-else>
				<view class="hint-title">点击中间宝石开始抽卡</view>
				<view class="hint-text">当前共有 {{ options.length }} 个选项，可随时调整。</view>
			</view>
			<view class="option-panel">
				<view class="option-header">
					<text>当前选项</text>
					<text>{{ options.length }}/{{ maxOptions }}</text>
				</view>
				<view class="option-list">
					<view class="option-chip" v-for="(item, index) in options" :key="index">
						<text class="option-index">{{ index + 1 }}</text>
						<text class="option-name">{{ item }}</text>
					</view>
				</view>
			</view>
		</view>

	</view>
</template>

<script>
import store from "@/common/decision-store.js";

const STORAGE_KEY = "decision_card_options";
const HISTORY_KEY = "decision_card_history";
const DEFAULT_OPTIONS = ["现在就做", "再想 10 分钟", "问问同事", "先休息一下", "写下利弊", "换个方案"];
const ENCOURAGES = ["答案已经出现，先给它一个机会。", "别急着怀疑，行动会带来新的线索。", "就从这一步开始，后面会慢慢清楚。"];
const WHEEL_COLORS = ["#ff4d6d", "#ff922b", "#ffd43b", "#69db7c", "#20c997", "#22b8cf", "#4dabf7", "#748ffc", "#b197fc", "#f06595"];
const WHEEL_RPX_SIZE = 620;

export default {
	data() {
		return {
			minOptions: 3,
			maxOptions: 10,
			options: DEFAULT_OPTIONS.slice(),
			currentResult: "",
			history: [],
			fallbackSpinning: false,
			fallbackAngle: 0,
			wheelDrawTimer: null,
			wheelSpinTimer: null,
			canvasSize: 0
		};
	},
	computed: {
		wheelCanvasStyle() {
			if (!this.canvasSize) return "";
			return `width: ${this.canvasSize}px; height: ${this.canvasSize}px;`;
		},
		coreText() {
			if (this.fallbackSpinning) return "抽取中";
			if (this.currentResult) return this.currentResult;
			return "开始";
		}
	},
	methods: {
		loadLocalData() {
			const savedOptions = uni.getStorageSync(STORAGE_KEY);
			const savedHistory = uni.getStorageSync(HISTORY_KEY);
			if (Array.isArray(savedOptions) && savedOptions.length >= this.minOptions) {
				this.options = this.normalizeOptions(savedOptions);
			}
			if (Array.isArray(savedHistory)) {
				this.history = savedHistory.slice(0, 6);
			}
			this.scheduleDrawWheel();
		},
		normalizeOptions(list) {
			const next = list
				.map(item => String(item || "").trim())
				.filter(Boolean)
				.slice(0, this.maxOptions);
			return next.length >= this.minOptions ? next : DEFAULT_OPTIONS.slice();
		},
		scheduleDrawWheel() {
			if (this.wheelDrawTimer) {
				clearTimeout(this.wheelDrawTimer);
			}
			this.wheelDrawTimer = setTimeout(() => {
				this.updateCanvasMetrics();
				this.drawWheel();
			}, 80);
		},
		updateCanvasMetrics() {
			const systemInfo = uni.getSystemInfoSync();
			this.canvasSize = Math.round(systemInfo.windowWidth * WHEEL_RPX_SIZE / 750);
		},
		easeOutCubic(progress) {
			return 1 - Math.pow(1 - progress, 3);
		},
		drawWheel() {
			if (!this.canvasSize) {
				this.updateCanvasMetrics();
			}
			const size = this.canvasSize;
			const center = size / 2;
			const radius = Math.round(size * 0.432);
			const rotation = this.fallbackAngle * Math.PI / 180;
			const total = this.options.length || 1;
			const segment = Math.PI * 2 / total;
			const ctx = uni.createCanvasContext("wheelCanvas", this);

			ctx.clearRect(0, 0, size, size);
			if (typeof ctx.setShadow === "function") {
				ctx.setShadow(0, Math.round(size * 0.035), Math.round(size * 0.08), "rgba(0,0,0,0.28)");
			}
			ctx.save();
			ctx.beginPath();
			ctx.arc(center, center, radius, 0, Math.PI * 2);
			ctx.clip();

			this.options.forEach((name, index) => {
				const start = -Math.PI / 2 + rotation + index * segment;
				const end = start + segment;
				ctx.beginPath();
				ctx.moveTo(center, center);
				ctx.arc(center, center, radius, start, end);
				ctx.closePath();
				ctx.setFillStyle(this.getWheelColor(index));
				ctx.fill();
			});

			if (typeof ctx.setShadow === "function") {
				ctx.setShadow(0, 0, 0, "rgba(0,0,0,0)");
			}
			ctx.setStrokeStyle("rgba(255,255,255,0.42)");
			ctx.setLineWidth(1);
			this.options.forEach((name, index) => {
				const angle = -Math.PI / 2 + rotation + index * segment;
				ctx.beginPath();
				ctx.moveTo(center, center);
				ctx.lineTo(center + Math.cos(angle) * radius, center + Math.sin(angle) * radius);
				ctx.stroke();
			});
			ctx.restore();

			const fontSize = this.getWheelFontSize(size, total);
			ctx.setFontSize(fontSize);
			ctx.setTextAlign("center");
			ctx.setTextBaseline("middle");
			this.options.forEach((name, index) => {
				const angle = -Math.PI / 2 + rotation + index * segment + segment / 2;
				const chars = this.getDisplayChars(name, total);
				const startY = -radius * 0.78;

				ctx.save();
				ctx.translate(center, center);
				ctx.rotate(angle + Math.PI / 2);
				chars.forEach((char, charIndex) => {
					const y = startY + charIndex * fontSize * 1.08;
					this.drawReadableText(ctx, char, 0, y, fontSize);
				});
				ctx.restore();
			});

			this.drawNeedle(ctx, center, radius, size);
			this.drawCenterButton(ctx, center, size);
			ctx.draw(false);
		},
		getWheelFontSize(size, total) {
			if (total >= 9) return Math.max(10, Math.round(size * 0.034));
			if (total >= 7) return Math.max(11, Math.round(size * 0.037));
			return Math.max(12, Math.round(size * 0.041));
		},
		getWheelColor(index) {
			return WHEEL_COLORS[index % WHEEL_COLORS.length];
		},
		getDisplayChars(name, total) {
			const maxChars = total >= 9 ? 7 : total >= 7 ? 8 : 9;
			return Array.from(String(name || "").replace(/\s+/g, "")).slice(0, maxChars);
		},
		drawReadableText(ctx, text, x, y, fontSize) {
			ctx.setFillStyle("rgba(60, 28, 24, 0.82)");
			ctx.fillText(text, x + 1, y + 1);
			ctx.fillText(text, x - 1, y + 1);
			ctx.fillText(text, x + 1, y - 1);
			ctx.fillText(text, x - 1, y - 1);
			ctx.setFillStyle("#ffffff");
			ctx.fillText(text, x, y);
		},
		drawNeedle(ctx, center, radius, size) {
			const top = center - radius - size * 0.05;
			const bottom = center - radius + size * 0.09;
			const half = size * 0.045;
			ctx.beginPath();
			ctx.moveTo(center, bottom);
			ctx.lineTo(center - half, top);
			ctx.lineTo(center + half, top);
			ctx.closePath();
			ctx.setFillStyle("#ffe58a");
			ctx.fill();
			ctx.setStrokeStyle("rgba(91,45,16,0.18)");
			ctx.stroke();
		},
		drawCenterButton(ctx, center, size) {
			const radius = size * 0.128;
			if (typeof ctx.setShadow === "function") {
				ctx.setShadow(0, size * 0.018, size * 0.035, "rgba(0,0,0,0.28)");
			}
			ctx.beginPath();
			ctx.arc(center, center, radius, 0, Math.PI * 2);
			ctx.setFillStyle("#edbd45");
			ctx.fill();
			if (typeof ctx.setShadow === "function") {
				ctx.setShadow(0, 0, 0, "rgba(0,0,0,0)");
			}
			ctx.beginPath();
			ctx.arc(center, center, radius * 0.88, 0, Math.PI * 2);
			ctx.setStrokeStyle("rgba(255,255,255,0.42)");
			ctx.setLineWidth(2);
			ctx.stroke();
			ctx.setFillStyle("#5b2d10");
			ctx.setFontSize(Math.max(13, Math.round(size * 0.05)));
			ctx.setTextAlign("center");
			ctx.setTextBaseline("middle");
			ctx.fillText(this.fallbackSpinning ? "抽取中" : "开始", center, center);
		},
		spinFallback() {
			if (this.fallbackSpinning) return;
			this.fallbackSpinning = true;
			const resultIndex = Math.floor(Math.random() * this.options.length);
			const segment = 360 / this.options.length;
			const middleAngle = resultIndex * segment + segment / 2;
			const targetAngle = (360 - middleAngle + 360) % 360;
			const currentAngle = ((this.fallbackAngle % 360) + 360) % 360;
			const delta = (targetAngle - currentAngle + 360) % 360;
			const startAngle = this.fallbackAngle;
			const endAngle = startAngle + 360 * 5 + delta;
			const startTime = Date.now();
			const duration = 2200;

			if (this.wheelSpinTimer) {
				clearTimeout(this.wheelSpinTimer);
			}
			const step = () => {
				const progress = Math.min((Date.now() - startTime) / duration, 1);
				this.fallbackAngle = startAngle + (endAngle - startAngle) * this.easeOutCubic(progress);
				this.drawWheel();
				if (progress < 1) {
					this.wheelSpinTimer = setTimeout(step, 16);
					return;
				}
				this.fallbackAngle = endAngle;
				this.fallbackSpinning = false;
				this.handleResult({ index: resultIndex, name: this.options[resultIndex] });
				this.drawWheel();
			};
			step();
		},
		openSettings() {
			uni.navigateTo({ url: "/pages/game-settings/index" });
		},
		handleResult(result) {
			this.currentResult = result.name;
			store.vibrateIfEnabled();
			const nextHistory = [result.name].concat(this.history.filter(item => item !== result.name)).slice(0, 6);
			this.history = nextHistory;
			uni.setStorageSync(HISTORY_KEY, nextHistory);
			store.addHistory({
				mode: "random",
				title: "自定义多选转盘",
				options: this.options.slice(),
				result: result.name,
				encourage: ENCOURAGES[Math.floor(Math.random() * ENCOURAGES.length)]
			});
		}
	},
	mounted() {
		this.loadLocalData();
		this.scheduleDrawWheel();
	},
	onReady() {
		this.scheduleDrawWheel();
	},
	onShow() {
		this.loadLocalData();
	},
	beforeDestroy() {
		if (this.wheelDrawTimer) {
			clearTimeout(this.wheelDrawTimer);
		}
		if (this.wheelSpinTimer) {
			clearTimeout(this.wheelSpinTimer);
		}
	}
};
</script>

<style>
.decision-page {
	position: relative;
	width: 100vw;
	height: 100vh;
	overflow: hidden;
	background: #120b2e;
}

.fallback-stage {
	position: fixed;
	top: 0;
	left: 0;
	z-index: 1;
	width: 100vw;
	height: 100vh;
	background: radial-gradient(circle at center 42%, rgba(87, 70, 146, 0.55), rgba(18, 11, 46, 0.96) 64%);
}

.fallback-wheel-wrap {
	position: absolute;
	top: 38%;
	left: 50%;
	width: 620rpx;
	height: 620rpx;
	transform: translate(-50%, -50%);
}

.wheel-disc {
	position: absolute;
	top: 50%;
	left: 50%;
	z-index: 2;
	width: 620rpx;
	height: 620rpx;
	margin: -310rpx 0 0 -310rpx;
	overflow: hidden;
	border: 0;
}

.wheel-canvas {
	display: block;
	width: 620rpx;
	height: 620rpx;
}

.top-panel {
	position: fixed;
	top: 42rpx;
	left: 32rpx;
	right: 32rpx;
	z-index: 10;
	display: flex;
	align-items: center;
	justify-content: space-between;
	pointer-events: none;
}

.app-title {
	color: #fff;
	font-size: 42rpx;
	font-weight: 700;
	line-height: 1.2;
}

.app-subtitle {
	margin-top: 8rpx;
	color: rgba(255, 255, 255, 0.72);
	font-size: 24rpx;
}

.icon-button,
.plain-button,
.secondary-button,
.remove-button {
	margin: 0;
	border: 0;
	border-radius: 8rpx;
	line-height: 1;
}

.icon-button::after,
.plain-button::after,
.secondary-button::after,
.remove-button::after {
	border: 0;
}

.icon-button {
	pointer-events: auto;
	padding: 18rpx 24rpx;
	background: rgba(255, 255, 255, 0.16);
	color: #fff;
	font-size: 26rpx;
}

.bottom-panel {
	position: fixed;
	left: 32rpx;
	right: 32rpx;
	bottom: 44rpx;
	z-index: 20;
}

.hint-card,
.result-card {
	padding: 24rpx 28rpx;
	border: 1rpx solid rgba(255, 255, 255, 0.18);
	border-radius: 8rpx;
	background: rgba(16, 12, 32, 0.68);
	color: #fff;
}

.hint-title,
.result-label {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.7);
}

.hint-text {
	margin-top: 8rpx;
	font-size: 30rpx;
	font-weight: 600;
}

.result-text {
	margin-top: 8rpx;
	font-size: 42rpx;
	font-weight: 700;
	color: #ffe58a;
}

.option-panel {
	margin-top: 16rpx;
	padding: 20rpx;
	border: 1rpx solid rgba(255, 255, 255, 0.16);
	border-radius: 8rpx;
	background: rgba(16, 12, 32, 0.62);
	color: #fff;
}

.option-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	color: rgba(255, 255, 255, 0.66);
	font-size: 22rpx;
}

.option-list {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-top: 14rpx;
	max-height: 164rpx;
	overflow: hidden;
}

.option-chip {
	display: flex;
	align-items: center;
	max-width: 100%;
	min-height: 44rpx;
	padding: 8rpx 14rpx 8rpx 8rpx;
	border-radius: 8rpx;
	background: rgba(255, 255, 255, 0.12);
}

.option-index {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 30rpx;
	height: 30rpx;
	margin-right: 8rpx;
	border-radius: 50%;
	background: #ffe58a;
	color: #5b2d10;
	font-size: 18rpx;
	font-weight: 700;
}

.option-name {
	max-width: 248rpx;
	overflow: hidden;
	color: rgba(255, 255, 255, 0.9);
	font-size: 24rpx;
	line-height: 1.2;
	text-overflow: ellipsis;
	white-space: nowrap;
}
</style>
