import { modelValue, aiImRef, fullLoading, compsRef, selectedComp } from './designerData'
import { AIURL, contextLevel } from '@molian/utils/defaultData'
import { useUI } from '@molian/utils/UIMap'
import { getNthParent } from '@molian/utils/useCore'
import { createTemplate } from '@molian/utils/template-generator'
const dropComp = function (data, dropRef?: string) {
  if (data.type == 'ai') {

  }
}

/**
 * 生成AI语句。应该带上当前组件名（以及相关配置）待考虑。基于当前组件来生成语句。
 *  应带入当前组件的名称。
 * 应带入当前的组件库名称。
 * 获取数据后放置。
 */
export const createAIMessage = function (data: AI.CreateData) {
  // 获取上下文组件数据
  const contextModelValue = getNthParent(modelValue.value, data.dropRef, contextLevel)
  const contextCode = createTemplate([contextModelValue])
  // console.log(`<!-- 上下文代码 -->\n${contextCode}\n<!-- 上下文代码 -->`)
  // let messages: AI.message[] = [{
  //   role: "user",
  //   content: `<!-- 上下文代码 -->
  //   ${contextCode}
  //   <!-- 上下文代码 -->
  //   当前操作组件Ref：${data.dropRef}。
  //   请使用${useUI.value}组件库回答我以下问题： ${data.messageText}`
  // }]
  // 暂不支持自动描述
  // if (data.autoDesc) {
  //   messages.push({
  //     role: "assistant",
  //     content: data.autoDesc
  //   })
  // }
  // messages.push({
  //   role: "user",
  //   content: data.messageText
  // })
  let formatData = {
    ...data,
    contextCode
  }
  console.log(formatData)
  //return dropComp(request(formatData), data.dropRef)
}


const request = async function (data: AI.CreateData) {
  try {
    const res = await fetch(AIURL, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    return await res.json()
  } catch (error) {
    console.error(error)
  }
}