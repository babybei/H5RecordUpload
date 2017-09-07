/**
 * Created by Administrator on 2014/12/19.
 */
/*
* 进度条显示音频播放进度及时间显示
*返回函数：oRturn(oPlayBar),oPlayBar是一个对象，具体内容见内容中间详解，功能：进度条显示音频播放进度及时间显示
* 方法：oRturn.timeFmat(time,timePlaceId,ishour){
*      功能： 格式化时间，将秒数转换为字符串hh:mm:ss,
*      参数：{
*      time:总秒数，
*      timePlaceId:时间放置位置的标签Id,若省略，则不显示时间
*      ishour:是否显示小时，true显示，false不显示，默认不显示
*      }
*      返回值：格式化后的时间
* },
* 方法：oRturn.BarValue{
*       功能：设置进度条的比例
*       参数：{
*       progressBarId:进度条的Id，
*       max：进度条的最大值，默认为100，
*       value：进度条的当前值
* }
* 方法：oRturn.switchPic{
*       功能：切换图片
*       参数：{
*       picId：图片元素的Id
*       picUrl:图片的url
* }
* */
define(['jquery','audioIE8'],function($,audioIE8) {
    var oReturn;

    /*播放时间*/
    function timeChange(time,timePlaceId,ishour){
        var timePlace1 = document.getElementById(timePlaceId),totalTime;
        //小时
        if(timePlace1 !== undefined && timePlace1 !== null){
            var hour = time / 3600;
            var hours = parseInt(hour);
            if(hours < 10){
                hours = "0" + hours;
            }
            //分钟
            var minute = time / 60;
            var minutes = parseInt(minute);
            if(minutes < 10){
                minutes = "0" + minutes;
            }
            //秒
            var second = time % 60;
            var seconds = Math.round(second);
            if(seconds < 10 ){
                seconds = "0" + seconds;
            }
            if(ishour === undefined || ishour === false){
                totalTime = minutes  + ":"  +seconds ;
            }
            else{

                totalTime =hours+":"+minutes  + ":" + seconds;
            }

            if(timePlaceId !== undefined){
                $(timePlace1).html(totalTime);
            }
            return totalTime;
        }
    }
/*
音频进度条
* oPlayBar = {
*       audioMp3Id:音频标签的Id,
*       internalTime:进度条更新的时间，毫秒计，默认为500ms，时间越短越平滑
*       currentTimeId:放置当前播放时间的元素Id，若省略，则不添加当前时间
*       overTimeId:放置剩余时间的元素Id，若省略，则不添加剩余时间
*       totalTimeId：放置总时间的元素Id，若省略，则不添加总时间
*       ishour：bool值，是否显示小时，默认不显示
*       progressBarId:进度条Id，
*       dragBar:拖动滚动条按钮的选择器，
*       switchPic:{
*       picUrl:['url1','url2'...],
*       timeSec:[time1,time2...] ,
*       picId：图片元素的Id
*       } 切换图片对象，picUrl是图片的url，timeSec是对象的切换时间，若省略，则没有图片切换功能
*       ended（audioMp3）:进度条满的时候调用的函数
*
* }
* */
    function playBar(oPlayBar) {
        dragMove(oPlayBar.progressBarId,0, 100);
        $('#' + oPlayBar.audioMp3Id).on("loadeddata.audioBar", function () {
            var allTime = this.duration;
            var currentTime;
            var overTime;
            var oldImgInd = -1;
            if(oPlayBar.currentTimeId !== undefined)
                timeChange(0, oPlayBar.currentTimeId,oPlayBar.ishour);

            if(oPlayBar.totalTimeId !== undefined)
                timeChange(allTime, oPlayBar.totalTimeId,oPlayBar.ishour);

            if(oPlayBar.internalTime === undefined){
                oPlayBar.internalTime = 500;
            }
            $(this).on('timeupdate',function () {
                var imgInd = oldImgInd,imgTime = 0;
                 currentTime = this.currentTime;
                 overTime = allTime - currentTime;
                /*切换图片*/
                if(oPlayBar.switchPic !== undefined){
                    oPlayBar.switchPic.timeSec.forEach(function(elem,index) {  // 获取此时应该显示的图片的index(不大于currentTime的最大值)
                        if(elem != '' && elem <= currentTime && elem >= imgTime){
                            imgInd = index ;
                            imgTime = Number(elem);
                        }
                    });
                    if(imgInd !== oldImgInd) {  // 如果图片index发生改变则切换图片
                        showTransPic(oPlayBar.switchPic.picId, oPlayBar.switchPic.picUrl[imgInd]);
                        oldImgInd = imgInd;
                    }
                }
                /*显示当前时间*/
                if(oPlayBar.currentTimeId !== undefined)
                    timeChange(currentTime, oPlayBar.currentTimeId,oPlayBar.ishour);
                /*显示剩余时间*/
                if(oPlayBar.overTimeId !== undefined)
                    timeChange(overTime, oPlayBar.overTimeId,oPlayBar.ishour);
                /*滑动进度条*/
                if(oPlayBar.progressBarId !== undefined)
                    dragMove(oPlayBar.progressBarId,currentTime, allTime,oPlayBar.dragBar);
                /*if(allTime == audioMp3.currentTime){
                    clearInterval(timeId);
                }*/
            });
            if(typeof  oPlayBar.ended == "function"){
                $(this).on("ended", oPlayBar.ended.bind(this,this));
            }
        }).filter(function(){
            return this.readyState >= 3;
        }).trigger('loadeddata.audioBar');
    }

    /*滚动条滑动*/
    function dragMove(progressBarId,value, max,drag) {
        var progressBar1 = document.getElementById(progressBarId);
        var dragBar = $(drag);
        if(max === undefined){
            max = 100;
        }
        if(progressBar1 !== null){
            progressBar1.style.width = (max !== 0 ? (value / max) : 0) * 100 + "%";
            dragBar.css('left',(max !== 0 ? (value / max) : 0) * 100 + "%");
    }

    }

    /*普通进度条
    * oMove{
    *   maxValue:进度条的最大值,若省略，则默认为100；
    *   currentValue:进度条的当前值，若省略则按照时间处理，1s加1；
    *   internalTime:进度条更新的时间，毫秒计，默认为500ms，时间越短越平滑
    *   currentValueId:放置当前变量的元素Id，若省略，则不添加当前量
     *  overValueId:放置剩余量的元素Id，若省略，则不添加剩余量
     *  totalValueId：放置总量的元素Id，若省略，则不添加总量
     *  percentId:放置进度条百分比的元素Id，若省略，则不显示百分比
     *  progressBarId:进度条Id，若省略，则没有动态进度条
     *  ishour：bool值，是否显示小时，默认不显示
     *  ended:进度条结束的事件函数
    * }
    * */

     function movingBar(oMove) {
        var currentValue  = 0,overValue,currentTime = 0,overTime;
        if(oMove.currentValue === undefined){
            /*显示总时间*/
            if(oMove.totalValueId !== undefined)
                timeChange(oMove.maxValue, oMove.totalValueId,oMove.ishour);
        }
         else{
            /*显示总值*/
            if(oMove.totalValueId !== undefined)
                $("#" + oMove.totalValueId).text(currentValue);
        }
         if(oMove.maxValue === undefined){
             oMove.maxValue = 100;
         }
        if(oMove.internalTime === undefined){
            oMove.internalTime = 500;
        }
        var bar = setInterval(function () {
            /*剩余值*/
            if(currentValue <= oMove.maxValue)
            overValue = oMove.maxValue - currentValue;
            /*动态滚动条*/
            if(oMove.progressBarId !== undefined){
                if(currentValue >= oMove.maxValue){
                    currentValue = oMove.maxValue;
                }
                dragMove(oMove.progressBarId,currentValue, oMove.maxValue);
            }
            /*当前值赋值，若是时间，则按真实时间赋值；若不是，按变量值赋值*/
            if(currentValue < oMove.maxValue){
                if(oMove.currentValue !== undefined)
                    currentValue = oMove.currentValue;
                else
                    currentValue += oMove.internalTime / 1000;
            }

            /*结束事件*/
            if(oMove.ended !== undefined){
                if(currentValue == oMove.maxValue){
                    oMove.ended();
                }
            }

            if(currentValue == oMove.maxValue){
                clearInterval(bar);
            }
        }, oMove.internalTime);

         var time = setInterval(function() {
             currentTime++;
             overTime = oMove.maxValue - currentTime;
             /*显示进度条百分比*/
             if(oMove.percentId !== undefined){
                 var percent = Math.round((currentValue / oMove.maxValue * 100)) + "%";
                 $("#" + oMove.percentId).text(percent);
             }
             /*判断变量是否是时间,若是，则按照时间解析规则解析；若不是，则直接显示*/
             if(oMove.currentValue === undefined){
                 /*显示当前时间*/
                 if(oMove.currentValueId !== undefined)
                     timeChange(currentTime, oMove.currentValueId,oMove.ishour);
                 /*显示剩余时间*/
                 if(oMove.overValueId !== undefined)
                     timeChange(overTime, oMove.overValueId,oMove.ishour);
             }
             currentValue = currentTime;
             overValue = overTime;

             if(currentTime == oMove.maxValue){
                 clearInterval(time);
             }
         },1000);
    }

    /*图片切换效果*/
    function showTransPic(picId,picUrl){
        $('#'+picId).fadeOut(1200,function(){
            $('#'+picId).attr("src",picUrl).fadeIn(1200);
        })
    }

    oReturn = playBar;
    oReturn.timeFmat = timeChange;
    oReturn.barValue = dragMove;
    oReturn.SwitchPic = showTransPic;
    oReturn.movingBar = movingBar;
    return oReturn;
});