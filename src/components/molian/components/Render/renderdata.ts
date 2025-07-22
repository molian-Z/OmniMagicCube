export default function () {
    const variable = ref({})
    const originVariable = ref({})
    const renderRef = reactive<any>({})
    const setRenderRef = (el: any, comp: any) => {
        renderRef[comp.key] = el
    }
    return {
        variable,
        originVariable,
        renderRef,
        setRenderRef
    }
}