/**
* 定义基本的数据类型别名。
* 每个键都映射到一个相应的类型。
*/
type ValueTypes = {
    /**
     * 字符串类型。
     */
    string: string;
    /**
     * 数字类型。
     */
    number: number;
    /**
     * 布尔类型。
     */
    boolean: boolean;
    /**
     * 对象类型，使用 Record 泛型来表示任意对象。
     */
    object: Record<string, any>;
    /**
     * 数组类型，元素可以是任意类型。
     */
    array: any[];
    /**
     * 函数类型。
     */
    function: Function;
    /**
     * 计算类型，通常用于表示计算结果，这里使用了 any 类型。
     */
    computed: any;
};

/**
* 定义函数相关的元数据类型。
* 包含函数代码、变量、修饰符、模式等信息。
*/
type FunctionDefinition = {
    /**
     * 函数的键，可以是任意字符串。
     */
    [key: string]: {
        /**
         * 表示这是一个函数类型。
         */
        type?: 'function';
        /**
         * 函数相关的值。
         */
        value?: {
            /**
             * 函数的代码字符串。
             */
            code?: string;
            /**
             * 函数的变量数组或对象。
             */
            codeVar?: string[] | { name: string; value: any }[];
            /**
             * 函数的修饰符数组。
             */
            modifiers?: string[];
            /**
             * 函数的模式，可以是普通函数或异步函数。
             */
            functionMode: 'function' | 'asyncFunction';
            /**
             * 表示这是一个箭头函数。
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
                bind:string;
                component: string;
                data: string;
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
 * AI 命名空间生命类型和接口。
 */
declare namespace AI {
    interface CreateData {
        autoDesc?: string;
        messageText?: messageText;
        useUI?: string;
        dropRef?: string;
        contextCode?:string;
    }

    interface message{
        content?: string;
        role: 'user' | 'assistant';
    }
}

declare namespace Device {
    interface Config {
        name: string;
        width: number;
        height: number;
        device: string;
        deviceType: "Phone" | "PC" | "Pad" | "iPad" | "custom";
        resolutionRatio: string;
        coverBackground?: {
            left: number;
            width: number;
            top: number;
            height: number;
            borderRadius: number[];
        };
    }
}


declare namespace IConfig {
    type IDefaultCategory = {
        icon?: string;
        name?: string;
        component?: string[] | RegExp[];
        rule?: RegExp;
    };
    interface IDefaultAttrsMap {
        [key: string]: any;
    }
    
    interface IEventMap {
        [key: string]: (string)[] | string;
    }
    
    interface ILifecycleMap {
        [key: string]: {
            codeVar: string[];
            code: string;
            function?: any;
        };
    }
    
    interface IDefaultSlotsMap {
        [key: string]: {
            [key: string]: {
                allowComps?: (string)[];
                auto?: boolean;
            } | string | boolean;
        };
    }
    
    // interface IUIMap {
    //     useUI: string;
    //     debug?: boolean;
    //     usePrefix?: string;
    //     data: Array<IData>;
    // }
    interface IData {
        name: string;
        prefix: string;
        icon?: string;
        docUrl?: string;
        removeAttrs?: string[];
        compMapping?: ICompMapping;
    };
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
    
    interface IDialog {
        appendToBody?: IAppendToBody | string;
        visible?: boolean | string;
        destroyOnClose?: string | any;
        header?: string;
        component?: string;
        [key: string]: any;
    }
    interface IAppendToBody {
        attach?: string;
        component?: string;
        [key: string]: any;
    }
    interface IDropdown {
        optionItems?: unknown;
        component?: string;
        [key: string]: any;
    }
    interface ICascader {
        optionItems?: string;
        checkStrictly?: any;
        component?: string;
        valueType?: string | any;
        [key: string]: any;
    }
    interface IRadioButton {
        value?: string;
        component?: string;
        [key: string]: any;
    }
    export interface IPopup {
        component?: string;
        default?: string;
        content?: string;
        trigger?: any;
        visible?: any;
        [key: string]: any;
    }
    interface ITooltip {
        content?: IContent | string;
        component?: string;
        [key: string]: any;
    }
    interface IContent {
        content?: string;
        destroyOnClose?: any;
        component?: string;
        [key: string]: any;
    }
    interface IInput {
        prefixIcon?: string;
        onKeyup?: Record<string, unknown>;
        onEnter?: Record<string, unknown>;
        modelValue?: string;
        ['onUpdate:modelValue']?: string;
        component?: string;
        [key: string]: any;
    }
    interface IButton {
        theme?: string | any;
        text?: IText | string;
        component?: string;
        [key: string]: any;
    }
    interface IText {
        variant?: string;
        type?: string;
        component?: string;
        [key: string]: any;
    }
}

/**
* 为 Setting 命名空间声明类型和接口。
*/
declare namespace Setting {
    interface Config {
        immerseMode:boolean;
    }
}