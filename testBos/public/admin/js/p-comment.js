$(function () {
    var bar_visit = echarts.init(document.getElementById('js-comment'));
    var visit_option= {
        tooltip : {
            trigger: 'axis',
            axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            }
        },
        legend: {
            data: ['一星差评', '二星及格','三星中评','四星满意','五星点赞']
        },
        grid: {
            left: '0%',
            right: '6%',
            bottom: '0%',
            containLabel: true
        },
        yAxis:  {
            type: 'value',
            axisLine:{
                lineStyle:{
                    color:'#ccc'
                }
            },
        },
        xAxis: {
            type: 'category',
            data: $('#evaluationListDays').val().split(","),
            axisLine:{
                lineStyle:{
                    color:'#ccc'
                }
            },
        },
        series: [
            {
                name: '一星差评',
                type: 'bar',
                stack: '总评论数',
                label: {
                    normal: {
                        show: true,
                        position: 'insideRight'
                    }
                },
                data: $('#fiveEvaluationListValues').val().split(",")
            },
            {
                name: '二星及格',
                type: 'bar',
                stack: '总评论数',
                label: {
                    normal: {
                        show: true,
                        position: 'insideRight'
                    }
                },
                data: $('#sixEvaluationListValues').val().split(",")
            },
            {
                name: '三星中评',
                type: 'bar',
                stack: '总评论数',
                label: {
                    normal: {
                        show: true,
                        position: 'insideRight'
                    }
                },
                data: $('#sevenEvaluationListValues').val().split(",")
            },
            {
                name: '四星满意',
                type: 'bar',
                stack: '总评论数',
                label: {
                    normal: {
                        show: true,
                        position: 'insideRight'
                    }
                },
                data: $('#eightEvaluationListValues').val().split(",")
            },
            {
                name: '五星点赞',
                type: 'bar',
                stack: '总评论数',
                label: {
                    normal: {
                        show: true,
                        position: 'insideRight'
                    }
                },
                data: $('#nineEvaluationListValues').val().split(",")
            }
        ]
    };
    bar_visit.setOption(visit_option);
    $(window).resize(bar_visit.resize);
});