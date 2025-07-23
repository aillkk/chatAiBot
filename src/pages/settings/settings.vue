<template>
    <view class="settings-container">
        <!-- 顶部标题栏 -->
        <view class="header" :style="{ paddingTop: safeAreaTop + 'px' }">
            <view class="header-content">
                <text class="back-btn" @click="goBack">←</text>
                <text class="page-title">设置</text>
                <text class="save-btn" @click="saveSettings">保存</text>
            </view>
        </view>

        <!-- 设置内容 -->
        <scroll-view
            class="settings-content"
            scroll-y="false"
            :style="{ marginTop: headerHeight + 'px' }"
        >
            <!-- AI API 配置 -->
            <view class="settings-section">
                <view class="section-header">
                    <text class="section-title">AI API 配置</text>
                    <text class="section-subtitle">配置您的AI服务提供商</text>
                </view>

                <view class="setting-item">
                    <text class="setting-label">API 密钥</text>
                    <input
                        class="setting-input"
                        v-model="settings.apiKey"
                        placeholder="请输入您的API密钥"
                        password="true"
                    />
                </view>

                <view class="setting-item">
                    <text class="setting-label">API 端点</text>
                    <input
                        class="setting-input"
                        v-model="settings.apiEndpoint"
                        placeholder="https://api.deepseek.com/v1/chat/completions"
                    />
                </view>

                <view class="setting-item">
                    <text class="setting-label">模型名称</text>
                    <picker
                        :range="modelOptions"
                        :range-key="'name'"
                        :value="modelIndex"
                        @change="onModelChange"
                    >
                        <view class="picker-display">
                            <text>{{ modelOptions[modelIndex].name }}</text>
                            <text class="picker-arrow">▼</text>
                        </view>
                    </picker>
                </view>

                <view class="api-status">
                    <text class="status-label">API 状态:</text>
                    <text
                        :class="[
                            'status-text',
                            apiStatus.available
                                ? 'status-success'
                                : 'status-error',
                        ]"
                    >
                        {{ apiStatus.message }}
                    </text>
                    <button class="test-btn" @click="testAPI">测试连接</button>
                </view>
            </view>

            <!-- 聊天设置 -->
            <view class="settings-section">
                <view class="section-header">
                    <text class="section-title">聊天设置</text>
                    <text class="section-subtitle">自定义聊天体验</text>
                </view>

                <view class="setting-item">
                    <text class="setting-label">最大回复长度</text>
                    <slider
                        class="setting-slider"
                        :value="settings.maxTokens"
                        @change="onMaxTokensChange"
                        min="500"
                        max="4000"
                        step="500"
                        show-value="true"
                    />
                </view>

                <view class="setting-item">
                    <text class="setting-label">创造性 (Temperature)</text>
                    <slider
                        class="setting-slider"
                        :value="settings.temperature * 100"
                        @change="onTemperatureChange"
                        min="0"
                        max="200"
                        step="10"
                        show-value="true"
                    />
                </view>

                <view class="setting-item">
                    <text class="setting-label">自动滚动到底部</text>
                    <switch
                        :checked="settings.autoScroll"
                        @change="onAutoScrollChange"
                        color="#667eea"
                    />
                </view>

                <view class="setting-item">
                    <text class="setting-label">消息提醒</text>
                    <switch
                        :checked="settings.notifications"
                        @change="onNotificationsChange"
                        color="#667eea"
                    />
                </view>
            </view>

            <!-- 数据管理 -->
            <view class="settings-section">
                <view class="section-header">
                    <text class="section-title">数据管理</text>
                    <text class="section-subtitle">管理您的聊天数据</text>
                </view>

                <view class="setting-item">
                    <text class="setting-label">自动保存聊天记录</text>
                    <switch
                        :checked="settings.autoSave"
                        @change="onAutoSaveChange"
                        color="#667eea"
                    />
                </view>

                <view class="setting-item">
                    <text class="setting-label">聊天记录保留天数</text>
                    <picker
                        :value="retentionIndex"
                        :range="retentionOptions"
                        @change="onRetentionChange"
                    >
                        <view class="picker-display">
                            <text>{{ retentionOptions[retentionIndex] }}</text>
                            <text class="picker-arrow">></text>
                        </view>
                    </picker>
                </view>

                <view class="action-buttons">
                    <button class="action-btn danger" @click="clearAllData">
                        清空所有数据
                    </button>
                    <button class="action-btn" @click="exportAllData">
                        导出所有数据
                    </button>
                </view>
            </view>

            <!-- 关于 -->
            <view class="settings-section">
                <view class="section-header">
                    <text class="section-title">关于</text>
                    <text class="section-subtitle">应用信息</text>
                </view>

                <view class="about-item">
                    <text class="about-label">版本</text>
                    <text class="about-value">1.0.0</text>
                </view>

                <view class="about-item">
                    <text class="about-label">开发者</text>
                    <text class="about-value">Wu, Zhe</text>
                </view>

                <view class="about-item">
                    <text class="about-label">许可证</text>
                    <text class="about-value">MIT License</text>
                </view>
            </view>
        </scroll-view>
    </view>
</template>

<script>
import aiService from "@/utils/aiService.js";

export default {
    data() {
        return {
            modelOptions: [
                {
                    id: "deepseek/deepseek-r1-0528:free",
                    name: "DeepSeek Chat: Free",
                },
                {
                    id: "anthropic/claude-sonnet-4",
                    name: "Anthropic: Claude Sonnet 4",
                },
                { id: "openai/gpt-4.1", name: "GPT-4.1" },
                { id: "x-ai/grok-4", name: "Grok 4" },
            ],
            modelIndex: 0,
            settings: {
                apiKey: "",
                apiEndpoint: "https://api.deepseek.com/v1/chat/completions",
                model: "deepseek-chat",
                maxTokens: 2000,
                temperature: 0.7,
                autoScroll: true,
                notifications: true,
                autoSave: true,
                retentionDays: 30,
            },
            apiStatus: {
                available: false,
                message: "未测试",
            },
            retentionOptions: ["7天", "30天", "90天", "永久"],
            retentionIndex: 1,
            safeAreaTop: 10,
            headerHeight: 0,
        };
    },
    onLoad() {
        const sysInfo = uni.getSystemInfoSync();
        // safeArea.top 是安全区顶部距离
        this.safeAreaTop = sysInfo.safeArea.top ? sysInfo.safeArea.top : 10;
        this.loadSettings();
        const idx = this.modelOptions.findIndex(
            (opt) => opt.id === this.settings.model
        );
        this.modelIndex = idx !== -1 ? idx : 0;
    },
    onReady() {
        // #ifdef MP-WEIXIN
        const query = uni.createSelectorQuery().in(this);
        query
            .select(".header")
            .boundingClientRect((data) => {
                if (data) {
                    this.headerHeight = data.height;
                }
            })
            .exec();
        // #endif
    },
    methods: {
        onModelChange(e) {
            this.modelIndex = e.detail.value;
            this.settings.model = this.modelOptions[this.modelIndex].id;
        },
        // 返回上一页
        goBack() {
            uni.navigateBack();
        },

        // 加载设置
        loadSettings() {
            try {
                const saved = uni.getStorageSync("app_settings");
                if (saved) {
                    this.settings = { ...this.settings, ...JSON.parse(saved) };
                }

                // 从AI服务获取当前配置
                const aiConfig = aiService.getConfig();
                this.settings.apiKey = aiConfig.apiKey;
                this.settings.apiEndpoint = aiConfig.apiEndpoint;
                this.settings.model = aiConfig.model;

                // 设置保留天数索引
                const retentionMap = { 7: 0, 30: 1, 90: 2 };
                this.retentionIndex =
                    retentionMap[this.settings.retentionDays] || 1;
            } catch (e) {
                console.error("加载设置失败:", e);
            }
        },

        // 保存设置
        saveSettings() {
            try {
                // 保存到本地存储
                uni.setStorageSync(
                    "app_settings",
                    JSON.stringify(this.settings)
                );

                // 更新AI服务配置
                aiService.setConfig({
                    apiKey: this.settings.apiKey,
                    apiEndpoint: this.settings.apiEndpoint,
                    model: this.settings.model,
                });

                uni.showToast({
                    title: "设置已保存",
                    icon: "success",
                });
            } catch (e) {
                console.error("保存设置失败:", e);
                uni.showToast({
                    title: "保存失败",
                    icon: "none",
                });
            }
        },

        // 测试API连接
        async testAPI() {
            this.apiStatus = { available: false, message: "测试中..." };

            try {
                const status = await aiService.checkAPIStatus();
                this.apiStatus = status;

                uni.showToast({
                    title: status.available ? "连接成功" : "连接失败",
                    icon: status.available ? "success" : "none",
                });
            } catch (error) {
                this.apiStatus = { available: false, message: "测试失败" };
                uni.showToast({
                    title: "测试失败",
                    icon: "none",
                });
            }
        },

        // 滑块事件处理
        onMaxTokensChange(e) {
            this.settings.maxTokens = e.detail.value;
        },

        onTemperatureChange(e) {
            this.settings.temperature = e.detail.value / 100;
        },

        // 开关事件处理
        onAutoScrollChange(e) {
            this.settings.autoScroll = e.detail.value;
        },

        onNotificationsChange(e) {
            this.settings.notifications = e.detail.value;
        },

        onAutoSaveChange(e) {
            this.settings.autoSave = e.detail.value;
        },

        // 保留天数选择
        onRetentionChange(e) {
            this.retentionIndex = e.detail.value;
            const retentionMap = [7, 30, 90, -1];
            this.settings.retentionDays = retentionMap[this.retentionIndex];
        },

        // 清空所有数据
        clearAllData() {
            uni.showModal({
                title: "确认清空",
                content:
                    "这将删除所有聊天记录和设置，此操作不可恢复。确定继续吗？",
                success: (res) => {
                    if (res.confirm) {
                        try {
                            uni.clearStorageSync();
                            this.loadSettings();
                            uni.showToast({
                                title: "数据已清空",
                                icon: "success",
                            });
                        } catch (e) {
                            console.error("清空数据失败:", e);
                            uni.showToast({
                                title: "清空失败",
                                icon: "none",
                            });
                        }
                    }
                },
            });
        },

        // 导出所有数据
        exportAllData() {
            try {
                const data = {
                    settings: this.settings,
                    chatMessages: uni.getStorageSync("chat_messages") || [],
                    exportTime: new Date().toISOString(),
                };

                const exportText = JSON.stringify(data, null, 2);

                uni.setClipboardData({
                    data: exportText,
                    success: () => {
                        uni.showToast({
                            title: "数据已复制到剪贴板",
                            icon: "success",
                        });
                    },
                });
            } catch (e) {
                console.error("导出数据失败:", e);
                uni.showToast({
                    title: "导出失败",
                    icon: "none",
                });
            }
        },
    },
};
</script>

<style>
.settings-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f5f5f5;
}

/* 顶部标题栏 */
.header {
    position: fixed;
    z-index: 10;
    top: 0;
    left: 0;
    width: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20rpx 0;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 30rpx;
}

.back-btn,
.save-btn {
    color: white;
    font-size: 32rpx;
    padding: 10rpx 20rpx;
}

.page-title {
    color: white;
    font-size: 36rpx;
    font-weight: bold;
}

/* 设置内容 */
.settings-content {
    flex: 1;
    padding: 20rpx;
    width: calc(100% - 40rpx);
}

.settings-section {
    background: white;
    border-radius: 20rpx;
    margin-bottom: 30rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.section-header {
    margin-bottom: 30rpx;
}

.section-title {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 10rpx;
}

.section-subtitle {
    font-size: 24rpx;
    color: #666;
}

.setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
}

.setting-item:last-child {
    border-bottom: none;
}

.setting-label {
    font-size: 28rpx;
    color: #333;
    flex: 1;
}

.setting-input {
    flex: 2;
    background: #f8f9fa;
    border: 2rpx solid #e9ecef;
    border-radius: 10rpx;
    padding: 15rpx 20rpx;
    font-size: 26rpx;
}

.setting-input:focus {
    border-color: #667eea;
    background: white;
}

.setting-slider {
    flex: 2;
}

.api-status {
    display: flex;
    align-items: center;
    gap: 20rpx;
    margin-top: 20rpx;
    padding: 20rpx;
    background: #f8f9fa;
    border-radius: 10rpx;
}

.status-label {
    font-size: 26rpx;
    color: #666;
}

.status-text {
    font-size: 26rpx;
    flex: 1;
}

.status-success {
    color: #28a745;
}

.status-error {
    color: #dc3545;
}

.test-btn {
    background: #667eea;
    color: white;
    border: none;
    border-radius: 15rpx;
    padding: 10rpx 20rpx;
    font-size: 24rpx;
}

.picker-display {
    display: flex;
    align-items: center;
    gap: 10rpx;
    background: #f8f9fa;
    border: 2rpx solid #e9ecef;
    border-radius: 10rpx;
    padding: 15rpx 20rpx;
    font-size: 26rpx;
    color: #333;
}

.picker-arrow {
    color: #999;
}

.action-buttons {
    display: flex;
    gap: 20rpx;
    margin-top: 30rpx;
}

.action-btn {
    flex: 1;
    padding: 20rpx;
    border-radius: 15rpx;
    font-size: 26rpx;
    border: none;
    background: #667eea;
    color: white;
}

.action-btn.danger {
    background: #dc3545;
}

.about-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
}

.about-item:last-child {
    border-bottom: none;
}

.about-label {
    font-size: 28rpx;
    color: #333;
}

.about-value {
    font-size: 26rpx;
    color: #666;
}
</style>
