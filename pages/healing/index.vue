<template>
	<view class="page">
		<view class="title">治愈解忧专区</view>
		<view class="subtitle">不止帮你做选择，也给纠结中的自己一点缓冲。</view>

		<view class="panel">
			<view class="section-title">每日解忧语录</view>
			<view class="quote">{{ quote }}</view>
			<button class="text-button" @click="refreshQuote">换一句</button>
		</view>

		<view class="panel">
			<view class="section-title">迷茫树洞</view>
			<textarea class="textarea" v-model="treeText" maxlength="240" placeholder="写下现在的心事，仅自己可见"></textarea>
			<button class="primary-button" @click="saveTree">存进树洞</button>
		</view>

		<view class="tree-item" v-for="item in treehole" :key="item.id">
			<view class="tree-time">{{ item.time }}</view>
			<view class="tree-content">{{ item.content }}</view>
			<button class="delete-button" @click="deleteTree(item.id)">删除</button>
		</view>

		<view class="panel">
			<view class="section-title">决策小 tips</view>
			<view class="tip" v-for="tip in tips" :key="tip">{{ tip }}</view>
		</view>
	</view>
</template>

<script>
import store from '@/common/decision-store.js';

export default {
	data() {
		return {
			quote: '',
			treeText: '',
			treehole: [],
			tips: store.TIPS
		};
	},
	onShow() {
		this.refreshQuote();
		this.loadTree();
	},
	methods: {
		refreshQuote() {
			this.quote = store.QUOTES[Math.floor(Math.random() * store.QUOTES.length)];
		},
		loadTree() {
			this.treehole = store.getTreehole();
		},
		saveTree() {
			const item = store.addTreehole(this.treeText);
			if (!item) {
				uni.showToast({ title: '先写一点内容吧', icon: 'none' });
				return;
			}
			this.treeText = '';
			this.loadTree();
			uni.showToast({ title: '已保存', icon: 'success' });
		},
		deleteTree(id) {
			store.deleteTreehole(id);
			this.loadTree();
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
.tree-item {
	margin-top: 24rpx;
	padding: 28rpx;
	border-radius: 8rpx;
	background: #fff;
}

.section-title {
	color: #8b7e74;
	font-size: 25rpx;
}

.quote {
	margin-top: 14rpx;
	font-size: 32rpx;
	font-weight: 700;
	line-height: 1.55;
}

.textarea {
	width: 100%;
	height: 170rpx;
	margin-top: 18rpx;
	padding: 18rpx;
	border: 1rpx solid #ded8cf;
	border-radius: 8rpx;
	background: #fbfaf8;
	font-size: 28rpx;
	line-height: 1.5;
	box-sizing: border-box;
}

.text-button,
.primary-button,
.delete-button {
	border: 0;
	border-radius: 8rpx;
}

.text-button::after,
.primary-button::after,
.delete-button::after {
	border: 0;
}

.text-button {
	margin: 18rpx 0 0;
	padding: 0;
	background: transparent;
	color: #6f8f84;
	font-size: 26rpx;
	text-align: left;
	line-height: 1.4;
}

.primary-button {
	width: 100%;
	height: 82rpx;
	margin-top: 18rpx;
	background: #6f8f84;
	color: #fff;
	font-size: 29rpx;
}

.tree-time {
	color: #8b7e74;
	font-size: 23rpx;
}

.tree-content,
.tip {
	margin-top: 12rpx;
	color: #4d4742;
	font-size: 27rpx;
	line-height: 1.6;
}

.delete-button {
	height: 58rpx;
	margin-top: 14rpx;
	padding: 0 22rpx;
	background: #f1e8e3;
	color: #9a645a;
	font-size: 24rpx;
}
</style>
