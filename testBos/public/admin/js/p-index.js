$(document).ready(function () {
    /*上下钟管理*/
    //用localStorage存储状态
    var l_free=localStorage.arrFree,
        l_working=localStorage.arrWorking,
        l_rest=localStorage.arrRest;
    // console.log("free:"+l_free);
    // console.log("working:"+l_working);
    // console.log("rest:"+l_rest);
    
    //记录拖拽后的排序
    $(".js-sortable-free").sortable({
        connectWith: ".js-sortable-free",
        update:function(){
            //记录sort后的id顺序数组
            // var arrFree = $( ".js-sortable-free" ).sortable('toArray');
            var ul_free=$( ".js-sortable-free" );
            var lis_free=ul_free.find('li');
            var i,arrFree=[],post_text;
            for(i=0;i<lis_free.length;i++){
                var data_free=$(".js-sortable-free li").eq(i).attr("data-technicianId");
                arrFree.push(data_free);
            }
            post_text=arrFree.join(',');
            console.log(post_text);
            //拖拽后利用localStorage记录顺序
            localStorage.arrFree = arrFree;

            $.ajax({
                type:'POST',
                url:'/shopAdmin/technician/updateTechnicianSort',
                dataType:'json',
                data:{
                    technicianList:post_text,
                },
                success:function (data) {
                    if(data.code===200){
                        console.log("拖拽排序成功");
                    }else if(data.code===400){
                        alert(data.message);
                    }
                }
            });
        }
    }).disableSelection();
    //如果有localst记录则，按照这个进行排序元素
    function ul_append(localSt_free,localSt_working,localSt_rest){
        if(localSt_free){
            var resArr1 = localSt_free.split(',');
            var ul_free = $('.js-sortable-free');
            //li 数组
            for(var i = 0;i < resArr1.length;i++){
                $("[data-technicianId=" + resArr1[i]+"]").find("[value='free']").attr("selected","selected").end()
                    .closest("li").removeClass("m-element-rest m-element-working").addClass("m-element-free")
                    .appendTo(ul_free);
            }
        }
        if(localSt_working){
            var resArr2 = localSt_working.split(',');
            var ul_working = $('.js-sortable-working');
            //li 数组
            for(var i = 0;i < resArr2.length;i++){
                $("[data-technicianId=" + resArr2[i]+"]").find("[value='working']").attr("selected","selected").end()
                    .closest("li").removeClass("m-element-rest m-element-free").addClass("m-element-working")
                    .appendTo(ul_working);
            }
        }
        if(localSt_rest){
            var resArr3 = localSt_rest.split(',');
            var ul_rest = $('.js-sortable-rest');
            //li 数组
            for(var i = 0;i < resArr3.length;i++){
                $("[data-technicianId=" + resArr3[i]+"]").find("[value='leaving']").attr("selected","selected").end()
                    .closest("li").removeClass("m-element-working m-element-free").addClass("m-element-rest")
                    .appendTo(ul_rest);
            }
        }
    }
    // ul_append(l_free,l_working,l_rest);

    //上下钟状态变更
    function change_states($this) {
        var select_val=$this.val();
        // console.log(select_val);
        if(select_val==="free"){
            $this.closest("li").removeClass("m-element-rest m-element-working").addClass("m-element-free")
            .appendTo(".js-sortable-free");
        }else if(select_val==="working"){
            $this.closest("li").removeClass("m-element-rest m-element-free").addClass("m-element-working")
            .appendTo(".js-sortable-working");
        }else if(select_val==="leaving"){
            $this.closest("li").removeClass("m-element-working m-element-free").addClass("m-element-rest")
            .appendTo(".js-sortable-rest");
        }
        var i,n,m;
        var li_free_len=$(".js-sortable-free li").length;
        var li_working_len=$(".js-sortable-working li").length;
        var li_rest_len=$(".js-sortable-rest li").length;
        var arrFree=[],
            arrWorking=[],
            arrRest=[];
        for(i=0;i<li_free_len;i++){
            var id_free=$(".js-sortable-free li").eq(i).attr("data-technicianId");

            arrFree.push(id_free);

        }
        for(i=0;i<li_rest_len;i++){
            var id_rest=$(".js-sortable-rest li").eq(i).attr("data-technicianId");

            arrRest.push(id_rest);

        }

        for(i=0;i<li_working_len;i++){
            var id_working=$(".js-sortable-working li").eq(i).attr("data-technicianId");

            arrWorking.push(id_working);

        }

        localStorage.arrFree = arrFree;
        localStorage.arrWorking = arrWorking;
        localStorage.arrRest = arrRest;

        l_free=localStorage.arrFree;
        l_working=localStorage.arrWorking;
        l_rest=localStorage.arrRest;
        console.log("free:"+l_free);
        console.log("working:"+l_working);
        console.log("leaving:"+l_rest);
        // console.log(`li_free_len:${li_free_len};li_working_len:${li_working_len};li_rest_len:${li_rest_len};localStorage:${localSt}`);

    }
    // $("li[id^='waiter'] select").each(function () {
    //     var $this=$(this);
    //     change_states($this);
    // });
    $("li[id^='waiter']").on('change','select',function () {
        var $this=$(this);

        var status=$(this).val();
        var technician_id= $(this).closest("li[id^='waiter']").attr('data-technicianId');
        console.log(status);
        console.log(technician_id);
        $.ajax({
            type:'POST',
            url:'/shopAdmin/technician/updateTechnicianStatus',
            dataType:'json',
            data:{
                status:status,
                technician_id:technician_id,
            },
            success:function (data) {
                console.log(data);
                if(data.code===200){
                    console.log("技师状态改变为"+status);
                    change_states($this);
                }else if(data.code===400){
                    alert(data.message);
                }
            },
            error:function (jqXHR) {
                console.log("发生错误"+jqXHR.status);
            }
        });


    });
    /*手动刷新*/
    $(".js-btn-rest").on('click',function () {
        window.location.reload();
    })
    /*图表*/
    /*var updatingChart = $(".updating-chart").peity("line", { width: 64 })

    setInterval(function() {
        var random = Math.round(Math.random() * 10)
        var values = updatingChart.text().split(",")
        values.shift()
        values.push(random)

        updatingChart
            .text(values.join(","))
            .change()
    }, 1000)*/
    $(".js-line").peity("line",{
        fill: '#1ab394',
        stroke:'#169c81',
    });
    /*工具提示*/
    $('.js-tooltip').tooltip('show');
    /*图表ECharts*/
    // 基于准备好的dom，初始化echarts实例
    var line_reward = echarts.init(document.getElementById('js-reward'));

    // 指定图表的配置项和数据
    var reward_option = {
        tooltip : {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: '#6a7985'
                }
            }
        },
        legend: {
            data:['打赏金额']
        },
        grid: {
            top:'40px',
            left: '0%',
            right: '3%',
            bottom: '0%',
            containLabel: true,
        },
        xAxis : [
            {
                type : 'category',
                boundaryGap : false,
                data : $('#weekOrderListDays').val().split(","),
                axisLine:{
                    lineStyle:{
                        color:'#ccc'
                    }
                },
            }
        ],
        yAxis : [
            {
                type : 'value',
                axisLine:{
                    lineStyle:{
                        color:'#ccc'
                    }
                },
            }
        ],
        series : [
            {
                name:'打赏金额',
                type:'line',
                stack: '总量',
                label: {
                    normal: {
                        show: true,
                        position: 'top'
                    }
                },
                itemStyle:{normal:{
                    color:'rgba(7,150,146,1)'
                }},
                lineStyle:{normal:{
                    color:'rgba(7,150,146,1)'
                }},
                areaStyle: {normal: {
                    color:'rgba(7,150,146,.5)'
                }},
                data:$('#weekOrderListValues').val().split(",")
            }
        ]
    };
    line_reward.setOption(reward_option);

    // 使用刚指定的配置项和数据显示图表。
/*    $(window).resize(line_reward.resize);

//    浏览入口对比
    var bar_visit = echarts.init(document.getElementById('js-visit'));
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
    $(window).resize(bar_visit.resize);*/
    /*提示框*/
/*    setTimeout(function () {
        $.gritter.add({
            title: '您有2条未读信息',
            text: '请前往<a href="#" class="text-warning">收件箱</a>查看今日任务',
            time: 10000
        });
    }, 2000);*/




});