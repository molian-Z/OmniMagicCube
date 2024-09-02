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
    function: Function;
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
                 */
                type?: any;
                /**
                 * 属性的值。
                 */
                value?: any;
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
                type?: 'string' | 'variable';
                /**
                 * 指令的值。
                 */
                value?: string;
            };
            /**
             * 显示指令。
             */
            show?: {
                /**
                 * 指令的类型。
                 */
                type?: 'variable';
                /**
                 * 指令的值。
                 */
                value?: string[];
            };
            /**
             * 条件渲染指令。
             */
            if?: {
                /**
                 * 指令的类型。
                 */
                type?: 'variable';
                /**
                 * 指令的值。
                 */
                value?: string[];
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
                /**
                 * 列表项的索引键。
                 */
                indexKey?: string;
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
             * 外边距样式。
             */
            margin?: string[] | string | number | number[];
            /**
 * 内边距样式。
 */
            padding?: string[] | string | number | number[];
            /**
             * 水平对齐方式。
             */
            constX?: 'left' | 'center' | 'right' | 'left2right';
            /**
             * 垂直对齐方式。
             */
            constY?: 'top' | 'center' | 'bottom' | 'top2bottom';
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
            border?: string[] | string | number | number[];
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
             * 其他任意 CSS 属性。
             */
            [key: string]: any;
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
    };
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
            key:string;
            index:number;
            title:string;
            tags?:string[];
            desc?:string;
            on: {
                bind: 'event' | 'variable';
                compData?: {
                    key: string;
                    type: string;
                    name: string;
                    subTitle: string;
                };
            }[];
            verify:{
                bind:string;
                variable: string;
                op: string;
                data: any;
            }[];
            run:{
                bind:string;
                variagble: string;
                op: string;
                data: any;
            }[];
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
        messageText?: messageText;
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
        icon?: string;
        name?: string;
        component?: string[] | RegExp[];
        rule?: RegExp;
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
            codeVar: string[];
            code: string;
            function?: any;
        };
    }
    
    /**
     * IDefaultSlotsMap 接口定义了组件的默认插槽映射。
     * 描述了插槽的名称和配置，包括允许的组件类型和自动插槽等。
     */
    interface IDefaultSlotsMap {
        [key: string]: {
            [key: string]: {
                allowComps?: (string)[];
                auto?: boolean;
            } | string | boolean;
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
    };
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
        immerseLeftMode:boolean;
        /**
         * 指示是否启用右侧沉浸模式的布尔值。
         * 
         * 当设置为`true`时，应用程序将进入沉浸模式，隐藏或最小化其他界面元素，以提供更专注的操作体验。
         */
        immerseRightMode:boolean;
    }
}