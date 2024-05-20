/**
 * UI组件库映射表
 * 输入项目中使用的UI方便框架内部解析
 */

export const useUI = ref<string>("element-plus")
export const debug = ref<boolean>(false)
export const usePrefix = ref<string | null>(null);
export const UIData:IConfig.IData[] = reactive([{
  name: 'tiny-vue',
  prefix: 'Tiny',
  icon: "tinyvue",
  docUrl:"https://opentiny.design/tiny-vue/zh-CN/os-theme/overview",
  removeAttrs: ["tiny_template", "tiny_renderless", "tiny_mode", "tiny_mode_root", "tiny_theme", "tiny_chart_theme"],
  compMapping: {
    "Button": {
      "theme": "type",
      "text": {
        "type": "text"
      },
      "size": {
        "size": "mini"
      }
    },
    "Tag": {
      "size": {
        "size": "mini"
      }
    },
    "Input": {
      "prefixIcon": "prefix",
      "size": {
        "size": "mini"
      }
    },
    "InputNumber": {
      "component": "Numeric",
      "size": {
        "size": "mini"
      }
    },
    "Select": {
      "size": {
        "size": "mini"
      },
      "options": (data: any[]) => {
        return {
          default: data.map((item: {
            [x: string]: any; isGroup: any; label: any; children: any[];
          }) => {
            if (item.isGroup) {
              return {
                _isSlot: true,
                tag: 'TinyOptionGroup',
                attrs: {
                  label: item.label
                },
                slots: item && item.children.map((fItem: any) => {
                  return {
                    _isSlot: true,
                    tag: "TinyOption",
                    attrs: {
                      disabled: fItem.disabled,
                      label: fItem.label,
                      value: fItem.value
                    }
                  }
                })
              }
            } else {
              return {
                _isSlot: true,
                tag: "TinyOption",
                attrs: {
                  disabled: item.disabled,
                  label: item.label,
                  value: item.value
                }
              }
            }
          })
        }
      }
    },
    "Switch": {
      "size": {
        "size": "mini"
      }
    },
    "Tooltip": {},
    "Popup": {
      "component": "Popover",
      "default": "reference",
      "content": "default"
    },
    "RadioGroup": {
      "size": {
        "size": "mini"
      }
    },
    "RadioButton": {
      "value": "label",
      "size": {
        "size": "mini"
      }
    },
    "Cascader": {
      "optionItems": "options",
      "size": {
        "size": "mini",
        "separator": "."
      },
      "checkStrictly": {
        "props": {
          "checkStrictly": true
        }
      }
    },
    "CascaderPanel": {
      "optionItems": "options",
      "size": {
        "size": "mini",
        "separator": "."
      },
      "checkStrictly": {
        "props": {
          "checkStrictly": true
        }
      }
    },
    "Dropdown": {
      "optionItems": (data: any) => {
        return {
          dropdown: {
            _isSlot: true,
            tag: 'TinyDropdownMenu',
            attrs: {},
            slots: data && data.map((item: any) => {
              return {
                _isSlot: true,
                tag: "TinyDropdownItem",
                attrs: {
                  disabled: item.disabled,
                  onClick: item.onclick,
                  name: item.value
                },
                slots: item.label
              }
            })
          }
        }
      }
    },
    "Dialog": {
      "component": "DialogBox",

    }
  }
}, {
  name: 'arco',
  prefix: 'A',
  icon: "Arco",
  docUrl:"https://arco.design/vue/docs/pro/start",
  compMapping: {
    "Button": {
      "theme": (text: string) => {
        if (text !== 'default') {
          return {
            "type": text
          }
        } else {
          return {}
        }
      },
      "text": {
        "type": "text"
      }
    },
    "Tag": {
      "theme": (text: string) => {
        return {
          color: text === 'primary' && "arcoblue" || text === 'default' && "gray" || "orangered"
        }
      }
    },
    "Input": {
      "prefixIcon": "prefix",
      "onEnter": {}
    },
    "InputNumber": {},
    "Select": {
      "size": { // 设置大小的同时设置组件的props
        "size": "small",
        "fieldNames": { value: 'value', label: 'label' }
      },
    },
    "Switch": {},
    "Tooltip": {
      "content": "content"
    },
    "Popup": {
      "component": "Popover",
      "default": "default",
      "content": "content",
      "trigger": {
        "trigger": "click",
      }
    },
    "RadioGroup": {
      "size": {
        "type": "button"
      }
    },
    "RadioButton": {
      "component": "Radio",
      "value": "value"
    },
    "Cascader": {
      "optionItems": "options",
      "checkStrictly": "check-strictly",
      "size": {
        "size": "small",
        "path-mode": true,
        "allow-clear": true
      }
    },
    "CascaderPanel": {
      "optionItems": "options",
      "checkStrictly": "check-strictly",
      "size": {
        "size": "small",
        "path-mode": true,
        "allow-clear": true,
        "style": "border-width: 0px;box-shadow: none;"
      }
    },
    "Dropdown": {
      "optionItems": (data: any) => {
        const prefix = usePrefix || UIData.find(item => item.name === 'arco')
        return {
          content: {
            _isSlot: true,
            tag: prefix + 'Dgroup',
            attrs: {},
            slots: data && data.map((item: any) => {

              return {
                _isSlot: true,
                tag: prefix + "Doption",
                attrs: {
                  disabled: item.disabled,
                  onClick: item.onclick,
                  command: item.value
                },
                slots: item.label
              }
            })
          }
        }
      }
    },
    "Dialog": {
      "component": "Modal",
      "destroyOnClose": "unmount-on-close",
      "appendToBody": "render-to-body",
      "header": "title"
    }
  }
}, {
  name: 'tdesign-vue-next',
  prefix: 'T',
  icon: "TDesign",
  docUrl:"https://tdesign.tencent.com/vue-next/overview",
  compMapping: {
    "Button": {
      "theme": "theme",
      "text": {
        "variant": "text"
      },
    },
    "Tag": {},
    "Input": {
      "prefixIcon": "prefixIcon",
      "onKeyup": {}
    },
    "InputNumber": {},
    "Select": {},
    "Switch": {},
    "Tooltip": {
      "content": {
        "content": "content",
        "destroyOnClose": true
      }
    },
    "Popup": {
      "component": "Popup",
      "default": "default",
      "content": "content"
    },
    "RadioGroup": {},
    "RadioButton": {
      "value": "label"
    },
    "Cascader": {
      "optionItems": "options"
    },
    "CascaderPanel": {
      "optionItems": "options"
    },
    "Dropdown": {
      "optionItems": (data: any) => {
        return {
          "options": data.map((item: any) => {
            return {
              content: item.label,
              value: item.value,
              disabled: item.disabled,
              onClick: item.onclick
            }
          })
        }
      }
    },
    "Dialog": {
      "appendToBody": {
        "attach": "body"
      }
    }
  }
}, {
  name: 'element-plus',
  prefix: 'El',
  icon: "ElementPlus",
  docUrl:"https://element-plus.org/zh-CN/",
  compMapping: {
    "Button": {
      "theme": "type",
      "text": "text"
    },
    "Tag": {
      "theme": "type"
    },
    "Input": {
      "prefixIcon": "prefix",
      "onEnter": {},
      "textarea": {
        "type": "textarea"
      }
    },
    "InputNumber": {},
    "Select": {
      "component": "SelectV2", // 切换组件
      "size": { // 设置大小的同时设置组件的props
        "size": "small",
        "props": {
          options: 'children'
        }
      }
    },
    "Switch": {},
    "Tooltip": {
      "content": "content"
    },
    "Popup": {
      "component": "Popover",
      "default": "reference",
      "content": "default",
      "trigger": {
        "trigger": "click",
        "width": "auto"
      }
    },
    "RadioGroup": {},
    "RadioButton": {
      "value": "label"
    },
    "Cascader": {
      "optionItems": "options",
      "checkStrictly": {
        "props": {
          "checkStrictly": true,
        }
      }
    },
    "CascaderPanel": {
      "optionItems": "options",
      "checkStrictly": {
        "props": {
          "checkStrictly": true,
        }
      }
    },
    "Dropdown": {
      "optionItems": (data: any) => {
        return {
          dropdown: {
            _isSlot: true,
            tag: 'ElDropdownMenu',
            attrs: {},
            slots: data && data.map((item: any) => {
              return {
                _isSlot: true,
                tag: "ElDropdownItem",
                attrs: {
                  disabled: item.disabled,
                  onClick: item.onclick,
                  command: item.value
                },
                slots: item.label
              }
            })
          }
        }
      }
    },
    "Dialog": {
      "visible": "modelValue",
      "onUpdate:visible": "onUpdate:modelValue",
      "destroyOnClose": "destroy-on-close",
      "appendToBody": "append-to-body",
      "header": "title"
    }
  }
}, {
  name: 'ant-design-vue',
  prefix: 'A',
  icon: "Ant",
  docUrl:"https://www.antdv.com/components/overview",
  compMapping: {
    "Button": {
      "theme": (type: string) => {
        if (type === 'warning') {
          return {
            type: 'primary',
            danger: true
          }
        }
        return {
          type: 'primary'
        }
      },
      "text": {
        "type": "link"
      },
    },
    "Tag": {},
    "Input": {
      "prefixIcon": "prefix",
      "modelValue": "value",
      "onUpdate:modelValue": "onUpdate:value"
    },
    "InputNumber": {
      "modelValue": 'value',
      "onUpdate:modelValue": "onUpdate:value",
    },
    "Select": {
      "modelValue": "value",
      "onUpdate:modelValue": "onUpdate:value"
    },
    "Switch": {
      "modelValue": 'value',
      "onUpdate:modelValue": "onUpdate:value",
    },
    "Tooltip": {
      "content": "title"
    },
    "Popup": {
      "component": "Popover"
    },
    "RadioGroup": {
      "modelValue": 'value',
      "onUpdate:modelValue": "onUpdate:value",
      "variant": {
        "buttonStyle": "solid"
      }
    },
    "RadioButton": {
      "value": "label"
    },
    "Cascader": {
      "optionItems": "options",
      "valueType": (data: string) => {
        if (data === 'full') {
          return {
            "changeOnSelect": true
          }
        }
        return {}
      },
      "modelValue": 'value',
      "onUpdate:modelValue": "onUpdate:value",
    },
    "CascaderPanel": {
      "component": "Cascader",
      "optionItems": "options",
      "valueType": (data: string) => {
        if (data === 'full') {
          return {
            "changeOnSelect": true
          }
        }
        return {}
      },
      "modelValue": 'value',
      "onUpdate:modelValue": "onUpdate:value",
    },
    "Dropdown": {
      "optionItems": (data: any) => {
        return {
          overlay: {
            _isSlot: true,
            tag: 'AMenu',
            attrs: {},
            slots: data && data.map((item: any) => {
              return {
                _isSlot: true,
                tag: "AMenuItem",
                attrs: {
                  disabled: item.disabled,
                  onClick: item.onclick,
                  command: item.value
                },
                slots: item.label
              }
            })
          }
        }
      }
    },
    "Dialog": {
      "component": "Modal",
      "appendToBody": {
        "getContainer": () => document.body,
        "zIndex": 1001
      },
      "header": "title",
      "visible": "open",
      "onUpdate:visible": "onUpdate:open"
    }
  }
}, {
  name: 'naive',
  prefix: 'N',
  icon: "naive",
  docUrl:"https://www.naiveui.com/zh-CN/os-theme",
  compMapping: {
    "Button": {
      "theme": "type",
      "text": "text"
    },
    "Tag": {
      "theme": "type"
    },
    "Input": {
      "prefixIcon": "prefix",
      "onEnter": {},
      "modelValue": 'value',
      "onUpdate:modelValue": "onUpdate:value",
    },
    "InputNumber": {
      "modelValue": 'value',
      "onUpdate:modelValue": "onUpdate:value",
    },
    "Select": {
      "modelValue": "value",
      "onUpdate:modelValue": "onUpdate:value",
      "size": {
        "size": "small",
        "virtualScroll": false
      }
    },
    "Switch": {
      "modelValue": 'value',
      "onUpdate:modelValue": "onUpdate:value",
    },
    "Tooltip": {
      "default": "trigger",
      "content": (text: any) => {
        return {
          "default": {
            _isSlot: true,
            tag: "NEllipsis",
            attrs: {},
            slots: text
          }
        }
      },
    },
    "Popup": {
      "component": "Popover",
      "default": "trigger",
      "content": "default",
      "trigger": {
        "trigger": "click",
        "style": "min-width:180px;"
      },
      "visible": "show",
      "onUpdate:visible": "onUpdate:show"
    },
    "RadioGroup": {
      "modelValue": 'value',
      "onUpdate:modelValue": "onUpdate:value",
    },
    "RadioButton": {
      "value": "label"
    },
    "Cascader": {
      "optionItems": "options",
      "checkStrictly": {
        "checkStrategy": "all",
        "separator": ".",
        "virtualScroll": false,
        "cascade": false
      },
      "modelValue": (value: string[]) => {
        return {
          "value": value[value.length - 1]
        }
      },
      "onUpdate:modelValue": "onUpdate:value",
    },
    "CascaderPanel": {
      "component": "Cascader",
      "optionItems": "options",
      "checkStrictly": {
        "checkStrategy": "all",
        "separator": ".",
        "virtualScroll": false,
        "cascade": false
      },
      "modelValue": (value: string[]) => {
        return {
          "value": value[value.length - 1]
        }
      },
      "onUpdate:modelValue": "onUpdate:value",
    },
    "Dropdown": {
      "optionItems": (data: any[]) => {
        return {
          "options": data.map((item: { label: any; value: any; disabled: any; onclick: any; }) => {
            return {
              label: item.label,
              key: item.value,
              disabled: item.disabled,
              props: {
                onClick: item.onclick,
              }
            }
          })
        }
      }
    },
    "Dialog": {
      "component": "Modal",
      "visible": "show",
      "onUpdate:visible": "onUpdate:show",
      "destroyOnClose": "destroy-on-close",
      "appendToBody": {
        "preset": "dialog",
        "style": {
          "width": "80vw"
        },
      },
      "header": "title",
      "footer": "action"
    }
  }
}, {
  name: 'vexip',
  prefix: 'V',
  icon: "vexip",
  docUrl:"https://www.vexipui.com/zh-CN/",
  compMapping: {
    "Button": {
      "theme": "type",
      "text": "text"
    },
    "Tag": {
      "theme": "type"
    },
    "Input": {
      "prefixIcon": "prefix",
      "onEnter": {},
      "modelValue": "value",
      "onUpdate:modelValue": "onUpdate:value"
    },
    "InputNumber": {
      "component": "NumberInput",
      "modelValue": "value",
      "onUpdate:modelValue": "onUpdate:value"
    },
    "Select": {
      "size": { // 设置大小的同时设置组件的props
        "size": "small",
        "props": {
          options: 'children'
        },
        "transfer": "body"
      },
      "modelValue": "value",
      "onUpdate:modelValue": "onUpdate:value"
    },
    "Switch": {
      "modelValue": "value",
      "onUpdate:modelValue": "onUpdate:value"
    },
    "Tooltip": {
      "content": (text: string) => {
        return {
          "default": {
            _isSlot: true,
            tag: "NEllipsis",
            attrs: {},
            slots: text
          }
        }
      },
      "default": "trigger"
    },
    "Popup": {
      "component": "Tooltip",
      "default": "trigger",
      "content": "default",
      "trigger": {
        "trigger": "click",
        "transfer": true
      }
    },
    "RadioGroup": {
      "size": {
        "size": "small",
        "shape": "button-group",
      },
      "modelValue": "value",
      "onUpdate:modelValue": "onUpdate:value"
    },
    "RadioButton": {
      "component": "Radio",
      "value": "label"
    },
    "Cascader": {
      "optionItems": "options",
      "checkStrictly": {
        "clearable": true,
        "noCascaded": true
      },
      "modelValue": "value",
      "onUpdate:modelValue": "onUpdate:value"
    },
    "CascaderPanel": {
      "component": "Cascader",
      "optionItems": "options",
      "checkStrictly": {
        "clearable": true,
        "noCascaded": true
      },
      "modelValue": "value",
      "onUpdate:modelValue": "onUpdate:value"
    },
    "Dropdown": {
      "optionItems": (data: any) => {
        return {
          drop: {
            _isSlot: true,
            tag: 'VDropdownList',
            attrs: {},
            slots: data && data.map((item: any) => {
              return {
                _isSlot: true,
                tag: "VDropdownItem",
                attrs: {
                  disabled: item.disabled,
                  onClick: item.onclick,
                  command: item.value
                },
                slots: item.label
              }
            })
          }
        }
      }
    },
    "Dialog": {
      "component": "Modal",
      "visible": "active",
      "onUpdate:visible": "onUpdate:active",
      "destroyOnClose": {
        "auto-remove": true,
        "undivided": true
      },
      "appendToBody": {
        "transfer": true
      },
      "header": "title"
    }
  }
}])