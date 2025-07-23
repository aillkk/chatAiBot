// AI服务类
export const apiUrl = "https://openrouter.ai/api/v1/chat/completions";
export const openRouterApiKey = "";

class AIService {
    constructor() {
        // 这里可以配置你的AI API密钥和端点
        this.apiKey = openRouterApiKey; // 需要用户自己配置
        this.apiEndpoint = apiUrl; // 示例端点
        this.model = "deepseek/deepseek-r1-0528:free";
    }

    // 发送消息到AI API
    async sendMessage(message, conversationHistory = []) {
        try {
            // 如果没有配置API密钥，返回模拟响应
            if (!this.apiKey) {
                return await this.getMockResponse(message);
            }

            const messages = this.formatMessages(conversationHistory, message);

            const response = await uni.request({
                url: this.apiEndpoint,
                method: "POST",
                header: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.apiKey}`,
                },
                data: {
                    model: this.model,
                    messages: messages,
                    max_tokens: 2000,
                    temperature: 0.7,
                    stream: false,
                },
            });

            if (response.statusCode === 200) {
                return response.data.choices[0].message.content;
            } else {
                throw new Error(`API请求失败: ${response.statusCode}`);
            }
        } catch (error) {
            console.error("AI API调用失败:", error);
            // 如果API调用失败，返回模拟响应
            return await this.getMockResponse(message);
        }
    }

    // 格式化消息为API格式
    formatMessages(history, currentMessage) {
        const messages = [];

        // 添加历史消息
        history.forEach((msg) => {
            messages.push({
                role: msg.role,
                content: msg.content,
            });
        });

        // 添加当前消息
        messages.push({
            role: "user",
            content: currentMessage,
        });

        return messages;
    }

    // 获取模拟响应（当没有配置API时使用）
    async getMockResponse(message) {
        // 模拟网络延迟
        await new Promise((resolve) =>
            setTimeout(resolve, 1000 + Math.random() * 2000)
        );

        const responses = {
            python: "我可以帮您编写Python代码。请告诉我您想要实现什么功能？",
            javascript: "JavaScript是一个强大的编程语言。您需要什么帮助？",
            机器学习:
                "机器学习是人工智能的一个重要分支。它通过算法让计算机从数据中学习模式。",
            优化: "代码优化是一个重要的技能。请分享您的代码，我可以帮您分析并提供改进建议。",
            算法: "算法是解决问题的步骤和方法。您想了解哪种算法？",
            数据结构:
                "数据结构是组织和存储数据的方式。常见的有数组、链表、栈、队列、树、图等。",
            数据库: "数据库是存储和管理数据的系统。您想了解哪种数据库？",
            web开发: "Web开发包括前端和后端开发。您对哪个方面更感兴趣？",
            移动开发:
                "移动应用开发可以使用原生开发或跨平台框架。您想了解哪种方式？",
            人工智能:
                "人工智能是让机器模拟人类智能的技术。包括机器学习、深度学习、自然语言处理等。",
        };

        // 根据关键词匹配响应
        for (const [keyword, response] of Object.entries(responses)) {
            if (message.toLowerCase().includes(keyword.toLowerCase())) {
                return (
                    response +
                    "\n\n这是一个模拟的AI响应。要使用真实的AI功能，请在配置中设置您的API密钥。"
                );
            }
        }

        // 默认响应
        const defaultResponses = [
            "我理解您的问题。让我为您详细解答一下...",
            "这是一个很好的问题！根据我的理解...",
            "我可以帮您解决这个问题。首先，我们需要...",
            "让我为您分析一下这个情况...",
            "基于您提供的信息，我建议...",
            "这是一个有趣的问题。让我从几个角度来分析...",
            "我明白您的需求。这里有几种可能的解决方案...",
            "让我为您提供一些有用的信息和建议...",
        ];

        const randomResponse =
            defaultResponses[
                Math.floor(Math.random() * defaultResponses.length)
            ];
        return (
            randomResponse +
            "\n\n这是一个模拟的AI响应。要使用真实的AI功能，请在配置中设置您的API密钥。"
        );
    }

    // 设置API配置
    setConfig(config) {
        if (config.apiKey) {
            this.apiKey = config.apiKey;
        }
        if (config.apiEndpoint) {
            this.apiEndpoint = config.apiEndpoint;
        }
        if (config.model) {
            this.model = config.model;
        }
    }

    // 获取当前配置
    getConfig() {
        return {
            apiKey: this.apiKey,
            apiEndpoint: this.apiEndpoint,
            model: this.model,
        };
    }

    // 检查API是否可用
    async checkAPIStatus() {
        if (!this.apiKey) {
            return {
                available: false,
                message: "未配置API密钥",
            };
        }

        try {
            const response = await uni.request({
                url: this.apiEndpoint,
                method: "POST",
                header: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.apiKey}`,
                },
                data: {
                    model: this.model,
                    messages: [{ role: "user", content: "test" }],
                    max_tokens: 10,
                },
            });

            return {
                available: response.statusCode === 200,
                message:
                    response.statusCode === 200
                        ? "API连接正常"
                        : `API请求失败: ${response.statusCode}`,
            };
        } catch (error) {
            return {
                available: false,
                message: `API连接失败: ${error.message}`,
            };
        }
    }
}

// 创建单例实例
const aiService = new AIService();

export default aiService;
