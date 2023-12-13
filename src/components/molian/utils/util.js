/**
 * 将字符串转换为驼峰命名法
 * @param {string} str - 待转换的字符串
 * @returns {string} - 转换后的字符串
 */ 
const toCamelCase = function (str) {  
  return str.replace(/[\s-]+(.)?/g, function(match, chr) {
    return chr ? chr.toUpperCase() : '';
  });
}

/**
 * 将字符串转换为大驼峰命名法形式
 * @param {string} str - 待转换的字符串
 * @returns {string} - 转换后的大驼峰命名法字符串
 */
const toUpperCamelCase = function (str) {
  const reg = /(?:(?:^-?)|\-)([A-z])/g
  return str.trim().replace(reg, (match, p1) => {
    return p1 ? p1.toUpperCase() : ''
  })
}

/**
 * 将给定的字符串转换为短横线命名法（kebab-case）的形式。
 * @param {string} str - 待转换的字符串
 * @returns {string} - 转换后的字符串
 */
export const toKebabCase = function(str) {  
  const reg = /([A-Z])/g;
  let ret = str.replace(reg, '-$1').toLowerCase();
  if (ret.startsWith('-')) {
    return ret.slice(1);
  }
  return ret;
}