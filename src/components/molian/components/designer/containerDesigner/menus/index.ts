import { computed } from 'vue'
import { hoverComp, hoverNodes, hoverIndex, resetDraggable } from '../../draggable'
import { useCloned } from '@vueuse/core'
import { selectedComp, currentNativeOn, currentEmits, globalAttrs } from '../../designerData'
import svgIcon from '@molianComps/SvgIcon/index.vue'
import { slotsMap } from '@molian/utils/compsConfig'
import { useI18n } from 'vue-i18n'

// import { i18nt as t } from '@molian/utils/lang'
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
const actionMenus = (menuKey: string) => {
    if (!Array.isArray(globalAttrs.actions)) {
        globalAttrs.actions = []
    }
    return globalAttrs.actions && globalAttrs.actions.map(item => {
        const checked = computed(() => {
            return item.on.findIndex((fitem: any) => {
                if (selectedComp && selectedComp.value) {
                    return fitem.compData.type === menuKey && fitem.compData.key === selectedComp.value.key
                }
            }) > -1
        })
        return {
            label: item.title,
            customClass: "menu-primary",
            checked: checked.value,
            onClick: () => {
                if (!!checked.value) {
                    const newI = item.on.findIndex((fitem: any) => {
                        if (selectedComp && selectedComp.value) {
                            return fitem.compData.type === menuKey && fitem.compData.key === selectedComp.value.key
                        }
                    })
                    if (newI > -1) {
                        item.on.splice(newI, 1)
                    }
                } else {
                    if (selectedComp && selectedComp.value) {
                        const { key, name, subTitle } = selectedComp.value
                        item.on.push({
                            bind: 'event',
                            compData: {
                                key,
                                type: menuKey,
                                name,
                                subTitle
                            }
                        })
                    }
                }
            }
        }
    }) || []
}

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

export const useMenus = () => {
    const { t } = useI18n()
    const bindEventData = computed(() => {
        return [{
            label: t('actions.nativeEvent'),
            icon: h(svgIcon, { icon: 'bindEvent' }),
            customClass: "menu-primary",
            disabled: currentNativeOn.value.length === 0,
            children: currentNativeOn.value.map((item: any) => {
                return {
                    label: item.key,
                    customClass: "menu-primary",
                    children: actionMenus(item.key)
                }
            })
        }, {
            label: t('actions.customEvent'),
            icon: h(svgIcon, { icon: 'bindEvent' }),
            customClass: "menu-primary",
            disabled: currentEmits.value.length === 0,
            children: currentEmits.value.map((item: any) => {
                return {
                    label: item.key,
                    customClass: "menu-primary",
                    children: actionMenus(item.key)
                }
            })
        }];
    })
    return {
        menus: computed(() => {
            return [{
                label: t('actions.bindAction'),
                icon: h(svgIcon, { icon: 'bindEvent' }),
                customClass: "menu-primary",
                children: bindEventData.value
            }, {
                label: t('actions.openSlot'),
                icon: h(svgIcon, { icon: 'appendSlot' }),
                customClass: "menu-primary",
                children: slotsData.value
            }, {
                label: t('actions.deleteComp'),
                icon: h(svgIcon, { icon: 'trash' }),
                customClass: "menu-danger",
                onClick: function () {
                    if (hoverNodes.value) {
                        hoverNodes.value.splice(hoverIndex.value, 1)
                    }
                    resetDraggable()
                }
            }]
        })
    }
}