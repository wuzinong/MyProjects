$(function () {
    //累计获奖人次
    var pie_total_num = echarts.init(document.getElementById('js-chart--total_num'));
    var total_num_option = {
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c} ({d}%)"
        },
        legend: {
            orient: 'vertical',
            x: 'left',
            data: ['累计获奖人次' ]
        },
        color:['rgba(26,179,148,1)','rgba(26,179,148,.7)','rgba(26,179,148,.4)'],
        series: [
            {
                name: '抽奖统计',
                type: 'pie',
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

                data: [
                    {value: $('#lotteryCount').text(), name: '累计获奖人次'},
                ]
            }
        ]
    };
    pie_total_num.setOption(total_num_option);

    // 使用刚指定的配置项和数据显示图表。
    $(window).resize(pie_total_num.resize);


    /*已领奖品人次*/
    var pie_win_num = echarts.init(document.getElementById('js-chart--win_num'));
    var win_num_option = {
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c} ({d}%)"
        },
        legend: {
            orient: 'vertical',
            x: 'left',
            data: ['未领奖品人次', '已领奖品人次', ]
        },
        color:['rgba(26,179,148,1)','rgba(26,179,148,.4)'],
        series: [
            {
                name: '抽奖统计',
                type: 'pie',
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

                data: [
                    {value: $('#unacceptedLotteryCount').val(), name: '未领奖品人次'},
                    {value: $('#acceptedLotteryCount').text(), name: '已领奖品人次'},
                ]
            }
        ]
    };
    pie_win_num.setOption(win_num_option);

    // 使用刚指定的配置项和数据显示图表。
    $(window).resize(pie_win_num.resize);

    /*已绑定奖品*/
/*    var pie_prize_item = echarts.init(document.getElementById('js-chart--prize_item'));
    var prize_item_option = {
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c} ({d}%)"
        },
        legend: {
            orient: 'vertical',
            x: 'left',
            data: ['已绑定奖品项', '未绑定奖品项']
        },
        color:['rgba(26,179,148,1)','rgba(26,179,148,.4)'],
        series: [
            {
                name: '打赏占比',
                type: 'pie',
                center:['50%','50%'],
                radius: ['55%', '75%'],
                avoidLabelOverlap: false,
                label: {
                    normal: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        show: true,
                        textStyle: {
                            fontSize: '18',
                            fontWeight: 'bold'
                        }
                    }
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },

                data: [
                    {value: 12, name: '已绑定奖品项'},
                    {value: 3, name: '未绑定奖品项'},
                ]
            }
        ]
    };
    pie_prize_item.setOption(prize_item_option);

    // 使用刚指定的配置项和数据显示图表。
    $(window).resize(pie_prize_item.resize);*/




    /*打赏人信息*/
    // $('[data-toggle="popover"]').popover();
    /*工具提示*/
    $('[data-toggle="tooltip"]').tooltip();
    /*下拉菜单悬浮显示*/
    $('.dropdown-toggle').dropdown();
    //日期范围
    laydate.render({
        elem: '#test1'
        , range: true
    });



});