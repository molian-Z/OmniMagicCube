<script setup lang="ts">
import { ref, computed, defineOptions, inject } from "vue";
import { useCloned } from "@vueuse/core";
import { selectedComp, createComp } from "../../designerData";
import { slotsMap } from "@molian/utils/compsConfig";
import svgIcon from "@molianComps/SvgIcon/index.vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
defineOptions({
  name: "SlotComp",
});
const comps: any = inject("mlComps");
const customComps: any = inject("customComps");
const { customButton, customInput, customPopup } = customComps;

const tempSlot = ref("");
const showKeyName = ref("");
const slots = computed(() => {
  if (selectedComp.value) {
    return slotsMap.value[selectedComp.value.name];
  }
});
const appendSlot = function (key: string | number, val: any) {
  if (selectedComp.value.slots && selectedComp.value.slots[key]) {
    delete selectedComp.value.slots[key];
    return false;
  }
  const { cloned } = useCloned(val);
  if (cloned.value === true || cloned.value === "auto") {
    cloned.value = {
      children: [],
    };
  } else {
    cloned.value.children = [];
  }
  if (selectedComp.value.slots) {
    selectedComp.value.slots[key] = cloned.value;
  } else {
    selectedComp.value.slots = {
      [key]: cloned.value,
    };
  }
};

const useComp = (key: any) => {
  return selectedComp.value && selectedComp.value.slots && selectedComp.value.slots[key];
};

const existSlot = (key: any) => {
  const slot = useComp(key);
  return slot && slot.appendComps && slot.appendComps.length > 0;
};

const appendChildComp = (key: any, comp: any) => {
  let obj = createComp(comps.value[comp.name], comp);
  selectedComp.value.slots[key].children.push(obj);
};

const updateModelValue = (key: any, btn: boolean) => {
  if (btn === false) {
    showKeyName.value = "";
  } else {
    showKeyName.value = key;
  }
};

const getI18n = (key: string | number) => {
  const rootKey = `attrs.${key}`;
  if (t(rootKey) === rootKey) {
    return key;
  } else {
    return t(rootKey);
  }
};
</script>
<template>
  <div class="slots-list">
    <template v-for="(val, key) in slots">
      <div class="slot-item">
        <div class="slot-item__title">
          <svg-icon class="slot-item__icon" icon="appendSlot" />
          <span class="slot-item__text">{{ getI18n(key) }}</span>
        </div>
        <customPopup
          trigger="click"
          placement="bottom"
          :destroyOnClose="true"
          :disabled="!selectedComp"
          :visible="showKeyName === key && !!selectedComp"
          @update:visible="(btn:boolean)=>updateModelValue(key, btn)"
          v-if="existSlot(key)"
        >
          <customButton theme="primary" :text="true" :disabled="!useComp(key)">
            {{ t("options.appendComponent") }}
          </customButton>
          <template #content>
            <div>
              <div
                class="designer-slot__selected-item"
                v-for="comp in useComp(key).appendComps"
                :key="typeof comp === 'object' ? comp.name : comp"
                @click="appendChildComp(key, comp)"
              >
                {{ comps[comp.name].title || comp.name }}
              </div>
            </div>
          </template>
        </customPopup>
        <customButton theme="primary" :text="true" @click="appendSlot(key, val)">
          {{ useComp(key) ? t("options.remove") : t("options.append") }}
        </customButton>
      </div>
    </template>
    <div class="slot-item">
      <div class="slot-item__title">
        <svg-icon class="slot-item__icon" icon="appendSlot" />
        <customInput class="slot-item__input" v-model="tempSlot" size="small" />
      </div>
      <customButton theme="primary" :text="true" @click="appendSlot(tempSlot, true)">
        {{
          selectedComp && selectedComp.slots && selectedComp.slots[tempSlot] && true
            ? t("options.remove")
            : t("options.append")
        }}
      </customButton>
    </div>
  </div>
</template>
<style scoped lang="scss">
.slot-list {
  display: flex;
  width: 100%;
  height: 510px;
}
.slot-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--ml-bg-color);
  padding: var(--ml-pd-lg) var(--ml-pd-base);
  border-radius: var(--ml-radius-base);
  margin-bottom: var(--ml-mg-base);
  width: 100%;

  .slot-item__title {
    display: flex;
    justify-content: flex-start;
    align-items: center;

    .slot-item__icon {
      min-width: 20px;
      height: 20px;
    }

    .slot-item__text {
      font-size: 14px;
      font-weight: bold;
    }

    .slot-item__input {
      width: 110px;
    }
  }
}
</style>
