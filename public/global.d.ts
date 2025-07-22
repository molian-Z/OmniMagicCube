/**
 * 定义了不同类型的值的接口。
 * 这些类型包括基本类型（字符串、数字、布尔值）以及复杂类型（对象、数组、函数和计算属性）。
 * 使用这个接口可以帮助强制类型检查，确保代码的健壮性和可维护性。
 */
type ValueTypes = {
    string: string;
    number: number;
    boolean: boolean;
    object: Record<string, any>;
    array: any[];
    function: FunctionDefinition;
    computed: any;
};

/**
 * 定义了一个类型，用于描述函数的定义集合。
 * 这个集合通过字符串键值对来索引，每个键对应的值描述了一个函数的特定属性。
 */
type FunctionDefinition = {
    [key: string]: {
        /**
         * 可选字段，用于标记这个属性的值是一个函数。
         */
        type?: 'function';
        /**
         * 可选字段，用于包含函数的具体定义信息。
         */
        value?: {
            /**
             * 可选字段，包含函数的源代码。
             */
            code?: string;
            /**
             * 可选字段，用于存储代码变量的定义。
             * 这可以是一个字符串数组，或者是一个包含变量名和值的对象数组。
             */
            codeVar?: string[] | { name: string; value: any }[];
            /**
             * 可选字段，包含函数使用的修饰器。
             */
            modifiers?: string[];
            /**
             * 必选字段，指定函数的模式是普通函数还是异步函数。
             */
            functionMode: 'function' | 'asyncFunction';
            /**
             * 可选字段，用于标记这个函数是一个箭头函数。
             */
            isArrow?: true;
        };
    };
};

interface IDefaultSlotsMap {
    /**
     * 组件的名称
     */
    [key: string]: {
        /**
         * 插槽的名称
         */
        [key: string]: string| boolean | {
            /**
             * 是否自动添加该插槽
             */
            auto?: boolean;
            /**
             * 允许的组件列表，这些组件可以被快速插入或附加
             */
            allowComps?: string[] | {
                name: string,
            }[];
            /**
             * 可以被快速插入的组件列表
             * 这里可以指定组件的名称，以及可选的属性
             */
            appendComps?: string[] | CubeData.ModelValue[];
        };
    };
}

/**
* 为 CubeData 命名空间声明类型和接口。
*/
declare namespace CubeData {
    /**
     * 表示模型值的接口。
     */
    interface ModelValue {
        /**
         * 模型名称。
         */
        name: string;
        /**
         * 模型类别。
         */
        category: string;
        /**
         * 模型的属性，使用键值对表示。
         */
        attrs?: {
            /**
             * 属性的键，可以是任意字符串。
             */
            [key: string]: {
                /**
                 * 属性的类型。
                 * - 当为 'variable' 时，value 应为字符串数组
                 * - 当为 'function' 时，value 应为函数定义对象
                 * - 其他类型时，value 的类型应与 type 对应
                 */
                type?: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function' | 'variable' | 'computed' | string;
                /**
                 * 属性的值。
                 * 根据 type 的不同，value 的类型也会不同：
                 * - 当 type 为 'variable' 时，value 是一个字符串数组
                 * - 当 type 为 'function' 时，value 是一个函数定义对象
                 * - 当 type 为其他类型时，value 应与 type 对应
                 */
                value?: string | number | boolean | object | any[] | FunctionDefinition | string[];
                /**
                 * 属性的额外信息。
                 */
                [key: string]: any;
            };
        };
        /**
         * 事件监听器配置。
         */
        on?: FunctionDefinition;
        /**
         * 原生事件监听器配置。
         */
        nativeOn?: FunctionDefinition;
        /**
         * 指令配置。
         */
        directives?: {
            /**
             * 文本指令。
             */
            text?: {
                /**
                 * 指令的类型。
                 */
                type?: 'string' | 'function' | 'variable';
                /**
                 * 指令的值。
                 */
                value?: string | FunctionDefinition | string[];
            };
            /**
             * 显示指令。
             */
            show?: {
                /**
                 * 指令的类型。
                 */
                type?: 'function' | 'variable';
                /**
                 * 指令的值。
                 */
                value?: FunctionDefinition | string[];
            };
            /**
             * 条件渲染指令。
             */
            if?: {
                /**
                 * 指令的类型。
                 */
                type?: 'function' | 'variable';
                /**
                 * 指令的值。
                 */
                value?: FunctionDefinition | string[];
            };
            /**
             * 列表渲染指令。
             */
            for?: {
                /**
                 * 指令的类型。
                 */
                type?: 'variable';
                /**
                 * 指令的值。
                 */
                value?: string[];
                /**
                 * 列表项的 ID 键。
                 */
                idKey?: string;
                /**
                 * 列表项的数据键。
                 */
                dataKey?: string;
            };
        };
        /**
         * 插槽配置。
         */
        slots?: {
            /**
             * 插槽的键，可以是任意字符串。
             */
            [key: string]: {
                /**
                 * 允许的组件类型数组。
                 */
                allowComps?: any[];
                /**
                 * 插槽的子元素数组。
                 */
                children: CubeData.ModelValue[];
            };
        };
        /**
         * CSS 样式配置。
         */
        css?: {
            /**
             * 边框圆角样式。
             */
            borderRadius?: string[] | string | number | number[];
            /**
             * 顶部外边距。
             */
            marginTop?: string | number;
            /**
             * 左侧外边距。
             */
            marginLeft?: string | number;
            /**
             * 右侧外边距。
             */
            marginRight?: string | number;
            /**
             * 底部外边距。
             */
            marginBottom?: string | number;
            /**
             * 顶部内边距。
             */
            paddingTop?: string | number;
            /**
             * 左侧内边距。
             */
            paddingLeft?: string | number;
            /**
             * 右侧内边距。
             */
            paddingRight?: string | number;
            /**
             * 底部内边距。
             */
            paddingBottom?: string | number;
            /**
             * 水平对齐方式。
             */
            constX?: 'left' | 'center' | 'right' | 'left2right';
            /**
             * 垂直对齐方式。
             */
            constY?: 'top' | 'center' | 'bottom' | 'top2bottom';
            /**
             * 水平移动距离。
             */
            moveX?: string | number;
            /**
             * 垂直移动距离。
             */
            moveY?: string | number;
            /**
             * 宽度。
             */
            width?: string | number;
            /**
             * 高度。
             */
            height?: string | number;
            /**
             * 定位方式。
             */
            position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
            /**
             * 透明度。
             */
            opacity?: number;
            /**
             * 旋转角度。
             */
            rotate?: string | number;
            /**
             * 颜色样式。
             */
            color?: {
                /**
                 * 是否显示颜色。
                 */
                isShow: boolean;
                /**
                 * 颜色的模型值。
                 */
                modelValue: string;
            };
            /**
             * 背景样式。
             */
            background?: {
                /**
                 * 是否显示背景。
                 */
                isShow: boolean;
                /**
                 * 背景的模型值。
                 */
                modelValue: string;
            };
            /**
             * 边框样式。
             */
            border?: {
                /**
                 * 边框颜色。
                 */
                color?: string;
                /**
                 * 边框宽度。
                 */
                width?: number;
                /**
                 * 边框样式。
                 */
                style?: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
                /**
                 * 边框类型。
                 */
                type?: 'all' | 'top' | 'bottom' | 'left' | 'right';
                /**
                 * 是否显示边框。
                 */
                isShow?: boolean;
            }[];
            /**
             * 混合模式样式。
             */
            mixBlendMode?: {
                /**
                 * 是否显示混合模式。
                 */
                isShow?: boolean;
                /**
                 * 混合模式的模型值。
                 */
                modelValue?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity';
            };
            /**
             * 模糊效果样式。
             */
            blur?: {
                /**
                 * 是否显示模糊效果。
                 */
                isShow?: boolean;
                /**
                 * 模糊效果的模型值。
                 */
                modelValue?: string;
                /**
                 * 模糊效果的适用范围。
                 */
                field?: '' | 'backdropFilter' | 'filter';
            };
            /**
             * 阴影样式。
             */
            boxShadow?: {
                /**
                 * 水平偏移量。
                 */
                h?: string | number;
                /**
                 * 垂直偏移量。
                 */
                v?: string | number;
                /**
                 * 模糊距离。
                 */
                blur?: string | number;
                /**
                 * 阴影扩展。
                 */
                spread?: string | number;
                /**
                 * 阴影颜色。
                 */
                color?: string;
                /**
                 * 阴影类型。
                 */
                type?: 'outset' | 'inset';
                /**
                 * 是否显示阴影。
                 */
                isShow?: boolean;
            }[];
            /**
             * CSS单位配置。
             */
            units?: {
                /**
                 * 宽度单位。
                 */
                width: 'px' | '%' | 'rem' | 'em' | 'vw' | 'vh' | 'vmin' | 'vmax' | 'auto';
                /**
                 * 高度单位。
                 */
                height: 'px' | '%' | 'rem' | 'em' | 'vw' | 'vh' | 'vmin' | 'vmax' | 'auto';
                /**
                 * 其他CSS属性单位。
                 */
                [key: string]: string;
            };
            /**
             * 自定义CSS代码。
             */
            customCss?: string;
            /**
             * 其他任意 CSS 属性。
             */
            [key: string]: any;
        };
        /**
         * 动画配置。
         */
        animations?: {
            /**
             * 入场动画配置数组。
             */
            enter?: import('./animation').AnimationConfig[];
            /**
             * 退场动画配置数组。
             */
            leave?: import('./animation').AnimationConfig[];
            /**
             * 状态变化动画配置。
             */
            stateChange?: {
                /**
                 * 激活状态动画。
                 */
                active: import('./animation').AnimationConfig[];
                /**
                 * 非激活状态动画。
                 */
                inactive: import('./animation').AnimationConfig[];
                /**
                 * 选中状态动画。
                 */
                selected: import('./animation').AnimationConfig[];
                /**
                 * 未选中状态动画。
                 */
                unselected: import('./animation').AnimationConfig[];
                /**
                 * 展开状态动画。
                 */
                expanded: import('./animation').AnimationConfig[];
                /**
                 * 折叠状态动画。
                 */
                collapsed: import('./animation').AnimationConfig[];
                /**
                 * 加载状态动画。
                 */
                loading: import('./animation').AnimationConfig[];
                /**
                 * 加载完成状态动画。
                 */
                loaded: import('./animation').AnimationConfig[];
                /**
                 * 错误状态动画。
                 */
                error: import('./animation').AnimationConfig[];
                /**
                 * 成功状态动画。
                 */
                success: import('./animation').AnimationConfig[];
                /**
                 * 禁用状态动画。
                 */
                disabled: import('./animation').AnimationConfig[];
                /**
                 * 启用状态动画。
                 */
                enabled: import('./animation').AnimationConfig[];
                /**
                 * 聚焦状态动画。
                 */
                focused: import('./animation').AnimationConfig[];
                /**
                 * 失焦状态动画。
                 */
                blurred: import('./animation').AnimationConfig[];
                /**
                 * 自定义状态动画。
                 */
                [stateName: string]: import('./animation').AnimationConfig[];
            };
            /**
             * 交互动画配置。
             */
            interaction?: {
                /**
                 * 悬停动画。
                 */
                hover: import('./animation').AnimationConfig[];
                /**
                 * 点击动画。
                 */
                click: import('./animation').AnimationConfig[];
                /**
                 * 双击动画。
                 */
                doubleClick: import('./animation').AnimationConfig[];
                /**
                 * 鼠标按下动画。
                 */
                mouseDown: import('./animation').AnimationConfig[];
                /**
                 * 鼠标释放动画。
                 */
                mouseUp: import('./animation').AnimationConfig[];
                /**
                 * 鼠标进入动画。
                 */
                mouseEnter: import('./animation').AnimationConfig[];
                /**
                 * 鼠标离开动画。
                 */
                mouseLeave: import('./animation').AnimationConfig[];
                /**
                 * 聚焦动画。
                 */
                focus: import('./animation').AnimationConfig[];
                /**
                 * 失焦动画。
                 */
                blur: import('./animation').AnimationConfig[];
                /**
                 * 拖拽动画。
                 */
                drag: import('./animation').AnimationConfig[];
                /**
                 * 拖拽开始动画。
                 */
                dragStart: import('./animation').AnimationConfig[];
                /**
                 * 拖拽结束动画。
                 */
                dragEnd: import('./animation').AnimationConfig[];
                /**
                 * 滚动动画。
                 */
                scroll: import('./animation').AnimationConfig[];
                /**
                 * 滑动动画。
                 */
                swipe: import('./animation').AnimationConfig[];
                /**
                 * 缩放动画。
                 */
                pinch: import('./animation').AnimationConfig[];
                /**
                 * 自定义交互动画。
                 */
                [eventName: string]: import('./animation').AnimationConfig[];
            };
        };
        /**
         * 模型的键。
         */
        key: string;
        /**
         * 模型的 ID。
         */
        id: string;
        /**
         * 组件标签。
         */
        tag: string;
        /**
         * 子标题。
         */
        subTitle: string;
    }
    /**
    * 全局属性接口。
    */
    interface GlobalAttrs {
        /**
         * 导入配置。
         */
        import: {
            /**
             * 导入的键，可以是任意字符串。
             */
            [key: string]: any;
        };
        /**
         * 导出配置。
         */
        export: {
            /**
             * 导出的键，可以是任意字符串。
             */
            [key: string]: any;
        };
        /**
         * 生命周期钩子配置。
         */
        lifecycle: FunctionDefinition;
        /**
         * 变量配置。
         */
        variable: {
            /**
             * 变量的键，可以是任意字符串。
             */
            [key: string]: {
                /**
                 * 变量的文本。
                 */
                label?: string;
                /**
                 * 变量的类型。
                 */
                type?: keyof ValueTypes;
                /**
                 * 变量的值。
                 */
                value?: ValueTypes[keyof ValueTypes];
            };
        };

        /**
         * 定义了一个数组，数组中的每个元素代表了一个操作的动作配置。
         * 每个动作配置包括了操作的关键字、索引、标题、标签、描述和相关数据等信息。
         * 
         * @property key 操作的关键字，用于唯一标识一个操作。
         * @property index 操作的索引号，用于确定操作的显示顺序。
         * @property title 操作的标题，用于用户界面显示。
         * @property tags 操作的标签，用于对操作进行分类或筛选，可选。
         * @property desc 操作的描述，提供关于操作的详细说明，可选。
         * @property data 操作相关数据的集合，每个元素包含了一个操作项的标签、字段、操作符和值等信息。
         */
        actions: CubeData.GlobalAttrs['action'][];
        action: {
            key: string;
            index: number;
            title: string;
            tags?: string[];
            desc?: string;
            on: {
                bind: 'event' | 'variable';
                compData?: {
                    key: string;
                    type: string;
                    name: string;
                    subTitle: string;
                };
            }[];
            verify: {
                bind: string;
                variable: string;
                op: string;
                data: any;
            }[];
            run: {
                bind: string;
                variagble: string;
                op: string;
                data: any;
            }[];
            extend: any;
        };
    }
}

/**
 * AI 命名空间，用于定义与人工智能相关的接口和类型。
 */
declare namespace AI {
    /**
     * 创建数据的接口，用于指定生成人工智能数据的配置。
     */
    interface CreateData {
        /**
         * 是否自动生成描述。
         */
        autoDesc?: string;
        /**
         * 消息文本，具体结构未定义。
         */
        messageText?: any;
        /**
         * 是否使用用户界面。
         */
        useUI?: string;
        /**
         * 是否丢弃引用。
         */
        dropRef?: string;
        /**
         * 上下文代码，用于标识特定的上下文环境。
         */
        contextCode?: string;
    }

    /**
     * 消息接口，用于定义用户和助手之间的消息交互。
     */
    interface message {
        /**
         * 消息内容。
         */
        content?: string;
        /**
         * 消息发送者的角色，可以是用户或助手。
         */
        role: 'user' | 'assistant';
    }
}

/**
 * 设备配置接口
 * 
 * 该接口定义了配置设备的各种属性，用于描述设备的特征和布局设置。
 */
declare namespace Device {
    /**
     * 设备配置接口
     * 
     * 该接口详细定义了设备的属性，包括名称、尺寸、类型、分辨率比例等。
     * 它还提供了一个可选的属性，用于自定义背景覆盖的布局。
     */
    interface Config {
        /**
         * 设备名称
         * 
         * 用于唯一标识设备。
         */
        name: string;
        /**
         * 设备宽度
         * 
         * 以像素为单位描述设备的宽度。
         */
        width: number;
        /**
         * 设备高度
         * 
         * 以像素为单位描述设备的高度。
         */
        height: number;
        /**
         * 设备型号
         * 
         * 用于更详细地描述设备的具体型号。
         */
        device: string;
        /**
         * 设备类型
         * 
         * 设备的分类，可以是手机、电脑、平板等预定义类型，也可以是自定义类型。
         */
        deviceType: "Phone" | "PC" | "Pad" | "iPad" | "custom";
        /**
         * 分辨率比例
         * 
         * 用于描述设备的分辨率与实际尺寸的比例。
         */
        resolutionRatio: string;
        /**
         * 背景覆盖区域
         * 
         * 可选属性，用于定义背景覆盖的布局，包括左上角坐标、宽度、高度和圆角大小。
         */
        coverBackground?: {
            left: number;
            width: number;
            top: number;
            height: number;
            borderRadius: number[];
        };
    }
}


/**
 * IConfig 命名空间声明了各种配置接口。
 * 这些接口用于定义组件的默认属性、事件、生命周期等。
 */
declare namespace IConfig {
    /**
     * IDefaultCategory 类型定义了组件的默认分类配置。
     * 包括分类的图标、名称、组件路径、规则等信息。
     */
    type IDefaultCategory = {
        index?: number;
        icon?: string;
        name?: string;
        component?: string[] | RegExp[];
        rule?: RegExp;
        isAll?: boolean;
    };
    /**
     * IDefaultAttrsMap 接口定义了组件的默认属性映射。
     * 允许通过键值对方式定义任意属性。
     */
    interface IDefaultAttrsMap {
        [key: string]: any;
    }

    /**
     * IEventMap 接口定义了组件的事件映射。
     * 通过键值对方式定义组件支持的事件及其类型。
     */
    interface IEventMap {
        [key: string]: (string)[] | string;
    }

    /**
     * ILifecycleMap 接口定义了组件的生命周期映射。
     * 包含了组件生命周期中的代码变量、代码片段和可选的函数。
     */
    interface ILifecycleMap {
        [key: string]: {
            codeVar?: string[];
            code?: string;
            function?: any;
        };
    }

    /**
     * IData 接口定义了组件的基本数据配置。
     * 包括组件名称、前缀、图标、文档链接等信息。
     */
    interface IData {
        name: string;
        prefix: string;
        icon?: string;
        docUrl?: string;
        removeAttrs?: string[];
        compMapping?: ICompMapping;
    }
    /**
     * ICompMapping 接口定义了组件映射。
     * 用于映射组件名称到其特定配置，支持多种组件类型。
     */
    interface ICompMapping {
        Button?: IButton;
        Tag?: Record<string, unknown>;
        Input?: IInput;
        InputNumber?: Record<string, unknown>;
        Select?: Record<string, unknown>;
        Switch?: Record<string, unknown>;
        Tooltip?: ITooltip;
        Popup?: IPopup;
        RadioGroup?: Record<string, unknown>;
        RadioButton?: IRadioButton;
        Cascader?: ICascader;
        CascaderPanel?: ICascader;
        Dropdown?: IDropdown;
        Dialog?: IDialog;
    }

    /**
     * IDialog 接口定义了对话框的配置。
     * 包括附加到身体、可见性、关闭时销毁等选项。
     */
    interface IDialog {
        appendToBody?: IAppendToBody | string;
        visible?: boolean | string;
        destroyOnClose?: string | any;
        header?: string;
        component?: string;
        [key: string]: any;
    }
    /**
     * IAppendToBody 接口定义了附加到身体的配置。
     * 包括附加的目标和组件配置。
     */
    interface IAppendToBody {
        attach?: string;
        component?: string;
        [key: string]: any;
    }
    /**
     * IDropdown 接口定义了下拉菜单的配置。
     * 包括选项和组件配置。
     */
    interface IDropdown {
        optionItems?: unknown;
        component?: string;
        [key: string]: any;
    }
    /**
     * ICascader 接口定义了级联选择器的配置。
     * 包括选项、严格检查、组件类型和值类型等。
     */
    interface ICascader {
        optionItems?: string;
        checkStrictly?: any;
        component?: string;
        valueType?: string | any;
        [key: string]: any;
    }
    /**
     * IRadioButton 接口定义了单选按钮的配置。
     * 包括值和组件配置。
     */
    interface IRadioButton {
        value?: string;
        component?: string;
        [key: string]: any;
    }
    /**
     * IPopup 接口定义了弹出窗口的配置。
     * 包括组件配置、默认值、内容和触发方式等。
     */
    export interface IPopup {
        component?: string;
        default?: string;
        content?: string;
        trigger?: any;
        visible?: any;
        [key: string]: any;
    }
    /**
     * ITooltip 接口定义了提示框的配置。
     * 包括内容、组件配置等。
     */
    interface ITooltip {
        content?: IContent | string;
        component?: string;
        [key: string]: any;
    }
    /**
     * IContent 接口定义了提示框内容的配置。
     * 包括内容、关闭时销毁和组件配置等。
     */
    interface IContent {
        content?: string;
        destroyOnClose?: any;
        component?: string;
        [key: string]: any;
    }
    /**
     * IInput 接口定义了输入框的配置。
     * 包括前缀图标、键盘事件、模型值和组件配置等。
     */
    interface IInput {
        prefixIcon?: string;
        onKeyup?: Record<string, unknown>;
        onEnter?: Record<string, unknown>;
        modelValue?: string;
        ['onUpdate:modelValue']?: string;
        component?: string;
        [key: string]: any;
    }
    /**
     * IButton 接口定义了按钮的配置。
     * 包括主题、文本和组件配置等。
     */
    interface IButton {
        theme?: string | any;
        text?: IText | string;
        component?: string;
        [key: string]: any;
    }
    /**
     * IText 接口定义了按钮文本的配置。
     * 包括变体、类型和组件配置等。
     */
    interface IText {
        variant?: string;
        type?: string;
        component?: string;
        [key: string]: any;
    }
}

/**
 * 定义了设置的命名空间。
 * 
 * 该命名空间包含了一组配置接口，用于描述应用程序的设置选项。
 */
declare namespace Setting {
    /**
     * 配置接口，用于定义应用程序的沉浸模式设置。
     * 
     * 沉浸模式是指应用程序在运行时尽可能减少干扰，提供更专注的用户体验的模式。
     */
    interface Config {
        /**
         * 指示是否启用左侧沉浸模式的布尔值。
         * 
         * 当设置为`true`时，应用程序将进入沉浸模式，隐藏或最小化其他界面元素，以提供更专注的操作体验。
         */
        immerseLeftMode: boolean;
        /**
         * 指示是否启用右侧沉浸模式的布尔值。
         * 
         * 当设置为`true`时，应用程序将进入沉浸模式，隐藏或最小化其他界面元素，以提供更专注的操作体验。
         */
        immerseRightMode: boolean;
    }
}

declare namespace plug {

    /**
    * 组件注册接口。
    */
    interface registerComps {
        globalComps: {
            Message: any;
            Notify: any;
            [key: string]: any;
        };
        allowDiffCateReg?: boolean;
        hiddenComps?: never[];
        allowRegPropsAndEmit?: boolean;
        categoryList?: any[]; // 添加了categoryList属性
        customComps?: any;
        cateRules?: any;
        clearDefaultCategory?: boolean;
        clearDefaultComps?: boolean;
        registerCloudUrl?: string;
        registerCloud?: boolean;
        /**
         * 可选的插槽映射，用于定义组件的插槽配置
         */
        slotsMap?: IDefaultSlotsMap | (() => IDefaultSlotsMap) | (() => Promise<IDefaultSlotsMap>);
        /**
         * 可选的生命周期映射，用于存储生命周期函数的相关信息
         * 
         * @property {string} key - 生命周期事件的键名
         * @property {string[]} codeVar - 与生命周期事件相关的变量名数组
         * @property {string} code - 生命周期事件的代码字符串
         * @property {any} function - 生命周期事件对应的函数对象
         */
        lifecycleMap?: {
            [key: string]: {
                codeVar?: string[];
                code?: string;
                function?: any;
            },
        };
        /**
         * 可选的原生事件映射，用于映射事件名称到事件类型
         */
        nativeEventMap?: {
            [key: string]: string[];
        };
        /**
         * 可选的属性映射，用于定义组件的各种属性及其配置
         */
        attrsMap?: {
            // 组件名称
            [key: string]: {
                // 属性名称
                [key: string]: {
                    // 属性的类型
                    type?: string | any;
                    // 属性的默认值
                    default?: any;
                    // 是否需要移除属性
                    removeAttr?: boolean;
                    // 属性的可选项列表，如果有的话
                    optionItems?: string[];
                    // 是否为必填属性
                    required?: boolean;
                    // 属性的扩展类型，可以是"Icon"或者字符串
                    expandType?: "Icon" | "Color" | string;
                    // 其他未明确列出的属性配置
                    [key: string]: any;
                }
            }
        };
    }

    interface designerInstall {
        useUI?: string;
        usePrefix?: string;
        useData?: any;
        compsConfig: plug.registerComps;
        iconUrl?: string;
        i18nInstance?: any;
    }

    interface renderInstall {
        customComps?: any;
        clearDefaultComps?: boolean;
        iconUrl?: string;
        UIName: string;
        appendUIMap?: any;
    }
}


interface InitObj {
    [key: string]: any;
}

interface AppendComp {
    [pKey: string]: {
        [key: string]: {
            value?: any;
            valueFn?: (params: any) => any;
        };
    };
}