<script setup lang="ts">
import { ref, inject, nextTick, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { modelValue, aiImRef, fullLoading, compsRef } from '@molianComps/Designer/designerData'
import { AIURL } from '@molian/utils/defaultData'
import svgIcon from '@molianComps/SvgIcon/index.vue'
import floatBall from '@molianComps/FloatBall/index.vue'
import loadComp from '@molianComps/Loading/loading-1.vue'
import { generateUUID } from '@molian/utils/util'
import { useUI } from '@molian/utils/UIMap'
const t: any = inject('mlLangs')
const customComps: any = inject('customComps')
const { customInput, customButton } = customComps
const message: any = inject("mlMessage")
const { showMenu, isOpenedMenu } = <any>inject('cmdMenu');
onClickOutside(aiImRef, (event) => {
  if (aiImRef.value.expand && !isOpenedMenu()) {
    aiImRef.value.switchExpand(false)
  }
}, {
  ignore: [],
})
const messageData = ref<{
  content?: string;
  key: number | string;
  role: 'user' | 'assistant' | 'system';
  type?: 'menu' | 'info';
}[]>([{
  role: "assistant",
  key: 1000000,
  content: `您好,我是墨。有什么需要我为您做的么？`
}])
const messageText = ref<string>('')
const currentStatus = ref<'' | null | 'primary' | 'success' | 'error'>(null)
const aiMessageRef = ref()

watch(messageData, () => {
  scrollToBottom();
}, {
  deep: true, // If your messages contain nested objects, you might need deep watching
});

const onContextMenu = (e: MouseEvent) => {
  e.preventDefault();
  showMenu({
    zIndex: 1200,
    x: e.x,
    y: e.y,
    items: Object.values(compsRef).map((item: any) => {
      return {
        label: item.comp.name + '_' + item.comp.key,
        onClick: () => {
          console.log(item)
        }
      }
    })
  });
}

const sendMsg = () => {
  if (messageText.value) {
    getCloudData(messageText.value)
    messageData.value.push({
      content: messageText.value,
      key: generateUUID(),
      role: 'user'
    })
    messageText.value = ''
  } else {
    message.warning(t('container.inputEmpty'))
  }
}

const getCloudData = async (messageText: string) => {
  fullLoading.value = true
  scrollToBottom()
  let pleaseUse = t("container.pleaseUse") + '"' + useUI.value + '"' + t("container.ui") + '\n'
  try {
    const res = await fetch(AIURL, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{
          role: "user",
          content: pleaseUse + messageText
        }]
      })
    })
    const data = await res.json()
    if (!data.success) {
      message.error(t('container.getDataError'))
    } else {
      messageData.value.push({
        content: data.info,
        key: generateUUID(),
        role: 'assistant'
      })
      messageData.value.push({
        key: generateUUID(),
        role: "system",
        type: 'menu'
      })
      scrollToBottom()
    }

  } catch (error) {
    message.error(error)
  }
  fullLoading.value = false
}

// 始终保持底部显示
const scrollToBottom = () => {
  nextTick(() => {
    if (aiMessageRef.value) {
      aiMessageRef.value.scrollTop = aiMessageRef.value.scrollHeight;
    }
  });
};
</script>

<template>
  <floatBall :title="t('container.aiIm')" ref="aiImRef" offsetX="52px" expandWidth="455px">
    <template v-slot:toggle>
      <span></span>
      <span class="newSpan"></span>
      <span></span>
      <span class="newSpan"></span>
      <span></span>
    </template>
    <div class="ai-body">
      <div class="ai-container" ref="aiMessageRef">
        <template v-for="msg in messageData" :key="msg.key">
          <div class="ai-message" :class="[msg.role, !!msg.type ? msg.type : '']" v-if="msg.role !== 'system'">
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
          <div class="ai-message-action" @click="onContextMenu" v-else>
            <div :class="['ai-message-action__text', msg.type]">
              {{ t('container.dropContent') }}
            </div>
          </div>
        </template>
        <div class="ai-loading">
          <div :class="['ai-holdOnPlease', currentStatus]" v-if="currentStatus !== null">{{ t('container.settingData') }}
            {{ t('container.holdOnPlease') }}</div>
          <loadComp v-if="fullLoading"></loadComp>
        </div>
      </div>
      <div class="ai-footer-input">
        <customInput type="textarea" :autosize="true" size="small" v-model="messageText" />
        <customButton theme="primary" style="margin-left:var(--ml-mg-small);height:100%;" size="small" :text="true"
          @click="sendMsg">{{ t('container.send') }}</customButton>
      </div>
    </div>
  </floatBall>
</template>

<style lang="scss" scoped>
:deep(.toggle) {
  overflow: visible;
  width: calc(100% - var(--ml-mg-lg)) !important;
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
      opacity: 0;
    }

    span:nth-child(2) {
      transform: translateY(0px);
      transition-delay: 0.125s;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      left: calc(100% - 24px);
      animation: steamer 8s linear infinite;
    }

    span:nth-child(3) {
      width: 20px;
      transform: translateX(-39px) rotate(45deg);
      opacity: 0;
    }

    span:nth-child(4) {
      width: calc(100% - 44px);
      animation: steamer 8s linear infinite;
      height: 6px;
      transform: translateY(0px);
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
  height: 100%;
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
          background: linear-gradient(-45deg, var(--ml-primary-color-4), var(--ml-primary-color));
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
          background: linear-gradient(-45deg, var(--ml-fill-color-4), var(--ml-fill-color-5));
        }
      }
    }

    .ai-message-action {
      margin: var(--ml-mg-lg);
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;

      .ai-message-action__text {
        padding: var(--ml-pd-base) var(--ml-pd-lg);
        box-shadow: var(--ml-shadow-small);
        border-radius: var(--ml-radius-small);
      }

      .ai-message-action__text.menu {
        background-color: var(--ml-primary-color);
        color: var(--ml-text-reverse-color-1);
        cursor: pointer;
        user-select: none;
      }

      .ai-message-action__text.info {
        background-color: var(--ml-bg-color);
        color: var(--ml-fill-color-1);
      }
    }
  }

  .ai-holdOnPlease {
    margin: var(--ml-mg-lg) 0;
    padding: var(--ml-mg-base) var(--ml-pd-lg);
    font-weight: bold;
    background: var(--ml-bg-color);
    border-radius: var(--ml-mg-base);
    box-shadow: var(--ml-shadow-small);
    text-align: center;
    user-select: none;

    &.success {
      color: var(--ml-text-reverse-color-1);
      background-color: var(--ml-success-color);
    }

    &.error {
      color: var(--ml-text-reverse-color-1);
      background-color: var(--ml-danger-color);
    }

    &.primary {
      color: var(--ml-text-reverse-color-1);
      background-color: var(--ml-primary-color);
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