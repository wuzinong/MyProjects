$(function () {
    //商家赏金余额
    /* var pie_balance = echarts.init(document.getElementById('js-chart--balance'));
    var balance_option = {
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c} ({d}%)"
        },
        legend: {
            orient: 'vertical',
            x: 'left',
            data:['赏金余额']
        },
        color:['rgba(26,179,148,1)','rgba(26,179,148,.7)','rgba(26,179,148,.4)'],
        series: [
            {
                name:'商家赏金余额',
                type:'pie',
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
                            fontSize: '22',
                            fontWeight: 'bold'
                        }
                    }
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },

                data:[
                    {value:$('#balance').text(), name:'赏金余额'},
                ]
            }
        ]
    };
    pie_balance.setOption(balance_option);

    // 使用刚指定的配置项和数据显示图表。
    $(window).resize(pie_balance.resize);
    //赏金分成
    var pie_reward01 = echarts.init(document.getElementById('js-chart--reward01'));
    var reward01_option = {
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c} ({d}%)"
        },
        legend: {
            orient: 'vertical',
            x: 'left',
            data:['成功提现','正在处理']
        },
        color:['rgba(26,179,148,1)','rgba(26,179,148,.4)'],
        series: [
            {
                name:'我的提现',
                type:'pie',
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
                            fontSize: '22',
                            fontWeight: 'bold'
                        }
                    }
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },

                data:[
                    {value:$('#drawedBalance').text(), name:'已提现'},
                    {value:$('#undrawedBalance').val(), name:'处理中'},
                ]
            }
        ]
    };
    pie_reward01.setOption(reward01_option);

    // 使用刚指定的配置项和数据显示图表。
    $(window).resize(pie_reward01.resize);

    //
    var pie_reward02 = echarts.init(document.getElementById('js-chart--reward02'));
    var reward02_option = {
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c} ({d}%)"
        },
        legend: {
            orient: 'vertical',
            x: 'left',
            data:['提现成功次数']
        },
        color:['rgba(26,179,148,1)'],
        series: [
            {
                name:'提现次数',
                type:'pie',
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
                            fontSize: '22',
                            fontWeight: 'bold'
                        }
                    }
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },

                data:[
                    {value:$('#withdrawCount').text(), name:'提现成功次数'}
                ]
            }
        ]
    };
    pie_reward02.setOption(reward02_option);

    // 使用刚指定的配置项和数据显示图表。
    $(window).resize(pie_reward02.resize); */




    /*打赏人信息*/
    $('[data-toggle="popover"]').popover();
    /*工具提示*/
    $('[data-toggle="tooltip"]').tooltip();
    /*下拉菜单悬浮显示*/
    // $('.dropdown-toggle').dropdown();






});