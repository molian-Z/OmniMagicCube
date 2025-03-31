import { AnimationService } from './animation-service';
import type { ComponentAnimations, AnimationConfig, AnimationEffect } from '@/types/animation';
import { gsap } from 'gsap';
import { watch } from 'vue';

/**
 * 组件动画管理器
 * 负责管理组件的动画生命周期、事件绑定和状态变化
 */
export class AnimationManager {
    private element: HTMLElement;
    private animations: ComponentAnimations;
    private context: any;

    // 存储动画实例和事件监听器
    private enterAnimation: any = null;
    private leaveAnimation: any = null;
    private interactionAnimations = new Map<string, any>();
    private stateWatchers = new Map<string, Function>();

    /**
     * 创建动画管理器实例
     * @param element 目标DOM元素
     * @param animations 动画配置
     * @param context 上下文数据
     */
    constructor(element: HTMLElement, animations: ComponentAnimations, context: any) {
        this.element = element;
        this.animations = animations;
        this.context = context;
    }

    /**
     * 初始化所有动画
     */
    init() {
        this.setupEnterAnimation();
        this.setupInteractionAnimations();
        this.setupStateChangeAnimations();

        return this;
    }

    /**
     * 销毁所有动画和事件监听
     */
    destroy() {
        this.setupLeaveAnimation();
        this.cleanupInteractionAnimations();
        this.cleanupStateAnimations();
    }

    /**
     * 重置元素样式
     * @param element 目标元素
     * @param duration 过渡时间
     */
    resetStyles(element: HTMLElement, duration: number = 0.3) {
        return AnimationService.resetElementStyles(element, duration);
    }

    /**
     * 设置入场动画
     */
    setupEnterAnimation() {
        if (!this.animations?.enter) return null;
        this.enterAnimation = AnimationService.runAnimation(
            this.element,
            this.animations.enter,
            this.context
        );
        return this.enterAnimation;
    }

    /**
     * 设置离场动画
     */
    setupLeaveAnimation() {
        if (!this.animations?.leave) return null;

        this.leaveAnimation = AnimationService.runAnimation(
            this.element,
            this.animations.leave,
            this.context
        );

        return this.leaveAnimation;
    }

    /**
     * 设置交互动画事件监听
     */
    setupInteractionAnimations() {
        if (!this.animations?.interaction) return;

        const interactions = this.animations.interaction;

        // 确保元素存在且可以添加事件监听
        if (!this.element) return;

        // 处理鼠标悬停动画
        if (interactions.hover) {
            const mouseEnterHandler = () => {
                const hoverConfig: any = { ...interactions.hover };

                // 使用Service创建动画
                if (hoverConfig.effects) {
                    const animation = AnimationService.createDirectAnimation(
                        this.element,
                        hoverConfig.effects
                    );
                    this.interactionAnimations.set('hover', animation);
                } else {
                    const animation: any = AnimationService.runAnimation(
                        this.element,
                        hoverConfig,
                        this.context
                    );

                    if (animation) {
                        this.interactionAnimations.set('hover', animation);
                    }
                }
            };

            const mouseLeaveHandler = () => {
                const animation = this.interactionAnimations.get('hover');

                if (animation) {
                    if (typeof animation.reverse === 'function') {
                        animation.reverse();
                    } else if (typeof animation.kill === 'function') {
                        animation.kill();
                        AnimationService.resetElementStyles(this.element);
                    }
                } else {
                    AnimationService.resetElementStyles(this.element);
                }
            };

            // 使用捕获阶段以确保事件被处理
            this.element.addEventListener('mouseenter', mouseEnterHandler, true);
            this.element.addEventListener('mouseleave', mouseLeaveHandler, true);

            this.interactionAnimations.set('hoverListeners', {
                mouseEnterHandler,
                mouseLeaveHandler
            });
        }

        // 处理点击动画
        if (interactions.click) {
            const clickHandler = () => {
                const clickConfig: any = { ...interactions.click };

                if (clickConfig.effects) {
                    // 创建时间线
                    const tl = gsap.timeline();

                    // 应用动画
                    tl.add(AnimationService.createDirectAnimation(
                        this.element,
                        clickConfig.effects
                    ));

                    // 恢复原始状态
                    const duration = clickConfig.effects[0]?.duration || 0.3;
                    const resetAnim = AnimationService.resetElementStyles(this.element, duration);
                    if (resetAnim) {
                        tl.add(resetAnim, `+=${duration + 0.2}`);
                    }
                } else {
                    const animation: any = AnimationService.runAnimation(
                        this.element,
                        clickConfig,
                        this.context
                    );
                    if (animation) {
                        // 如果是点击动画，通常需要在一段时间后恢复
                        setTimeout(() => {
                            if (typeof animation?.reverse === 'function') {
                                animation?.reverse();
                            } else {
                                // 如果没有reverse方法，使用resetElementStyles恢复样式
                                AnimationService.resetElementStyles(this.element);
                            }
                        }, (0.3) * 1000 + 500);
                    }
                }
            };

            // 使用捕获阶段以确保事件被处理
            this.element.addEventListener('click', clickHandler, true);

            this.interactionAnimations.set('clickListener', clickHandler);
        }

        // 为Vue组件添加特殊处理
        // 检查元素是否为Vue组件
        if ((this.element as any).__vue__ || (this.element as any)._vnode) {
            const childElements = this.element.querySelectorAll('*');
            childElements.forEach((child, index) => {
                if (index < 5) {
                    this.addInteractionToElement(child as HTMLElement, interactions as unknown as Record<string, AnimationConfig>);
                }
            });
        }
    }

    /**
     * 为指定元素添加交互事件
     */
    private addInteractionToElement(element: HTMLElement, interactions: Record<string, AnimationConfig>) {
        // 处理鼠标悬停动画
        if (interactions.hover) {
            const mouseEnterHandler = () => {
                if (interactions.hover.effects) {
                    const animation = AnimationService.createDirectAnimation(
                        this.element,
                        interactions.hover.effects
                    );
                    this.interactionAnimations.set('hover-child', animation);
                } else {
                    const animation = AnimationService.runAnimation(
                        this.element,
                        interactions.hover,
                        this.context
                    );
                    this.interactionAnimations.set('hover-child', animation);
                }
            };

            const mouseLeaveHandler = () => {
                const animation = this.interactionAnimations.get('hover-child');

                if (animation) {
                    if (typeof animation.reverse === 'function') {
                        animation.reverse();
                    } else if (typeof animation.kill === 'function') {
                        animation.kill();
                        AnimationService.resetElementStyles(this.element);
                    }
                } else {
                    AnimationService.resetElementStyles(this.element);
                }
            };

            element.addEventListener('mouseenter', mouseEnterHandler, true);
            element.addEventListener('mouseleave', mouseLeaveHandler, true);
        }

        // 处理点击动画
        if (interactions.click) {
            const clickHandler = () => {
                if (interactions.click.effects) {
                    // 创建时间线
                    const tl = gsap.timeline();

                    // 应用动画
                    tl.add(AnimationService.createDirectAnimation(
                        this.element,
                        interactions.click.effects
                    ));

                    // 恢复原始状态
                    const duration = interactions.click.effects[0]?.duration || 0.3;
                    const resetAnim = AnimationService.resetElementStyles(this.element, duration);
                    if (resetAnim) {
                        tl.add(resetAnim, `+=${duration + 0.2}`);
                    }
                } else {
                    AnimationService.runAnimation(
                        this.element,
                        interactions.click,
                        this.context
                    );
                }
            };

            element.addEventListener('click', clickHandler, true);
        }
    }

    /**
     * 清理交互动画事件监听
     */
    cleanupInteractionAnimations() {
        if (!this.element) return;

        // 清理hover事件监听
        if (this.interactionAnimations.has('hoverListeners')) {
            const { mouseEnterHandler, mouseLeaveHandler } = this.interactionAnimations.get('hoverListeners');
            this.element.removeEventListener('mouseenter', mouseEnterHandler, true);
            this.element.removeEventListener('mouseleave', mouseLeaveHandler, true);
        }

        // 清理click事件监听
        if (this.interactionAnimations.has('clickListener')) {
            this.element.removeEventListener('click', this.interactionAnimations.get('clickListener'), true);
        }

        this.interactionAnimations.clear();
    }

    /**
     * 设置状态变化动画
     */
    setupStateChangeAnimations() {
        if (!this.animations?.stateChange || !this.context) return;

        const stateAnimations = this.animations.stateChange;

        // 遍历所有状态动画配置
        Object.keys(stateAnimations).forEach(stateName => {
            // 检查上下文对象中是否有对应的属性
            const pathParts = stateName.split('.');
            let stateExists = false;

            // 检查属性是否存在于context中
            let obj = this.context;
            for (const part of pathParts) {
                if (obj && typeof obj === 'object') {
                    // 处理ref对象，获取其value
                    if (obj.value !== undefined && typeof obj.value === 'object') {
                        obj = obj.value[part];
                    } else if (part in obj) {
                        obj = obj[part];
                    } else {
                        stateExists = false;
                        break;
                    }
                    stateExists = true;
                } else {
                    stateExists = false;
                    break;
                }
            }

            // 如果状态存在，则创建监听器
            if (stateExists) {
                // 创建监听器函数
                const watchCallback = (newValue: any, oldValue: any) => {
                    // 获取动画配置
                    const animConfig = stateAnimations[stateName];

                    // 检查是否有触发条件配置
                    if ((animConfig as any).trigger?.condition) {
                        const condition = (animConfig as any).trigger?.condition;
                        let shouldTrigger = false;

                        // 根据条件类型进行判断
                        if (condition.expression) {
                            // 使用自定义表达式
                            try {
                                // 创建一个安全的求值环境
                                const evalContext = {
                                    newValue,
                                    oldValue,
                                    context: this.context
                                };

                                // 使用Function构造函数创建一个沙箱环境
                                const evalFn = new Function(
                                    'newValue', 'oldValue', 'context',
                                    `return ${condition.expression};`
                                );

                                shouldTrigger = evalFn(newValue, oldValue, this.context);
                            } catch (error) {
                                console.error('Error evaluating animation condition:', error);
                            }
                        } else if (condition.operator && condition.value !== undefined) {
                            // 使用操作符和值进行比较
                            switch (condition.operator) {
                                case '==':
                                    shouldTrigger = newValue == condition.value;
                                    break;
                                case '===':
                                    shouldTrigger = newValue === condition.value;
                                    break;
                                case '!=':
                                    shouldTrigger = newValue != condition.value;
                                    break;
                                case '!==':
                                    shouldTrigger = newValue !== condition.value;
                                    break;
                                case '>':
                                    shouldTrigger = newValue > condition.value;
                                    break;
                                case '>=':
                                    shouldTrigger = newValue >= condition.value;
                                    break;
                                case '<':
                                    shouldTrigger = newValue < condition.value;
                                    break;
                                case '<=':
                                    shouldTrigger = newValue <= condition.value;
                                    break;
                                case 'includes':
                                    shouldTrigger = Array.isArray(condition.value)
                                        ? condition.value.includes(newValue)
                                        : String(newValue).includes(String(condition.value));
                                    break;
                                case 'startsWith':
                                    shouldTrigger = String(newValue).startsWith(String(condition.value));
                                    break;
                                case 'endsWith':
                                    shouldTrigger = String(newValue).endsWith(String(condition.value));
                                    break;
                                default:
                                    shouldTrigger = newValue === condition.value;
                            }
                        } else {
                            // 默认行为：检查常见的激活状态值
                            shouldTrigger = newValue === true || newValue === 1 || newValue === 'active';
                        }

                        // 根据条件结果触发动画
                        if (shouldTrigger) {
                            AnimationService.runAnimation(
                                this.element,
                                animConfig,
                                this.context
                            );
                        } else {
                            // 检查是否有反向状态动画
                            const reverseAnimName = this.getOppositeStateName(stateName);
                            if (reverseAnimName && stateAnimations[reverseAnimName]) {
                                AnimationService.runAnimation(
                                    this.element,
                                    stateAnimations[reverseAnimName],
                                    this.context
                                );
                            }
                        }
                    } else {
                        // 兼容旧的逻辑
                        if (newValue === true || newValue === 1 || newValue === 'active') {
                            // 激活状态
                            AnimationService.runAnimation(
                                this.element,
                                animConfig,
                                this.context
                            );
                        } else if (oldValue === true || oldValue === 1 || oldValue === 'active') {
                            // 从激活状态变为非激活状态，可以考虑反向播放动画
                            const reverseAnimName = this.getOppositeStateName(stateName);
                            if (reverseAnimName && stateAnimations[reverseAnimName]) {
                                AnimationService.runAnimation(
                                    this.element,
                                    stateAnimations[reverseAnimName],
                                    this.context
                                );
                            }
                        }
                    }
                };

                // 根据路径创建监听表达式，处理ref对象
                const watcherFn = () => {
                    // 保持原有的监听逻辑不变
                    let result = this.context;
                    const firstPart = pathParts[0];

                    // 首先检查是否是顶级ref对象
                    if (firstPart in result && result[firstPart] && typeof result[firstPart].value !== 'undefined') {
                        result = result[firstPart].value;

                        // 处理剩余路径
                        for (let i = 1; i < pathParts.length; i++) {
                            const part = pathParts[i];
                            if (result && typeof result === 'object' && part in result) {
                                result = result[part];
                                // 检查是否是嵌套的ref
                                if (result && typeof result.value !== 'undefined') {
                                    result = result.value;
                                }
                            } else {
                                return undefined;
                            }
                        }
                    } else {
                        // 常规路径处理
                        for (const part of pathParts) {
                            if (result && typeof result === 'object' && part in result) {
                                result = result[part];
                                // 检查是否是ref
                                if (result && typeof result.value !== 'undefined') {
                                    result = result.value;
                                }
                            } else {
                                return undefined;
                            }
                        }
                    }

                    return result;
                };

                const unwatch = watch(
                    watcherFn,
                    watchCallback,
                    { immediate: false }
                );

                // 保存取消监听的函数，以便后续清理
                this.stateWatchers.set(stateName, unwatch);
            }
        });
    }

    /**
     * 获取状态的反向状态名称
     * @param stateName 状态名称
     * @returns 反向状态名称
     */
    private getOppositeStateName(stateName: string): string | null {
        const opposites: Record<string, string> = {
            'active': 'inactive',
            'selected': 'unselected',
            'expanded': 'collapsed',
            'enabled': 'disabled',
            'focused': 'blurred',
            'loading': 'loaded',
            'visible': 'hidden',
            'open': 'closed',
            // 可以根据需要添加更多的状态对应关系
        };

        // 检查正向映射
        if (stateName in opposites) {
            return opposites[stateName];
        }

        // 检查反向映射
        for (const [key, value] of Object.entries(opposites)) {
            if (value === stateName) {
                return key;
            }
        }

        return null;
    }

    /**
     * 清理状态监听
     */
    cleanupStateAnimations() {
        this.stateWatchers.forEach((watcher) => {
            if (typeof watcher === 'function') {
                watcher(); // 停止监听
            }
        });

        this.stateWatchers.clear();
    }

    /**
     * 手动触发动画
     * @param animationType 动画类型
     * @param animationName 动画名称
     */
    triggerAnimation(animationType: string, animationName: string) {
        if (animationType === 'stateChange' && this.animations?.stateChange?.[animationName]) {
            return AnimationService.runAnimation(
                this.element,
                this.animations.stateChange[animationName],
                this.context
            );
        } else if (animationType === 'interaction' && this.animations?.interaction?.[animationName]) {
            return AnimationService.runAnimation(
                this.element,
                this.animations.interaction[animationName],
                this.context
            );
        }

        return null;
    }
}