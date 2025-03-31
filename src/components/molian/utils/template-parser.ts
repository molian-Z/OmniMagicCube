import { parse } from '@vue/compiler-sfc'
import { parse as babelParse } from '@babel/parser';
export class TemplateParser {
    createAst(template:string) {
        return parse(template)
    }

    parseAst({ descriptor }: { descriptor: { template: { type: string; ast: any }; scriptSetup?: any; script?: any } }) {
        const {
            template,
            scriptSetup,
            script
        } = descriptor
        const {
            type,
            ast
        } = template
        if (type === 'template') {
            // 解析Template
            const astData = ast.children && deepAst(ast.children) || []

            // 解析JS
            let scriptCode = script && script.content || script && scriptSetup.content || null
            let scriptData = babelParse(scriptCode, {
                sourceType: 'module',
                plugins: ['typescript']  // 如果需要解析 TypeScript
            });
            const parseScriptCode = scriptCode && new JsParseCode(scriptCode).deepScript(scriptData) || []
            const newScriptCode = {
                import: {},
                export: {},
                variable: {},
            }
            parseScriptCode.forEach((item: JsParseResult) => {
                if (item.type === 'import' && item.moduleName && item.importNames) {
                    (newScriptCode.import as Record<string, string[]>)[item.moduleName] = item.importNames;
                } else if (item.type === 'export') {
                    newScriptCode.export = item;
                } else if (item.type === 'variable' && item.data) {
                    item.data.forEach((varItem: { data?: { key?: string; value: any } }) => {
                        if (varItem.data && varItem.data.key) {
                            (newScriptCode.variable as Record<string, any>)[varItem.data.key] = varItem.data.value;
                        }
                    });
                }
            })
            return {
                templateData: astData,
                jsData: newScriptCode
            }
        } else {
            return {
                code: -1,
                message: "template模板缺少template节点"
            }
        }
    }
}
// 深度解析Ast语句
function deepAst(data: AstNode[]):any[] {
    const newData:any[] = []
    if (data && data.length > 0) {
        data.forEach(item => {
            const tagData = parseTag(item)
            if (!!tagData) {
                newData.push(tagData)
            }
        })
    }
    return newData
}

function parseAttrs(attrs: AstProp[]): {
    attrs: Record<string, any>;
    on: Record<string, any>;
    directives: Record<string, any>;
} {
    const objAttr: Record<string, any> = {},
        objOn: Record<string, any> = {},
        objDirectives: Record<string, any> = {}
    attrs && attrs.map(item => {
        if (item.type === 6) {
            // const or let
            if (item.value && item.value.type === 2) {
                objAttr[item.name] = item.value.content
            } else {
                console.log(item)
            }
        } else if (item.type === 7) {
            // v-bind or v-on or v-for or v-if or v-show
            if (item.name === 'on') {
                if (item.exp && item.exp.type === 4 && item.arg?.content) {
                    objOn[item.arg.content] = {
                        type: 'function',
                        value: {
                            codeVar: [],
                            code: '',
                            modifiers: item.modifiers,
                        }
                    }
                }
            } else if (item.name === 'bind') {
                // 动态数据应从动态内容中获取否则从静态内容中获取
                if (item.arg?.content === 'key') {
                    if (!('for' in objDirectives)) {
                        objDirectives.for = {}
                    }
                    (objDirectives.for as Record<string, any>).idKey = item.exp?.ast?.value || item.exp?.content
                } else if (item.arg?.content) {
                    objAttr[item.arg.content] = item.exp?.ast?.value || item.exp?.content
                }
            } else if (item.name === 'for') {
                const {
                    source,
                    value,
                    key,
                    index
                }:any = item.forParseResult
                objDirectives.for = {
                    type: source.ast && source.ast.value && 'number' || 'variable',
                    value: source.ast && source.ast.value || source.content.split('.'),
                }
                if (value) {
                    objDirectives.for.dataKey = value.content
                }
                if (key) {
                    objDirectives.for.objectKey = key.content
                }
                if (index) {
                    objDirectives.for.indexKey = index.content
                }
            } else if (item.name === 'if' || item.name === 'show') {
                objDirectives[item.name] = {
                    type: 'variable',
                    value: item?.exp?.content.split('.'),
                }
            } else {
                console.log(item)
            }
        } else {
            console.log(item)
        }
    })
    // 循环、修饰符、变量、样式、相关代码
    return {
        attrs: objAttr,
        on: objOn,
        directives: objDirectives
    }
}

// 是否有效标签
function isValid(data: AstNode): boolean {
    if (data.type === 3) {
        // type = 3 是注释语句
        return false
    } else {
        return true
    }
}

//解析标签
function parseTag(data: AstNode): false | {
    name: string;
    attrs: Record<string, any>;
    on: Record<string, any>;
    directives: Record<string, any>;
    slots?: {
        default: {
            children: any[];
        };
    };
} {
    let obj:any = {}
    if (data.type === 0) {
        // 根标签
        return false
    } else if (data.type === 1) {
        // 标签内容
        obj.name = data.tag
    } else if (data.type === 2) {
        // 文本内容
        obj.name = 'text'
        obj.directives = {
            "text": {
                "type": "string",
                "value": data.content
            }
        }
    } else if (data.type === 3) {
        // 注释内容
        return false
    } else if (data.type === 5) {
        // 动态变量绑定的标签
        obj.name = 'text'
        obj.directives = {
            "text": {
                "type": "variable",
                "value": typeof data.content === 'string' 
                    ? data.content.split('.')
                    : data.content?.content?.split('.')
            }
        }
    } else {
        console.log(data)
    }

    // 原有代码添加类型
    const attrsData: AttrsData = !!data.props && parseAttrs(data.props) || {
        attrs: {},
        on: {},
        directives: {}
    }
    
    obj.attrs = attrsData.attrs || {}
    obj.on = attrsData.on || {}
    obj.directives = {
        ...obj.directives,
        ...attrsData.directives
    }

    // 为text时确认数据 为v-for确认数据
    if (data.children && data.children.length > 0) {
        obj.slots = {
            default: {
                children: deepAst(data.children)
            }
        } as SlotData
    }
    return obj
}


/**
 * jsCode解析
 */
class JsParseCode {
    private code: string;
    private ast: any;
    private _type: Record<string, (info: any) => any>;
    constructor(code:string) {
        this.code = code
        this.ast = null
        this._type = {
            Literal: (info) => {
                return info.value
            },
            Identifier: (info) => {
                return info.name
            },
            AssignmentPattern: (info) => {
                return [this._type[info.left.type](info.left), this._type[info.right.type](info.right)]
            },
            ObjectExpression: (info) => {
                let obj:Record<string, any> = {
                    __code: this.code.substring(info.start, info.end),
                }
                this.propsParse(info.properties).forEach(item => {
                    obj[item.key] = item.value
                })
                return obj
            },
            ArrayExpression: (info) => {
                return info.elements.map((item: any) => this._type[item.type](item))
            },
            FunctionExpression: (info) => {
                const {
                    async,
                    params,
                    body,
                    start,
                    end
                } = info
                return {
                    type: "function",
                    value: {
                        code: this.code.substring(body.start + 1, body.end - 1),
                        codeVar: this.paramsParse(params),
                        functionMode: !!async ? "asyncFunction" : "function",
                        arrow: false,
                        __code: this.code.substring(body.start, body.end)
                    },
                    blockData: this._type.BlockStatement(info.body)
                }
            },
            ArrowFunctionExpression: (info) => {
                const {
                    async,
                    params,
                    body
                } = info
                return {
                    type: "function",
                    value: {
                        __code: this.code.substring(body.start + 1, body.end - 1),
                        codeVar: this.paramsParse(params),
                        functionMode: !!async ? "asyncFunction" : "function",
                        arrow: true
                    },
                    blockData: this._type.BlockStatement(info.body)
                }
            },
            ExpressionStatement: (info) => {
                let obj = {
                    type: info.type,
                    __code: this.code.substring(info.start, info.end),
                    data: this._type[info.expression.type](info.expression)
                }
                return obj
            },
            CallExpression: (info) => {
                return {
                    type: "callFunction",
                    arguments: this.paramsParse(info.arguments),
                    data: this._type[info.callee.type](info.callee),
                    __code: this.code.substring(info.start, info.end)
                }
            },
            BlockStatement: (info) => {
                return info.body.map((item: acorn.Node) => {
                    return this._type[item.type](item)
                })
            },
            ReturnStatement: (info) => {
                return {
                    type: 'return',
                    data: this._type[info.argument.type](info.argument),
                    __code: this.code.substring(info.start, info.end)
                }
            },
            MemberExpression: (info) => {
                // 递归执行(待完善)
                return {
                    type: "object",
                    data: info,
                    __code: this.code.substring(info.start, info.end)
                }
            },
            Property: (info) => {
                const {
                    value,
                    type,
                    key
                } = info
                let obj:any = {
                    __code: this.code.substring(info.start, info.end),
                }
                if (typeof value === 'object') {
                    if (type === 'ObjectExpression') {
                        obj.value = this.declarationParse(value)
                    } else {
                        obj.value = this._type[value.type](value)
                    }
                } else {
                    obj.value = value
                }
                obj.key = this._type[key.type](key)
                return obj
            }
        }
    }

    // 递归
    deepScript(data: acorn.Node): JsParseResult[] {
        if (!data || !('body' in data)) {
            return [];
        }

        const { body } = data as { body: acorn.Node[] };
        const scriptData: JsParseResult[] = [];

        body.forEach((item: acorn.Node & { start: number; end: number }) => {
            if ('start' in item && 'end' in item) {
                const parsedItem: JsParseResult = {
                    __code: this.code.substring(item.start, item.end),
                    ...this.topParse(item)
                };
                scriptData.push(parsedItem);
            }
        });

        return scriptData;
    }

    // 顶部格式化
    topParse(codeData: CodeData): JsParseResult {
        const { type } = codeData;
        let obj: Partial<JsParseResult> = {};

        switch (type) {
            case "ImportDeclaration":
                if (codeData.specifiers && codeData.source?.value) {
                    obj = {
                        type: "import",
                        moduleName: codeData.source.value,
                        importNames: this.specifiersParse(codeData.specifiers).map(item => item.imported)
                    };
                }
                break;

            case "ExportDefaultDeclaration":
                if (codeData.declaration) {
                    const data = this.declarationParse(codeData.declaration);
                    obj = {
                        type: "export",
                        data: data.data,
                        exportName: "default"
                    };
                }
                break;

            case "VariableDeclaration":
                if (codeData.declarations) {
                    obj = {
                        type: "variable",
                        data: codeData.declarations.map(item => this.declarationParse(item)),
                        kind: codeData.kind
                    };
                }
                break;

            case "FunctionDeclaration":
                obj = {
                    type: "variable",
                    data: [this.declarationParse(codeData)],
                    kind: "global"
                };
                break;

            default:
                console.warn(`未处理的代码类型: ${type}`);
                break;
        }

        return obj as JsParseResult;
    }

    // 说明解析
    specifiersParse(specifiers: ImportSpecifier[]): Array<{
        imported: string;
        local: string;
    }> {
        const data: Array<{ imported: string; local: string }> = [];
        
        specifiers.forEach(item => {
            const { type, imported, local } = item;
            
            switch (type) {
                case "ImportSpecifier":
                    if (imported?.type && local?.type) {
                        data.push({
                            imported: this._type[imported.type](imported),
                            local: this._type[local.type](local)
                        });
                    }
                    break;
                default:
                    console.warn(`未处理的导入类型: ${type}`);
                    break;
            }
        });

        return data;
    }


    // 声明格式化
    declarationParse(data: DeclarationData): DeclarationResult {
        const {
            id,
            init,
            type,
            properties,
        } = data;

        const obj: Partial<DeclarationResult> = {};

        switch (type) {
            case "ObjectExpression":
                obj.type = type;
                obj.data = this.propsParse(properties || []);
                break;
            case "VariableDeclarator":
                if (id?.name) {
                    obj.type = type;
                    obj.data = {
                        key: id.name,
                        value: this.valueParse(init)
                    };
                }
                break;
            case "FunctionDeclaration":
                if (data.id) {
                    obj.type = type;
                    obj.data = {
                        key: this._type[data.id.type](data.id),
                        value: this._type.FunctionExpression(data)
                    };
                }
                break;
            default:
                console.warn(`未处理的声明类型: ${type}`);
                break;
        }

        return obj as DeclarationResult;
    }

    // 属性解析
    propsParse(props: any[]): any[] {
        const data:any[] = []
        props.forEach(item => {
            data.push(this._type[item.type](item))
        })
        return data
    }

    // 初始化代码解析
    valueParse(valueData: any): any {
        return this._type[valueData.type](valueData)
    }

    paramsParse(params: any[]): any[] {
        return params.map(item => this._type[item.type](item))
    }
}


// AST 节点接口
interface AstNode {
    type: number;
    tag?: string;
    content?: string | {
        content: string;
    };
    children?: AstNode[];
    props?: AstProp[];
}

// AST 属性接口
interface AstProp {
    type: number;
    name: string;
    value?: {
        type: number;
        content: string;
    };
    exp?: {
        type: number;
        content: string;
        ast?: {
            value: any;
        };
    };
    arg?: {
        content: string;
    };
    modifiers?: string[];
    forParseResult?: {
        source: {
            ast?: {
                value: any;
            };
            content: string;
        };
        value?: {
            content: string;
        };
        key?: {
            content: string;
        };
        index?: {
            content: string;
        };
    };
}

// 解析结果接口
interface ParseResult {
    templateData: any[];
    jsData: {
        import: Record<string, string[]>;
        export: any;
        variable: Record<string, any>;
    };
}

// JS解析代码接口
interface JsParseResult {
    type: string;
    moduleName?: string;
    importNames?: string[];
    data?: any;
    kind?: string;
    __code?: string;
    exportName?: string;
}

// 定义属性数据接口
interface AttrsData {
    attrs: Record<string, any>;
    on: Record<string, any>;
    directives: Record<string, any>;
}

// 定义插槽接口
interface SlotData {
    default: {
        children: ReturnType<typeof deepAst>;
    };
}

// 定义声明解析的输入接口
interface DeclarationData {
    id?: {
        name: string;
        type: string;
    };
    init?: any;
    type: string;
    start: number;
    end: number;
    properties?: any[];
    params?: any[];
    body?: any;
}

// 定义声明解析的返回接口
interface DeclarationResult {
    type: string;
    data: {
        key?: string;
        value?: any;
    } | any[];
}

// 定义导入说明符接口
interface ImportSpecifier {
    type: string;
    start: number;
    end: number;
    imported: {
        type: string;
        name: string;
    };
    local: {
        type: string;
        name: string;
    };
}

interface CodeData extends acorn.Node {
    specifiers?: ImportSpecifier[];
    source?: {
        value: string;
    };
    declaration?: any;
    declarations?: any[];
    kind?: string;
}