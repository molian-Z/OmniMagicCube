<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
const customComps: any = inject("customComps");
const { customButton, customButtonGroup, customSlider } = customComps;

const props = defineProps({
  currentTime: {
    type: Number,
    required: true,
  },
  totalDuration: {
    type: Number,
    default: 3,
  },
  isPlaying: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (e: "play"): void;
  (e: "pause"): void;
  (e: "seek", time: number): void;
}>();

const { t } = useI18n();

// 内部时间值，用于滑块
const internalTime = ref(props.currentTime);

// 重置到开始
const resetToStart = () => {
  emit("pause");
  emit("seek", 0);
};

// 跳到结束
const skipToEnd = () => {
  emit("pause");
  emit("seek", props.totalDuration);
};

// 播放/暂停切换
const togglePlayPause = () => {
  if (props.isPlaying) {
    emit("pause");
  } else {
    emit("play");
  }
};

// 时间滑块变化
const handleTimeChange = (value: number) => {
  emit("seek", value);
};

// 监听外部时间变化
watch(
  () => props.currentTime,
  (newTime) => {
    internalTime.value = newTime;
  }
);
</script>

<template>
  <div class="timeline-controls">
    <div class="playback-controls">
      <customButtonGroup>
        <customButton @click="resetToStart" :title="t('animation.resetToStart', '回到开始')">
          <svg-icon icon="arrow-left" />
        </customButton>
        <customButton @click="togglePlayPause" :title="t('animation.playPause', '播放/暂停')">
          <svg-icon icon="video-pause" v-if="isPlaying" />
          <svg-icon icon="video-play" v-else />
        </customButton>
        <customButton @click="skipToEnd" :title="t('animation.skipToEnd', '跳到结束')">
          <svg-icon icon="arrow-right" />
        </customButton>
      </customButtonGroup>
    </div>

    <div class="time-slider">
      <customSlider
        v-model="internalTime"
        :min="0"
        :max="totalDuration"
        :step="0.01"
        @change="handleTimeChange"
        :format-tooltip="(val: any) => `${val.toFixed(2)}s`"
      />
    </div>

    <div class="time-display">
      {{ currentTime.toFixed(2) }}s / {{ totalDuration.toFixed(2) }}s
    </div>
  </div>
</template>

<style scoped lang="scss">
.timeline-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;

  .playback-controls {
    flex-shrink: 0;
  }

  .time-slider {
    min-width: 130px;
    flex-grow: 1;
  }

  .time-display {
    flex-shrink: 0;
    font-family: monospace;
    font-size: 14px;
    min-width: 120px;
    text-align: right;
  }
}
</style>
