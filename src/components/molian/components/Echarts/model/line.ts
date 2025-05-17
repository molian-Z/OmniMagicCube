import * as echarts from 'echarts'
import colors from '../colors'
import {
    getChartData
} from '@molian/utils/util'

export default (data) => {
    const opts = {
        color: colors[data.selectedColor],
        xAxis: {
            boundaryGap: false,
        },
        yAxis: {},
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        legend: {
            show:data.showLegend,
            data: []
        },
        ...data.options
    }

    // 设置tooltip
    opts.tooltip = {
        show: data.showTooltip,
        trigger:"axis",
        axisPointer: {
            type: 'cross',
            label: {
                backgroundColor: '#6a7985'
            }
        }
    }

    // 设置x轴内容
    if(data.xAxisType === 'category'){
        opts.xAxis.data = data.axisData
    }
    opts.xAxis = {
        show: data.showXAxis,
        type: data.xAxisType,
        ...opts.xAxis,
    }
    //设置y轴内容
    if(data.yAxisType === 'category'){
        opts.yAxis.data = data.axisData
    }
    opts.yAxis = {
        show: data.showYAxis,
        type: data.yAxisType,
        ...opts.yAxis,
    }

    // 设置内容
    opts.legend.data = []
    opts.series = getChartData(data.axisData, data.modelValue).map(item => {
        if (data.modelValue.length > 1) {
            opts.legend.data.push(item.name)
        }
        return {
            ...item,
            areaStyle: data.showBackground ? {} : null,
            type: 'line'
        }
    })
    return opts
}