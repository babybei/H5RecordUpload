/**
 * Created by Administrator on 2015/3/17.
 *notice: swf文件、JPlayer.js文件必须位于同一目录;
 * 若不使用requireJS加载,则audio_ie8.js文件也必须与它们同一目录,否则无需;
 * 必须保证audioIE8初始化完成后
 * 特征: 使用Flash播放音频,preload=auto时,整个音频全加载,并能缓存,但是不触发loadeddata事件
 */
(function (b) {
    "function" == typeof define && define.amd ? define(['require', 'jquery'], b) : window.MP3Encoder = b.apply(jQuery('head > script').last().attr('src'), jQuery, jQuery.jPlayer);
})(function (require, $) {
    var oReturn = {};/*模块返回值*/
    var aReadyCallBack = [];
    var aReadyCallBackWait = [];

    var nAudioNum,nReadyNum = 0,busy = false;

    var fReady = function (callBack) {
        if (callBack === undefined) {
            aReadyCallBack.forEach(function (elem) {
                elem();
            });
            aReadyCallBack = aReadyCallBackWait;
            aReadyCallBackWait = [];
            if(aReadyCallBack.length > 0) {
                fInit();
            }
            else {
                busy = false;
            }
        }
        else {
            if(busy) {
                aReadyCallBackWait.push(callBack);
            }
            else {
                busy = true;
                aReadyCallBack.push(callBack);
                fInit();
            }
        }
    };
    var fInit = function() {
        $(document).ready(function () {
            var $audio = $('audio'),audioNotInit = $audio.not('.audioIE8-inited');
            nAudioNum = $audio.length;
            nReadyNum = nAudioNum - audioNotInit.length;
            audioNotInit.each(function (index) {
            	//判断地址是否可以访问
//            	var xmlhttp;
//                if (window.XMLHttpRequest){
//                	xmlhttp=new XMLHttpRequest();
//                }else{
//                	xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
//                }
//            	xmlhttp.open("GET",$(this).attr('src'),false);
//            	try{
//	            	xmlhttp.send();
//            	}
//            	catch(err){
//            		var oldUrl=$(this).attr('src');
//            		var oldsp=oldUrl.split('/');
//            		var name=oldsp[oldsp.length-1];
//            		$(this).attr('src',oldUrl.replace("mp3.kaolawu.com","mp3.cdn.kaolawu.com"));  //要替换的地址阿里云的或者腾讯的地址，需要后台提供
//            	}
            	
                if($(this).attr('src') == location.href || !$(this).attr('src')){
                    nReadyNum++;
                    if (nReadyNum == nAudioNum) {
                        fReady();
                    }
                }
                else if (window.HTMLAudioElement && !this.error) {
                    if (this.readyState > 0) {
                        nReadyNum++;
                        if (nReadyNum == nAudioNum) {
                            fReady();
                        }
                    }
                    else {
                        $(this).on('loadedmetadata', function () {
                            nReadyNum++;
                            if (nReadyNum == nAudioNum) {
                                fReady();
                            }
                        }).on('error', function (event) {
                            window.audioerror = event;
                            if (this.error.code == MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED || this.error.code == MediaError.MEDIA_ERR_DECODE) {
                                Audio2Flash(this, index);
                            }
                            else {/*当错误不是文件类型不支持时,忽略此audio,避免影响页面其他展示*/                            	
                        		ErrorDialog(this.error.code, MediaError,$(this).attr('src'),$(this));
                                nReadyNum++;
                                if (nReadyNum == nAudioNum) {
                                    fReady();
                                }
                            }
                        });
                    }
                }
                else if ((!window.HTMLAudioElement) || (window.HTMLAudioElement && (this.error.code == this.error.MEDIA_ERR_SRC_NOT_SUPPORTED || this.error.code == MediaError.MEDIA_ERR_DECODE))) {
                    Audio2Flash(this, index);
                }
                else {
                    ErrorDialog(this.error.code, MediaError,$(this).attr('src'),$(this));
                    nReadyNum++;
                    console.log('unknown error', nReadyNum, nAudioNum);
                    if (nReadyNum == nAudioNum) {
                        fReady();
                    }
                }
            }).addClass('audioIE8-inited');
            if (nReadyNum == nAudioNum) {
                fReady();
            }
        });
    };


    function Audio2Flash(domAudio, index) {
        requirejs(['jPlayer'],function() {
            var $thisAudio = $(domAudio).hide();/*audio标签*/
            var sAudioType = $thisAudio.prop('src').match(/\.(\w+)$/)[1];
            console.log($thisAudio.prop('src'), ' to flash');
            var bThisEnded = false;/*音频播放完毕标志*/
            var nThisReadyState = 0;/*readyState标志*/
//            初始化jplayer播放器, 绑定audio DOM事件
            var $thisPlayer = $('<div>', {
                id: 'jp_' + (domAudio.id || index),
                'class': 'jp_' + ($(domAudio).prop('class') || index)
            }).insertAfter(domAudio).jPlayer({
                ready: function () {/*1.播放前触发一次duration为0*/
                    console.log('readyjp,'+$thisAudio[0].duration);
                    var oMedia={};
                    oMedia[sAudioType] = $thisAudio.prop('src');
                    $(this).jPlayer('setMedia', oMedia);
                    if ($thisAudio.attr('autoplay') !== undefined) {
                        $thisPlayer.jPlayer('play');
                    }
                },
                error: function (event) {/*发生错误时忽略,防止影响页面其他展示*/
                	ErrorDialog(event.jPlayer.error.type,$.jPlayer.error,$thisAudio.attr('src'),$thisAudio);
                    console.log('flasherror');
                    nReadyNum++;
                    if (nReadyNum == nAudioNum) {
                        fReady();
                    }
                },
                setmedia: function () {/*3.播放前触发一次duration为0*/
                        console.log('setmediajp,'+$thisAudio[0].duration);
                    nThisReadyState = 0;
                    bThisEnded = false;
                    nReadyNum++;
                    if (nReadyNum == nAudioNum) {
                        fReady();
                    }
                },
                loadeddata: function () {
                        console.log('loadedjp,'+$thisAudio[0].duration);
                    bThisEnded = false;
                    nThisReadyState = 3;
                    $thisAudio.trigger('loadeddata');
                },
                canplay: function (event) {/*5.播放后触发一次duration正常*/
                        console.log('canplayjp,'+$thisAudio[0].duration);
                        domAudio.jp_duration = event.jPlayer.status.duration;
                    if ($thisAudio[0].duration > 0) {
                        $thisPlayer.trigger($.jPlayer.event.loadeddata);
                    }
                    $thisAudio.trigger('canplay');
                },
                play: function () {/*4.播放后触发一次duration为0*/
                        console.log('playjp,'+$thisAudio[0].duration);
                    $thisAudio.trigger('play');
                },
                playing: function () {/*6.播放后触发一次duration正常*/
                        console.log('playingjp,'+$thisAudio[0].duration);
                    bThisEnded = false;
                    $thisAudio.trigger('playing');
                },
                timeupdate: function (event) {/*2.播放前触发一次duration为0*/
                    /*7.播放后触发多次duration正常*/
                        console.log('timeupdatejp,'+$thisAudio[0].duration);
                        domAudio.jp_duration = event.jPlayer.status.duration;
                        domAudio.jp_currentTime = event.jPlayer.status.currentTime;
                        if(nThisReadyState < 3 && $thisAudio[0].duration > 0) {
                        	$thisPlayer.trigger($.jPlayer.event.loadeddata);
                        }
                    $thisAudio.trigger('timeupdate');
                },
                ended: function () {/*8.播放后触发一次duration正常*/
                        console.log('endedjp,'+$thisAudio[0].duration);
                    bThisEnded = true;
                    $thisAudio.trigger('ended');
                },
                progress: function(event){
                    var percent = event.jPlayer.status.seekPercent;
                    console.log('progress:'+percent);
                    $thisAudio.trigger('progress');
                    if(percent == 100){
                        $thisPlayer.trigger($.jPlayer.event.loadeddata);
                    }
                },
                swfPath: ('function' == typeof require ? require.toUrl('jPlayer') : require).replace(/\w+(\.\w+)*$/, 'jquery.jplayer.swf'),
                solution: 'flash, html',
                supplied: sAudioType,
                loop: $thisAudio.attr('loop'),
                muted: $thisAudio.attr('muted'),
                preload: $thisAudio.attr('preload'),
                globalvolume: true,
                volume: 0.5
            });

//            audio DOM添加属性和方法
            Object.defineProperties(domAudio, {
                'currentTime': {
                    get: function () {
                        return domAudio.jp_currentTime || 0;
                    },
                    set: function (val) {
                        if (val >= domAudio.jp_duration) {
                            $thisPlayer.jPlayer('stop');
                            $thisPlayer.trigger($.jPlayer.event.ended);
                        }
                        else {
                            $thisPlayer.jPlayer('play', val);
                        }
                    }
                },
                'duration': {
                    get: function () {
                        return domAudio.jp_duration || 0;
                    }
                },
                'paused': {
                    get: function () {
                        return $thisPlayer.data('jPlayer').status.paused;
                    },
                    set: function (val) {
                        val && $thisPlayer.jPlayer('pause');
                    }
                },
                'readyState': {
                    get: function () {
                        return nThisReadyState;
                    }
                },
                'ended': {
                    get: function () {
                        return bThisEnded;
                    }
                },
                'volume': {
                    get: function () {
                        return $thisPlayer.data('jPlayer').options.volume
                    },
                    set: function (val) {
                        $thisPlayer.jPlayer('volume', val);
                    }
                },
                'play': {
                    value: function () {
                        $thisPlayer.jPlayer('play');
                    }
                },
                'pause': {
                    value: function () {
                        $thisPlayer.jPlayer('pause');
                    }
                },
                'load': {
                    value: function () {
                        $thisPlayer.jPlayer('load');
                    }
                }
            });
        });
    }

    function ErrorDialog(errCode,errType,audioPath,obj) {
        requirejs(['jquery-ui'],function() {
            if($('#audio-error-dialog').length > 0) return;
            var msgStr = '';
            if (errCode == errType.MEDIA_ERR_ABORTED) {
                msgStr = '由于您误操作，音频文件加载失败，请刷新后等待音频正常播放。';
            }
            else if (errCode == errType.MEDIA_ERR_DECODE) {
                msgStr = '音频解码出错，请联系工作人员。';
            }
            else if (errCode == errType.MEDIA_ERR_NETWORK) {
                msgStr = '音频下载出错，请确认网络正常后联系工作人员。';
            }
            else if(errCode == errType.FLASH) {
                msgStr = 'Flash音频播放器加载出错，请联系工作人员。';
                return oReturn;
            }
            else if(errCode == errType.FLASH_DISABLED) {
                msgStr = 'Flash音频播放器运行出错，请联系工作人员。';
            }
            else if(errCode == errType.NO_SUPPORT) {
                msgStr = '音频文件格式不支持，请联系工作人员。';
            }
            else if(errCode == errType.URL) {
                msgStr = '音频下载出错，请确认网络正常后联系工作人员。';
            }
            else if(errCode == errType.URL_NOT_SET || errCode == errType.NO_SOLUTION) {
                msgStr = 'Flash音频播放器设置出错，可能音频格式不支持，请联系工作人员。';
            }
            else if(errCode == errType.VERSION) {
                msgStr = '浏览器或FLASH版本不支持，更新浏览器和FLASH，若仍未解决请联系工作人员。';
            }
            else {
                msgStr = '音频播放发生未知出错，请联系工作人员。';
            }
        	console.log(errCode+"---------"+msgStr);
            $('<div>',{
                'id': 'audio-error-dialog',
                'title': '错误提示'
            }).append($('<span>',{
                //'html': msgStr + '<br/>点击重新加载: ' + '<a style="color:red;cursor:pointer" target="_blank" href="'+audioPath+'">'+audioPath+'</a>'
            	'html':'访问音频时失败，请 '+'<a style="color:red;cursor:pointer; text-decoration: underline;" target="_blank" href="'+audioPath+'">点击这里</a>'+' 确认音频是否可以播放，如果可以，请回到此页面后刷新。'
            }).css({'text-align':'left','display':'inline-block','max-width':'100%','word-break':'break-all'})).appendTo('body').dialog({
                resizable: false,
                autoOpen: true,
                buttons: [
                    {
                    	text: '确定',
                    	click: function(){
                    		sureDialogClose($(this),obj);
                    	}
                    }
                ],
                hide: 100,
                show: 100,
                modal: true,
				draggable: false
            });
        });
    }
    
    function sureDialogClose(dialogObj,audioObj){
    	dialogObj.dialog('close');
    	//audioObj.load();  //点击确定重新加载音频
		//location.reload();
    }

    oReturn.isbusy = function(){return busy};
    oReturn.ready = function(callBack) {
        if(typeof callBack =='function') {
            fReady(callBack);
        }
        else {
            fReady(function(){});
        }
    };
    return oReturn;
});