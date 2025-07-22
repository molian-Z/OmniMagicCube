# AI 模块

这个目录包含了重构后的AI代码助手相关模块，提供了模块化、可维护的AI功能实现。

## 模块结构

```
ai/
├── index.ts              # 统一导出入口
├── ai-assistant.ts       # 核心AI助手类
├── cache-manager.ts      # 缓存管理
├── request-manager.ts    # 请求管理
├── response-parser.ts    # 响应解析
├── prompt-manager.ts     # 提示词管理
├── readonly-validator.ts # 只读区域验证
└── README.md            # 本文档
```

## 核心模块

### AICodeAssistant
主要的AI助手类，提供以下功能：
- 代码补全建议
- 代码分析
- 错误修复建议
- 代码优化
- 代码重构
- AI问答

### CacheManager
管理AI请求的缓存，提高响应速度：
- LRU缓存策略
- 自动过期清理
- 内存使用优化

### RequestManager
处理AI API请求：
- 请求队列管理
- 速率限制
- 错误重试
- 超时处理

### ResponseParser
解析AI API响应：
- 多种响应格式支持
- 错误处理
- 数据验证

### PromptManager
管理AI提示词：
- 系统提示词模板
- 上下文增强
- 只读区域约束

### ReadonlyValidator
验证只读区域：
- 区域完整性检查
- 自动修复
- 冲突解决

## 使用方法

### 基本使用

```typescript
import { AICodeAssistant } from './ai'

const aiAssistant = new AICodeAssistant({
  apiKey: 'your-api-key',
  model: 'gpt-4',
  language: 'typescript'
})

// 获取代码补全
const completions = await aiAssistant.getCompletions({
  code: 'function hello',
  position: { line: 0, column: 13 },
  language: 'typescript'
})
```

### 独立使用模块

```typescript
import { CacheManager, RequestManager } from './ai'

// 使用缓存管理器
const cache = new CacheManager()
cache.set('key', 'value', 3600) // 缓存1小时

// 使用请求管理器
const requestManager = new RequestManager(config)
const response = await requestManager.makeRequest(prompt, context)
```

## 设计原则

1. **单一职责**: 每个模块只负责一个特定功能
2. **松耦合**: 模块间依赖最小化
3. **高内聚**: 相关功能集中在同一模块
4. **可测试**: 每个模块都可以独立测试
5. **可扩展**: 易于添加新功能和修改现有功能

## 性能优化

- **缓存策略**: 智能缓存减少API调用
- **请求合并**: 相似请求自动合并
- **懒加载**: 按需加载模块
- **内存管理**: 自动清理过期数据

## 错误处理

- **优雅降级**: API失败时提供基础功能
- **重试机制**: 自动重试失败的请求
- **错误日志**: 详细的错误信息记录
- **用户友好**: 向用户显示易懂的错误信息