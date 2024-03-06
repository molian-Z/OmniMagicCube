import { ref } from 'vue'
import { computed } from 'vue'
import { hoverComp, hoverNodes, hoverIndex, resetDraggable } from '../../draggable'
import { useCloned } from '@vueuse/core'
import { selectedComp } from '../../designerData'
import svgIcon from '@molianComps/svg-icon/index.vue'
import { slotsMap } from '@molian/utils/compsConfig'
const slotsData = computed(() => {
  if (selectedComp.value && selectedComp.value.slots) {
    const componentSlots = slotsMap.value[selectedComp.value.name];
    if (componentSlots) {
      return Object.keys(componentSlots).map((key: string) => {
        // 确保 disabled 是一个布尔值
        const slots = selectedComp.value?.slots;
        const isDisabled = slots && slots.hasOwnProperty(key);
        return {
          label: key,
          disabled: isDisabled,
          customClass: "menu-primary",
          onClick: () => appendSlot(key, hoverComp.value)
        };
      });
    }
  }
  return [];
});

const appendSlot = function (key: string, val: any) {
  if (selectedComp.value && selectedComp.value.slots && selectedComp.value.slots[key]) {
    delete selectedComp.value.slots[key]
    return false
  }
  const { cloned } = useCloned(val)
  if (cloned.value === true || cloned.value === 'auto') {
    cloned.value = {
      children: []
    }
  } else {
    cloned.value.children = []
  }
  if (!!selectedComp.value && selectedComp.value.slots) {
    selectedComp.value.slots[key] = cloned.value
  }
  if (selectedComp.value) {
    selectedComp.value.slots = {
      [key]: cloned.value
    }
  }
}
export const menuData = ref([{
  label: '插槽',
  icon: h(svgIcon, { icon: 'appendSlot' }),
  customClass: "menu-primary",
  children: slotsData
}, {
  label: '删除',
  icon: h(svgIcon, { icon: 'trash' }),
  customClass: "menu-danger",
  onClick: function () {
    if (hoverNodes.value) {
      hoverNodes.value.splice(hoverIndex.value, 1)
    }
    resetDraggable()
  }
}])