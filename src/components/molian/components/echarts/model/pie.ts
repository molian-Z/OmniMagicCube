import * as echarts from 'echarts'
import colors from '../colors'

export default (data:any) => {
    const opts = {
        color: colors[data.selectedColor],
        legend: {
            show: data.showLegend,
            orient: 'vertical',
            left: 'left'
            // data: []
        },
        ...data.options
    }
    // 设置tooltip
    opts.tooltip = {
        show: data.showTooltip,
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
        appendTo:document.body
    }

    // 设置内容
    opts.series = data.modelValue.map(item => {
        return {
            type: 'pie',
            data: item.data,
            radius: data.isCircle ? ['40%', '70%'] : '80%',
            padAngle: data.isCircle ? 5 : 0,
            label: {
                show: data.pieLabelType === 'none' ? false : true,
                position: data.pieLabelType !== 'none' ? data.pieLabelType : ''
            },
            itemStyle: {
                borderRadius: data.isCircle ? 10 : 5
            },
            ...item
        }
    })
    return opts
}