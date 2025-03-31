import { gsap } from 'gsap';
import { type AnimationConfig, type AnimationEffect } from '@/types/animation';

// 动画引擎接口 - 保留这个设计
interface AnimationEngine {
  runAnimation(element: HTMLElement, config: AnimationConfig, context: any): void;
  stopAnimation(element: HTMLElement): void;
}

/**
 * 动画服务类
 * 用于处理核心动画逻辑和执行
 */
export class AnimationService {
  // 保留引擎注册机制
  private static engines: Record<string, AnimationEngine> = {};
  
  // 静态初始化
  static {
    // 注册默认引擎
    this.registerEngine('gsap', {
      runAnimation: (element, config, context) => {
        return AnimationService.runGsapAnimation(element, config, context);
      },
      stopAnimation: (element) => {
        gsap.killTweensOf(element);
      }
    });
    
    this.registerEngine('css', {
      runAnimation: (element, config, context) => {
        return AnimationService.runCssAnimation(element, config);
      },
      stopAnimation: (element) => {
        if (element instanceof HTMLElement) {
          element.style.animation = 'none';
        }
      }
    });
  }

  /**
   * 执行动画配置
   * @param element 目标元素
   * @param config 动画配置，可以是单个配置或配置数组
   * @param context 上下文数据
   * @returns 动画控制器
   */
  static runAnimation(element: HTMLElement, config: AnimationConfig | AnimationConfig[], context?: any) {
    if (!element || !config) return;
    
    // 如果是数组，创建一个时间轴按顺序执行所有动画
    if (Array.isArray(config) && config.length > 1) {
      // 创建主时间轴
      const masterTimeline = gsap.timeline();
      
      // 按顺序添加每个动画配置
      config.forEach(animConfig => {
        // 确定使用哪个引擎
        const engineName = animConfig.engine;
        const engine = this.engines[engineName] || this.engines.gsap;
        // 执行单个动画并添加到主时间轴
        const animation: any = engine.runAnimation(element, animConfig, context);
        if (animation) {
          masterTimeline.add(animation);
        }
      });
      
      return masterTimeline;
    } else {
      // 单个配置的情况保持不变
      const singleConfig = Array.isArray(config) ? config[0] : config;
      const engineName = singleConfig?.engine;
      const engine = this.engines[engineName] || this.engines.gsap;
      
      return engine.runAnimation(element, singleConfig, context);
    }
  }
  
  /**
   * 停止动画
   * @param element 目标元素
   */
  static stopAnimation(element: HTMLElement): void {
    if (!element) return;
    
    Object.values(this.engines).forEach(engine => {
      engine.stopAnimation(element);
    });
  }
  
  /**
   * 注册新的动画引擎
   * @param name 引擎名称
   * @param engine 引擎实现
   */
  static registerEngine(name: string, engine: AnimationEngine): void {
    this.engines[name] = engine;
  }

  /**
   * 将动画效果配置转换为GSAP配置
   * 从Manager移动到Service，因为这是核心动画逻辑
   */
  static convertEffectsToTweenConfig(effects: AnimationEffect[]): any {
    const config: any = {
      duration: 0.3,
      ease: 'power1.out'
    };
    
    effects.forEach(effect => {
      if (effect.duration) {
        config.duration = effect.duration;
      }
      
      if (effect.ease) {
        config.ease = effect.ease;
      }
      
      if (effect.type === 'scale' && effect.to) {
        config.scale = effect.to.scale;
      } else if (effect.type === 'fade' && effect.to) {
        config.opacity = effect.to.opacity;
      } else if (effect.type === 'slide') {
        // 处理滑动效果 - 修改为从当前位置滑动到目标位置
        const distance = effect.properties?.distance ?? '100%';
        // 根据方向设置目标位置
        if (effect.direction === 'up') {
          config.y = `-${distance}`; // 向上滑动
        } else if (effect.direction === 'down') {
          config.y = distance; // 向下滑动
        } else if (effect.direction === 'left') {
          config.x = `-${distance}`; // 向左滑动
        } else if (effect.direction === 'right') {
          config.x = distance; // 向右滑动
        }
        
        // 只有当to.x和to.y有明确的非零值时，才覆盖方向计算的值
        // 如果to中明确指定了x或y，且direction也设置了相应方向，则优先使用to中的值
        if (effect.to?.x !== undefined && (effect.direction !== 'left' && effect.direction !== 'right')) {
          config.x = effect.to.x;
        }
        if (effect.to?.y !== undefined && (effect.direction !== 'up' && effect.direction !== 'down')) {
          config.y = effect.to.y;
        }
      } else if (effect.type === 'rotate' && effect.to) {
        config.rotation = effect.to.rotation;
      } else if (effect.type === 'custom' && effect.properties) {
        Object.assign(config, effect.properties);
      }
    });
    
    return config;
  }

  /**
   * 创建直接的GSAP动画
   * 新增方法，简化Manager中的代码
   */
  static createDirectAnimation(element: HTMLElement, effects: AnimationEffect[]) {
    const tweenConfig = this.convertEffectsToTweenConfig(effects);
    return gsap.to(element, tweenConfig);
  }
  
  /**
   * 重置元素样式到初始状态
   * 新增方法，统一处理样式重置
   * @param element 目标元素
   * @param duration 过渡时间，设为0则立即重置
   * @param immediate 是否立即重置，为true时忽略duration参数
   */
  static resetElementStyles(element: HTMLElement, duration: number = 0.3, immediate: boolean = false) {
    if (immediate) {
      // 立即重置样式，不使用动画
      element.style.scale = '';
      element.style.backgroundColor = '';
      element.style.transform = '';
      element.style.opacity = '';
      element.style.translate = '';
      element.style.rotate = '';
      
      // 清除GSAP可能设置的内联样式
      gsap.killTweensOf(element);
      gsap.set(element, { clearProps: "all" });
      
      return null;
    } else {
      // 使用动画过渡到初始状态
      return gsap.to(element, {
        scale: 1,
        backgroundColor: '',
        transform: '',
        opacity: '',
        x: '',
        y: '',
        rotation: '',
        duration: duration,
        ease: 'power1.out',
        clearProps: "all" // 动画完成后清除所有属性
      });
    }
  }

  /**
   * 执行GSAP动画
   */
  private static runGsapAnimation(element: HTMLElement, config: AnimationConfig | AnimationConfig[], context?: any) {
    // 处理配置可能是数组的情况
    const animConfig = Array.isArray(config) ? config[0] : config;
    
    if (!animConfig || !animConfig.effects || animConfig.effects.length === 0) {
      console.warn('无效的动画配置:', config);
      return null;
    }
    
    // 处理目标元素
    const targets = this.resolveTargets(element, animConfig.target);
    
    // 创建时间轴
    const timeline = gsap.timeline({
      ...(animConfig.timeline || {}),
      onStart: animConfig.callbacks?.onStart ? this.createCallback(animConfig.callbacks.onStart, context) : undefined,
      onUpdate: animConfig.callbacks?.onUpdate ? this.createCallback(animConfig.callbacks.onUpdate, context) : undefined,
      onComplete: animConfig.callbacks?.onComplete ? this.createCallback(animConfig.callbacks.onComplete, context) : undefined,
    });
    animConfig.effects.forEach((effect, index) => {
      const params = this.convertEffectsToTweenConfig([effect]);
      
      // 计算动画位置
      const positionLabel = index === 0 ? 0 : (effect.delay ? `+=${effect.delay}` : '+=0');
      // 添加到时间轴
      timeline.to(targets, {
        ...params,
        stagger: animConfig.target?.stagger,
      }, positionLabel);
    });
    
    return timeline;
  }
  
  /**
   * 执行CSS动画
   */
  private static runCssAnimation(element: HTMLElement, config: AnimationConfig | AnimationConfig[]) {
    // 处理配置可能是数组的情况
    const animConfig = Array.isArray(config) ? config[0] : config;
    
    if (!animConfig || !animConfig.effects || animConfig.effects.length === 0) {
      console.warn('无效的动画配置:', config);
      return null;
    }
    
    // 处理目标元素
    const targets = this.resolveTargets(element, animConfig.target);
    const effect = animConfig.effects[0];
    
    // 将目标转换为数组以便使用forEach
    const targetsArray = targets instanceof HTMLElement ? [targets] : Array.from(targets);
    
    // 为每个目标应用CSS动画
    targetsArray.forEach((target: Element) => {
      // 确保目标是HTMLElement
      if (!(target instanceof HTMLElement)) return;
      
      // 设置动画属性
      target.style.animationDuration = `${effect.duration}s`;
      target.style.animationDelay = `${effect.delay || 0}s`;
      target.style.animationFillMode = 'both';
      
      // 根据效果类型应用CSS类
      let className = '';
      if (effect.type === 'fade') {
        className = 'fade-in';
      } else if (effect.type === 'slide') {
        className = `slide-${effect.direction || 'up'}`;
      } else if (effect.type === 'scale') {
        className = 'scale-in';
      } else if (effect.type === 'rotate') {
        className = 'rotate-in';
      } else if (effect.type === 'custom' && effect.properties?.className) {
        className = effect.properties.className;
      }
      
      // 应用动画类
      if (className) {
        target.classList.add(className);
        
        // 动画结束后移除类
        const onAnimationEnd = () => {
          target.classList.remove(className);
          target.removeEventListener('animationend', onAnimationEnd);
        };
        target.addEventListener('animationend', onAnimationEnd);
      }
    });
    
    // 返回简单控制器
    return {
      pause: () => {
        targetsArray.forEach((target: Element) => {
          if (target instanceof HTMLElement) {
            target.style.animationPlayState = 'paused';
          }
        });
      },
      play: () => {
        targetsArray.forEach((target: Element) => {
          if (target instanceof HTMLElement) {
            target.style.animationPlayState = 'running';
          }
        });
      },
      restart: () => {
        targetsArray.forEach((target: Element) => {
          if (target instanceof HTMLElement) {
            target.style.animation = 'none';
            target.offsetHeight; // 触发重绘
            target.style.animation = '';
          }
        });
      }
    };
  }
  
  /**
   * 解析目标元素
   */
  private static resolveTargets(element: HTMLElement, targetConfig?: AnimationConfig['target']) {
    if (!targetConfig) return element;
    
    if (targetConfig.selector) {
      // 使用选择器查找元素
      return element.querySelectorAll(targetConfig.selector);
    } else if (targetConfig.children) {
      // 选择所有子元素
      return targetConfig.childSelector 
        ? element.querySelectorAll(targetConfig.childSelector)
        : element.children;
    }
    
    return element;
  }
  
  /**
   * 创建回调函数
   */
  private static createCallback(code: string, context: any) {
    try {
      // 安全地创建回调函数
      return new Function('context', `
        return function() {
          ${code}
        }.bind(context);
      `)(context);
    } catch (error) {
      console.error('创建动画回调函数失败:', error);
      return () => {};
    }
  }
}

/**
 * 获取默认动画配置
 * @param type 动画类型
 * @returns 默认配置
 */
export const getDefaultAnimationConfig = (type: string): AnimationConfig => {
  return {
    engine: "gsap",
    name: `${type}_${Date.now()}`,
    trigger: {
      type: type === "enter" ? "onMount" : "onUnmount",
      delay: 0,
      condition: {
        value: "",
        operator: "==="
      }
    },
    effects: [
      {
        type: "fade",
        duration: 0.5,
        delay: 0,
        ease: "power2.out"
      }
    ]
  };
};