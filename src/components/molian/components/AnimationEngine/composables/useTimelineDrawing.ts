import { Ref } from 'vue';
import { AnimationEffect } from '../types/animation';
import { LABEL_WIDTH } from './useTimelineEvents'; // 导入常量

export function useTimelineDrawing(
  timelineCtx: Ref<CanvasRenderingContext2D | null>,
  timelineWidth: Ref<number>,
  timelineHeight: Ref<number>,
  timeScale: Ref<number>,
  effects: Ref<AnimationEffect[]>,
  currentTime: Ref<number>,
  totalDuration: Ref<number>,
  currentEffectIndex: Ref<number>,
  t: Function
) {
  // 绘制时间轴
  const drawTimeline = () => {
    if (!timelineCtx.value) return;
    
    const ctx = timelineCtx.value;
    const width = timelineWidth.value;
    const height = timelineHeight.value;
    
    // 清空画布
    ctx.clearRect(0, 0, width, height);
    
    // 绘制背景
    ctx.fillStyle = "var(--ml-fill-color-light)";
    ctx.fillRect(0, 0, width, height);
    
    // 绘制网格线
    drawGrid(ctx, width, height);
    
    // 绘制时间刻度
    drawTimeScale(ctx, width, height);
    
    // 绘制当前时间指示器
    drawCurrentTimeIndicator(ctx, height);
    
    // 绘制效果轨道
    drawEffectTracks();
    
    // 绘制关键帧
    drawKeyframes();
  };

  // 绘制网格线
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = "rgba(200, 200, 200, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    // 水平网格线
    const trackHeight = 30;
    for (let y = 30; y < height; y += trackHeight) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    
    // 垂直网格线 (每0.25秒一条)
    for (let i = 0; i <= totalDuration.value * 4; i++) {
      const x = (i / 4) * timeScale.value;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    
    ctx.stroke();
  };

  // 绘制时间刻度
  const drawTimeScale = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // 绘制时间刻度背景
    ctx.fillStyle = "var(--ml-fill-color)";
    ctx.fillRect(0, 0, width, 25);
    
    ctx.strokeStyle = "var(--ml-border-color)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    // 每0.5秒绘制一个刻度
    for (let i = 0; i <= totalDuration.value * 2; i++) {
      const x = (i / 2) * timeScale.value;
      const isMajor = i % 2 === 0; // 每整秒是主刻度
      
      ctx.moveTo(x, isMajor ? 0 : 20);
      ctx.lineTo(x, 25);
      
      // 添加时间标签（只在整秒处添加）
      if (isMajor) {
        ctx.fillStyle = "var(--ml-text-color-primary)";
        ctx.font = "12px Arial";
        ctx.fillText(`${i/2}s`, x + 2, 16);
      }
    }
    ctx.stroke();
    
    // 绘制时间刻度底部边框
    ctx.strokeStyle = "var(--ml-border-color)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 25);
    ctx.lineTo(width, 25);
    ctx.stroke();
  };

  // 绘制当前时间指示器
  const drawCurrentTimeIndicator = (ctx: CanvasRenderingContext2D, height: number) => {
    // 使用导入的 LABEL_WIDTH 常量
    const currentX = LABEL_WIDTH + currentTime.value * timeScale.value;
    
    // 绘制指示器线
    ctx.strokeStyle = "var(--ml-primary-color)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(currentX, 0);
    ctx.lineTo(currentX, height);
    ctx.stroke();
    
    // 绘制指示器头部
    ctx.fillStyle = "var(--ml-primary-color)";
    ctx.beginPath();
    ctx.moveTo(currentX - 8, 0);
    ctx.lineTo(currentX + 8, 0);
    ctx.lineTo(currentX, 8);
    ctx.closePath();
    ctx.fill();
    
    // 显示当前时间
    ctx.fillStyle = "#ffffff";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.fillText(currentTime.value.toFixed(2) + "s", currentX, 18);
    ctx.textAlign = "start"; // 重置文本对齐
  };

  // 根据效果类型获取颜色
  const getEffectColor = (type: string, alpha = 1) => {
    const colors: Record<string, string> = {
      fade: `rgba(103, 194, 58, ${alpha})`,
      slide: `rgba(230, 162, 60, ${alpha})`,
      scale: `rgba(245, 108, 108, ${alpha})`,
      rotate: `rgba(64, 158, 255, ${alpha})`,
      custom: `rgba(144, 147, 153, ${alpha})`
    };
    
    return colors[type] || `rgba(144, 147, 153, ${alpha})`;
  };

  // 绘制效果轨道
  const drawEffectTracks = () => {
    if (!timelineCtx.value) return;
    
    const ctx = timelineCtx.value;
    const height = timelineHeight.value;
    const trackHeight = 30;
    // 使用导入的 LABEL_WIDTH 常量
    
    effects.value.forEach((effect, index) => {
      const y = 30 + index * trackHeight;
      
      // 绘制轨道背景
      const isSelected = index === currentEffectIndex.value;
      ctx.fillStyle = isSelected 
        ? "var(--ml-primary-color-light)" 
        : "var(--ml-fill-color)";
      ctx.fillRect(0, y, timelineWidth.value, trackHeight - 2);
      
      // 绘制轨道边框
      if (isSelected) {
        ctx.strokeStyle = "var(--ml-primary-color)";
        ctx.lineWidth = 2;
        ctx.strokeRect(0, y, timelineWidth.value, trackHeight - 2);
      }
      
      // 绘制轨道标签背景 - 使用更明显的背景色
      ctx.fillStyle = getEffectColor(effect.type, 0.3);
      ctx.fillRect(0, y, LABEL_WIDTH, trackHeight - 2);
      
      // 添加标签区域右侧分隔线
      ctx.strokeStyle = getEffectColor(effect.type, 0.8);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(LABEL_WIDTH, y);
      ctx.lineTo(LABEL_WIDTH, y + trackHeight - 2);
      ctx.stroke();
      
      // 绘制轨道标签 - 使用更清晰的字体和颜色
      ctx.fillStyle = "#000000"; // 使用黑色文字提高对比度
      ctx.font = "bold 13px Arial";
      // 添加文字背景以增强可读性
      const effectName = t(`animation.effect.${effect.type}`) || effect.type;
      const textWidth = ctx.measureText(effectName).width;
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.fillRect(5, y + 8, textWidth + 10, 18);
      
      // 绘制文字
      ctx.fillStyle = "#000000";
      ctx.fillText(effectName, 10, y + 22);
      
      // 绘制效果持续时间条
      const startX = LABEL_WIDTH + effect.delay * timeScale.value; // 使用 LABEL_WIDTH
      const endX = startX + (effect.duration * timeScale.value);
      
      // 绘制效果背景
      const effectColor = getEffectColor(effect.type);
      const gradientColor = getEffectColor(effect.type, 0.7);
      
      // 创建渐变
      const gradient = ctx.createLinearGradient(startX, y + 5, endX, y + trackHeight - 7);
      gradient.addColorStop(0, effectColor);
      gradient.addColorStop(1, gradientColor);
      
      ctx.fillStyle = gradient;
      
      // 绘制圆角矩形
      const radius = 4;
      const width = endX - startX;
      const height = trackHeight - 10;
      
      ctx.beginPath();
      ctx.moveTo(startX + radius, y + 5);
      ctx.lineTo(endX - radius, y + 5);
      ctx.quadraticCurveTo(endX, y + 5, endX, y + 5 + radius);
      ctx.lineTo(endX, y + 5 + height - radius);
      ctx.quadraticCurveTo(endX, y + 5 + height, endX - radius, y + 5 + height);
      ctx.lineTo(startX + radius, y + 5 + height);
      ctx.quadraticCurveTo(startX, y + 5 + height, startX, y + 5 + height - radius);
      ctx.lineTo(startX, y + 5 + radius);
      ctx.quadraticCurveTo(startX, y + 5, startX + radius, y + 5);
      ctx.closePath();
      ctx.fill();
      
      // 添加效果时间信息
      ctx.fillStyle = "#ffffff";
      ctx.font = "10px Arial";
      if (width > 50) { // 只在宽度足够时显示文本
        ctx.fillText(`${effect.duration.toFixed(1)}s`, startX + 5, y + 18);
      }
    });
  };

  // 绘制关键帧
  const drawKeyframes = () => {
    if (!timelineCtx.value) return;
    
    const ctx = timelineCtx.value;
    const trackHeight = 30;
    // 使用导入的 LABEL_WIDTH 常量
    
    effects.value.forEach((effect, index) => {
      const y = 30 + index * trackHeight + trackHeight / 2;
      const isSelected = index === currentEffectIndex.value;
      
      // 开始关键帧 - 使用 LABEL_WIDTH
      const startX = LABEL_WIDTH + effect.delay * timeScale.value;
      
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = isSelected ? "var(--ml-primary-color)" : "var(--ml-text-color-primary)";
      ctx.lineWidth = isSelected ? 3 : 2;
      
      // 绘制菱形开始关键帧
      ctx.beginPath();
      ctx.moveTo(startX, y - 6);
      ctx.lineTo(startX + 6, y);
      ctx.lineTo(startX, y + 6);
      ctx.lineTo(startX - 6, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // 结束关键帧
      const endX = startX + (effect.duration * timeScale.value);
      
      // 绘制圆形结束关键帧
      ctx.beginPath();
      ctx.arc(endX, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  };

  return {
    drawTimeline,
    getEffectColor
  };
}