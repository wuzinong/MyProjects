

$(function () {
    var pie_waiter1 = echarts.init(document.getElementById('js-chart--waiter1'));
    var waiter1_option = {
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c} 人({d}%)"
        },
        legend: {
            orient: 'vertical',
            x: 'left',
            data:['有工牌','无工牌']
        },
        color:['rgba(26,179,148,1)','rgba(26,179,148,.4)'],
        series: [
            {
                name:'工牌',
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
                    {value:$('#badgeTechnicianCount').val(), name:'有工牌'},
                    {value:$('#unBadgeTechnicianCount').val(), name:'无工牌'},
                ]
            }
        ]
    };
    pie_waiter1.setOption(waiter1_option);

    // 使用刚指定的配置项和数据显示图表。
    $(window).resize(pie_waiter1.resize);
    var pie_waiter2 = echarts.init(document.getElementById('js-chart--waiter2'));
    var waiter2_option = {
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c} ({d}%)"
        },
        legend: {
            orient: 'vertical',
            x: 'left',
            data:['空闲中','工作中','休假中']
        },
        color:['rgba(26,179,148,1)','rgba(26,179,148,.7)','rgba(26,179,148,.4)'],
        series: [
            {
                name:'上钟数据',
                type:'pie',
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
                    {value:$('#freeTechnicianCount').val(), name:'空闲中'},
                    {value:$('#workingTechnicianCount').val(), name:'工作中'},
                    {value:$('#leavingTechnicianCount').val(), name:'休假中'},
                ]
            }
        ]
    };
    pie_waiter2.setOption(waiter2_option);

    // 使用刚指定的配置项和数据显示图表。
    $(window).resize(pie_waiter2.resize);

    var pie_waiter3 = echarts.init(document.getElementById('js-chart--waiter3'));
    var waiter3_option = {
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c} ({d}%)"
        },
        legend: {
            orient: 'vertical',
            x: 'left',
            data:['使用中','未绑定']
        },
        color:['rgba(26,179,148,1)','rgba(26,179,148,.4)'],
        series: [
            {
                name:'工牌使用率',
                type:'pie',
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
                    {value:$('#usedBadgeCount').val(), name:'使用中'},
                    {value:$('#unUsedBadgeCount').val(), name:'未绑定'},
                ]
            }
        ]
    };
    pie_waiter3.setOption(waiter3_option);





    /*X-editable*/
    //toggle `popup` / `inline` mode
    $.fn.editable.defaults.mode = 'popup';

    //make username editable
    $('#username').editable();

    //make status editable
    $('#status').editable({
        type: 'text',
        title: '输入工号',
        placement: 'top',
        /*
        //uncomment these lines to send data on server
        ,pk: 1
        ,url: '/post'
        */
    });
    $('.js-waiter-num').editable({
        type: 'text',
        title: '输入工号',
        placement: 'top',
    });

});