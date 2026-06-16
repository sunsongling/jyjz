<template>
	<view class="page">
		<view class="title">理智分析选</view>
		<view class="subtitle">适合换工作、搬家、关系选择等大事。分数只是参考，答案仍然属于你。</view>

		<view class="panel">
			<view class="panel-title">两个备选方案</view>
			<input class="input" v-model="plans[0].name" maxlength="16" placeholder="方案 A" />
			<input class="input" v-model="plans[1].name" maxlength="16" placeholder="方案 B" />
		</view>

		<view class="plan-card" v-for="(plan, planIndex) in plans" :key="planIndex">
			<view class="plan-head">
				<view class="plan-name">{{ plan.name || ('方案 ' + (planIndex + 1)) }}</view>
				<view class="score">净分 {{ planScore(plan) }}</view>
			</view>

			<view class="list-title">优点</view>
			<view class="factor-row" v-for="(item, index) in plan.pros" :key="index">
				<input class="factor-input" :value="item.text" maxlength="20" placeholder="写下一个优点" @input="updateFactor(planIndex, 'pros', index, 'text', $event)" />
				<input class="score-input" type="number" :value="item.score" placeholder="0-10" @input="updateFactor(planIndex, 'pros', index, 'score', $event)" />
			</view>
			<button class="text-button" @click="addFactor(planIndex, 'pros')">添加优点</button>

			<view class="list-title">缺点</view>
			<view class="factor-row" v-for="(item, index) in plan.cons" :key="index">
				<input class="factor-input" :value="item.text" maxlength="20" placeholder="写下一个缺点" @input="updateFactor(planIndex, 'cons', index, 'text', $event)" />
				<input class="score-input" type="number" :value="item.score" placeholder="0-10" @input="updateFactor(planIndex, 'cons', index, 'score', $event)" />
			</view>
			<button class="text-button warn" @click="addFactor(planIndex, 'cons')">添加缺点</button>
		</view>

		<view class="panel">
			<view class="panel-title">灵魂拷问</view>
			<view class="question" v-for="(question, index) in questions" :key="question">
				<view class="question-text">{{ question }}</view>
				<textarea class="textarea" v-model="answers[index]" maxlength="80" placeholder="写下你的直觉答案"></textarea>
			</view>
		</view>

		<view class="panel">
			<view class="panel-title">决策笔记</view>
			<textarea class="note" v-model="note" maxlength="300" placeholder="写下顾虑、期待、底线或暂时想不通的地方"></textarea>
		</view>

		<button class="primary-button" @click="generateReport">生成分析报告</button>

		<view class="report" v-if="report">
			<view class="report-title">简易决策分析报告</view>
			<view class="report-line">{{ report.summary }}</view>
			<view class="report-line">方案 A：{{ report.aScore }} 分；方案 B：{{ report.bScore }} 分。</view>
			<view class="report-line">参考建议：{{ report.advice }}</view>
		</view>
	</view>
</template>

<script>
import store from '@/common/decision-store.js';

function clampScore(value) {
	const number = Number(value || 0);
	return Math.max(0, Math.min(10, number));
}

export default {
	data() {
		return {
			plans: [
				{ name: '方案 A', pros: [{ text: '', score: 5 }], cons: [{ text: '', score: 5 }] },
				{ name: '方案 B', pros: [{ text: '', score: 5 }], cons: [{ text: '', score: 5 }] }
			],
			questions: store.QUESTIONS.slice(0, 3),
			answers: ['', '', ''],
			note: '',
			report: null
		};
	},
	methods: {
		addFactor(planIndex, type) {
			this.plans[planIndex][type].push({ text: '', score: 5 });
		},
		updateFactor(planIndex, type, factorIndex, field, event) {
			const value = event && event.detail ? event.detail.value : '';
			const item = this.plans[planIndex][type][factorIndex];
			if (!item) return;
			item[field] = field === 'score' ? clampScore(value) : value;
		},
		sum(list) {
			return list.reduce((total, item) => total + clampScore(item.score), 0);
		},
		planScore(plan) {
			return this.sum(plan.pros) - this.sum(plan.cons);
		},
		generateReport() {
			const aScore = this.planScore(this.plans[0]);
			const bScore = this.planScore(this.plans[1]);
			let winner = '两个方案接近';
			if (aScore > bScore) winner = this.plans[0].name || '方案 A';
			if (bScore > aScore) winner = this.plans[1].name || '方案 B';
			const advice = aScore === bScore
				? '分数接近，建议回看灵魂拷问和笔记，找出更贴近本心的选择。'
				: `${winner} 当前更占优，但仍建议确认最坏结果是否可承受。`;
			this.report = {
				aScore,
				bScore,
				summary: `当前分析结果：${winner}`,
				advice
			};
			store.vibrateIfEnabled();
			store.addHistory({
				mode: 'rational',
				title: '理智分析选',
				options: this.plans.map(plan => plan.name),
				result: winner,
				encourage: advice,
				detail: {
					plans: this.plans,
					answers: this.answers,
					note: this.note,
					report: this.report
				}
			});
			uni.showToast({ title: '报告已保存', icon: 'success' });
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

.panel,
.plan-card,
.report {
	margin-top: 24rpx;
	padding: 28rpx;
	border-radius: 8rpx;
	background: #fff;
}

.panel-title,
.plan-name,
.report-title {
	font-size: 32rpx;
	font-weight: 700;
}

.input,
.factor-input,
.score-input,
.textarea,
.note {
	border: 1rpx solid #ded8cf;
	border-radius: 8rpx;
	background: #fbfaf8;
	font-size: 28rpx;
	box-sizing: border-box;
}

.input {
	width: 100%;
	height: 82rpx;
	margin-top: 18rpx;
	padding: 0 20rpx;
}

.plan-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.score {
	color: #6f8f84;
	font-size: 27rpx;
	font-weight: 700;
}

.list-title {
	margin-top: 22rpx;
	color: #8b7e74;
	font-size: 25rpx;
}

.factor-row {
	display: flex;
	gap: 14rpx;
	margin-top: 14rpx;
}

.factor-input {
	flex: 1;
	height: 76rpx;
	padding: 0 18rpx;
}

.score-input {
	width: 120rpx;
	height: 76rpx;
	padding: 0 12rpx;
	text-align: center;
}

.text-button,
.primary-button {
	border: 0;
	border-radius: 8rpx;
}

.text-button::after,
.primary-button::after {
	border: 0;
}

.text-button {
	margin: 14rpx 0 0;
	padding: 0;
	background: transparent;
	color: #6f8f84;
	font-size: 25rpx;
	text-align: left;
	line-height: 1.5;
}

.text-button.warn {
	color: #a16f64;
}

.question {
	margin-top: 18rpx;
}

.question-text {
	color: #3c3833;
	font-size: 27rpx;
}

.textarea,
.note {
	width: 100%;
	height: 120rpx;
	margin-top: 12rpx;
	padding: 18rpx;
	line-height: 1.45;
}

.note {
	height: 170rpx;
}

.primary-button {
	width: 100%;
	height: 86rpx;
	margin-top: 26rpx;
	background: #7b7292;
	color: #fff;
	font-size: 30rpx;
}

.report-line {
	margin-top: 14rpx;
	color: #5f5953;
	font-size: 27rpx;
	line-height: 1.6;
}
</style>
