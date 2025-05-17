
export default (request: any) => {
    // 在适当的生命周期钩子中添加事件监听
    onMounted(() => {
        window.addEventListener('ai-request', request || handleAiRequest);
    });

    // 在组件卸载时移除事件监听
    onUnmounted(() => {
        window.removeEventListener('ai-request', request || handleAiRequest);
    });

    // 处理AI请求的函数
    const handleAiRequest = async (event: CustomEvent) => {
        const { data, callback } = event.detail;

        try {
            console.log('收到AI请求:', data);

            // 这里处理AI请求，可以调用API或其他服务
            // 示例：模拟API调用
            const response = await processAiRequest(data);

            // 通过回调函数返回响应
            if (typeof callback === 'function') {
                callback(response);
            }
        } catch (error: any) {
            console.error('处理AI请求失败:', error);
            // 返回错误信息
            if (typeof callback === 'function') {
                callback({ error: '处理请求失败', message: error.message });
            }
        }
    };

    // 处理AI请求的函数（示例）
    const processAiRequest = async (data: any) => {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 500));

        // 构建响应数据格式
        return `\`\`\`json:container_search
{
  "id": "container_search",
  "name": "MlVerticalContainer",
  "slots": {
    "default": {
      "allowComps": [],
      "children": [
        {
          "id": "card_total",
          "name": "ElCard",
          "attrs": {
            "shadow": {
              "type": "string",
              "value": "hover"
            }
          },
          "css": {
            "margin": ["0","0","10","0"],
            "background": {
              "isShow": true,
              "modelValue": "linear-gradient(135deg, #f6d365 0%, #fda085 100%)"
            },
            "color": {
              "isShow": true,
              "modelValue": "#ffffff"
            },
            "height": "120px"
          },
          "slots": {
            "default": {
              "allowComps": [],
              "children": [
                {
                  "id": "total_title",
                  "name": "div",
                  "directives": {
                    "text": {
                      "type": "string",
                      "value": "总订单数"
                    }
                  },
                  "css": {
                    "fontSize": "16px",
                    "fontWeight": "bold",
                    "marginBottom": "10px"
                  }
                },
                {
                  "id": "total_value",
                  "name": "div",
                  "directives": {
                    "text": {
                      "type": "string",
                      "value": "1,234"
                    }
                  },
                  "css": {
                    "fontSize": "24px",
                    "fontWeight": "bold"
                  }
                }
              ]
            }
          }
        },
        {
          "id": "card_pending",
          "name": "ElCard",
          "attrs": {
            "shadow": {
              "type": "string",
              "value": "hover"
            }
          },
          "css": {
            "margin": ["0","0","10","0"],
            "background": {
              "isShow": true,
              "modelValue": "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)"
            },
            "color": {
              "isShow": true,
              "modelValue": "#ffffff"
            },
            "height": "120px"
          },
          "slots": {
            "default": {
              "allowComps": [],
              "children": [
                {
                  "id": "pending_title",
                  "name": "div",
                  "directives": {
                    "text": {
                      "type": "string",
                      "value": "待处理订单"
                    }
                  },
                  "css": {
                    "fontSize": "16px",
                    "fontWeight": "bold",
                    "marginBottom": "10px"
                  }
                },
                {
                  "id": "pending_value",
                  "name": "div",
                  "directives": {
                    "text": {
                      "type": "string",
                      "value": "56"
                    }
                  },
                  "css": {
                    "fontSize": "24px",
                    "fontWeight": "bold"
                  }
                }
              ]
            }
          }
        },
        {
          "id": "card_completed",
          "name": "ElCard",
          "attrs": {
            "shadow": {
              "type": "string",
              "value": "hover"
            }
          },
          "css": {
            "margin": ["0","0","10","0"],
            "background": {
              "isShow": true,
              "modelValue": "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)"
            },
            "color": {
              "isShow": true,
              "modelValue": "#ffffff"
            },
            "height": "120px"
          },
          "slots": {
            "default": {
              "allowComps": [],
              "children": [
                {
                  "id": "completed_title",
                  "name": "div",
                  "directives": {
                    "text": {
                      "type": "string",
                      "value": "已完成订单"
                    }
                  },
                  "css": {
                    "fontSize": "16px",
                    "fontWeight": "bold",
                    "marginBottom": "10px"
                  }
                },
                {
                  "id": "completed_value",
                  "name": "div",
                  "directives": {
                    "text": {
                      "type": "string",
                      "value": "987"
                    }
                  },
                  "css": {
                    "fontSize": "24px",
                    "fontWeight": "bold"
                  }
                }
              ]
            }
          }
        },
        {
          "id": "card_canceled",
          "name": "ElCard",
          "attrs": {
            "shadow": {
              "type": "string",
              "value": "hover"
            }
          },
          "css": {
            "margin": ["0","0","10","0"],
            "background": {
              "isShow": true,
              "modelValue": "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)"
            },
            "color": {
              "isShow": true,
              "modelValue": "#ffffff"
            },
            "height": "120px"
          },
          "slots": {
            "default": {
              "allowComps": [],
              "children": [
                {
                  "id": "canceled_title",
                  "name": "div",
                  "directives": {
                    "text": {
                      "type": "string",
                      "value": "已取消订单"
                    }
                  },
                  "css": {
                    "fontSize": "16px",
                    "fontWeight": "bold",
                    "marginBottom": "10px"
                  }
                },
                {
                  "id": "canceled_value",
                  "name": "div",
                  "directives": {
                    "text": {
                      "type": "string",
                      "value": "45"
                    }
                  },
                  "css": {
                    "fontSize": "24px",
                    "fontWeight": "bold"
                  }
                }
              ]
            }
          }
        }
      ]
    }
  }
}
\`\`\`

## 修改解释

1. **修改内容及原因**：
   - 为每个卡片组件添加了slots.default配置，在其中嵌套了标题和数值展示的div组件
   - 为每个卡片设置了固定高度(120px)以保持统一美观
   - 为标题和数值设置了不同的字体大小和粗细，增强视觉层次
   - 保留了原有的渐变背景色，保持多彩卡片的设计意图
   - 使用directives.text来设置文本内容，符合无界魔方设计器规范

2. **解决问题**：
   - 通过slots嵌套实现了更丰富的卡片内容展示，不仅显示标题还能展示具体数值
   - 统一的样式设置使卡片组看起来更协调专业
   - 数值使用大字号突出显示，便于快速识别关键数据

3. **可能影响**：
   - 固定高度可能在不同尺寸屏幕上需要调整
   - 数值需要后端数据绑定才能真正动态显示

4. **注意事项**：
   - 实际使用时需要将数值部分改为动态数据绑定
   - 可根据实际需求调整卡片高度和字体大小

## 修改内容总结

| 修改项 | 修改前 | 修改后 | 修改原因 |
| ----- | ----- | ----- | ------- |
| 卡片内容 | 只有简单文本 | 添加标题和数值分层展示 | 增强数据展示效果 |
| 卡片高度 | 未设置 | 固定120px | 保持卡片大小一致 |
| 文本样式 | 统一设置 | 标题和数值不同样式 | 增强视觉层次感 |
| slots配置 | 简单文本指令 | 嵌套div组件结构 | 符合设计器规范，便于扩展 |`
    };
}