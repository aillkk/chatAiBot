<template>
    <view class="chat-container">
        <!-- 顶部标题栏 -->
        <view class="header" :style="{ paddingTop: safeAreaTop + 'px' }">
            <view class="header-content">
                <text class="app-title">AI Chat</text>
                <view class="header-actions">
                    <text class="action-btn" @click="clearChat">清空</text>
                    <text class="action-btn" @click="exportChat">导出</text>
                    <text class="action-btn" @click="openSettings">⚙️</text>
                </view>
            </view>
        </view>

        <!-- 消息列表区域 -->
        <scroll-view
            class="messages-container"
            scroll-y="true"
            :scroll-top="scrollTop"
            :scroll-into-view="scrollIntoView"
            @scrolltoupper="loadMoreMessages"
        >
            <view class="messages-list">
                <!-- 欢迎消息 -->
                <view v-if="messages.length === 0" class="welcome-message">
                    <view class="welcome-icon">🤖</view>
                    <text class="welcome-title">欢迎使用 AI Chat</text>
                    <text class="welcome-subtitle"
                        >我是您的AI助手，有什么可以帮助您的吗？</text
                    >
                    <view class="suggestions">
                        <view
                            class="suggestion-item"
                            @click="sendSuggestion('帮我写一个Python函数')"
                        >
                            <text>帮我写一个Python函数</text>
                        </view>
                        <view
                            class="suggestion-item"
                            @click="sendSuggestion('解释一下机器学习')"
                        >
                            <text>解释一下机器学习</text>
                        </view>
                        <view
                            class="suggestion-item"
                            @click="sendSuggestion('帮我优化代码')"
                        >
                            <text>帮我优化代码</text>
                        </view>
                    </view>
                </view>

                <!-- 消息列表 -->
                <view
                    v-for="(message, index) in messages"
                    :key="index"
                    :class="[
                        'message-item',
                        message.role === 'user'
                            ? 'user-message'
                            : 'assistant-message',
                    ]"
                    :id="'msg-' + index"
                >
                    <view class="message-avatar">
                        <text v-if="message.role === 'user'" class="avatar-text"
                            >👤</text
                        >
                        <text v-else class="avatar-text">🤖</text>
                    </view>
                    <view class="message-content">
                        <view class="message-header">
                            <text class="message-role">{{
                                message.role === "user" ? "您" : "AI"
                            }}</text>
                            <text class="message-time">{{
                                formatTime(message.timestamp)
                            }}</text>
                        </view>
                        <view class="message-text">
                            <text>{{ message.content }}</text>
                        </view>
                        <view
                            v-if="message.role === 'assistant'"
                            class="message-actions"
                        >
                            <text
                                class="action-icon"
                                @click="copyMessage(message.content)"
                                >📋</text
                            >
                            <text
                                class="action-icon"
                                @click="regenerateMessage(index)"
                                >🔄</text
                            >
                        </view>
                    </view>
                </view>

                <!-- 加载状态 -->
                <view v-if="isLoading" class="loading-message">
                    <view class="message-avatar">
                        <text class="avatar-text">🤖</text>
                    </view>
                    <view class="message-content">
                        <view class="loading-dots">
                            <view class="dot"></view>
                            <view class="dot"></view>
                            <view class="dot"></view>
                        </view>
                    </view>
                </view>
            </view>
        </scroll-view>

        <!-- 底部输入区域 -->
        <view class="input-container">
            <view class="input-wrapper">
                <textarea
                    class="message-input"
                    v-model="inputMessage"
                    placeholder="输入您的问题..."
                    :disabled="isLoading"
                    :maxlength="2000"
                    @confirm="sendMessage"
                    @input="onInput"
                    auto-height
                ></textarea>
                <view class="input-actions">
                    <text class="char-count"
                        >{{ inputMessage.length }}/2000</text
                    >
                    <button
                        class="send-btn"
                        :class="{ 'send-btn-disabled': !canSend }"
                        @click="sendMessage"
                        :disabled="!canSend || isLoading"
                    >
                        <text v-if="!isLoading">发送</text>
                        <text v-else>发送中...</text>
                    </button>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import aiService from "@/utils/aiService.js";

export default {
    data() {
        return {
            safeAreaTop: 0,
            messages: [],
            inputMessage: "",
            isLoading: false,
            scrollTop: 0,
            scrollIntoView: "",
            messageId: 0,
            settings: {
                autoScroll: true,
                autoSave: true,
            },
        };
    },
    computed: {
        canSend() {
            return this.inputMessage.trim().length > 0 && !this.isLoading;
        },
    },
    onLoad() {
        // 加载历史消息和设置
        this.loadHistoryMessages();
        this.loadSettings();
        const sysInfo = uni.getSystemInfoSync();
        // safeArea.top 是安全区顶部距离
        this.safeAreaTop = sysInfo.safeArea ? sysInfo.safeArea.top : 0;
        console.log("safeAreaTop", this.safeAreaTop);
    },
    methods: {
        // 发送消息
        async sendMessage() {
            if (!this.canSend) return;

            const userMessage = {
                id: this.messageId++,
                role: "user",
                content: this.inputMessage.trim(),
                timestamp: new Date(),
            };

            this.messages.push(userMessage);
            this.inputMessage = "";
            this.isLoading = true;

            // 滚动到底部
            this.$nextTick(() => {
                this.scrollToBottom();
            });

            try {
                // 使用AI服务发送消息
                const response = await aiService.sendMessage(
                    userMessage.content,
                    this.messages.slice(0, -1)
                );

                const assistantMessage = {
                    id: this.messageId++,
                    role: "assistant",
                    content: response,
                    timestamp: new Date(),
                };

                this.messages.push(assistantMessage);

                // 滚动到底部
                this.$nextTick(() => {
                    this.scrollToBottom();
                });

                // 保存消息到本地存储
                if (this.settings.autoSave) {
                    this.saveMessages();
                }
            } catch (error) {
                console.error("发送消息失败:", error);
                uni.showToast({
                    title: "发送失败，请重试",
                    icon: "none",
                });
            } finally {
                this.isLoading = false;
            }
        },

        // 发送建议问题
        sendSuggestion(suggestion) {
            this.inputMessage = suggestion;
            this.sendMessage();
        },

        // 复制消息
        copyMessage(content) {
            uni.setClipboardData({
                data: content,
                success: () => {
                    uni.showToast({
                        title: "已复制到剪贴板",
                        icon: "success",
                    });
                },
            });
        },

        // 重新生成消息
        regenerateMessage(index) {
            // 移除当前AI回复
            this.messages.splice(index, 1);
            this.isLoading = true;

            this.$nextTick(() => {
                this.scrollToBottom();
                // 重新发送最后一条用户消息
                const lastUserMessage = this.messages[this.messages.length - 1];
                if (lastUserMessage && lastUserMessage.role === "user") {
                    this.sendMessage();
                }
            });
        },

        // 清空聊天
        clearChat() {
            uni.showModal({
                title: "确认清空",
                content: "确定要清空所有聊天记录吗？",
                success: (res) => {
                    if (res.confirm) {
                        this.messages = [];
                        this.saveMessages();
                        uni.showToast({
                            title: "已清空聊天记录",
                            icon: "success",
                        });
                    }
                },
            });
        },

        // 导出聊天
        exportChat() {
            if (this.messages.length === 0) {
                uni.showToast({
                    title: "暂无聊天记录",
                    icon: "none",
                });
                return;
            }

            let exportText = "AI Chat 聊天记录\n";
            exportText += "导出时间: " + new Date().toLocaleString() + "\n\n";

            this.messages.forEach((msg) => {
                exportText += `[${
                    msg.role === "user" ? "用户" : "AI"
                }] ${this.formatTime(msg.timestamp)}\n`;
                exportText += msg.content + "\n\n";
            });

            uni.setClipboardData({
                data: exportText,
                success: () => {
                    uni.showToast({
                        title: "聊天记录已复制到剪贴板",
                        icon: "success",
                    });
                },
            });
        },

        // 打开设置页面
        openSettings() {
            uni.navigateTo({
                url: "/pages/settings/settings",
            });
        },

        // 滚动到底部
        scrollToBottom() {
            if (this.settings.autoScroll) {
                this.scrollIntoView = "msg-" + (this.messages.length - 1);
            }
        },

        // 加载更多消息
        loadMoreMessages() {
            // 这里可以实现加载历史消息的逻辑
            console.log("加载更多消息");
        },

        // 输入处理
        onInput(e) {
            // 可以在这里添加输入验证或其他处理
        },

        // 格式化时间
        formatTime(timestamp) {
            const now = new Date();
            const msgTime = new Date(timestamp);
            const diff = now - msgTime;

            if (diff < 60000) {
                // 1分钟内
                return "刚刚";
            } else if (diff < 3600000) {
                // 1小时内
                return Math.floor(diff / 60000) + "分钟前";
            } else if (diff < 86400000) {
                // 24小时内
                return Math.floor(diff / 3600000) + "小时前";
            } else {
                return (
                    msgTime.toLocaleDateString() +
                    " " +
                    msgTime.toLocaleTimeString()
                );
            }
        },

        // 保存消息到本地存储
        saveMessages() {
            try {
                uni.setStorageSync(
                    "chat_messages",
                    JSON.stringify(this.messages)
                );
            } catch (e) {
                console.error("保存消息失败:", e);
            }
        },

        // 加载历史消息
        loadHistoryMessages() {
            try {
                const saved = uni.getStorageSync("chat_messages");
                if (saved) {
                    this.messages = JSON.parse(saved);
                    this.messageId =
                        this.messages.length > 0
                            ? Math.max(...this.messages.map((m) => m.id)) + 1
                            : 0;
                }
            } catch (e) {
                console.error("加载历史消息失败:", e);
            }
        },

        // 加载设置
        loadSettings() {
            try {
                const saved = uni.getStorageSync("app_settings");
                if (saved) {
                    const parsed = JSON.parse(saved);
                    this.settings.autoScroll =
                        parsed.autoScroll !== undefined
                            ? parsed.autoScroll
                            : true;
                    this.settings.autoSave =
                        parsed.autoSave !== undefined ? parsed.autoSave : true;
                }
            } catch (e) {
                console.error("加载设置失败:", e);
            }
        },
    },
};
</script>

<style>
.chat-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f5f5f5;
}

/* 顶部标题栏 */
.header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding-top: calc(20rpx + env(safe-area-inset-top));
    padding-top: calc(20rpx + constant(safe-area-inset-top));
    padding-bottom: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 30rpx;
}

.app-title {
    color: white;
    font-size: 36rpx;
    font-weight: bold;
}

.header-actions {
    display: flex;
    gap: 20rpx;
}

.action-btn {
    color: white;
    font-size: 28rpx;
    padding: 10rpx 20rpx;
    border-radius: 20rpx;
    background-color: rgba(255, 255, 255, 0.2);
}

/* 消息列表区域 */
.messages-container {
    flex: 1;
    min-height: 0; /* 关键：防止内容撑开父容器 */
    padding: 20rpx 0rpx;
}

.messages-list {
    padding-bottom: 20rpx;
}

/* 欢迎消息 */
.welcome-message {
    text-align: center;
    padding: 100rpx 40rpx;
}

.welcome-icon {
    font-size: 120rpx;
    margin-bottom: 30rpx;
}

.welcome-title {
    display: block;
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
}

.welcome-subtitle {
    display: block;
    font-size: 28rpx;
    color: #666;
    margin-bottom: 60rpx;
}

.suggestions {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.suggestion-item {
    background: white;
    padding: 30rpx;
    border-radius: 20rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
    text-align: left;
}

.suggestion-item text {
    color: #333;
    font-size: 28rpx;
}

/* 消息项 */
.message-item {
    display: flex;
    margin-bottom: 30rpx;
    animation: fadeIn 0.3s ease-in;
}

.user-message {
    flex-direction: row-reverse;
}

.message-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 20rpx;
    flex-shrink: 0;
}

.user-message .message-avatar {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
}

.avatar-text {
    font-size: 40rpx;
}

.message-content {
    flex: 1;
    max-width: 70%;
}

.user-message .message-content {
    text-align: right;
}

.message-header {
    display: flex;
    align-items: center;
    margin-bottom: 10rpx;
}

.user-message .message-header {
    flex-direction: row-reverse;
}

.message-role {
    font-size: 24rpx;
    color: #666;
    margin: 0 10rpx;
}

.message-time {
    font-size: 22rpx;
    color: #999;
}

.message-text {
    display: inline-block;
    max-width: 80%; /* 限制最大宽度，防止太长 */
    background: white;
    padding: 20rpx 30rpx;
    border-radius: 20rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
    word-break: break-all; /* 让长单词/英文自动换行 */
    white-space: pre-wrap; /* 保留换行和空格，支持多行 */
}

.user-message .message-text {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.message-text text {
    font-size: 28rpx;
    line-height: 1.6;
}

.message-actions {
    display: flex;
    justify-content: flex-start;
    margin-top: 10rpx;
    gap: 20rpx;
}

.action-icon {
    font-size: 32rpx;
    padding: 10rpx;
    cursor: pointer;
}

/* 加载状态 */
.loading-message {
    display: flex;
    margin-bottom: 30rpx;
}

.loading-dots {
    display: flex;
    gap: 10rpx;
    padding: 20rpx 30rpx;
}

.dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
    background-color: #667eea;
    animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) {
    animation-delay: -0.32s;
}
.dot:nth-child(2) {
    animation-delay: -0.16s;
}

/* 底部输入区域 */
.input-container {
    background: white;
    padding: 20rpx;
    border-top: 1rpx solid #eee;
    box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.message-input {
    background: #f8f9fa;
    border: 2rpx solid #e9ecef;
    border-radius: 25rpx;
    padding: 20rpx 30rpx;
    font-size: 28rpx;
    min-height: 80rpx;
    max-height: 200rpx;
    resize: none;
    width: calc(100% - 60rpx);
}

.message-input:focus {
    border-color: #667eea;
    background: white;
}

.input-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.char-count {
    font-size: 24rpx;
    color: #999;
}

.send-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 25rpx;
    font-size: 28rpx;
    font-weight: bold;
    margin-right: 0rpx;
}

.send-btn-disabled {
    background: #ccc !important;
    color: #999 !important;
}

/* 动画 */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20rpx);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes bounce {
    0%,
    80%,
    100% {
        transform: scale(0);
    }
    40% {
        transform: scale(1);
    }
}
</style>
