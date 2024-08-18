import { useChangeCase } from '@vueuse/integrations/useChangeCase'
/**
 * 将字符串转换为驼峰命名法
 * @param {string} str - 待转换的字符串
 * @returns {string} - 转换后的字符串
 */
const toCamelCase = function (str: string): string {
    // return str.replace(/[\s-]+(.)?/g, function (match: any, chr: string) {
    //   return chr ? chr.toUpperCase() : '';
    // });
    const changeCase = useChangeCase(str, 'camelCase')
    return changeCase.value;
}

/**
 * 将字符串转换为大驼峰命名法形式
 * @param {string} str - 待转换的字符串
 * @returns {string} - 转换后的大驼峰命名法字符串
 */
const toUpperCamelCase = function (str: string): string {
    // const reg = /(?:(?:^-?)|\-)([A-z])/g
    // return str.trim().replace(reg, (match: any, p1: string) => {
    //   return p1 ? p1.toUpperCase() : ''
    // })
    const changeCase = useChangeCase(str, 'pascalCase')
    return changeCase.value;
}

/**
 * 将给定的字符串转换为短横线命名法（kebab-case）的形式。
 * @param {string} str - 待转换的字符串
 * @returns {string} - 转换后的字符串
 */
export const toKebabCase = function (str: string): string {
    // const reg = /([A-Z])/g;
    // let ret = str.replace(reg, '-$1').toLowerCase();
    // if (ret.startsWith('-')) {
    //   return ret.slice(1);
    // }
    const changeCase = useChangeCase(str, 'kebabCase')
    return changeCase.value;
}

export const deepObjToArray: any = function (obj: any) {
    let newArr = []
    for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
            const value = obj[key]
            if (typeof value === 'object' && !Array.isArray(value)) {
                newArr.push({
                    label: key,
                    value: key,
                    children: deepObjToArray(value)
                })
            } else {
                newArr.push({
                    label: key,
                    value: key
                })
            }
        }
    }
    return newArr
}

export const deepModelValueToTree = (modelValue: CubeData.ModelValue[]) => {
    const data: CubeData.ModelValue[] = []
    return data
}

export const calculateRatio = function (width: number, height: number) {
    const gcd: any = (a: number, b: number) => {
        if (!b) return a;
        return gcd(b, a % b);
    };

    const divisor = gcd(width, height);
    const widthRatio = width / divisor;
    const heightRatio = height / divisor;

    return {
        "widthRatio": widthRatio,
        "heightRatio": heightRatio,
        "width": width,
        "height": height,
        "divisor": divisor,
        "ratio": `${widthRatio}:${heightRatio}`,
    };
}

export const scaleCalculate = function (originalWidth: number, originalHeight: number, originalBlockX: number, originalBlockY: number, newWidth: number, newHeight: number) {
    // 计算缩放比例
    const scaleX = newWidth / originalWidth;
    const scaleY = newHeight / originalHeight;

    // 将原屏幕中的坐标转换为新屏幕的坐标
    const newBlockX = originalBlockX * scaleX;
    const newBlockY = originalBlockY * scaleY;
    return {
        x: newBlockX,
        y: newBlockY
    }
}

export const generateUUID = function () {
    if (typeof crypto !== 'undefined' && !!crypto.randomUUID) {
        return crypto.randomUUID();
    } else {
        let d = new Date().getTime();
        if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
            d += performance.now(); // 高精度时间戳   
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = (d + Math.random() * 16) % 16 | 0; d = Math.floor(d / 16); return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }
}


export const getChartData = function(axisData: any, modelValue: any) {
    const series: { name: any; data: number[]; }[] = []
    modelValue.forEach((item: { data: any[]; name: any; }) => {
        const dataset: number[] = []
        axisData.forEach((axisItem: any) => {
            const currentItem = item.data.find((val: any) => {
                return val.name === axisItem
            })
            if (!!currentItem) {
                dataset.push(currentItem.value)
            } else {
                dataset.push(0)
            }
        })
        series.push({
            name: item.name,
            data: dataset
        })
    })
    return series
}