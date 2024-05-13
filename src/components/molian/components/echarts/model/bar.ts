import colors from '../colors'
export default (data) => {
    const opts = {
        color: colors[data.selectedColor],
        xAxis: {
            boundaryGap: true,
        },
        yAxis: {},
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        legend: {
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
            stack: data.isStack ? 'total' : '',
            smooth: true,
            showSymbol: false,
            barWidth: data.barWidth,
            showBackground: data.showBackground,
            backgroundStyle:{
                borderRadius : data.borderRadius
            },
            type: 'bar',
            itemStyle:{
                opacity: 0.8,
                borderRadius: data.borderRadius,
            },
            ...item,
        }
    })
    return opts
}