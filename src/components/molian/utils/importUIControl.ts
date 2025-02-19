// 改用render语法
import {
  defineComponent,
  h,
  computed,
} from 'vue'

interface Slot {
    slots: any;
    attrs: any;
    tag: string;
  }
  
  interface ComponentAttrs {
    [key: string]: any;
  }
  
  interface SlotMap {
    [key: string]: () => any;
  }
  
  interface RenderSlot {
    slots?: RenderSlot | RenderSlot[] | (() => any);
    attrs?: Record<string, any>;
    tag: string;
  }
  
  interface ComponentMap {
    [key: string]: {
      comp: string | Component<any>;
    };
  }
  
  /**
   * 创建一个渲染函数
   * 
   * 此函数用于生成一个虚拟节点（VNode），可以根据不同的输入类型来处理渲染逻辑
   * 它允许灵活地定义和渲染组件的结构，支持数组、对象、函数和字符串作为渲染输入
   * 
   * @param slots - 渲染槽，可以是RenderSlot类型、RenderSlot数组、函数或字符串
   * @param attrs - 组件的属性，以键值对形式表示
   * @param tag - 组件的标签，用于在comps中查找对应的组件
   * @param comps - 组件映射，用于查找和创建组件实例
   * @returns 返回一个VNode，代表渲染的组件
   */
  function createRender(
    slots: RenderSlot | RenderSlot[] | (() => any) | string,
    attrs: Record<string, any>,
    tag: string,
    comps: ComponentMap
  ): VNode {
    /**
     * 处理渲染槽的数据
     * 
     * 此函数根据输入的slotData类型，递归地处理和转换渲染槽数据
     * 它支持数组、对象、函数和字符串作为输入，并根据不同的类型进行相应的处理
     * 
     * @param slotData - 渲染槽数据，可以是RenderSlot类型、RenderSlot数组、函数或字符串
     * @returns 返回处理后的渲染结果，具体类型取决于输入
     */
    const processSlots = (slotData: typeof slots) => {
      // 如果是数组，则遍历数组中的每一项，并递归调用createRender函数
      if (Array.isArray(slotData)) {
        return slotData.map(item => createRender(item.slots, item.attrs, item.tag, comps));
      }
      
      // 如果是非空对象，则递归调用createRender函数处理该对象
      if (typeof slotData === 'object' && slotData !== null) {
        return createRender(slotData.slots, slotData.attrs, slotData.tag, comps);
      }
      
      // 如果是函数，则直接调用该函数
      if (typeof slotData === 'function') {
        return slotData();
      }
      
      // 如果是字符串或不支持的类型，则返回一个渲染该字符串的函数
      return () => slotData;
    };
    
    // 使用处理后的slots数据，结合组件的tag和attrs，调用h函数生成VNode
    return h(comps[tag], attrs, processSlots(slots));
  }
/**
 * 创建一个控制组件的工厂函数
 * 
 * @param prefix 组件前缀，用于构建组件名称
 * @param compName 组件名称，与前缀组合以查找组件
 * @param newAttrs 新的属性对象，用于定义或重写组件属性
 * @param app 应用实例，用于访问应用上下文中的组件
 * @returns 返回一个定义好的组件
 */
export const createControl = function (
  prefix: string,
  compName: string,
  newAttrs: Record<string, string | object | Function>,
  app?: any
) {
  return defineComponent({
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      const comps = app?._context?.components;
      
      // 处理插槽映射
      const getSlots = (): SlotMap => {
        return Object.entries(slots).reduce((acc, [key, element]) => {
          const mappedKey = newAttrs[key] || key;
          acc[mappedKey] = element;
          return acc;
        }, {} as SlotMap);
      };

      const currentSlots = ref(getSlots());

      // 处理属性映射和转换
      const getAttrs = computed(() => {
        const objAttrs: ComponentAttrs = {};

        const processArraySlot = (items: Slot[]) => {
          currentSlots.value = items.map(item => 
            createRender(item.slots, item.attrs, item.tag, comps)
          );
        };

        const processAttribute = (key: string, currentAttr: any) => {
          if (Array.isArray(currentAttr)) {
            processArraySlot(currentAttr);
          } else if (currentAttr && !currentAttr._isSlot) {
            objAttrs[key] = currentAttr;
          } else if (currentAttr) {
            currentSlots.value[key] = createRender(
              currentAttr.slots,
              currentAttr.attrs,
              currentAttr.tag,
              comps
            );
          }
        };

        Object.entries(attrs).forEach(([key, element]) => {
          const attrType = typeof newAttrs[key];
          
          switch (attrType) {
            case 'string':
              objAttrs[newAttrs[key] as string] = element;
              break;
            case 'object':
              Object.assign(objAttrs, newAttrs[key]);
              break;
            case 'function':
              const newAttr = (newAttrs[key] as Function)(element);
              Object.entries(newAttr).forEach(([attrKey, value]) => 
                processAttribute(attrKey, value)
              );
              break;
            default:
              objAttrs[key] = element;
          }
        });

        objAttrs.ref = 'ref';
        return objAttrs;
      });

      try {
        const controlTag = comps[`${prefix}${compName}`];
        return () => h(controlTag, getAttrs.value, currentSlots.value);
      } catch (error) {
        console.error(`组件${prefix}${compName}不存在:`, error);
        return () => null;
      }
    }
  });
};