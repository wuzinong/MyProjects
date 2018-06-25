$(function () {
    /* //商家赏金余额
    var pie_balance = echarts.init(document.getElementById('js-chart--balance'));
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
                    {value:2524.00, name:'赏金余额'},
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
                    {value:5144.00, name:'成功提现'},
                    {value:1088.00, name:'正在处理'},
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
            data:['成功提现','正在处理']
        },
        color:['rgba(26,179,148,1)','rgba(26,179,148,.4)'],
        series: [
            {
                name:'二级合作商提现',
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
                    {value:5120.00, name:'成功提现'},
                    {value:1500.00, name:'正在处理'},
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


    /*商家提现弹出层*/
    $(".js-btn-withdrawals").on('click',function () {
        var la_worker_add=layer.open({
            type:2,
            title:'增加员工',
            area:['800px','500px'],
            maxmin: true,
            scrollbar: false,
            content:'../../modal-withdrawals.html'
        });
        layer.full(la_worker_add);
    });



});