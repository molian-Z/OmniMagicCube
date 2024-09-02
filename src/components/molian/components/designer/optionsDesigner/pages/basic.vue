<script setup lang="ts">
import { defineOptions, inject } from "vue";
import { hoverComp } from '../../draggable'

defineOptions({
  name: "basicComp",
});
const customComps: any = inject("customComps");
const { customInput } = customComps;
const t:any = inject('mlLangs')

</script>
<template>
  <div class="basic-list">
    <template v-if="hoverComp">
      <div class="data2form-item">
        <div class="data2form-item__label">{{t('options.id')}}</div>
        <div class="data2form-item__input">
          <customInput size="small" v-model="hoverComp.id" />
        </div>
        <div style="width: 24px"></div>
      </div>
      <div class="data2form-item">
        <div class="data2form-item__label">{{t('options.key')}}</div>
        <div class="data2form-item__input">
          <customInput size="small" v-model="hoverComp.key" />
        </div>
        <div style="width: 24px"></div>
      </div>
      <div class="data2form-item">
        <div class="data2form-item__label">{{t('options.subTitle')}}</div>
        <div class="data2form-item__input">
          <customInput size="small" v-model="hoverComp.subTitle" />
        </div>
        <div style="width: 24px"></div>
      </div>
      <div class="data2form-item">
        <div class="data2form-item__label">{{t('options.currentComponent')}}</div>
        <div class="data2form-item__input">
          <customInput size="small" readonly v-model="hoverComp.name" />
        </div>
        <div style="width: 24px"></div>
      </div>
    </template>
  </div>
</template>
