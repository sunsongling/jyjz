const KEYS = {
	introSeen: 'jy_intro_seen',
	settings: 'jy_settings',
	history: 'jy_history',
	treehole: 'jy_treehole',
	feedback: 'jy_feedback',
	options: 'decision_card_options',
	legacyHistory: 'decision_card_history',
	latestResult: 'jy_latest_result'
};

const DEFAULT_SETTINGS = {
	sound: true,
	vibrate: true
};

const QUOTES = [
	'答案不是终点，开始行动才是。',
	'允许自己慢一点，但别让纠结困住太久。',
	'今天先做一个小决定，明天就会轻一点。',
	'选择没有完美版，只有当下更适合的一版。',
	'把心事写下来，很多结就会自己松开。'
];

const TIPS = [
	'给选择设置一个截止时间，超过时间就执行当前最优解。',
	'把选项减少到三个以内，选择会立刻清晰很多。',
	'大事看价值，小事交给随机，不必事事耗尽心力。',
	'先写下你最担心的后果，再判断它是否真的不可承受。'
];

const PRESETS = [
	{ id: 'food', name: '干饭选择', options: ['米饭套餐', '面条', '轻食', '火锅', '便利店', '自己做饭'] },
	{ id: 'trip', name: '出行选择', options: ['散步', '看电影', '逛商场', '去公园', '咖啡馆', '在家休息'] },
	{ id: 'fun', name: '休闲娱乐', options: ['游戏一局', '看剧', '读书', '运动', '整理房间', '听播客'] },
	{ id: 'work', name: '职场小事', options: ['先写方案', '先回消息', '整理待办', '请教同事', '休息五分钟'] },
	{ id: 'wear', name: '穿搭选择', options: ['黑白基础款', '浅色舒适款', '正式一点', '运动风', '今天随性'] }
];

const QUESTIONS = [
	'这个选择五年后还会重要吗？',
	'你是因为想要它，还是害怕失去什么？',
	'如果朋友做同样选择，你会怎么建议？',
	'哪个方案更贴近你真正想过的生活？',
	'最坏结果出现时，你有办法承受或补救吗？'
];

function read(key, fallback) {
	try {
		const value = uni.getStorageSync(key);
		return value === '' || value === undefined || value === null ? fallback : value;
	} catch (e) {
		return fallback;
	}
}

function write(key, value) {
	uni.setStorageSync(key, value);
	return value;
}

function createId(prefix = 'jy') {
	return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function formatTime(date = new Date()) {
	const pad = value => String(value).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getSettings() {
	return Object.assign({}, DEFAULT_SETTINGS, read(KEYS.settings, {}));
}

function saveSettings(settings) {
	return write(KEYS.settings, Object.assign({}, DEFAULT_SETTINGS, settings));
}

function vibrateIfEnabled() {
	const settings = getSettings();
	if (!settings.vibrate || !uni.vibrateShort) return;
	uni.vibrateShort({ fail() {} });
}

function getHistory() {
	return read(KEYS.history, []);
}

function addHistory(record) {
	const next = Object.assign({
		id: createId('history'),
		time: formatTime(),
		mode: 'random',
		title: '一次抉择',
		options: [],
		result: '',
		encourage: ''
	}, record || {});
	const list = [next].concat(getHistory()).slice(0, 100);
	write(KEYS.history, list);
	write(KEYS.latestResult, next);
	return next;
}

function deleteHistory(id) {
	write(KEYS.history, getHistory().filter(item => item.id !== id));
}

function clearHistory() {
	write(KEYS.history, []);
	write(KEYS.legacyHistory, []);
}

function getTreehole() {
	return read(KEYS.treehole, []);
}

function addTreehole(content) {
	const text = String(content || '').trim();
	if (!text) return null;
	const item = {
		id: createId('tree'),
		time: formatTime(),
		content: text
	};
	const list = [item].concat(getTreehole()).slice(0, 50);
	write(KEYS.treehole, list);
	return item;
}

function deleteTreehole(id) {
	write(KEYS.treehole, getTreehole().filter(item => item.id !== id));
}

function clearTreehole() {
	write(KEYS.treehole, []);
}

function getFeedback() {
	return read(KEYS.feedback, '');
}

function saveFeedback(content) {
	return write(KEYS.feedback, String(content || '').trim().slice(0, 160));
}

function clearAllLocalData() {
	clearHistory();
	clearTreehole();
	write(KEYS.feedback, '');
	write(KEYS.options, []);
	write(KEYS.latestResult, null);
}

export default {
	KEYS,
	QUOTES,
	TIPS,
	PRESETS,
	QUESTIONS,
	read,
	write,
	getSettings,
	saveSettings,
	vibrateIfEnabled,
	getHistory,
	addHistory,
	deleteHistory,
	clearHistory,
	getTreehole,
	addTreehole,
	deleteTreehole,
	clearTreehole,
	getFeedback,
	saveFeedback,
	clearAllLocalData,
	formatTime
};
