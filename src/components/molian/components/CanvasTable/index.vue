<template>
  <div 
    class="canvas-table-container" 
    ref="containerRef"
    @wheel="handleWheel"
  >
    <!-- 主画布 -->
    <canvas 
      ref="mainCanvasRef" 
      class="main-canvas"
      :width="canvasWidth"
      :height="canvasHeight"
    ></canvas>
    
    <!-- 冻结表头画布 -->
    <canvas 
      v-if="freezeHeader"
      ref="headerCanvasRef" 
      class="header-canvas"
      :width="canvasWidth"
      :height="headerHeight"
    ></canvas>
    
    <!-- 冻结列画布 -->
    <canvas 
      v-if="freezeColumns.length > 0"
      ref="columnsCanvasRef" 
      class="columns-canvas"
      :width="freezeColumnsWidth"
      :height="canvasHeight - (freezeHeader ? headerHeight : 0)"
      :style="{ top: freezeHeader ? headerHeight + 'px' : 0 }"
    ></canvas>
    
    <!-- 冻结表头和列的交叉区域画布 -->
    <canvas 
      v-if="freezeHeader && freezeColumns.length > 0"
      ref="cornerCanvasRef" 
      class="corner-canvas"
      :width="freezeColumnsWidth"
      :height="headerHeight"
    ></canvas>
    
    <!-- 滚动条 -->
    <div class="scrollbar-container">
      <div 
        class="horizontal-scrollbar"
        ref="horizontalScrollbarRef"
        @scroll="handleHorizontalScroll"
      >
        <div :style="{ width: totalWidth + 'px', height: '1px' }"></div>
      </div>
      <div 
        class="vertical-scrollbar"
        ref="verticalScrollbarRef"
        @scroll="handleVerticalScroll"
      >
        <div :style="{ height: totalHeight + 'px', width: '1px' }"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CanvasTable',
  props: {
    // 表格数据
    data: {
      type: Array,
      required: true,
      default: () => []
    },
    // 表格列配置
    columns: {
      type: Array,
      required: true,
      default: () => []
    },
    // 行高
    rowHeight: {
      type: Number,
      default: 40
    },
    // 表头高度
    headerHeight: {
      type: Number,
      default: 50
    },
    // 是否冻结表头
    freezeHeader: {
      type: Boolean,
      default: true
    },
    // 冻结列的字段名数组
    freezeColumns: {
      type: Array,
      default: () => []
    },
    // 单元格样式
    cellStyle: {
      type: Object,
      default: () => ({
        padding: 8,
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        textColor: '#333',
        borderColor: '#e8e8e8'
      })
    },
    // 表头样式
    headerStyle: {
      type: Object,
      default: () => ({
        backgroundColor: '#f5f5f5',
        fontWeight: 'bold',
        textColor: '#333',
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        padding: 8,
        borderColor: '#e8e8e8'
      })
    }
  },
  data() {
    return {
      // 画布尺寸
      canvasWidth: 0,
      canvasHeight: 0,
      // 滚动位置
      scrollLeft: 0,
      scrollTop: 0,
      // 冻结列的总宽度
      freezeColumnsWidth: 0,
      // 列宽缓存
      columnWidths: [],
      // 总内容宽度和高度
      totalWidth: 0,
      totalHeight: 0,
      // 设备像素比
      pixelRatio: 1,
      // 渲染相关
      requestAnimationId: null,
      isRenderScheduled: false
    };
  },
  mounted() {
    this.initTable();
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
    if (this.requestAnimationId) {
      cancelAnimationFrame(this.requestAnimationId);
    }
  },
  watch: {
    data() {
      this.calculateDimensions();
      this.scheduleRender();
    },
    columns() {
      this.calculateDimensions();
      this.scheduleRender();
    },
    freezeColumns() {
      this.calculateDimensions();
      this.scheduleRender();
    }
  },
  methods: {
    // 初始化表格
    initTable() {
      this.pixelRatio = window.devicePixelRatio || 1;
      this.calculateDimensions();
      this.setupCanvases();
      this.scheduleRender();
    },
    
    // 计算表格尺寸
    calculateDimensions() {
      const container = this.$refs.containerRef;
      if (!container) return;
      
      // 计算容器尺寸
      this.canvasWidth = container.clientWidth;
      this.canvasHeight = container.clientHeight;
      
      // 计算列宽
      this.columnWidths = this.columns.map(col => col.width || 120);
      
      // 计算总内容宽度
      this.totalWidth = this.columnWidths.reduce((sum, width) => sum + width, 0);
      
      // 计算总内容高度
      this.totalHeight = this.data.length * this.rowHeight + (this.freezeHeader ? this.headerHeight : 0);
      
      // 计算冻结列宽度
      this.freezeColumnsWidth = this.freezeColumns.reduce((sum, field) => {
        const colIndex = this.columns.findIndex(col => col.field === field);
        return sum + (colIndex !== -1 ? this.columnWidths[colIndex] : 0);
      }, 0);
    },
    
    // 设置画布
    setupCanvases() {
      // 主画布
      const mainCanvas = this.$refs.mainCanvasRef;
      if (mainCanvas) {
        mainCanvas.width = this.canvasWidth * this.pixelRatio;
        mainCanvas.height = this.canvasHeight * this.pixelRatio;
        const ctx = mainCanvas.getContext('2d');
        ctx.scale(this.pixelRatio, this.pixelRatio);
      }
      
      // 表头画布
      const headerCanvas = this.$refs.headerCanvasRef;
      if (headerCanvas) {
        headerCanvas.width = this.canvasWidth * this.pixelRatio;
        headerCanvas.height = this.headerHeight * this.pixelRatio;
        const ctx = headerCanvas.getContext('2d');
        ctx.scale(this.pixelRatio, this.pixelRatio);
      }
      
      // 冻结列画布
      const columnsCanvas = this.$refs.columnsCanvasRef;
      if (columnsCanvas) {
        columnsCanvas.width = this.freezeColumnsWidth * this.pixelRatio;
        columnsCanvas.height = (this.canvasHeight - (this.freezeHeader ? this.headerHeight : 0)) * this.pixelRatio;
        const ctx = columnsCanvas.getContext('2d');
        ctx.scale(this.pixelRatio, this.pixelRatio);
      }
      
      // 交叉区域画布
      const cornerCanvas = this.$refs.cornerCanvasRef;
      if (cornerCanvas) {
        cornerCanvas.width = this.freezeColumnsWidth * this.pixelRatio;
        cornerCanvas.height = this.headerHeight * this.pixelRatio;
        const ctx = cornerCanvas.getContext('2d');
        ctx.scale(this.pixelRatio, this.pixelRatio);
      }
    },
    
    // 渲染表格
    render() {
      this.isRenderScheduled = false;
      
      // 渲染主内容区域
      this.renderMainContent();
      
      // 渲染冻结表头
      if (this.freezeHeader) {
        this.renderHeader();
      }
      
      // 渲染冻结列
      if (this.freezeColumns.length > 0) {
        this.renderFreezeColumns();
      }
      
      // 渲染交叉区域
      if (this.freezeHeader && this.freezeColumns.length > 0) {
        this.renderCorner();
      }
    },
    
    // 渲染主内容区域
    renderMainContent() {
      const canvas = this.$refs.mainCanvasRef;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      
      // 计算可视区域的行范围
      const startRowIndex = Math.floor(this.scrollTop / this.rowHeight);
      const endRowIndex = Math.min(
        Math.ceil((this.scrollTop + this.canvasHeight) / this.rowHeight),
        this.data.length
      );
      
      // 计算可视区域的列范围
      let accumulatedWidth = 0;
      let startColIndex = 0;
      let freezeColsWidth = 0;
      
      // 计算冻结列的总宽度
      this.freezeColumns.forEach(field => {
        const colIndex = this.columns.findIndex(col => col.field === field);
        if (colIndex !== -1) {
          freezeColsWidth += this.columnWidths[colIndex];
        }
      });
      
      // 找到第一个可见的非冻结列
      for (let i = 0; i < this.columns.length; i++) {
        if (!this.freezeColumns.includes(this.columns[i].field)) {
          if (accumulatedWidth >= this.scrollLeft) {
            startColIndex = i;
            break;
          }
          accumulatedWidth += this.columnWidths[i];
        }
      }
      
      // 渲染可视区域的单元格
      let x = -this.scrollLeft + freezeColsWidth;
      
      for (let colIndex = startColIndex; colIndex < this.columns.length; colIndex++) {
        const column = this.columns[colIndex];
        
        // 跳过冻结列
        if (this.freezeColumns.includes(column.field)) {
          continue;
        }
        
        const colWidth = this.columnWidths[colIndex];
        
        // 如果列已经超出可视区域，跳出循环
        if (x > this.canvasWidth) {
          break;
        }
        
        // 只有当列至少部分可见时才渲染
        if (x + colWidth > 0) {
          let y = this.freezeHeader ? this.headerHeight - this.scrollTop : -this.scrollTop;
          
          for (let rowIndex = startRowIndex; rowIndex < endRowIndex; rowIndex++) {
            const row = this.data[rowIndex];
            
            // 渲染单元格
            this.renderCell(ctx, row[column.field], x, y, colWidth, this.rowHeight, this.cellStyle);
            
            y += this.rowHeight;
          }
        }
        
        x += colWidth;
      }
      
      // 绘制网格线
      this.drawGridLines(ctx, freezeColsWidth);
    },
    
    // 渲染表头
    renderHeader() {
      const canvas = this.$refs.headerCanvasRef;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, this.canvasWidth, this.headerHeight);
      
      let x = -this.scrollLeft;
      let freezeColsWidth = 0;
      
      // 计算冻结列的总宽度
      this.freezeColumns.forEach(field => {
        const colIndex = this.columns.findIndex(col => col.field === field);
        if (colIndex !== -1) {
          freezeColsWidth += this.columnWidths[colIndex];
        }
      });
      
      x += freezeColsWidth;
      
      // 渲染表头单元格
      for (let colIndex = 0; colIndex < this.columns.length; colIndex++) {
        const column = this.columns[colIndex];
        const colWidth = this.columnWidths[colIndex];
        
        // 跳过冻结列
        if (this.freezeColumns.includes(column.field)) {
          continue;
        }
        
        // 如果列已经超出可视区域，跳出循环
        if (x > this.canvasWidth) {
          break;
        }
        
        // 只有当列至少部分可见时才渲染
        if (x + colWidth > 0) {
          this.renderCell(ctx, column.title, x, 0, colWidth, this.headerHeight, this.headerStyle);
        }
        
        x += colWidth;
      }
      
      // 绘制表头底部边框
      ctx.beginPath();
      ctx.moveTo(0, this.headerHeight - 0.5);
      ctx.lineTo(this.canvasWidth, this.headerHeight - 0.5);
      ctx.strokeStyle = this.headerStyle.borderColor;
      ctx.stroke();
    },
    
    // 渲染冻结列
    renderFreezeColumns() {
      const canvas = this.$refs.columnsCanvasRef;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, this.freezeColumnsWidth, this.canvasHeight);
      
      // 计算可视区域的行范围
      const startRowIndex = Math.floor(this.scrollTop / this.rowHeight);
      const endRowIndex = Math.min(
        Math.ceil((this.scrollTop + this.canvasHeight) / this.rowHeight),
        this.data.length
      );
      
      let x = 0;
      
      // 渲染冻结列
      for (let colIndex = 0; colIndex < this.columns.length; colIndex++) {
        const column = this.columns[colIndex];
        
        // 只渲染冻结列
        if (!this.freezeColumns.includes(column.field)) {
          continue;
        }
        
        const colWidth = this.columnWidths[colIndex];
        let y = -this.scrollTop;
        
        for (let rowIndex = startRowIndex; rowIndex < endRowIndex; rowIndex++) {
          const row = this.data[rowIndex];
          
          // 渲染单元格
          this.renderCell(ctx, row[column.field], x, y, colWidth, this.rowHeight, this.cellStyle);
          
          y += this.rowHeight;
        }
        
        x += colWidth;
      }
      
      // 绘制右侧边框
      ctx.beginPath();
      ctx.moveTo(this.freezeColumnsWidth - 0.5, 0);
      ctx.lineTo(this.freezeColumnsWidth - 0.5, this.canvasHeight);
      ctx.strokeStyle = this.cellStyle.borderColor;
      ctx.stroke();
      
      // 绘制网格线
      this.drawFreezeColumnsGridLines(ctx);
    },
    
    // 渲染交叉区域
    renderCorner() {
      const canvas = this.$refs.cornerCanvasRef;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, this.freezeColumnsWidth, this.headerHeight);
      
      let x = 0;
      
      // 渲染冻结列的表头
      for (let colIndex = 0; colIndex < this.columns.length; colIndex++) {
        const column = this.columns[colIndex];
        
        // 只渲染冻结列
        if (!this.freezeColumns.includes(column.field)) {
          continue;
        }
        
        const colWidth = this.columnWidths[colIndex];
        
        // 渲染表头单元格
        this.renderCell(ctx, column.title, x, 0, colWidth, this.headerHeight, this.headerStyle);
        
        x += colWidth;
      }
      
      // 绘制底部边框
      ctx.beginPath();
      ctx.moveTo(0, this.headerHeight - 0.5);
      ctx.lineTo(this.freezeColumnsWidth, this.headerHeight - 0.5);
      ctx.strokeStyle = this.headerStyle.borderColor;
      ctx.stroke();
      
      // 绘制右侧边框
      ctx.beginPath();
      ctx.moveTo(this.freezeColumnsWidth - 0.5, 0);
      ctx.lineTo(this.freezeColumnsWidth - 0.5, this.headerHeight);
      ctx.strokeStyle = this.headerStyle.borderColor;
      ctx.stroke();
    },
    
    // 渲染单元格
    renderCell(ctx, content, x, y, width, height, style) {
      // 绘制单元格背景
      ctx.fillStyle = style.backgroundColor || '#fff';
      ctx.fillRect(x, y, width, height);
      
      // 绘制单元格内容
      ctx.fillStyle = style.textColor;
      ctx.font = `${style.fontWeight || ''} ${style.fontSize}px ${style.fontFamily}`;
      ctx.textBaseline = 'middle';
      
      // 文本内容处理
      const text = String(content || '');
      const padding = style.padding || 8;
      
      // 文本截断处理
      const maxTextWidth = width - padding * 2;
      let displayText = text;
      let textWidth = ctx.measureText(text).width;
      
      if (textWidth > maxTextWidth) {
        // 简单的文本截断，可以根据需要实现更复杂的逻辑
        let ellipsis = '...';
        let ellipsisWidth = ctx.measureText(ellipsis).width;
        let fitLength = text.length;
        
        while (fitLength > 0 && ctx.measureText(text.substring(0, fitLength) + ellipsis).width > maxTextWidth) {
          fitLength--;
        }
        
        displayText = text.substring(0, fitLength) + ellipsis;
      }
      
      ctx.fillText(displayText, x + padding, y + height / 2);
      
      // 绘制单元格边框
      ctx.strokeStyle = style.borderColor;
      ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
    },
    
    // 绘制网格线
    drawGridLines(ctx, offsetX) {
      ctx.beginPath();
      ctx.strokeStyle = this.cellStyle.borderColor;
      
      // 绘制水平网格线
      const startY = this.freezeHeader ? this.headerHeight - this.scrollTop : -this.scrollTop;
      const startRowIndex = Math.floor(this.scrollTop / this.rowHeight);
      const endRowIndex = Math.min(
        Math.ceil((this.scrollTop + this.canvasHeight) / this.rowHeight),
        this.data.length
      );
      
      for (let rowIndex = startRowIndex; rowIndex <= endRowIndex; rowIndex++) {
        const y = startY + (rowIndex - startRowIndex) * this.rowHeight;
        ctx.moveTo(offsetX, y - 0.5);
        ctx.lineTo(this.canvasWidth, y - 0.5);
      }
      
      // 绘制垂直网格线
      let x = offsetX - this.scrollLeft;
      for (let colIndex = 0; colIndex < this.columns.length; colIndex++) {
        const column = this.columns[colIndex];
        
        // 跳过冻结列
        if (this.freezeColumns.includes(column.field)) {
          continue;
        }
        
        const colWidth = this.columnWidths[colIndex];
        x += colWidth;
        
        if (x > 0 && x < this.canvasWidth) {
          ctx.moveTo(x - 0.5, this.freezeHeader ? this.headerHeight : 0);
          ctx.lineTo(x - 0.5, this.canvasHeight);
        }
      }
      
      ctx.stroke();
    },
    
    // 绘制冻结列的网格线
    drawFreezeColumnsGridLines(ctx) {
      ctx.beginPath();
      ctx.strokeStyle = this.cellStyle.borderColor;
      
      // 绘制水平网格线
      const startRowIndex = Math.floor(this.scrollTop / this.rowHeight);
      const endRowIndex = Math.min(
        Math.ceil((this.scrollTop + this.canvasHeight) / this.rowHeight),
        this.data.length
      );
      
      let y = -this.scrollTop;
      for (let rowIndex = startRowIndex; rowIndex <= endRowIndex; rowIndex++) {
        ctx.moveTo(0, y - 0.5);
        ctx.lineTo(this.freezeColumnsWidth, y - 0.5);
        y += this.rowHeight;
      }
      
      // 绘制垂直网格线
      let x = 0;
      for (let colIndex = 0; colIndex < this.columns.length; colIndex++) {
        const column = this.columns[colIndex];
        
        // 只处理冻结列
        if (!this.freezeColumns.includes(column.field)) {
          continue;
        }
        
        x += this.columnWidths[colIndex];
        
        if (colIndex < this.columns.length - 1) {
          ctx.moveTo(x - 0.5, 0);
          ctx.lineTo(x - 0.5, this.canvasHeight);
        }
      }
      
      ctx.stroke();
    },
    
    // 处理水平滚动
    handleHorizontalScroll(e) {
      this.scrollLeft = e.target.scrollLeft;
      this.scheduleRender();
    },
    
    // 处理垂直滚动
    handleVerticalScroll(e) {
      this.scrollTop = e.target.scrollTop;
      this.scheduleRender();
    },
    
    // 处理鼠标滚轮事件
    handleWheel(e) {
      e.preventDefault();
      
      const horizontalScrollbar = this.$refs.horizontalScrollbarRef;
      const verticalScrollbar = this.$refs.verticalScrollbarRef;
      
      if (e.shiftKey) {
        // 水平滚动
        if (horizontalScrollbar) {
          horizontalScrollbar.scrollLeft += e.deltaY;
        }
      } else {
        // 垂直滚动
        if (verticalScrollbar) {
          verticalScrollbar.scrollTop += e.deltaY;
        }
      }
    },
    
    // 处理窗口大小变化
    handleResize() {
      this.calculateDimensions();
      this.setupCanvases();
      this.scheduleRender();
    },
    
    // 调度渲染
    scheduleRender() {
      if (!this.isRenderScheduled) {
        this.isRenderScheduled = true;
        this.requestAnimationId = requestAnimationFrame(() => this.render());
      }
    }
  }
};
</script>

<style scoped>
.canvas-table-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 1px solid #e8e8e8;
}

.main-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.header-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 2;
  background-color: #fff;
}

.columns-canvas {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  z-index: 1;
  background-color: #fff;
}

.corner-canvas {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;
  background-color: #fff;
}

.scrollbar-container {
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 4;
}

.horizontal-scrollbar {
  width: calc(100% - 17px);
  height: 17px;
  overflow-x: auto;
  overflow-y: hidden;
}

.vertical-scrollbar {
  position: absolute;
  top: 0;
  right: 0;
  width: 17px;
  height: calc(100% - 17px);
  overflow-x: hidden;
  overflow-y: auto;
}
</style>