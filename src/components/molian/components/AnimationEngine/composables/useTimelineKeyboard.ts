import { Ref } from 'vue';
import { AnimationEffect } from '../types/animation';

export function useTimelineKeyboard(
  isKeyboardFocused: Ref<boolean>,
  currentTime: Ref<number>,
  totalDuration: Ref<number>,
  currentEffectIndex: Ref<number>,
  effects: Ref<AnimationEffect[]>,
  emit: Function
) {
  // 处理键盘快捷键
  const handleKeyDown = (event: KeyboardEvent) => {
    // 只有在时间轴获得焦点时才处理快捷键
    if (!isKeyboardFocused.value) return;
    
    switch (event.key) {
      case ' ': // 空格键：播放/暂停
        event.preventDefault();
        emit('play-toggle');
        break;
      case 'ArrowLeft': // 左箭头：后退一帧
        event.preventDefault();
        const prevTime = Math.max(0, currentTime.value - 0.033); // 假设30fps，一帧约33ms
        emit('time-update', prevTime);
        break;
      case 'ArrowRight': // 右箭头：前进一帧
        event.preventDefault();
        const nextTime = Math.min(totalDuration.value, currentTime.value + 0.033);
        emit('time-update', nextTime);
        break;
      case 'Home': // Home键：跳到开始
        event.preventDefault();
        emit('time-update', 0);
        break;
      case 'End': // End键：跳到结束
        event.preventDefault();
        emit('time-update', totalDuration.value);
        break;
      case 'Delete': // Delete键：删除当前选中的效果
        event.preventDefault();
        if (currentEffectIndex.value >= 0) {
          const updatedEffects = [...effects.value];
          updatedEffects.splice(currentEffectIndex.value, 1);
          emit('effect-update', updatedEffects);
        }
        break;
    }
  };

  // 设置焦点状态
  const handleFocus = () => {
    isKeyboardFocused.value = true;
  };

  const handleBlur = () => {
    isKeyboardFocused.value = false;
  };

  return {
    handleKeyDown,
    handleFocus,
    handleBlur
  };
}