# DeepSeek Chat - AI 聊天应用

一个基于 uni-app 开发的 AI 聊天应用，提供类似 DeepSeek 的聊天体验。

## 功能特性

### 🚀 核心功能

- **智能对话**: 支持与 AI 助手进行自然语言对话
- **消息历史**: 自动保存聊天记录，支持历史消息查看
- **实时响应**: 流畅的对话体验，支持打字机效果
- **多平台支持**: 基于 uni-app，支持 H5、小程序、App 等多平台

### 🎨 用户界面

- **现代化设计**: 采用渐变色彩和圆角设计
- **响应式布局**: 适配不同屏幕尺寸
- **流畅动画**: 消息发送和接收的平滑动画效果
- **深色友好**: 良好的对比度和可读性

### ⚙️ 设置功能

- **API 配置**: 支持自定义 AI API 密钥和端点
- **聊天设置**: 可调节回复长度、创造性等参数
- **数据管理**: 支持聊天记录导出和清空
- **个性化**: 自动滚动、消息提醒等个性化设置

### 🔧 实用工具

- **消息操作**: 复制消息内容、重新生成回复
- **快捷建议**: 预设常用问题，一键发送
- **导出功能**: 支持聊天记录导出为文本
- **状态显示**: 实时显示 API 连接状态

## 技术架构

### 前端框架

- **uni-app**: 跨平台开发框架
- **Vue.js**: 响应式前端框架
- **uni-ui**: 统一的 UI 组件库

### 核心模块

- **AI 服务模块** (`src/utils/aiService.js`): 处理 AI API 通信
- **聊天界面** (`src/pages/index/index.vue`): 主聊天页面
- **设置页面** (`src/pages/settings/settings.vue`): 应用设置

### 数据存储

- **本地存储**: 使用 uni-app 的 Storage API
- **消息持久化**: 自动保存聊天记录
- **设置同步**: 用户偏好设置本地存储

## 安装和运行

### 环境要求

- Node.js 14.0+
- npm 或 yarn
- HBuilderX (推荐) 或 VS Code

### 安装步骤

1. **克隆项目**

```bash
git clone <repository-url>
cd chatbot-uni
```

2. **安装依赖**

```bash
npm install
```

3. **运行项目**

开发模式 (H5):

```bash
npm run dev:h5
```

开发模式 (微信小程序):

```bash
npm run dev:mp-weixin
```

4. **构建项目**

构建 H5 版本:

```bash
npm run build:h5
```

构建微信小程序:

```bash
npm run build:mp-weixin
```

## 配置说明

### AI API 配置

1. 打开应用，点击右上角的设置按钮 ⚙️
2. 在"AI API 配置"部分输入您的 API 信息：

   - **API 密钥**: 您的 AI 服务提供商 API 密钥
   - **API 端点**: API 服务地址 (默认: https://api.deepseek.com/v1/chat/completions)
   - **模型名称**: 使用的 AI 模型名称 (默认: deepseek-chat)

3. 点击"测试连接"验证配置是否正确
4. 点击"保存"应用设置

### 支持的 AI 服务

应用默认配置为 DeepSeek API，但也支持其他兼容 OpenAI API 格式的服务：

- **DeepSeek**: https://api.deepseek.com/v1/chat/completions
- **OpenAI**: https://api.openai.com/v1/chat/completions
- **Azure OpenAI**: https://your-resource.openai.azure.com/openai/deployments/your-deployment/chat/completions
- **其他兼容服务**: 任何支持 OpenAI API 格式的服务

## 使用指南

### 开始对话

1. **首次使用**: 应用会显示欢迎界面和预设问题建议
2. **发送消息**: 在底部输入框输入您的问题
3. **快捷建议**: 点击预设问题快速开始对话
4. **等待回复**: AI 会生成回复并显示在对话中

### 消息操作

- **复制消息**: 点击 AI 回复下方的 📋 图标复制内容
- **重新生成**: 点击 🔄 图标重新生成 AI 回复
- **清空聊天**: 点击顶部"清空"按钮清除所有记录
- **导出聊天**: 点击顶部"导出"按钮导出聊天记录

### 个性化设置

在设置页面可以调整：

- **回复长度**: 控制 AI 回复的最大长度 (500-4000 字符)
- **创造性**: 调节 AI 回复的创造性程度 (0-2)
- **自动滚动**: 新消息时自动滚动到底部
- **消息提醒**: 启用消息通知
- **数据保留**: 设置聊天记录保留时间

## 开发说明

### 项目结构

```
chatbot-uni/
├── src/
│   ├── pages/
│   │   ├── index/
│   │   │   └── index.vue          # 主聊天页面
│   │   └── settings/
│   │       └── settings.vue       # 设置页面
│   ├── utils/
│   │   └── aiService.js           # AI服务模块
│   ├── App.vue                    # 应用入口
│   ├── main.js                    # 主入口文件
│   ├── pages.json                 # 页面配置
│   └── manifest.json              # 应用配置
├── public/
├── package.json
└── README.md
```

### 自定义开发

#### 添加新的 AI 服务

1. 修改 `src/utils/aiService.js` 中的配置
2. 更新 API 端点和认证方式
3. 调整消息格式处理逻辑

#### 扩展功能

1. **新页面**: 在 `src/pages/` 下创建新页面
2. **新组件**: 创建可复用的 Vue 组件
3. **新服务**: 在 `src/utils/` 下添加新的服务模块

#### 样式定制

- 主色调: `#667eea` (蓝色渐变)
- 辅助色: `#764ba2` (紫色渐变)
- 背景色: `#f5f5f5` (浅灰色)

## 常见问题

### Q: 如何获取 API 密钥？

A: 访问您选择的 AI 服务提供商官网，注册账号并获取 API 密钥。

### Q: 支持哪些平台？

A: 基于 uni-app 开发，支持 H5、微信小程序、支付宝小程序、App 等多平台。

### Q: 聊天记录会丢失吗？

A: 应用会自动保存聊天记录到本地存储，除非手动清空或卸载应用。

### Q: 可以离线使用吗？

A: 需要网络连接才能与 AI 服务通信，但可以查看历史聊天记录。

## 许可证

MIT License - 详见 LICENSE 文件

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 更新日志

### v1.0.0

- 初始版本发布
- 支持基本的 AI 对话功能
- 实现消息历史保存
- 添加设置页面和 API 配置
- 支持多平台部署
