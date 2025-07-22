import { Ref } from 'vue';
import { AnimationEffect } from '../types/animation';

// 定义常量
export const LABEL_WIDTH = 100;

export function useTimelineEvents(
  timelineCanvas: Ref<HTMLCanvasElement | null>,
  timeScale: Ref<number>,
  isDragging: Ref<boolean>,
  selectedKeyframe: Ref<{
    effect: AnimationEffect;
    index: number;
    type: "start" | "end";
  } | null>,
  effects: Ref<AnimationEffect[]>,
  totalDuration: Ref<number>,
  drawTimeline: Function,
  emit: Function
) {
  // 处理时间轴点击
  const handleTimelineClick = (event: MouseEvent) => {
    if (!timelineCanvas.value) return;
    
    const rect = timelineCanvas.value.getBoundingClientRect();
    const x = event.clientX - rect.left;
    
    // 如果点击在标签区域内，只选择效果，不更新时间
    if (x < LABEL_WIDTH) {
      const y = event.clientY - rect.top;
      const trackHeight = 30;
      
      // 计算点击了哪个轨道
      const trackIndex = Math.floor((y - 30) / trackHeight);
      if (trackIndex >= 0 && trackIndex < effects.value.length) {
        emit("effect-select", trackIndex);
      }
      return; // 添加return，防止在标签区域点击时继续执行后续代码
    }
    
    // 设置当前时间 - 考虑标签宽度计算实际时间
    const timeX = x - LABEL_WIDTH;
    const time = Math.max(0, Math.min(totalDuration.value, timeX / timeScale.value));
    emit("time-update", time);
    
    // 检查是否点击了关键帧
    checkKeyframeClick(x, event.clientY - rect.top);
    
    // 重绘时间轴
    drawTimeline();
  };

  // 检查是否点击了关键帧
  const checkKeyframeClick = (x: number, y: number) => {
    const trackHeight = 30;
    
    effects.value.forEach((effect, index) => {
      const trackY = 30 + index * trackHeight + trackHeight / 2;
      
      // 调整开始和结束位置，考虑标签宽度
      const startX = LABEL_WIDTH + effect.delay * timeScale.value;
      const endX = startX + (effect.duration * timeScale.value);
      
      // 检查开始关键帧
      if (Math.abs(x - startX) <= 6 && Math.abs(y - trackY) <= 6) {
        selectedKeyframe.value = { effect, index, type: "start" };
        emit("effect-select", index);
        return;
      }
      
      // 检查结束关键帧
      if (Math.abs(x - endX) <= 6 && Math.abs(y - trackY) <= 6) {
        selectedKeyframe.value = { effect, index, type: "end" };
        emit("effect-select", index);
        return;
      }
      
      // 检查是否点击了轨道
      if (y >= 30 + index * trackHeight && y <= 30 + (index + 1) * trackHeight) {
        emit("effect-select", index);
      }
    });
  };

  // 处理鼠标按下
  const handleMouseDown = (event: MouseEvent) => {
    isDragging.value = true;
    handleTimelineClick(event);
  };

  // 处理鼠标移动
  const handleMouseMove = (event: MouseEvent) => {
    if (!isDragging.value || !selectedKeyframe.value || !timelineCanvas.value) return;
    
    const rect = timelineCanvas.value.getBoundingClientRect();
    const x = event.clientX - rect.left;
    
    // 计算实际时间 - 考虑标签宽度
    const timeX = Math.max(0, x - LABEL_WIDTH); // 确保不为负数
    const time = Math.max(0, Math.min(totalDuration.value, timeX / timeScale.value));
    
    // 更新关键帧位置
    const { effect, index, type } = selectedKeyframe.value;
    const updatedEffects = [...effects.value];
    
    if (type === "start") {
      // 更新延迟时间
      const maxDelay = effect.delay + effect.duration - 0.1;
      updatedEffects[index].delay = Math.min(time, maxDelay);
      updatedEffects[index].duration = effect.delay + effect.duration - updatedEffects[index].delay;
    } else if (type === "end") {
      // 更新持续时间
      const minDuration = 0.1;
      updatedEffects[index].duration = Math.max(minDuration, time - effect.delay);
    }
    
    emit("effect-update", updatedEffects);
    
    // 更新当前时间
    emit("time-update", time);
    
    // 重绘时间轴
    drawTimeline();
  };

  // 处理鼠标释放
  const handleMouseUp = () => {
    isDragging.value = false;
    selectedKeyframe.value = null;
  };

  // 添加缩放相关方法
  const zoomIn = () => {
    timeScale.value = Math.min(200, timeScale.value * 1.2);
    drawTimeline();
  };

  const zoomOut = () => {
    timeScale.value = Math.max(50, timeScale.value / 1.2);
    drawTimeline();
  };

  const resetZoom = () => {
    timeScale.value = 100;
    drawTimeline();
  };

  // 添加鼠标滚轮缩放
  const handleWheel = (event: WheelEvent) => {
    if (event.ctrlKey) {
      event.preventDefault();
      if (event.deltaY < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
    }
  };

  return {
    handleTimelineClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    zoomIn,
    zoomOut,
    resetZoom,
    handleWheel,
    LABEL_WIDTH // 导出常量供其他模块使用
  };
}