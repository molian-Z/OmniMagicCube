<script setup lang="ts">
import { ref, inject, nextTick, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { modelValue, aiImRef, fullLoading } from '@molianComps/designer/designerData'
import { AIURL } from '@molian/utils/defaultData'
import svgIcon from '@molianComps/svg-icon/index.vue'
import floatBall from '@molianComps/float-ball/index.vue'
import loadComp from '@molianComps/loading/loading-1.vue'
const t: any = inject('mlLangs')
const customComps: any = inject('customComps')
const { customInput, customButton } = customComps
const message: any = inject('ml-message')
onClickOutside(aiImRef, () => {
  if (aiImRef.value.expand) {
    aiImRef.value.switchExpand(false)
  }
})

const messageData = ref<{
  content: string;
  key: number;
  role: 'user' | 'assistant';
}[]>([{
  role: "assistant",
  key: 123123,
  content: `您好,我是墨。\n有什么需要我为您做的么？`
}])
const messageText = ref<string>('')
const aiMessageRef = ref()

// 始终保持底部显示
const scrollToBottom = () => {
 nextTick(() => {
   if (aiMessageRef.value) {
    aiMessageRef.value.scrollTop = aiMessageRef.value.scrollHeight;
   }
 });
};

watch(messageData, () => {
 scrollToBottom();
}, {
 deep: true, // If your messages contain nested objects, you might need deep watching
});

const sendMsg = () => {
  if (messageText.value) {
    getCloudData()
    messageData.value.push({
      content: messageText.value,
      key: Math.random(),
      role: 'user'
    })
    messageText.value = ''
  } else {
    message.warning(t('container.inputEmpty'))
  }
}

const getCloudData = async () => {
  fullLoading.value = true
  try {
    const res = await fetch(AIURL, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{
          role:"user",
          content:messageText.value
        }]
      })
    })
    const data = await res.json()
    console.log(data)
    messageData.value.push({
      content: "正在为您写入数据请稍候。",
      key: Math.random(),
      role: 'assistant'
    })
  } catch (error) {
    message.error(error)
  }
  fullLoading.value = false
}
</script>

<template>
  <floatBall :title="t('container.aiIm')" ref="aiImRef" offsetX="52px">
    <template v-slot:toggle>
      <span class="newSpan"></span>
      <span class="newSpan"></span>
      <span></span>
      <span></span>
      <span></span>
    </template>
    <div class="ai-body">
      <div class="ai-container" ref="aiMessageRef">
        <template v-for="msg in messageData" :key="msg.key">
          <div class="ai-message" :class="msg.role === 'user' ? 'user' : 'assistant'">
            <div class="ai-message-avatar">
              <template v-if="msg.role === 'user'">
                <svg-icon icon="avatar"></svg-icon>
              </template>
              <template v-else>
                墨
              </template>
            </div>
            <div class="ai-message-text">
              {{ msg.content }}
            </div>
          </div>
        </template>
        <div class="ai-loading">
          <loadComp v-if="fullLoading"></loadComp>
        </div>
      </div>
      <div class="ai-footer-input">
        <customInput type="textarea" size="small" v-model="messageText" />
        <customButton theme="primary" size="small" :text="true" @click="sendMsg">发送</customButton>
      </div>
    </div>
  </floatBall>
</template>

<style lang="scss" scoped>
:deep(.toggle) {
  overflow: visible;
}

.toggle {
  span {
    position: absolute;
    height: 2px;
    width: 20px;
    background-color: var(--ml-fill-color-1, #E5E6EB);
    border-radius: 4px;
    cursor: pointer;
    transition: 0.5s;
    transform: translateY(0px) rotate(70deg);
    left: 4px;
  }

  span:nth-child(3) {
    width: 20px;
    left: -3px;
    transition: 0.5s;
    transform: translateY(0px) rotate(-70deg);
  }

  span:nth-child(2) {
    transform: translateY(-9px);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    left: 23px;
  }

  span:nth-child(1) {
    transform: translateY(3px) rotate(90deg);
    width: 14px;
    height: 6px;
    left: 19px;
  }

  span:nth-child(4) {
    transform: translateY(3px);
    width: 8px;
    left: 5px;
  }
}

.expand {
  --box_shadow_color: rgba(60, 62, 75, 0.2);
  --streamer_light_color: linear-gradient(to right, #03a9f4, #f441a5, #ffeb3b, #09a8f4);
  --streamer_inSize: 5px;
  --radius: 10px;
  --color: #fff;

  .toggle {
    span:nth-child(5) {
      transform: translateX(39px) rotate(-45deg);
      opacity: 0;
    }

    span:nth-child(1) {
      transform: translateX(-15px);
      transition-delay: 0.125s;
      width: 16px;
      animation: steamer 8s linear infinite;
    }

    span:nth-child(2) {
      transform: translateY(0px);
      transition-delay: 0.125s;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      left: 23px;
      animation: steamer 8s linear infinite;
    }

    span:nth-child(3) {
      width: 20px;
      transform: translateX(-39px) rotate(45deg);
      opacity: 0;
    }

    span:nth-child(4) {
      width: 20px;
      transform: translateY(40px) rotate(315deg);
      opacity: 0;
    }

    .newSpan {
      box-shadow: 0 2px 2px 1px var(--box_shadow_color);
      -webkit-box-reflect: below 0 linear-gradient(transparent, rgba(0, 0, 0, 0.2));
      background: var(--streamer_light_color);
      background-size: 400%;
      border-radius: var(--radius);
      color: var(--color);
    }

    .newSpan::before {
      content: "";
      position: absolute;
      inset: calc(var(--streamer_inSize) * -1);
      background: var(--streamer_light_color);
      background-size: 400%;
      border-radius: var(--radius);
      filter: blur(10px);
      animation: steamer 8s infinite;
    }
  }
}

@keyframes steamer {
  100% {
    background-position: -400% 0;
  }
}


.ai-body {
  width: 100%;
  height: calc(100% - 16px);
  background-color: var(--ml-bg-color);
  padding: var(--ml-pd-base);
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  border-radius: var(--ml-radius-lg);

  .ai-container {
    height: calc(100% - 54px);
    overflow: auto;
    padding: var(--ml-pd-base);

    .ai-message {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: var(--ml-mg-lg);

      .ai-message-avatar {
        width: 48px;
        min-width: 48px;
        height: 48px;
        border-radius: 50%;
        font-size: 22px;
        color: var(--ml-fill-color-1);
        background-color: var(--ml-bg-color);
        box-shadow: var(--ml-shadow-small), var(--ml-shadow-small-inset);
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .ai-message-text {
        margin-left: 10px;
        font-size: 14px;
        padding: var(--ml-pd-base);
        border-radius: var(--ml-radius-small);
        box-shadow: var(--ml-shadow-small);
        white-space: pre-wrap;
      }

      &.user {
        flex-direction: row-reverse;

        .ai-message-text {
          color: var(--ml-text-reverse-color-1);
          background-color: var(--ml-primary-color);
        }
      }

      &.assistant {
        .ai-message-avatar {
          background-color: var(--ml-primary-color);
          color: var(--ml-text-reverse-color-1);
          user-select: none;
        }

        .ai-message-text {
          color: var(--ml-info-color-9);
          background-color: var(--ml-fill-color-5);
        }
      }
    }
  }

  .ai-loading {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .ai-footer-input {
    display: flex;
    align-items: center;
    width: 100%;
  }
}
</style>