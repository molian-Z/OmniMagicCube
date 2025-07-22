<script setup lang="ts">
import { useOffsetPagination } from '@vueuse/core'
import { defineProps, defineEmits, defineOptions } from 'vue'
defineOptions({
  name: 'Pagination'
})
const props = defineProps({
  total: {
    type: Number,
    default: 0
  },
  pageSize: {
    type: Number,
    default: 10
  },
  current: {
    type: Number,
    default: 1
  }
})
const emit = defineEmits(['change', 'prev', 'next'])
const onChange = ({ currentPage, currentPageSize }: { currentPage: number, currentPageSize: number }) => {
  emit('change', { currentPage, currentPageSize })
}
const newTotal = computed(() =>{
  return props.total
})
const {
  currentPage,
  currentPageSize,
  pageCount,
  isFirstPage,
  isLastPage,
  prev,
  next,
} = useOffsetPagination({
  total: newTotal,
  page: props.current,
  pageSize: props.pageSize,
  onPageChange: onChange,
  onPageSizeChange: onChange,
})

const cmptdCurrentPageCount = computed(() => {
  return getNearestSixNumbers(1)
})

function getNearestSixNumbers(minPage = 1, maxPage?: number) {
 // 如果没有指定最大页码，我们可以假设至少比当前页码大5
 maxPage = maxPage || currentPage.value + 6;
 
 // 计算起始和结束数字
 let start = Math.max(currentPage.value - 3, minPage);
 let end = Math.min(start + 6, maxPage);
 
 // 确保至少有6个数字，如果结束数字太近，调整起始数字
 if (end - start < 6) {
   start = end - 6;
 }
 
 // 创建包含这六个数字的数组
 let numbers = [];
 for (let i = start; i <= end; i++) {
  if(i <= pageCount.value){
    numbers.push(i);
  }
 }
 return numbers;
}
 

const clickPrev = () => {
  if(!isFirstPage.value){
    prev()
  }
  
}

const clickNext = () => {
  if(!isLastPage.value){
    next()
  }
}

const navToPage = (i:number) =>{
  currentPage.value = i
}

</script>

<template>
  <div class="pagination-container">
    <div class="pagination-page">
      <div :class="['pagination-prev', !!isFirstPage && 'disabled']" @click="clickPrev">
        <icon icon="arrow-left-bold"></icon>
      </div>
      <div :class="['pagination-page-count', currentPage === i && 'active']" v-for="i in cmptdCurrentPageCount" @click="navToPage(i)">{{ i }}</div>
      <div :class="['pagination-next', !!isLastPage && 'disabled']" @click="clickNext">
        <icon icon="arrow-right-bold"></icon>
      </div>
    </div>
    <div class="pagination-total">{{total}}</div>
  </div>
</template>

<style lang="scss" scoped>
.pagination-container {
  display: flex;
  align-items: center;
  justify-content:space-between;
  .pagination-page{
    display: flex;
    align-items: center;
    
    >div{
      margin: 0 var(--ml-mg-base);
      background-color: var(--ml-bg-page-color);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height:26px;
      font-weight:bold;
      cursor: pointer;
      user-select: none;
      border-radius:var(--ml-radius-small);
      transition:var(--ml-transition-base);
      &:hover{
        background-color: var(--ml-fill-color-3);
      }

      &.active{
        background-color: var(--ml-primary-color-4);
        color:var(--ml-text-reverse-color-1);
      }
    }
  }

  .pagination-total{
    color: var(--ml-text-color-2);
    font-weight:bold;
  }
  .disabled{
    opacity: .3;
    cursor: no-drop;
    &:hover{
        background-color: var(--ml-bg-page-color);
      }
  }
}
</style>