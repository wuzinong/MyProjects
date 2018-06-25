$(function () {
    /*累计用户*/
    //赏金分成
    var pie_user_all = echarts.init(document.getElementById('js-chart--user_all'));
    var user_all_option = {
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c}人 ({d}%)"
        },
        legend: {
            orient: 'vertical',
            x: 'left',
            data:['累积用户']
        },
        color:['rgba(26,179,148,1)','rgba(26,179,148,.7)','rgba(26,179,148,.4)'],
        series: [
            {
                name:'绑定手机数据',
                type:'pie',
                center:['50%','50%'],
                radius: '60%',
                avoidLabelOverlap: false,
                label: {
                    normal: {
                        show: false,
                    },
                    emphasis: {
                        show: true,
                    }
                },

                data:[
                    {value:$('#shopClientCount').text(), name:'累积用户'},
                ]
            }
        ]
    };
    pie_user_all.setOption(user_all_option);
    // 使用刚指定的配置项和数据显示图表。
    $(window).resize(pie_user_all.resize);

    /*手机绑定*/
    var pie_phone = echarts.init(document.getElementById('js-chart--phone'));
    var phone_option = {
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c}人 ({d}%)"
        },
        legend: {
            orient: 'vertical',
            x: 'left',
            data:['已抽奖人次']
        },
        color:['rgba(26,179,148,1)'],
        series: [
            {
                name:'已抽奖人次',
                type:'pie',
                center:['50%','50%'],
                radius: '60%',
                avoidLabelOverlap: false,
                label: {
                    normal: {
                        show: false,
                    },
                    emphasis: {
                        show: true,
                    }
                },

                data:[
                    {value:$('#clientLotteryCount').text(), name:'已抽奖人次'}
                ]
            }
        ]
    };
    pie_phone.setOption(phone_option);
    // 使用刚指定的配置项和数据显示图表。
    $(window).resize(pie_phone.resize);

    //
    var pie_win_num = echarts.init(document.getElementById('js-chart--win_num'));
    var win_num_option = {
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c}人 ({d}%)"
        },
        legend: {
            orient: 'vertical',
            x: 'left',
            data:['已领奖人次','未领奖人次']
        },
        color:['rgba(26,179,148,1)','rgba(26,179,148,.7)','rgba(26,179,148,.4)'],
        series: [
            {
                name:'领奖人次',
                type:'pie',
                center:['50%','50%'],
                radius: '60%',
                avoidLabelOverlap: false,
                label: {
                    normal: {
                        show: false,
                    },
                    emphasis: {
                        show: true,
                    }
                },

                data:[
                    {value:$('#acceptedLotteryCount').text(), name:'已领奖人次'},
                    {value:$('#unacceptedLotteryCount').val(), name:'未领奖人次'}
                ]
            }
        ]
    };
    pie_win_num.setOption(win_num_option);

    // 使用刚指定的配置项和数据显示图表。
    $(window).resize(pie_win_num.resize);


    //    浏览入口对比
    /* var bar_visit = echarts.init(document.getElementById('js-visit'));
    var visit_option= {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            data: ['安卓', '苹果']
        },
        grid: {
            top:'40px',
            left: '0%',
            right: '3%',
            bottom: '0%',
            containLabel: true,
        },
        yAxis: {
            type: 'value',
            boundaryGap: [0, 0.01],
            axisLine:{
                lineStyle:{
                    color:'#ccc'
                }
            },
        },
        xAxis: {
            type: 'category',
            data: ['2017.05.01','2017.05.02','2017.05.03','2017.05.04','2017.05.05','20173.05.06'],
            axisLine:{
                lineStyle:{
                    color:'#ccc'
                }
            },
        },
        series: [
            {
                name: '安卓',
                type: 'bar',
                data: [18203, 23489, 29034, 104970, 131744, 630230],
                itemStyle:{normal:{
                    color:'rgba(7,150,144,.9)'
                }},
            },
            {
                name: '苹果',
                type: 'bar',
                data: [19325, 23438, 31000, 121594, 134141, 681807],
                itemStyle:{normal:{
                    color:'rgba(7,150,144,.5)'
                }},
            }
        ]
    };
    bar_visit.setOption(visit_option);
    $(window).resize(bar_visit.resize); */

    /*打赏人信息*/
    $('[data-toggle="popover"]').popover();
    /*工具提示*/
    $('[data-toggle="tooltip"]').tooltip();

});